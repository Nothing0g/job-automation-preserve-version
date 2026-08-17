import { describe, expect, it } from "vitest";
import { buildGmailComposeUrl } from "./gmailCompose";

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

  it("does not create a compose URL when recipient or draft content is absent", () => {
    expect(buildGmailComposeUrl({ to: "", subject: "Subject", body: "Draft" })).toBeNull();
    expect(buildGmailComposeUrl({ to: "hiring@example.com", subject: "Subject", body: "  " })).toBeNull();
  });
});
