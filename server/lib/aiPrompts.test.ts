import { describe, expect, it } from "vitest";
import { buildEmailMessages, buildResumeMessages } from "./aiPrompts";

const profile = {
  resumeText: "Analyst at Northstar. Built weekly reporting in SQL.",
  personalBio: "I value direct, thoughtful communication.",
};
const job = { company: "Orbit", role: "Data Analyst", jobDescription: "Use SQL to improve reporting." };

describe("grounded AI prompts", () => {
  it("places the complete candidate source and job description in the resume request", () => {
    const messages = buildResumeMessages(profile, job);
    expect(String(messages[0].content)).toContain("Do not invent");
    expect(JSON.stringify(messages[1].content)).toContain(profile.resumeText);
    expect(JSON.stringify(messages[1].content)).toContain(job.jobDescription);
  });

  it("prohibits ungrounded company research in outreach drafts", () => {
    const messages = buildEmailMessages(profile, job);
    expect(String(messages[0].content)).toContain("Do not use external research");
    expect(String(messages[0].content)).toContain("only the email body");
  });
});
