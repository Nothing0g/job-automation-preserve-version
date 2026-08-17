import * as XLSX from "xlsx";

export type TrackerExportJob = {
  id: number;
  company: string;
  role: string;
  status: string;
  contextMode: "full" | "limited";
  contactEmail?: string | null;
  sourceUrl?: string | null;
  nextAction?: string | null;
  followUpAt?: Date | string | null;
  jobDescription?: string | null;
  tailoredResume?: string | null;
  tailoredResumeApprovedAt?: Date | string | null;
  emailDraft?: string | null;
  notes?: string | null;
};

function dateValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function trackerExportRows(jobs: TrackerExportJob[]) {
  return jobs.map(job => ({
    "Application ID": job.id,
    Company: job.company,
    Role: job.role,
    Status: job.status,
    "Context mode": job.contextMode === "limited" ? "No JD / email-first" : "Full job description",
    "Contact email": job.contactEmail ?? "",
    "Source URL": job.sourceUrl ?? "",
    "Next action": job.nextAction ?? "",
    "Follow-up date": dateValue(job.followUpAt),
    "Job description": job.jobDescription ?? "",
    "Tailored resume": job.tailoredResume ?? "",
    "Resume approved": job.tailoredResumeApprovedAt ? "Yes" : "No",
    "Resume approval date": dateValue(job.tailoredResumeApprovedAt),
    "Personalized email draft": job.emailDraft ?? "",
    Notes: job.notes ?? "",
  }));
}

export function trackerWorkbook(jobs: TrackerExportJob[]) {
  const sheet = XLSX.utils.json_to_sheet(trackerExportRows(jobs));
  sheet["!cols"] = [
    { wch: 15 }, { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 42 }, { wch: 32 }, { wch: 16 }, { wch: 72 }, { wch: 72 }, { wch: 17 }, { wch: 20 }, { wch: 72 }, { wch: 52 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Application tracker");
  return workbook;
}

/** Downloads a local .xlsx copy only; no tracker data is sent to another service. */
export function downloadTrackerWorkbook(jobs: TrackerExportJob[]) {
  const filename = `job-application-tracker-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(trackerWorkbook(jobs), filename, { compression: true });
}
