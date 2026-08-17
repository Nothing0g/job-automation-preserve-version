export type JobDiscoverySource = {
  id: "linkedin" | "indeed" | "glassdoor" | "naukri" | "wellfound" | "google";
  name: string;
  description: string;
  focus: string;
};

export type JobDiscoveryLink = JobDiscoverySource & {
  href: string;
};

export const jobDiscoverySources: readonly JobDiscoverySource[] = [
  { id: "linkedin", name: "LinkedIn", focus: "Network", description: "Open the live role search on LinkedIn." },
  { id: "indeed", name: "Indeed", focus: "Broad search", description: "Open the live role search on Indeed." },
  { id: "glassdoor", name: "Glassdoor", focus: "Research", description: "Open Glassdoor’s job search with your terms." },
  { id: "naukri", name: "Naukri", focus: "India", description: "Open Naukri’s role search, including India-focused results." },
  { id: "wellfound", name: "Wellfound", focus: "Startups", description: "Open Wellfound’s startup job board with your role query." },
  { id: "google", name: "Google Jobs", focus: "Wide scan", description: "Run a broad web search for current role listings." },
];

function trimmed(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toNaukriSlug(value: string) {
  return trimmed(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates outbound live-search links only. Third-party job listings are never
 * fetched, copied, cached, or presented as results inside this application.
 */
export function buildJobDiscoveryLinks(role: string, location = ""): JobDiscoveryLink[] {
  const searchRole = trimmed(role);
  const searchLocation = trimmed(location);
  if (!searchRole) return [];

  const linkedIn = new URL("https://www.linkedin.com/jobs/search/");
  linkedIn.searchParams.set("keywords", searchRole);
  if (searchLocation) linkedIn.searchParams.set("location", searchLocation);

  const indeed = new URL("https://www.indeed.com/jobs");
  indeed.searchParams.set("q", searchRole);
  if (searchLocation) indeed.searchParams.set("l", searchLocation);

  const glassdoor = new URL("https://www.glassdoor.com/Job/jobs.htm");
  glassdoor.searchParams.set("sc.keyword", searchRole);
  if (searchLocation) glassdoor.searchParams.set("locKeyword", searchLocation);

  const wellfound = new URL("https://wellfound.com/jobs");
  wellfound.searchParams.set("query", searchRole);
  if (searchLocation) wellfound.searchParams.set("location", searchLocation);

  const broadSearch = new URL("https://www.google.com/search");
  broadSearch.searchParams.set("q", `${searchRole}${searchLocation ? ` ${searchLocation}` : ""} jobs`);

  const naukriRole = toNaukriSlug(searchRole);
  const naukriLocation = toNaukriSlug(searchLocation);
  const naukriPath = naukriLocation ? `/${naukriRole}-jobs-in-${naukriLocation}` : `/${naukriRole}-jobs`;

  const urls: Record<JobDiscoverySource["id"], string> = {
    linkedin: linkedIn.toString(),
    indeed: indeed.toString(),
    glassdoor: glassdoor.toString(),
    naukri: `https://www.naukri.com${naukriPath}`,
    wellfound: wellfound.toString(),
    google: broadSearch.toString(),
  };

  return jobDiscoverySources.map(source => ({ ...source, href: urls[source.id] }));
}
