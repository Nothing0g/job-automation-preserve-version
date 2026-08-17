import { ApplicationStatus } from "../../drizzle/schema";

export type SheetJob = {
  company: string;
  role: string;
  jobDescription: string;
  status: ApplicationStatus;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

export function normalizeStatus(value?: string): ApplicationStatus {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("interview")) return "interview";
  if (normalized.includes("offer")) return "offer";
  if (normalized.includes("reject")) return "rejected";
  if (normalized.includes("applied") || normalized.includes("submit")) return "applied";
  return "to-apply";
}

export function parseJobsFromCsv(csv: string): { jobs: SheetJob[]; skipped: number } {
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error("The selected sheet needs a header row and at least one job row.");
  const headers = rows[0].map(normalizeHeader);
  const companyIndex = headers.findIndex(header => ["company", "companyname"].includes(header));
  const roleIndex = headers.findIndex(header => ["role", "roletitle", "title", "jobtitle", "position"].includes(header));
  const descriptionIndex = headers.findIndex(header => ["jobdescription", "description", "jd"].includes(header));
  const statusIndex = headers.findIndex(header => ["status", "applicationstatus"].includes(header));

  if (companyIndex < 0 || roleIndex < 0 || descriptionIndex < 0) {
    throw new Error("Use headers named Company, Role, and Job Description. Status is optional.");
  }

  const seen = new Set<string>();
  let skipped = 0;
  const jobs = rows.slice(1).flatMap(row => {
    const company = (row[companyIndex] ?? "").trim();
    const role = (row[roleIndex] ?? "").trim();
    const jobDescription = (row[descriptionIndex] ?? "").trim();
    if (!company || !role || !jobDescription) {
      skipped += 1;
      return [];
    }
    const key = `${company.toLowerCase()}|${role.toLowerCase()}|${jobDescription.slice(0, 80).toLowerCase()}`;
    if (seen.has(key)) {
      skipped += 1;
      return [];
    }
    seen.add(key);
    return [{ company, role, jobDescription, status: normalizeStatus(statusIndex >= 0 ? row[statusIndex] : undefined) }];
  });

  return { jobs: jobs.slice(0, 200), skipped: skipped + Math.max(jobs.length - 200, 0) };
}

export function buildSheetCsvUrl(sheetUrl: string, sheetName: string) {
  const parsed = new URL(sheetUrl.trim());
  if (parsed.hostname !== "docs.google.com") {
    throw new Error("Use a Google Sheets URL from docs.google.com.");
  }
  const match = parsed.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match?.[1]) throw new Error("That does not look like a Google Sheets document URL.");
  if (!sheetName.trim()) throw new Error("Enter the tab name you want to import.");
  const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq`);
  exportUrl.searchParams.set("tqx", "out:csv");
  exportUrl.searchParams.set("sheet", sheetName.trim());
  return exportUrl.toString();
}
