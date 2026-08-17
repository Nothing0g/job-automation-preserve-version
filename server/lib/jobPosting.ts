import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { load } from "cheerio";

export type ExtractedJobPosting = {
  company: string;
  role: string;
  jobDescription: string;
  sourceUrl: string;
};

const MAX_PAGE_BYTES = 1_000_000;
const REQUEST_TIMEOUT_MS = 12_000;

function text(value: string | undefined | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function removeMarkup(value: string | undefined | null) {
  return text(load(`<div>${value ?? ""}</div>`)("div").text());
}

function privateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized.startsWith("::ffff:127.");
}

export async function validatePublicPostingUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a complete public job-posting URL.");
  }
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.port) {
    throw new Error("Use a standard public http(s) job-posting URL.");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("This link does not point to a public job page.");
  }
  if (isIP(hostname) && privateAddress(hostname)) throw new Error("This link does not point to a public job page.");
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(entry => privateAddress(entry.address))) {
    throw new Error("This link does not point to a public job page.");
  }
  return parsed;
}

async function readBounded(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_PAGE_BYTES) throw new Error("This posting page is too large to import. Paste the job details instead.");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_PAGE_BYTES) {
      await reader.cancel();
      throw new Error("This posting page is too large to import. Paste the job details instead.");
    }
    chunks.push(value);
  }
  const combined = new Uint8Array(length);
  let offset = 0;
  chunks.forEach(chunk => { combined.set(chunk, offset); offset += chunk.byteLength; });
  return new TextDecoder().decode(combined);
}

function firstJobPosting(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) { const found = firstJobPosting(item); if (found) return found; }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (type === "JobPosting" || Array.isArray(type) && type.includes("JobPosting")) return record;
  return firstJobPosting(record["@graph"]);
}

function organizationName(value: unknown) {
  if (typeof value === "string") return text(value);
  if (value && typeof value === "object" && "name" in value) return text(String((value as { name?: unknown }).name ?? ""));
  return "";
}

export function extractJobPosting(html: string, sourceUrl: string): ExtractedJobPosting {
  const $ = load(html);
  let structured: Record<string, unknown> | null = null;
  $("script[type='application/ld+json']").each((_, element) => {
    if (structured) return;
    try { structured = firstJobPosting(JSON.parse($(element).text())); } catch { /* Ignore invalid site markup. */ }
  });
  // Cheerio assigns inside a callback; preserve the parsed value explicitly for TypeScript's control-flow analysis.
  const structuredData = structured as Record<string, unknown> | null;
  const metadata = (name: string) => text($("meta").filter((_, element) => $(element).attr("property") === name || $(element).attr("name") === name).first().attr("content"));
  const hostLabel = new URL(sourceUrl).hostname.replace(/^www\./, "").split(".")[0].replace(/[-_]/g, " ");
  const role = text(String(structuredData?.title ?? "")) || text($("h1").first().text()) || metadata("og:title") || text($("title").text()).split(/[|–—]/)[0].trim();
  const company = organizationName(structuredData?.hiringOrganization) || metadata("og:site_name") || hostLabel;
  const structuredDescription = removeMarkup(typeof structuredData?.description === "string" ? structuredData.description : "");
  const visibleDescription = text($("main, [class*='description' i], [id*='description' i], [class*='job-detail' i]").first().text());
  const fallbackDescription = text($("body").text());
  const jobDescription = (structuredDescription || visibleDescription || fallbackDescription).slice(0, 40_000);
  if (!role || role.length < 2 || !jobDescription || jobDescription.length < 80) {
    throw new Error("This public page did not expose enough job detail to import. Enter the role manually or use No JD Mode.");
  }
  return { company: company.slice(0, 255), role: role.slice(0, 255), jobDescription, sourceUrl };
}

export async function fetchPublicJobPosting(rawUrl: string) {
  let url = await validatePublicPostingUrl(rawUrl);
  for (let redirectCount = 0; redirectCount < 4; redirectCount += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "JobAutomationStudio/1.0 (public job detail import)", accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("This posting page redirected without a destination.");
      url = await validatePublicPostingUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error("This public job page could not be read. Check the link or enter the details manually.");
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("This link is not an HTML job-posting page. Enter the details manually.");
    }
    return extractJobPosting(await readBounded(response), url.toString());
  }
  throw new Error("This job page redirected too many times. Enter the details manually.");
}
