import JSZip from "jszip";
import { createDocxBlob, createPdfArrayBuffer } from "../client/src/lib/documentExport.ts";

const input = {
  kind: "cover-letter",
  content: "# Hello Hiring Team\nI came across the Data Analyst opening and wanted to introduce myself.\n\nBest,\nCandidate Name",
  company: "Northstar",
  role: "Data Analyst",
  fileStem: "northstar-data-analyst",
  contactLinks: {
    email: "candidate@example.com",
    phone: "+91 98765 43210",
    linkedin: "https://linkedin.com/in/candidate",
    github: "https://github.com/candidate",
    portfolio: "https://candidate.dev",
  },
};

const docx = await createDocxBlob(input);
const zip = await JSZip.loadAsync(await docx.arrayBuffer());
const relationships = await zip.file("word/_rels/document.xml.rels")?.async("text") ?? "";
const pdfText = new TextDecoder().decode(new Uint8Array(createPdfArrayBuffer(input)));
const expectedTargets = ["mailto:candidate@example.com", "tel:+919876543210", "https://linkedin.com/in/candidate", "https://github.com/candidate", "https://candidate.dev"];

for (const target of expectedTargets) {
  if (!relationships.includes(target) || !pdfText.includes(`/URI (${target})`)) throw new Error(`Missing export hyperlink annotation: ${target}`);
  console.log(`Verified DOCX and PDF link target: ${target}`);
}
