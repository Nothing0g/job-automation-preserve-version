import { describe, expect, it } from "vitest";
import { appendEmailSignature } from "./emailSignature";

describe("appendEmailSignature", () => {
  it("keeps the generated email body and appends a saved signature with one blank line", () => {
    expect(appendEmailSignature("Hello Hiring Team,\n\nThank you.", "Best,\nAlex"))
      .toBe("Hello Hiring Team,\n\nThank you.\n\nBest,\nAlex");
  });

  it("does not add blank lines when the personal signature is empty", () => {
    expect(appendEmailSignature("Hello Hiring Team,", "   ")).toBe("Hello Hiring Team,");
  });
});
