import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ApplicationStatus,
  InsertUser,
  jobs,
  masterProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getMasterProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(masterProfiles)
    .where(eq(masterProfiles.userId, userId))
    .limit(1);
  return result[0];
}

export async function saveMasterProfile(
  userId: number,
  data: { resumeText?: string; personalBio?: string; resumeFileKey?: string },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const current = await getMasterProfile(userId);
  if (current) {
    await db
      .update(masterProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterProfiles.userId, userId));
  } else {
    await db.insert(masterProfiles).values({
      userId,
      resumeText: data.resumeText ?? null,
      personalBio: data.personalBio ?? null,
      resumeFileKey: data.resumeFileKey ?? null,
    });
  }
  return getMasterProfile(userId);
}

export async function listJobs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.updatedAt));
}

export async function getJobForUser(userId: number, jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createJob(
  userId: number,
  data: {
    company: string;
    role: string;
    jobDescription: string;
    status: ApplicationStatus;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.insert(jobs).values({ userId, ...data });
  return getJobForUser(userId, Number(result[0].insertId));
}

export async function updateJobForUser(
  userId: number,
  jobId: number,
  data: Partial<{
    company: string;
    role: string;
    jobDescription: string;
    status: ApplicationStatus;
    tailoredResume: string;
    emailDraft: string;
    notes: string;
  }>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db
    .update(jobs)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
  return getJobForUser(userId, jobId);
}
