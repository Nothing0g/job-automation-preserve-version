import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const applicationStatuses = [
  "to-apply",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;

export const masterProfiles = mysqlTable(
  "master_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeText: text("resumeText"),
    resumeFileKey: varchar("resumeFileKey", { length: 512 }),
    personalBio: text("personalBio"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("master_profiles_user_unique").on(table.userId)],
);

export const jobs = mysqlTable(
  "jobs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company: varchar("company", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    jobDescription: text("jobDescription").notNull(),
    status: mysqlEnum("status", applicationStatuses).default("to-apply").notNull(),
    tailoredResume: text("tailoredResume"),
    emailDraft: text("emailDraft"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("jobs_user_status_idx").on(table.userId, table.status),
    index("jobs_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MasterProfile = typeof masterProfiles.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type ApplicationStatus = (typeof applicationStatuses)[number];
