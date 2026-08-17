import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { createDocxBlob, createExportFilename, createPdfArrayBuffer, formatDraftBlocks, resumeFitsOnePage } from "./documentExport";

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

  it("removes raw Markdown fences and divider-only lines from export content", () => {
    expect(formatDraftBlocks("```markdown\n# Candidate\n---\n## Experience\n- Built a dashboard\n```"))
      .toEqual([
        { type: "heading", text: "Candidate", level: 1 },
        { type: "heading", text: "Experience", level: 2 },
        { type: "bullet", text: "Built a dashboard" },
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
      createDocxBlob({ ...sampleDocument, kind: "cover-letter", contactLinks: { email: "candidate@example.com", github: "https://github.com/candidate" } }),
      Promise.resolve(createPdfArrayBuffer({ ...sampleDocument, kind: "cover-letter", contactLinks: { email: "candidate@example.com", github: "https://github.com/candidate" } })),
    ]);
    expect(docx.size).toBeGreaterThan(500);
    expect(pdf.byteLength).toBeGreaterThan(500);
  });

  it("embeds saved contact details as clickable DOCX and PDF hyperlinks", async () => {
    const contactLinks = { email: "candidate@example.com", phone: "+91 98765 43210", linkedin: "https://linkedin.com/in/candidate", github: "https://github.com/candidate", portfolio: "https://candidate.dev" };
    const docx = await createDocxBlob({ ...sampleDocument, kind: "cover-letter", contactLinks });
    const zip = await JSZip.loadAsync(await docx.arrayBuffer());
    const relationships = await zip.file("word/_rels/document.xml.rels")?.async("text");
    const pdfText = new TextDecoder().decode(new Uint8Array(createPdfArrayBuffer({ ...sampleDocument, kind: "cover-letter", contactLinks })));

    expect(relationships).toContain("mailto:candidate@example.com");
    expect(relationships).toContain("tel:+919876543210");
    expect(relationships).toContain("https://github.com/candidate");
    expect(pdfText).toContain("/Subtype /Link");
    expect(pdfText).toContain("/URI (mailto:candidate@example.com)");
    expect(pdfText).toContain("/URI (tel:+919876543210)");
    expect(pdfText).toContain("/URI (https://candidate.dev)");
  });

  it("keeps resume exports to one page by rejecting content that cannot fit the compact layout", () => {
    const tooLong = `# Candidate Name\ncontact@example.com\n## EXPERIENCE\n${Array.from({ length: 140 }, (_, index) => `- Factual accomplishment number ${index + 1} with a supported result.`).join("\n")}`;
    expect(resumeFitsOnePage(tooLong)).toBe(false);
    expect(() => createPdfArrayBuffer({ ...sampleDocument, content: tooLong }))
      .toThrow("too long for one page");
  });
});
