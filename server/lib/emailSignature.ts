/** Appends the user's saved sign-off exactly once to a newly generated email body. */
export function appendEmailSignature(emailBody: string, emailSignature?: string | null) {
  const body = emailBody.trim();
  const signature = emailSignature?.trim();
  return signature ? `${body}\n\n${signature}` : body;
}
