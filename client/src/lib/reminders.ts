export type ReminderJob = {
  status: string;
  followUpAt: Date | null;
  nextAction: string | null;
};

export type ReminderGroups<T extends ReminderJob> = {
  overdue: T[];
  today: T[];
  upcoming: T[];
  unscheduled: T[];
};

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

/** Groups only active applications so the dashboard emphasizes the next useful follow-up. */
export function groupFollowUpReminders<T extends ReminderJob>(jobs: T[], referenceDate = new Date()): ReminderGroups<T> {
  const today = startOfDay(referenceDate);
  return jobs.reduce<ReminderGroups<T>>((groups, job) => {
    if (job.status === "rejected" || job.status === "offer") return groups;
    if (!job.followUpAt) {
      if (job.nextAction) groups.unscheduled.push(job);
      return groups;
    }
    const dueDay = startOfDay(job.followUpAt);
    if (dueDay < today) groups.overdue.push(job);
    else if (dueDay === today) groups.today.push(job);
    else groups.upcoming.push(job);
    return groups;
  }, { overdue: [], today: [], upcoming: [], unscheduled: [] });
}
