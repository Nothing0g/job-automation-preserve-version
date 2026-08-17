# Hosting handoff

## Recommended path

Use the managed deployment attached to this project for the least operational work. It already supplies the database, file storage, AI gateway, and deployment environment used by the application. To deploy there, create a checkpoint and select **Publish** in the project interface.

## GitHub repository

The repository is intended to be private because it contains the implementation for processing personal career information. Source code excludes runtime secrets. A private GitHub repository is suitable for backups, review, and future development.

## Vercel boundary

This project is an Express-backed application, not a static site. Vercel deployment is possible only after moving the server implementation to a compatible Vercel runtime and supplying equivalent services for the database, PDF storage, and AI generation. The project should not be published publicly in direct-access mode.

Before an external deployment, choose one access-control approach:

| Approach | Effect |
|---|---|
| Vercel Authentication | Restricts the deployment to an approved identity before the app loads. |
| Cloudflare Access | Places identity-aware access control in front of the deployment. |
| App authentication | Re-enables a normal account sign-in workflow within the app. |

The direct-access personal-workspace mode is compatible with a private environment only. It intentionally trades a sign-in screen for convenience and therefore must not be exposed without one of the controls above.
