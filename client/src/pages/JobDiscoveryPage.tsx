import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildJobDiscoveryLinks } from "@/lib/jobDiscovery";
import { ArrowUpRight, Compass, MapPin, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const suggestedRoles = ["Product Analyst", "AI Product Intern", "Business Analyst", "Software Engineer"];

export default function JobDiscoveryPage() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const links = useMemo(() => buildJobDiscoveryLinks(role, location), [role, location]);
  const hasRole = Boolean(role.trim());

  function submit(event: FormEvent) {
    event.preventDefault();
    if (hasRole) setHasSearched(true);
  }

  function useSuggestedRole(value: string) {
    setRole(value);
    setHasSearched(true);
  }

  return (
    <div className="studio-page mx-auto max-w-7xl space-y-6">
      <section className="studio-hero overflow-hidden p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-primary"><Compass className="h-4 w-4" /><p className="data-label">Public job discovery</p></div>
          <h1 className="editorial-title mt-3 text-4xl leading-[0.95] sm:text-6xl">Start with the live source, not a stale copy.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Enter a role and optional location to open live searches from selected public job sources. Each result opens on the provider’s own website, where its newest listings, filters, account rules, and availability apply.</p>
        </div>
        <div className="studio-hero-orb" />
      </section>

      <section className="studio-panel p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="data-label text-primary">Search brief</p><h2 className="editorial-title mt-2 text-3xl">Choose your next opening</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">This workspace does not scrape, copy, or store third-party listings. It simply hands you focused entry points to inspect them directly.</p>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
          <div className="space-y-2"><Label htmlFor="discovery-role">Role or keywords</Label><Input id="discovery-role" value={role} onChange={event => setRole(event.target.value)} placeholder="e.g. Product Analyst" autoComplete="off" /></div>
          <div className="space-y-2"><Label htmlFor="discovery-location">Location <span className="text-muted-foreground">(optional)</span></Label><div className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="discovery-location" value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Bengaluru or Remote" className="pl-9" autoComplete="off" /></div></div>
          <Button type="submit" disabled={!hasRole} className="min-w-40"><Search className="mr-2 h-4 w-4" />Show live searches</Button>
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-muted-foreground">Try a role:</span>{suggestedRoles.map(suggestion => <Button key={suggestion} type="button" size="sm" variant="outline" className="bg-background" onClick={() => useSuggestedRole(suggestion)}>{suggestion}</Button>)}</div>
      </section>

      {hasSearched && hasRole ? (
        <section aria-live="polite">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="data-label text-primary">Live search links</p><h2 className="editorial-title mt-2 text-3xl">Explore {role.trim()}{location.trim() ? ` in ${location.trim()}` : ""}</h2></div><p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />External links only; no listings are collected here.</p></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {links.map(link => <a key={link.id} href={link.href} target="_blank" rel="noreferrer" className="group rounded-xl border border-border bg-card p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex items-start justify-between gap-4"><div><p className="data-label text-primary">{link.focus}</p><h3 className="editorial-title mt-2 text-2xl">{link.name}</h3></div><ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{link.description}</p>
              <p className="mt-5 text-sm font-medium text-primary">Open search <span aria-hidden="true">→</span></p>
            </a>)}
          </div>
          <p className="mt-5 rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-xs leading-5 text-muted-foreground">Availability, login requirements, filters, and exact search behavior vary by provider and region. Review the live posting on its original site before adding it to your application pipeline.</p>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-border bg-card/45 px-6 py-12 text-center"><Compass className="mx-auto h-6 w-6 text-primary" /><h2 className="editorial-title mt-4 text-3xl">Your source shortlist will appear here.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Enter a role above to generate direct, current search links across the selected public sources.</p></section>
      )}
    </div>
  );
}
