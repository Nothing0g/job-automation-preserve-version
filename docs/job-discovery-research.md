# Job Discovery Source Review

## Scope

The discovery feature should help the personal workspace open **live public search results** on established job boards. It should not copy, cache, or represent third-party listings as its own data. A user supplies a role and optional location; the application constructs clearly labelled external search links that open in a new tab.

| Source | Public entry point reviewed | Finding | Product decision |
|---|---|---|---|
| LinkedIn | `https://www.linkedin.com/jobs` and LinkedIn Help’s *Search for jobs on LinkedIn* article | The official Jobs entry point and help documentation describe job and location search. The sandbox browser timed out while loading the live Jobs page, so no listing data will be fetched or reproduced. | Link to LinkedIn’s live job search using a role/location query, labelled as an external search. |
| Indeed | `https://www.indeed.com/` | The public site identifies itself as **Job Search**. The current page directed the browser to sign in, reinforcing that account or regional behaviour belongs to the provider. | Link to Indeed’s live job search without trying to bypass sign-in, scrape listings, or claim availability. |
| Glassdoor | `https://www.glassdoor.com/Job/index.htm` | The live destination reported that the provider was unavailable in the sandbox’s region. | Offer the official entry point as an external search only; do not infer availability or retrieve listings. |
| Naukri | `https://www.naukri.com/` | The public home page describes a job search service, shows popular role links, and exposes company job pages. A CAPTCHA blocked further automation. | Include Naukri as an India-focused external search, without circumventing the CAPTCHA or scraping results. |

## Implementation Boundary

The feature will provide a curated collection of external searches rather than automated scraping. This approach preserves attribution, respects each provider’s own authentication, filters, local availability, and terms, and ensures that the user sees the freshest results directly on the source site.

## Sources

1. [LinkedIn Jobs](https://www.linkedin.com/jobs)
2. [Search for jobs on LinkedIn — LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a511260)
3. [Indeed Job Search](https://www.indeed.com/)
4. [Glassdoor Job Search](https://www.glassdoor.com/Job/index.htm)
5. [Naukri](https://www.naukri.com/)
