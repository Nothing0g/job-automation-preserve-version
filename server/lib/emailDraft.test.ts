import { describe, expect, it } from "vitest";
import { cleanEmailDraft } from "./emailDraft";

describe("cleanEmailDraft", () => {
  it("removes LLM wrappers and separators while preserving the email itself", () => {
    expect(cleanEmailDraft("```markdown\nHere is the email body:\n---\nHi Hiring Team,\n\nI would welcome a conversation.\n```"))
      .toBe("Hi Hiring Team,\n\nI would welcome a conversation.");
  });

  it("removes a generated subject line from a body-only draft", () => {
    expect(cleanEmailDraft("Subject: Application\n\nHello,"))
      .toBe("Hello,");
  });
});
