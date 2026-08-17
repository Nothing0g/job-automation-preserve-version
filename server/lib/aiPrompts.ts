import type { Message } from "../_core/llm";

type JobContext = { company: string; role: string; jobDescription: string; contextMode: "full" | "limited" };
type ProfileContext = { resumeText: string | null; personalBio: string | null; resumeFileUrl?: string };

function sourceParts(profile: ProfileContext, job: JobContext) {
  const parts: NonNullable<Message["content"]>[] = [];
  parts.push({
    type: "text",
    text: `AUTHORITATIVE CANDIDATE SOURCE\n\nMaster resume text:\n${profile.resumeText?.trim() || "No text resume was provided. Use the attached PDF resume if present."}\n\nPersonal bio/context:\n${profile.personalBio?.trim() || "No personal bio was provided."}\n\nTARGET JOB\nCompany: ${job.company}\nRole: ${job.role}\nJob context: ${job.contextMode === "limited" ? "No job description was supplied." : "A job description was supplied."}\nJob description:\n${job.jobDescription || "No job description was supplied."}`,
  });
  if (profile.resumeFileUrl) {
    parts.push({ type: "file_url", file_url: { url: profile.resumeFileUrl, mime_type: "application/pdf" } });
  }
  return parts;
}

const groundingRules = `Use only the authoritative candidate source supplied by the user. The job description is a statement of employer needs, not evidence of candidate experience. Do not invent, infer, inflate, or fill in missing qualifications, metrics, employers, projects, tools, credentials, timelines, or outcomes. If a requirement has no explicit support in the candidate source, omit it rather than compensating with a plausible claim. Do not use external research about the company. Keep the candidate's facts truthful while tailoring language, ordering, and emphasis.`;

export function buildResumeMessages(profile: ProfileContext, job: JobContext): Message[] {
  return [
    {
      role: "system",
      content: `You are a precise resume editor. ${groundingRules} Produce a standalone tailored resume in clean Markdown with conventional headings and concise bullet points. Preserve the candidate's identity and factual employment history; prioritize, reorder, or rephrase supported information to make relevant experience easier to find. Do not add a cover letter, explanation, or commentary.`,
    },
    { role: "user", content: sourceParts(profile, job) as Message["content"] },
  ];
}

export function buildEmailMessages(profile: ProfileContext, job: JobContext): Message[] {
  return [
    {
      role: "system",
      content: `You write concise, highly personalized job outreach emails. ${groundingRules} Write only the email body, 140–210 words. Reference concrete duties, priorities, or language from the supplied job description and connect them to one or two explicitly supported parts of the candidate source. Address the reader as “Hiring Team” unless a name appears in the supplied source. Use a direct, warm, human tone. Avoid generic flattery, buzzwords, empty claims, “I hope this finds you well,” and invented company details. End with a low-pressure invitation to connect.`,
    },
    { role: "user", content: sourceParts(profile, job) as Message["content"] },
  ];
}

export function buildLimitedContextEmailMessages(profile: ProfileContext, job: JobContext): Message[] {
  return [
    {
      role: "system",
      content: `You write concise, professional job outreach emails when the employer has not provided a job description. ${groundingRules} Write only the email body, 110–160 words. Open with clear interest in the ${job.role} role at ${job.company}. Connect one or two explicitly supported parts of the candidate source to the role title, without claiming to know the role’s duties or the employer’s needs. Politely ask whether the role is open and request the detailed job description or application guidance. Address the reader as “Hello,”. Use a direct, warm tone. Do not add a subject line, company research, generic flattery, or a tailored resume claim. End with a low-pressure invitation to connect.`,
    },
    { role: "user", content: sourceParts(profile, job) as Message["content"] },
  ];
}
