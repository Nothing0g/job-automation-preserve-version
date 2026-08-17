import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPersonalUser: vi.fn(),
  getMasterProfile: vi.fn(),
  saveMasterProfile: vi.fn(),
  listJobs: vi.fn(),
  getJobForUser: vi.fn(),
  createJob: vi.fn(),
  updateJobForUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const personalUser = {
  id: 42,
  openId: "personal-workspace-owner",
  name: "Personal workspace",
  email: null,
  loginMethod: "direct-access",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function caller() {
  return appRouter.createCaller({
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  });
}

describe("personal workspace routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getPersonalUser.mockResolvedValue(personalUser);
  });

  it("returns null—not undefined—when the personal workspace has no saved profile", async () => {
    dbMocks.getMasterProfile.mockResolvedValue(null);
    await expect(caller().profile.get()).resolves.toBeNull();
    expect(dbMocks.getMasterProfile).toHaveBeenCalledWith(personalUser.id);
  });

  it("creates a direct-access application with its tracker fields", async () => {
    const created = { id: 9, company: "Northstar", role: "Analyst" };
    dbMocks.createJob.mockResolvedValue(created);
    const result = await caller().jobs.create({
      company: "Northstar",
      role: "Analyst",
      jobDescription: "Use analysis, reporting, and SQL to help the operations team make better decisions every week.",
      contextMode: "full",
      status: "to-apply",
      nextAction: "Send a concise note to the hiring team",
      followUpAt: "2026-09-01",
    });
    expect(result).toEqual(created);
    expect(dbMocks.createJob).toHaveBeenCalledWith(personalUser.id, expect.objectContaining({
      nextAction: "Send a concise note to the hiring team",
      followUpAt: new Date("2026-09-01T12:00:00.000Z"),
    }));
  });

  it("creates a limited-context application with only role, company, and contact email", async () => {
    dbMocks.createJob.mockResolvedValue({ id: 10, company: "Brivo", role: "AI Product Intern" });
    await caller().jobs.create({
      company: "Brivo",
      role: "AI Product Intern",
      jobDescription: "",
      contextMode: "limited",
      contactEmail: "hiring@brivo.com",
      status: "to-apply",
    });
    expect(dbMocks.createJob).toHaveBeenCalledWith(personalUser.id, expect.objectContaining({
      contextMode: "limited",
      contactEmail: "hiring@brivo.com",
      jobDescription: "",
    }));
  });

  it("clears tracker fields explicitly when updating an application", async () => {
    dbMocks.updateJobForUser.mockResolvedValue({ id: 9 });
    await caller().jobs.update({ id: 9, nextAction: null, followUpAt: null });
    expect(dbMocks.updateJobForUser).toHaveBeenCalledWith(personalUser.id, 9, { nextAction: null, followUpAt: null });
  });
});
