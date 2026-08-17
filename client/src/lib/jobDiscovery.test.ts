import { describe, expect, it } from "vitest";
import { buildJobDiscoveryLinks } from "./jobDiscovery";

describe("job discovery links", () => {
  it("builds live external searches with the supplied role and location", () => {
    const links = buildJobDiscoveryLinks("Product Analyst", "Bengaluru");
    const linkedIn = new URL(links.find(link => link.id === "linkedin")!.href);
    const indeed = new URL(links.find(link => link.id === "indeed")!.href);
    const google = new URL(links.find(link => link.id === "google")!.href);

    expect(links).toHaveLength(6);
    expect(linkedIn.searchParams.get("keywords")).toBe("Product Analyst");
    expect(linkedIn.searchParams.get("location")).toBe("Bengaluru");
    expect(indeed.searchParams.get("q")).toBe("Product Analyst");
    expect(indeed.searchParams.get("l")).toBe("Bengaluru");
    expect(google.searchParams.get("q")).toBe("Product Analyst Bengaluru jobs");
  });

  it("creates a clean Naukri role route and does not create links without a role", () => {
    const naukri = buildJobDiscoveryLinks("  AI / Product Intern  ", "New Delhi")
      .find(link => link.id === "naukri");

    expect(naukri?.href).toBe("https://www.naukri.com/ai-product-intern-jobs-in-new-delhi");
    expect(buildJobDiscoveryLinks("   ")).toEqual([]);
  });
});
