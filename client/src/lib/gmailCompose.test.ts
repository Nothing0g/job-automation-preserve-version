import { describe, expect, it } from "vitest";
import { buildGmailComposeUrl, gmailComposeGuidance } from "./gmailCompose";

describe("Gmail compose handoff", () => {
  it("prefills recipient, subject, and body without invoking any send action", () => {
    const url = new URL(buildGmailComposeUrl({
      to: "hiring@example.com",
      subject: "Application for Product Analyst at Northstar",
      body: "Hello Hiring Team,\n\nI came across the role.",
    })!);
    expect(url.origin + url.pathname).toBe("https://mail.google.com/mail/");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("hiring@example.com");
    expect(url.searchParams.get("su")).toBe("Application for Product Analyst at Northstar");
    expect(url.searchParams.get("body")).toContain("I came across the role.");
    expect(url.searchParams.has("send")).toBe(false);
  });

  it("opens Gmail with the subject and draft when the recipient is not yet known", () => {
    const url = new URL(buildGmailComposeUrl({ to: "", subject: "Subject", body: "Draft" })!);
    expect(url.searchParams.get("su")).toBe("Subject");
    expect(url.searchParams.get("body")).toBe("Draft");
    expect(url.searchParams.has("to")).toBe(false);
  });

  it("does not create a compose URL when the draft content is absent", () => {
    expect(buildGmailComposeUrl({ to: "hiring@example.com", subject: "Subject", body: "  " })).toBeNull();
  });

  it("provides explicit recipient guidance for both compose states", () => {
    expect(gmailComposeGuidance("hiring@example.com")).toContain("saved recipient");
    expect(gmailComposeGuidance("")).toContain("add it in Gmail");
  });
});
