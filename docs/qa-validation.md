# Revision validation record

## Checked manually

| Area | Evidence |
|---|---|
| Direct access and fixed profile query | The dashboard and profile page both rendered without the prior `profile.get` undefined-data console error. The profile query now explicitly resolves to `null` when no profile is stored. |
| Light theme | Reviewed at desktop and mobile sizes. The warm editorial surface system, form elements, side navigation, cards, and empty state rendered without clipping or unreadable text. |
| Dark theme | Captured the dashboard and master profile in dark mode at desktop size. The final midnight-indigo surfaces, amber action accent, violet navigation state, form panels, and corrected profile hero all rendered with readable text and coherent depth. The persistent mode control switches the root `.dark` class. |
| Responsive behavior | Reviewed the application dashboard and master profile pages at 1280px and 375px widths. Navigation converts to a compact header with the theme toggle retained. |
| DOCX and PDF exports | Generated actual resume DOCX and PDF artifacts from a representative saved draft. The DOCX XML contained the expected title, role/company subtitle, headings, bullets, and body text. The rendered one-page PDF displayed the same factual content with clear hierarchy and spacing. |
| Reusable signature and reminders | Confirmed the master profile presents an editable closing block that is appended only to newly generated outreach emails. The dashboard groups active follow-ups as overdue, due today, upcoming, or needing a date; closed applications are omitted. |
| Paste-text job-context fallback | Captured the failed public-link-import state. The intake dialog clearly presents an editable “Paste the visible job text instead” area and requires at least 40 characters before it maps only user-reviewed text into the editable job-description field. The normal closed dialog was restored after the capture. |
| One-page resume review and approval | Reviewed an existing overlong workspace draft in the application view. The sample-aligned Times-style preview retained the compact hierarchy and correctly held copy, DOCX, and PDF actions in review, presenting an explicit shortening message rather than allowing approval when the fixed one-page renderer could not fit the content. New tailored resumes are prompted to stay within the compact one-page structure, and approval is cleared whenever the draft or target context changes. |
| Hosting handoff | `README.md` and `docs/hosting-handoff.md` explain the private direct-access boundary and the managed services that need replacements before an external Vercel deployment. |

## Automated checks

Run from the repository root:

```bash
pnpm test
pnpm check
```

The regression suite covers AI grounding prompts and the compact one-page constraint, tracker date parsing, the absent-profile null response, personal-workspace job creation with tracker fields, explicit tracker-field clearing on update, persisted resume approval safeguards, export formatting, descriptive export filenames, non-empty DOCX/PDF bytes, one-page overflow rejection, reusable signature insertion, paste-text fallback mapping, and follow-up reminder grouping.
