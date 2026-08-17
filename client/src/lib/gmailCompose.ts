export type GmailComposeInput = {
  to?: string | null;
  subject: string;
  body: string;
};

/** Creates a Gmail compose URL only; it never sends email or accesses a Gmail account. */
export function buildGmailComposeUrl({ to, subject, body }: GmailComposeInput) {
  const recipient = to?.trim() ?? "";
  const message = body.trim();
  if (!message) return null;

  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  if (recipient) url.searchParams.set("to", recipient);
  url.searchParams.set("su", subject.trim());
  url.searchParams.set("body", message);
  return url.toString();
}

/** Explains whether Gmail will receive a stored recipient; sending always remains user-controlled. */
export function gmailComposeGuidance(to?: string | null) {
  return to?.trim()
    ? "Your saved recipient is included."
    : "No recipient is saved for this role—add it in Gmail before you send.";
}
