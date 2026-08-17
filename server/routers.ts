import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { applicationStatuses } from "../drizzle/schema";
import * as db from "./db";
import { buildEmailMessages, buildResumeMessages } from "./lib/aiPrompts";
import { buildSheetCsvUrl, parseJobsFromCsv } from "./lib/sheetImport";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";
import { COOKIE_NAME } from "@shared/const";

const statusSchema = z.enum(applicationStatuses);
const jobFields = {
  company: z.string().trim().min(1).max(255),
  role: z.string().trim().min(1).max(255),
  jobDescription: z.string().trim().min(40).max(100_000),
  status: statusSchema,
};

function contentFrom(result: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = result.choices[0]?.message.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The drafting service returned an empty response. Please try again." });
  }
  return content.trim();
}

async function preferredModel() {
  const catalog = await listLLMModels();
  return (
    catalog.data.find(model => model.id.startsWith("claude-sonnet"))?.id ??
    catalog.data.find(model => model.id === "gpt-5")?.id ??
    catalog.data.find(model => model.id.startsWith("gpt-5"))?.id
  );
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => db.getMasterProfile(ctx.user.id)),
    save: protectedProcedure
      .input(z.object({ resumeText: z.string().max(100_000).optional(), personalBio: z.string().max(20_000).optional() }))
      .mutation(({ ctx, input }) => db.saveMasterProfile(ctx.user.id, input)),
    uploadPdf: protectedProcedure
      .input(z.object({ filename: z.string().min(1).max(255), mimeType: z.string(), base64: z.string().min(16).max(12_000_000) }))
      .mutation(async ({ ctx, input }) => {
        if (input.mimeType !== "application/pdf" && !input.filename.toLowerCase().endsWith(".pdf")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PDF resume or paste the resume as text." });
        }
        const bytes = Buffer.from(input.base64, "base64");
        if (bytes.byteLength > 8 * 1024 * 1024 || bytes.subarray(0, 4).toString() !== "%PDF") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The resume must be a valid PDF smaller than 8 MB." });
        }
        const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
        const stored = await storagePut(`users/${ctx.user.id}/master-resume/${safeFilename}`, bytes, "application/pdf");
        return db.saveMasterProfile(ctx.user.id, { resumeFileKey: stored.key });
      }),
  }),
  jobs: router({
    list: protectedProcedure.query(({ ctx }) => db.listJobs(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => db.getJobForUser(ctx.user.id, input.id)),
    create: protectedProcedure.input(z.object(jobFields)).mutation(({ ctx, input }) => db.createJob(ctx.user.id, input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        company: jobFields.company.optional(),
        role: jobFields.role.optional(),
        jobDescription: jobFields.jobDescription.optional(),
        status: statusSchema.optional(),
        tailoredResume: z.string().max(100_000).optional(),
        emailDraft: z.string().max(40_000).optional(),
        notes: z.string().max(40_000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updated = await db.updateJobForUser(ctx.user.id, id, data);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "This job no longer exists." });
        return updated;
      }),
    importSheet: protectedProcedure
      .input(z.object({ sheetUrl: z.string().url().max(2_000), sheetName: z.string().trim().min(1).max(200) }))
      .mutation(async ({ ctx, input }) => {
        let csvUrl: string;
        try {
          csvUrl = buildSheetCsvUrl(input.sheetUrl, input.sheetName);
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid Google Sheet URL." });
        }
        const response = await fetch(csvUrl, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The selected sheet could not be read. Confirm that anyone with the link can view it and that the tab name is exact." });
        }
        const { jobs, skipped } = parseJobsFromCsv(await response.text());
        if (!jobs.length) throw new TRPCError({ code: "BAD_REQUEST", message: "No complete jobs were found in the selected sheet." });
        for (const job of jobs) await db.createJob(ctx.user.id, job);
        return { imported: jobs.length, skipped };
      }),
    generateDrafts: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const [profile, job] = await Promise.all([db.getMasterProfile(ctx.user.id), db.getJobForUser(ctx.user.id, input.id)]);
        if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "This job no longer exists." });
        if (!profile || (!profile.resumeText?.trim() && !profile.resumeFileKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Save a master resume before generating a tailored resume or outreach email." });
        }
        const resumeFileUrl = profile.resumeFileKey ? await storageGetSignedUrl(profile.resumeFileKey) : undefined;
        const profileContext = { resumeText: profile.resumeText, personalBio: profile.personalBio, resumeFileUrl };
        const model = await preferredModel();
        const [resumeResult, emailResult] = await Promise.all([
          invokeLLM({ model, messages: buildResumeMessages(profileContext, job), maxTokens: 6000 }),
          invokeLLM({ model, messages: buildEmailMessages(profileContext, job), maxTokens: 1600 }),
        ]);
        return db.updateJobForUser(ctx.user.id, job.id, {
          tailoredResume: contentFrom(resumeResult),
          emailDraft: contentFrom(emailResult),
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
