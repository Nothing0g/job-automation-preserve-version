import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { trackerExportRows, trackerWorkbook } from "./trackerExport";

const job = {
  id: 14,
  company: "Northstar Analytics",
  role: "Business Analyst",
  status: "interview",
  contextMode: "full" as const,
  contactEmail: "talent@northstar.example",
  sourceUrl: "https://careers.example/jobs/14",
  nextAction: "Prepare case-study notes",
  followUpAt: new Date("2026-08-20T00:00:00.000Z"),
  jobDescription: "Analyse reporting data.",
  tailoredResume: "# Candidate\n## EXPERIENCE",
  tailoredResumeApprovedAt: new Date("2026-08-18T00:00:00.000Z"),
  emailDraft: "Hello hiring team,",
  notes: "Asked about the team structure.",
};

describe("tracker workbook export", () => {
  it("includes all available application tracker details in a readable local row", () => {
    expect(trackerExportRows([job])).toEqual([expect.objectContaining({
      "Application ID": 14,
      Company: "Northstar Analytics",
      "Contact email": "talent@northstar.example",
      "Follow-up date": "2026-08-20",
      "Resume approved": "Yes",
      "Personalized email draft": "Hello hiring team,",
    })]);
  });

  it("creates an xlsx workbook with the tracker worksheet and export headers", () => {
    const workbook = trackerWorkbook([job]);
    expect(workbook.SheetNames).toEqual(["Application tracker"]);
    const records = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets["Application tracker"]);
    expect(records[0]).toMatchObject({ Company: "Northstar Analytics", "Next action": "Prepare case-study notes" });
  });
});
