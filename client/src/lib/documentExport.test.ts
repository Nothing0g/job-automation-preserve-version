import { describe, expect, it } from "vitest";
import { createDocxBlob, createExportFilename, createPdfArrayBuffer, formatDraftBlocks } from "./documentExport";

const sampleDocument = {
  company: "Northstar",
  role: "Data Analyst",
  kind: "resume" as const,
  content: "# Summary\nA factual profile.\n- Built reporting tools\n## Experience\nA focused accomplishment.",
  fileStem: "northstar-data-analyst",
};

describe("document export formatting", () => {
  it("preserves headings, bullets, and body text in a clean export structure", () => {
    expect(formatDraftBlocks("# Summary\n**Results** that matter\n- Built a dashboard\n\nA factual closing."))
      .toEqual([
        { type: "heading", text: "Summary", level: 1 },
        { type: "paragraph", text: "Results that matter" },
        { type: "bullet", text: "Built a dashboard" },
        { type: "paragraph", text: "A factual closing." },
      ]);
  });

  it("uses descriptive filenames for both supported formats", () => {
    expect(createExportFilename("northstar-data-analyst", "resume", "docx"))
      .toBe("northstar-data-analyst-tailored-resume.docx");
    expect(createExportFilename("northstar-data-analyst", "cover-letter", "pdf"))
      .toBe("northstar-data-analyst-cover-letter.pdf");
  });

  it("creates non-empty DOCX and PDF document bytes from a saved draft", async () => {
    const [docx, pdf] = await Promise.all([
      createDocxBlob(sampleDocument),
      Promise.resolve(createPdfArrayBuffer(sampleDocument)),
    ]);
    expect(docx.size).toBeGreaterThan(500);
    expect(pdf.byteLength).toBeGreaterThan(500);
  });
});
