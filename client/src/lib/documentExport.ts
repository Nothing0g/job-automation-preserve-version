import { AlignmentType, BorderStyle, Document, ExternalHyperlink, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";

export type ExportDocumentKind = "resume" | "cover-letter";

export type DraftBlock = {
  type: "heading" | "bullet" | "paragraph";
  text: string;
  level?: 1 | 2 | 3;
};

export type ContactLinks = {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

type DocumentContactLink = { label: string; value: string; href: string };

type ExportDocumentInput = {
  kind: ExportDocumentKind;
  content: string;
  company: string;
  role: string;
  fileStem: string;
  contactLinks?: ContactLinks;
};

const documentTitle = (kind: ExportDocumentKind) =>
  kind === "resume" ? "Tailored Resume" : "Personalized Cover Letter";

function cleanText(value: string) {
  return value
    .replace(/^```(?:markdown|md|text)?\s*/i, "")
    .replace(/\s*```$/i, "")
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
    .filter(line => Boolean(line) && !/^```(?:markdown|md|text)?$/i.test(line) && !/^(?:-{3,}|_{3,}|\*{3,})$/.test(line))
    .map(line => {
      if (line.startsWith("### ")) return { type: "heading" as const, text: cleanText(line.slice(4)), level: 3 as const };
      if (line.startsWith("## ")) return { type: "heading" as const, text: cleanText(line.slice(3)), level: 2 as const };
      if (line.startsWith("# ")) return { type: "heading" as const, text: cleanText(line.slice(2)), level: 1 as const };
      if (/^(?:[-*•]|\d+[.)])\s+/.test(line)) return { type: "bullet" as const, text: cleanText(line) };
      return { type: "paragraph" as const, text: cleanText(line) };
    })
    .filter(block => block.text.length > 0);
}

function exportContactLinks(contactLinks?: ContactLinks): DocumentContactLink[] {
  const links = contactLinks ?? {};
  return [
    links.email?.trim() ? { label: "Email", value: links.email.trim(), href: `mailto:${links.email.trim()}` } : null,
    links.phone?.trim() ? { label: "Mobile", value: links.phone.trim(), href: `tel:${links.phone.trim().replace(/[\s()-]/g, "")}` } : null,
    links.linkedin?.trim() ? { label: "LinkedIn", value: "LinkedIn", href: links.linkedin.trim() } : null,
    links.github?.trim() ? { label: "GitHub", value: "GitHub", href: links.github.trim() } : null,
    links.portfolio?.trim() ? { label: "Portfolio", value: "Portfolio", href: links.portfolio.trim() } : null,
  ].filter((link): link is DocumentContactLink => Boolean(link));
}

function linkRuns(links: DocumentContactLink[], color = "6B5B52") {
  return links.flatMap((link, index) => [
    ...(index > 0 ? [new TextRun({ text: "  ·  ", color, size: 17 })] : []),
    new ExternalHyperlink({ link: link.href, children: [new TextRun({ text: link.value, color, size: 17, underline: { type: "single", color } })] }),
  ]);
}

function coverLetterContactParagraph(contactLinks?: ContactLinks) {
  const links = exportContactLinks(contactLinks);
  return links.length ? new Paragraph({ alignment: AlignmentType.LEFT, children: linkRuns(links), spacing: { after: 260 } }) : null;
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

function coverLetterParagraph(block: DraftBlock) {
  if (block.type === "heading") {
    return new Paragraph({
      text: block.text,
      heading: block.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
    });
  }
  if (block.type === "bullet") return new Paragraph({ text: block.text, bullet: { level: 0 }, spacing: { after: 80 } });
  return new Paragraph({ text: block.text, spacing: { after: 130 }, keepLines: true });
}

function resumeParagraphs(content: string) {
  const blocks = formatDraftBlocks(content);
  let beforeFirstSection = true;

  return blocks.map((block, index) => {
    const isContactLine = beforeFirstSection && index > 0 && block.type === "paragraph";
    if (block.type === "heading" && block.level === 2) beforeFirstSection = false;

    if (block.type === "heading" && block.level === 1) {
      return new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: block.text.toUpperCase(), bold: true, font: "Times New Roman", size: 28 })], spacing: { after: 18 } });
    }
    if (block.type === "heading" && block.level === 2) {
      return new Paragraph({
        children: [new TextRun({ text: block.text.toUpperCase(), bold: true, font: "Times New Roman", size: 17 })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 5, color: "000000", space: 1 } },
        spacing: { before: 75, after: 20 },
        keepNext: true,
      });
    }
    if (block.type === "heading" && block.level === 3) {
      return new Paragraph({ children: [new TextRun({ text: block.text, bold: true, font: "Times New Roman", size: 17 })], spacing: { before: 25, after: 0 }, keepNext: true });
    }
    if (block.type === "bullet") {
      return new Paragraph({ children: [new TextRun({ text: `• ${block.text}`, font: "Times New Roman", size: 16 })], indent: { left: 180, hanging: 120 }, spacing: { after: 0, line: 150 } });
    }
    return new Paragraph({ alignment: isContactLine ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: block.text, font: "Times New Roman", size: isContactLine ? 15 : 16 })], spacing: { after: isContactLine ? 50 : 0, line: 150 }, keepLines: true });
  });
}

function renderResumePdf(pdf: jsPDF, content: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 27;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - margin;
  let y = margin;
  let beforeFirstSection = true;
  const ensureRoom = (height: number) => {
    if (y + height > maxY) throw new Error("This resume is too long for one page. Shorten or remove a few bullets, then preview it again.");
  };

  formatDraftBlocks(content).forEach((block, index) => {
    const isContactLine = beforeFirstSection && index > 0 && block.type === "paragraph";
    if (block.type === "heading" && block.level === 2) beforeFirstSection = false;

    if (block.type === "heading" && block.level === 1) {
      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      const lines = pdf.splitTextToSize(block.text.toUpperCase(), contentWidth);
      ensureRoom(lines.length * 14 + 4);
      pdf.text(lines, pageWidth / 2, y, { align: "center" });
      y += lines.length * 14 + 4;
      return;
    }
    if (block.type === "heading" && block.level === 2) {
      ensureRoom(15);
      pdf.setFont("times", "bold");
      pdf.setFontSize(8.6);
      pdf.text(block.text.toUpperCase(), margin, y + 7);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.45);
      pdf.line(margin, y + 9, pageWidth - margin, y + 9);
      y += 14;
      return;
    }
    if (block.type === "heading" && block.level === 3) {
      pdf.setFont("times", "bold");
      pdf.setFontSize(8.7);
      const lines = pdf.splitTextToSize(block.text, contentWidth);
      ensureRoom(lines.length * 9 + 2);
      pdf.text(lines, margin, y);
      y += lines.length * 9 + 2;
      return;
    }

    pdf.setFont("times", "normal");
    pdf.setFontSize(isContactLine ? 7.3 : 8.15);
    const bulletOffset = block.type === "bullet" ? 13 : 0;
    const lines = pdf.splitTextToSize(block.text, contentWidth - bulletOffset);
    const lineHeight = isContactLine ? 8.5 : 9;
    ensureRoom(lines.length * lineHeight + 2);
    if (block.type === "bullet") pdf.text("•", margin + 3, y);
    if (isContactLine) pdf.text(lines, pageWidth / 2, y, { align: "center" });
    else pdf.text(lines, margin + bulletOffset, y);
    y += lines.length * lineHeight + (isContactLine ? 4 : 2);
  });
}

function ensureOnePageResume(content: string) {
  const measurement = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  renderResumePdf(measurement, content);
}

export function resumeFitsOnePage(content: string) {
  try {
    ensureOnePageResume(content);
    return true;
  } catch {
    return false;
  }
}

export async function createDocxBlob(input: ExportDocumentInput) {
  if (input.kind === "resume") ensureOnePageResume(input.content);
  const title = documentTitle(input.kind);
  const document = new Document({
    creator: "Job Automation Studio",
    title,
    sections: [{
      properties: { page: { margin: input.kind === "resume" ? { top: 420, right: 450, bottom: 420, left: 450 } : { top: 900, right: 900, bottom: 900, left: 900 } } },
      children: input.kind === "resume"
        ? resumeParagraphs(input.content)
        : [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 34 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `${input.role} · ${input.company}`, color: "6B5B52", size: 20 })], spacing: { after: 320 } }),
          ...(coverLetterContactParagraph(input.contactLinks) ? [coverLetterContactParagraph(input.contactLinks)!] : []),
          ...formatDraftBlocks(input.content).map(coverLetterParagraph),
        ],
    }],
  });
  return Packer.toBlob(document);
}

function createPdf(input: ExportDocumentInput) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  if (input.kind === "resume") {
    renderResumePdf(pdf, input.content);
    return pdf;
  }
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  const addPageIfNeeded = (height: number) => {
    if (y + height > pageHeight - margin) { pdf.addPage(); y = margin; }
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

  const links = exportContactLinks(input.contactLinks);
  if (links.length) {
    pdf.setFontSize(9.5);
    pdf.setTextColor(82, 97, 116);
    let linkX = margin;
    links.forEach((link, index) => {
      const label = index > 0 ? ` · ${link.value}` : link.value;
      pdf.textWithLink(label, linkX, y, { url: link.href });
      linkX += pdf.getTextWidth(label);
    });
    y += 27;
  }

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
