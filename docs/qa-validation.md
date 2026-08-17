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
| Resume cleanup and exports | Added a shared parser rule for preview, server measurement, DOCX, and PDF output that discards literal Markdown fences and divider-only lines. The resume prompt now forbids both artifacts, and export regression coverage verifies they do not render. |
| Contact links and cover-letter exports | Master Profile now stores validated email, mobile, LinkedIn, GitHub, and portfolio values. A generated local DOCX/PDF cover-letter pair was programmatically inspected for all five targets: `mailto:candidate@example.com`, `tel:+919876543210`, LinkedIn, GitHub, and portfolio HTTPS URLs. Each target was present as an actual DOCX relationship and `/Subtype /Link` PDF URI annotation, not non-interactive text. Final activation will be confirmed in the user’s installed document viewer. |
| Outreach tone | The grounded email prompt now starts as a factual introduction—acknowledging that the candidate came across the role—then substantiates the candidate’s fit with sourced evidence rather than unsupported “perfect fit” language. |
| Visual system | Reviewed the dashboard and redesigned Master Profile at desktop size in both daylight and explicit dark preview states. The interface now applies an editorial desk motif consistently: a distinctive studio mark, purposeful typography, clearer candidate-record sections, stronger surface hierarchy, and a low-luminance blue-ink dark palette with a warm action accent and readable semantic text. |
| Application workspace visual review | Reviewed the actual Brivo / AI Product Intern workspace at desktop size in daylight and dark themes. Both views retained a clear two-column hierarchy—actions and source context on the left, resume preview and outreach draft on the right—with readable text, separated editable regions, visible approval/export controls, and no clipping or theme-color collisions. |
| Linked resume header | Loaded the Brivo workspace after the corrected implementation. The live resume preview contains active Email, Mobile, LinkedIn, GitHub, and Portfolio labels, linked through the saved Master Profile as `mailto:`, `tel:`, and HTTPS targets. The former raw contact line is excluded from the rendered resume body. |
| Refined dark workspace | Loaded the complete Brivo workspace after the final palette revision. The low-luminance ink background, mint action colour, light document surface, borders, labels, and editable controls remained readable; the rendered resume preview exposed the five concise saved-link labels as interactive anchors. |
| Refined light workspace | Loaded the complete Brivo workspace after the final palette revision. The warm parchment base, evergreen action colour, calm card surfaces, document pane, text hierarchy, editable controls, and rendered linked resume header were all visible and readable without clipping or contrast collisions. |
| Hosting handoff | `README.md` and `docs/hosting-handoff.md` explain the private direct-access boundary and the managed services that need replacements before an external Vercel deployment. |

## Automated checks

Run from the repository root:

```bash
pnpm test
pnpm check
```

The regression suite covers AI grounding prompts, conversational opening requirements, and the compact one-page constraint; tracker date parsing; the absent-profile null response; personal-workspace job creation with tracker fields; explicit tracker-field clearing on update; persisted resume approval safeguards; export formatting; Markdown-artifact cleanup; clickable resume-header labels and embedded DOCX/PDF URI targets; descriptive export filenames; non-empty DOCX/PDF bytes; one-page overflow rejection; reusable signature insertion; paste-text fallback mapping; and follow-up reminder grouping.
