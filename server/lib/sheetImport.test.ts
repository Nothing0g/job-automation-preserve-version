import { describe, expect, it } from "vitest";
import { buildSheetCsvUrl, parseJobsFromCsv } from "./sheetImport";

describe("sheet import parsing", () => {
  it("maps recognized headers and preserves quoted descriptions", () => {
    const result = parseJobsFromCsv('Company,Role,Job Description,Status\nNorthstar,Analyst,"Use SQL, dashboards, and reporting",Applied');
    expect(result.jobs).toEqual([
      { company: "Northstar", role: "Analyst", jobDescription: "Use SQL, dashboards, and reporting", status: "applied" },
    ]);
  });

  it("creates a selected-tab CSV URL for a Google Sheets document", () => {
    expect(buildSheetCsvUrl("https://docs.google.com/spreadsheets/d/abc_123/edit#gid=0", "Applications"))
      .toContain("/spreadsheets/d/abc_123/gviz/tq?tqx=out%3Acsv&sheet=Applications");
  });

  it("rejects non-Google URLs", () => {
    expect(() => buildSheetCsvUrl("https://example.com/data.csv", "Jobs")).toThrow("Google Sheets");
  });
});
