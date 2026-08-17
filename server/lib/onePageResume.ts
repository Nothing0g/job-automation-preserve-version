import { jsPDF } from "jspdf";

type ResumeBlock = { type: "heading" | "bullet" | "paragraph"; text: string; level?: 1 | 2 | 3 };

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

function blocks(content: string): ResumeBlock[] {
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

/** Uses the same compact Letter-page measurement as the resume PDF export, without saving a file. */
export function resumeFitsOnePage(content: string) {
  if (!content.trim()) return false;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 27;
  const contentWidth = pageWidth - margin * 2;
  const maxY = pageHeight - margin;
  let y = margin;
  let beforeFirstSection = true;

  const parsedBlocks = blocks(content);
  for (let index = 0; index < parsedBlocks.length; index += 1) {
    const block = parsedBlocks[index];
    const isContactLine = beforeFirstSection && index > 0 && block.type === "paragraph";
    if (block.type === "heading" && block.level === 2) beforeFirstSection = false;
    if (block.type === "heading" && block.level === 1) {
      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      y += pdf.splitTextToSize(block.text.toUpperCase(), contentWidth).length * 14 + 4;
    } else if (block.type === "heading" && block.level === 2) {
      y += 14;
    } else if (block.type === "heading" && block.level === 3) {
      pdf.setFont("times", "bold");
      pdf.setFontSize(8.7);
      y += pdf.splitTextToSize(block.text, contentWidth).length * 9 + 2;
    } else {
      pdf.setFont("times", "normal");
      pdf.setFontSize(isContactLine ? 7.3 : 8.15);
      const bulletOffset = block.type === "bullet" ? 13 : 0;
      const lines = pdf.splitTextToSize(block.text, contentWidth - bulletOffset);
      y += lines.length * (isContactLine ? 8.5 : 9) + (isContactLine ? 4 : 2);
    }
    if (y > maxY) return false;
  }
  return true;
}
