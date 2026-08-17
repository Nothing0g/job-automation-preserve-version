export type GmailComposeInput = {
  to: string;
  subject: string;
  body: string;
};

/** Creates a Gmail compose URL only; it never sends email or accesses a Gmail account. */
export function buildGmailComposeUrl({ to, subject, body }: GmailComposeInput) {
  const recipient = to.trim();
  const message = body.trim();
  if (!recipient || !message) return null;

  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  url.searchParams.set("to", recipient);
  url.searchParams.set("su", subject.trim());
  url.searchParams.set("body", message);
  return url.toString();
}
