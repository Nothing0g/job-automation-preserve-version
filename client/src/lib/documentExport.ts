import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";

export type ExportDocumentKind = "resume" | "cover-letter";

export type DraftBlock = {
  type: "heading" | "bullet" | "paragraph";
  text: string;
  level?: 1 | 2;
};

type ExportDocumentInput = {
  kind: ExportDocumentKind;
  content: string;
  company: string;
  role: string;
  fileStem: string;
};

const documentTitle = (kind: ExportDocumentKind) =>
  kind === "resume" ? "Tailored Resume" : "Personalized Cover Letter";

function cleanText(value: string) {
  return value
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function createExportFilename(fileStem: string, kind: ExportDocumentKind, extension: "docx" | "pdf") {
  const safeStem = fileStem.trim() || "application";
  return `${safeStem}-${kind === "resume" ? "tailored-resume" : "cover-letter"}.${extension}`;
}

export function formatDraftBlocks(content: string): DraftBlock[] {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      if (line.startsWith("### ")) return { type: "heading" as const, text: cleanText(line.slice(4)), level: 2 as const };
      if (line.startsWith("## ") || line.startsWith("# ")) return { type: "heading" as const, text: cleanText(line.replace(/^#+\s*/, "")), level: 1 as const };
      if (/^(?:[-*•]|\d+[.)])\s+/.test(line)) return { type: "bullet" as const, text: cleanText(line) };
      return { type: "paragraph" as const, text: cleanText(line) };
    })
    .filter(block => block.text.length > 0);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function docxParagraph(block: DraftBlock) {
  if (block.type === "heading") {
    return new Paragraph({
      text: block.text,
      heading: block.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
    });
  }
  if (block.type === "bullet") {
    return new Paragraph({ text: block.text, bullet: { level: 0 }, spacing: { after: 80 } });
  }
  return new Paragraph({ text: block.text, spacing: { after: 130 }, keepLines: true });
}

export async function createDocxBlob(input: ExportDocumentInput) {
  const title = documentTitle(input.kind);
  const document = new Document({
    creator: "Job Automation Studio",
    title,
    sections: [
      {
        properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
        children: [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 34 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `${input.role} · ${input.company}`, color: "6B5B52", size: 20 })], spacing: { after: 320 } }),
          ...formatDraftBlocks(input.content).map(docxParagraph),
        ],
      },
    ],
  });
  return Packer.toBlob(document);
}

function createPdf(input: ExportDocumentInput) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (height: number) => {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setTextColor(43, 34, 30);
  pdf.setFont("times", "bold");
  pdf.setFontSize(23);
  pdf.text(documentTitle(input.kind), margin, y);
  y += 27;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(104, 86, 75);
  pdf.text(`${input.role} · ${input.company}`, margin, y);
  y += 31;

  for (const block of formatDraftBlocks(input.content)) {
    const fontSize = block.type === "heading" ? (block.level === 1 ? 15 : 12) : 10.5;
    const lineHeight = block.type === "heading" ? 18 : 15;
    pdf.setFont(block.type === "heading" ? "times" : "helvetica", block.type === "heading" ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    pdf.setTextColor(43, 34, 30);
    const prefix = block.type === "bullet" ? "•  " : "";
    const lines = pdf.splitTextToSize(`${prefix}${block.text}`, contentWidth - (block.type === "bullet" ? 12 : 0));
    addPageIfNeeded(lines.length * lineHeight + 12);
    pdf.text(lines, margin + (block.type === "bullet" ? 8 : 0), y);
    y += lines.length * lineHeight + (block.type === "heading" ? 10 : 8);
  }
  return pdf;
}

export function createPdfArrayBuffer(input: ExportDocumentInput) {
  return createPdf(input).output("arraybuffer");
}

export async function exportDocx(input: ExportDocumentInput) {
  downloadBlob(await createDocxBlob(input), createExportFilename(input.fileStem, input.kind, "docx"));
}

export function exportPdf(input: ExportDocumentInput) {
  createPdf(input).save(createExportFilename(input.fileStem, input.kind, "pdf"));
}
