import { describe, expect, it } from "vitest";
import { cleanEmailDraftForDisplay } from "./emailDraft";

describe("cleanEmailDraftForDisplay", () => {
  it("removes legacy Gmail wrapper text and dividers without changing the email", () => {
    expect(cleanEmailDraftForDisplay("Here is the email body:\n\n---\n\nHi Hiring Team,\n\nThank you."))
      .toBe("Hi Hiring Team,\n\nThank you.");
  });

  it("keeps normal paragraph content that is not a presentation wrapper", () => {
    expect(cleanEmailDraftForDisplay("Hi Priya,\n\nI came across the role yesterday."))
      .toBe("Hi Priya,\n\nI came across the role yesterday.");
  });
});
