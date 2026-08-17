import { describe, expect, it } from "vitest";
import { resumeFitsOnePage } from "./onePageResume";

describe("one-page resume measurement", () => {
  it("accepts a compact factual resume and rejects an overlong draft", () => {
    expect(resumeFitsOnePage("# Candidate Name\ncontact@example.com\n## EXPERIENCE\n### Analyst\n- Built a factual reporting workflow."))
      .toBe(true);
    expect(resumeFitsOnePage(`# Candidate Name\ncontact@example.com\n## EXPERIENCE\n${Array.from({ length: 150 }, (_, index) => `- Factual accomplishment ${index + 1} with a documented outcome and relevant implementation detail.`).join("\n")}`))
      .toBe(false);
  });
});
