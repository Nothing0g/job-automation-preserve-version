# Job Automation Studio

Job Automation Studio is a private, personal application workspace. It stores a master resume and context, creates fact-grounded tailored resumes and outreach drafts, tracks every application, and surfaces the next follow-up action.

## Daily workflow

1. Open **Master profile** and save your factual resume and any helpful personal context.
2. Choose **New application**, enter the company, role, full job description, and an optional next action or follow-up date.
3. The app saves the application and prepares a tailored resume plus a personalized outreach email using only your stored profile and the job description.
4. Review, edit, copy, or download the drafts in the application workspace. Update the stage and tracker as the application progresses.

## Privacy and access

This version deliberately uses **direct personal access** and has no visible sign-in step. It is appropriate for a private workspace where only you can reach the app.

> Do not deploy this direct-access build to a public URL. Without an access layer, any person who reaches that URL could access the same personal workspace and its data.

For a hosted personal deployment, place it behind an access control layer such as Vercel Authentication, Cloudflare Access, or a private network. If the app will ever be accessible to anyone else, restore user authentication before deployment.

## GitHub handoff

The repository excludes secrets and is ready to export. Keep the project private. Never commit `.env` files, database credentials, storage keys, or AI API keys.

## External hosting note

The app currently uses the managed database, object storage, and AI gateway supplied by its original environment. A straight GitHub-to-Vercel import will build the interface, but the full functionality requires replacements for each managed dependency:

| Capability | Required self-hosted replacement |
|---|---|
| Database | MySQL-compatible database and `DATABASE_URL` |
| Resume PDF storage | Private S3-compatible bucket and server-side upload helpers |
| AI tailoring | A provider API key plus a replacement for the server AI gateway |
| Personal data protection | Vercel Authentication, Cloudflare Access, or restored app authentication |

Built-in managed hosting remains the lowest-maintenance way to use the application. If you prefer Vercel, complete the dependency substitutions above before connecting the repository, then add the required secrets in Vercel’s project settings rather than the repository.
