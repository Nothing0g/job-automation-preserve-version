/** Removes only known presentational wrappers left by older generated outreach drafts. */
export function cleanEmailDraftForDisplay(value: string) {
  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .filter(line => !/^(?:```(?:markdown|text|plain)?|---+|here(?:'| i)s (?:the )?email body:?|email body:)\s*$/i.test(line.trim()));

  while (/^(?:subject|email subject)\s*:/i.test(lines[0]?.trim() ?? "")) lines.shift();
  return lines.join("\n").replace(/^\s+|\s+$/g, "");
}
