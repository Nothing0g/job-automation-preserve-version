import { describe, expect, it } from "vitest";
import { groupFollowUpReminders } from "./reminders";

describe("groupFollowUpReminders", () => {
  it("separates active applications by their follow-up timing and ignores closed applications", () => {
    const jobs = [
      { id: 1, status: "applied", followUpAt: new Date("2026-08-16T12:00:00Z"), nextAction: "Send note" },
      { id: 2, status: "interview", followUpAt: new Date("2026-08-17T12:00:00Z"), nextAction: "Confirm time" },
      { id: 3, status: "to-apply", followUpAt: new Date("2026-08-18T12:00:00Z"), nextAction: "Apply" },
      { id: 4, status: "applied", followUpAt: null, nextAction: "Choose a date" },
      { id: 5, status: "rejected", followUpAt: new Date("2026-08-15T12:00:00Z"), nextAction: "Ignore" },
    ];
    const groups = groupFollowUpReminders(jobs, new Date("2026-08-17T09:00:00Z"));
    expect(groups.overdue.map(job => job.id)).toEqual([1]);
    expect(groups.today.map(job => job.id)).toEqual([2]);
    expect(groups.upcoming.map(job => job.id)).toEqual([3]);
    expect(groups.unscheduled.map(job => job.id)).toEqual([4]);
  });
});
