/** Converts an HTML date input to a stable noon-UTC timestamp for storage. */
export function parseFollowUpDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Follow-up date must use the YYYY-MM-DD format.");
  }
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Follow-up date is invalid.");
  return parsed;
}
