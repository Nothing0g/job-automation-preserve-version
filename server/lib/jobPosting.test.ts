import { describe, expect, it } from "vitest";
import { extractJobPosting, validatePublicPostingUrl } from "./jobPosting";

describe("public job-posting extraction", () => {
  it("prefers structured JobPosting values over page chrome", () => {
    const output = extractJobPosting(`
      <html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Product Intern","description":"<p>Support research, product planning, and customer discovery with a collaborative team.</p>","hiringOrganization":{"@type":"Organization","name":"Northstar"}}</script></head>
      <body><nav>Home Jobs Sign in</nav><h1>Jobs</h1></body></html>`, "https://careers.example.com/jobs/123");
    expect(output).toMatchObject({ company: "Northstar", role: "Product Intern", sourceUrl: "https://careers.example.com/jobs/123" });
    expect(output.jobDescription).toContain("customer discovery");
  });

  it("returns a clear failure when a static page exposes no meaningful job details", () => {
    expect(() => extractJobPosting("<html><body><h1>Sign in</h1></body></html>", "https://jobs.example.com/role"))
      .toThrow("did not expose enough job detail");
  });

  it("rejects a local URL before attempting to fetch it", async () => {
    await expect(validatePublicPostingUrl("http://localhost:3000/jobs/1")).rejects.toThrow("public http");
  });
});
