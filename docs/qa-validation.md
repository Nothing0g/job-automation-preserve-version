# Revision validation record

## Checked manually

| Area | Evidence |
|---|---|
| Direct access and fixed profile query | The dashboard and profile page both rendered without the prior `profile.get` undefined-data console error. The profile query now explicitly resolves to `null` when no profile is stored. |
| Light theme | Reviewed at desktop and mobile sizes. The warm editorial surface system, form elements, side navigation, cards, and empty state rendered without clipping or unreadable text. |
| Dark theme | Captured the dashboard and master profile in dark mode at desktop size. The final midnight-indigo surfaces, amber action accent, violet navigation state, form panels, and corrected profile hero all rendered with readable text and coherent depth. The persistent mode control switches the root `.dark` class. |
| Responsive behavior | Reviewed the application dashboard and master profile pages at 1280px and 375px widths. Navigation converts to a compact header with the theme toggle retained. |
| Hosting handoff | `README.md` and `docs/hosting-handoff.md` explain the private direct-access boundary and the managed services that need replacements before an external Vercel deployment. |

## Automated checks

Run from the repository root:

```bash
pnpm test
pnpm check
```

The regression suite covers AI grounding prompts, tracker date parsing, the absent-profile null response, personal-workspace job creation with tracker fields, and explicit tracker-field clearing on update.
