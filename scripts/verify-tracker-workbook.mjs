import * as XLSX from "xlsx";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { trackerWorkbook } from "../client/src/lib/trackerExport.ts";

const outputDir = resolve("/home/ubuntu/Downloads");
const outputPath = resolve(outputDir, "job-application-tracker-verification.xlsx");
mkdirSync(outputDir, { recursive: true });

const workbook = trackerWorkbook([
  {
    id: 1,
    company: "Brivo",
    role: "AI Product Intern",
    status: "to-apply",
    contextMode: "full",
    contactEmail: null,
    sourceUrl: "https://careers.brivo.com/en/postings/f8348d24-0612-4e7a-8de9-643226471c45",
    nextAction: null,
    followUpAt: null,
    jobDescription: "Imported Brivo AI Product Intern job description.",
    tailoredResume: "Saved tailored resume content.",
    tailoredResumeApprovedAt: null,
    emailDraft: "Saved personalized email draft.",
    notes: null,
  },
]);

XLSX.writeFile(workbook, outputPath, { compression: true });
const reopened = XLSX.read(readFileSync(outputPath), { type: "buffer" });
const rows = XLSX.utils.sheet_to_json(reopened.Sheets["Application tracker"], { defval: "" });
console.log(JSON.stringify({ outputPath, sheetNames: reopened.SheetNames, headers: Object.keys(rows[0] ?? {}), firstRow: rows[0] }, null, 2));
