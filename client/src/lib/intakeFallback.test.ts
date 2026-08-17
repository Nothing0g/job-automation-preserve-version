import { describe, expect, it } from "vitest";
import { applyManualPostingContext, hasSufficientManualContext } from "./intakeFallback";

describe("public-link paste fallback", () => {
  it("keeps the fallback unavailable until useful visible posting text is provided", () => {
    expect(hasSufficientManualContext("Too short")).toBe(false);
    expect(hasSufficientManualContext("  Responsibilities include analysing customer data and preparing weekly reports.  ")).toBe(true);
  });

  it("maps only reviewed pasted text into the job description after an unavailable import", () => {
    const visibleText = "Responsibilities include analysing customer data and preparing weekly reports.";
    const result = applyManualPostingContext({ jobDescription: "", contextMode: "limited" as const, company: "Northstar", role: "Analyst" }, `  ${visibleText}  `);
    expect(result).toEqual({ company: "Northstar", role: "Analyst", jobDescription: visibleText, contextMode: "full" });
  });
});
