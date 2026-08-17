import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CalendarClock, CheckCircle2, FileSearch, Link2, Mail, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const statusConfig = {
  "to-apply": { label: "To apply", accent: "bg-stone-400 dark:bg-stone-500" },
  applied: { label: "Applied", accent: "bg-sky-500" },
  interview: { label: "Interview", accent: "bg-violet-500" },
  offer: { label: "Offer", accent: "bg-emerald-500" },
  rejected: { label: "Rejected", accent: "bg-rose-500" },
} as const;
type Status = keyof typeof statusConfig;
type IntakeMode = "details" | "limited" | "link";
type ApplicationForm = { company: string; role: string; jobDescription: string; contextMode: "full" | "limited"; contactEmail: string; sourceUrl: string; status: Status; nextAction: string; followUpAt: string };
const blankForm: ApplicationForm = { company: "", role: "", jobDescription: "", contextMode: "full", contactEmail: "", sourceUrl: "", status: "to-apply", nextAction: "", followUpAt: "" };

function StartApplicationDialog({ onDone }: { onDone: () => void }) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<IntakeMode>("details");
  const [form, setForm] = useState<ApplicationForm>(blankForm);
  const create = trpc.jobs.create.useMutation();
  const generate = trpc.jobs.generateDrafts.useMutation();
  const importPosting = trpc.jobs.importPublicLink.useMutation();
  const busy = create.isPending || generate.isPending || importPosting.isPending;

  function chooseMode(nextMode: IntakeMode) {
    setMode(nextMode);
    setForm(current => ({ ...current, contextMode: nextMode === "limited" ? "limited" : "full", jobDescription: nextMode === "limited" ? "" : current.jobDescription }));
  }

  async function importFromLink() {
    if (!form.sourceUrl.trim()) return toast.error("Paste a public job-posting URL first.");
    try {
      const posting = await importPosting.mutateAsync({ url: form.sourceUrl });
      setForm(current => ({ ...current, company: posting.company, role: posting.role, jobDescription: posting.jobDescription, sourceUrl: posting.sourceUrl, contextMode: "full" }));
      setMode("details");
      toast.success("Details were imported. Review them before creating the application.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This public job page could not be imported.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const job = await create.mutateAsync({ ...form, jobDescription: form.contextMode === "limited" ? "" : form.jobDescription, contactEmail: form.contactEmail || null, sourceUrl: form.sourceUrl || null, nextAction: form.nextAction || null, followUpAt: form.followUpAt || null });
      if (!job) throw new Error("The application could not be created.");
      onDone(); setOpen(false); setMode("details"); setForm(blankForm);
      toast.success(form.contextMode === "limited" ? "Application created. Preparing your limited-context outreach…" : "Application created. Preparing your tailored drafts…");
      try {
        await generate.mutateAsync({ id: job.id });
        toast.success(form.contextMode === "limited" ? "Your factual outreach email is ready to review. Your master resume was left unchanged." : "Your tailored resume and outreach email are ready to review.");
      } catch (error) { toast.error(error instanceof Error ? error.message : "The job was saved, but its drafts need another try."); }
      setLocation(`/jobs/${job.id}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "The application could not be created."); }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />New application</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle className="editorial-title text-3xl">Start an application</DialogTitle><DialogDescription>Choose the context you have. Imported or entered details always stay visible and editable before the studio drafts anything.</DialogDescription></DialogHeader>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button type="button" variant={mode === "details" ? "default" : "outline"} className="h-auto justify-start gap-2 px-3 py-3 text-left" onClick={() => chooseMode("details")}><FileSearch className="h-4 w-4 shrink-0" /><span><span className="block text-sm">Full details</span><span className="mt-0.5 block text-xs font-normal opacity-75">Paste a JD</span></span></Button>
        <Button type="button" variant={mode === "limited" ? "default" : "outline"} className="h-auto justify-start gap-2 px-3 py-3 text-left" onClick={() => chooseMode("limited")}><Mail className="h-4 w-4 shrink-0" /><span><span className="block text-sm">No JD Mode</span><span className="mt-0.5 block text-xs font-normal opacity-75">Role + email only</span></span></Button>
        <Button type="button" variant={mode === "link" ? "default" : "outline"} className="h-auto justify-start gap-2 px-3 py-3 text-left" onClick={() => chooseMode("link")}><Link2 className="h-4 w-4 shrink-0" /><span><span className="block text-sm">Public job link</span><span className="mt-0.5 block text-xs font-normal opacity-75">Import visible details</span></span></Button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "link" && <section className="rounded-xl border border-primary/20 bg-accent/35 p-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Import from a public page</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The studio reads exposed job-page text only. Pages that require a login or load details in the browser may need manual entry.</p></div></div><div className="mt-4 flex gap-2"><Input aria-label="Public job posting URL" type="url" placeholder="https://careers.example.com/jobs/..." value={form.sourceUrl} onChange={event => setForm({ ...form, sourceUrl: event.target.value })} /><Button type="button" variant="outline" className="shrink-0 bg-card" disabled={importPosting.isPending} onClick={() => void importFromLink()}>{importPosting.isPending ? "Reading…" : "Import"}</Button></div></section>}
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={event => setForm({ ...form, company: event.target.value })} required /></div><div className="space-y-2"><Label htmlFor="role">Role title</Label><Input id="role" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} required /></div></div>
        {mode === "limited" && <section className="rounded-xl border border-amber-500/25 bg-amber-50/60 p-4 dark:bg-amber-950/20"><p className="text-sm font-semibold text-amber-900 dark:text-amber-200">No JD Mode keeps your claims conservative.</p><p className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-100/70">It creates a factual outreach email that asks for the detailed job description or application guidance. Your resume remains unchanged.</p><div className="mt-4 space-y-2"><Label htmlFor="contact-email">Contact email</Label><Input id="contact-email" type="email" placeholder="hiring@company.com" value={form.contactEmail} onChange={event => setForm({ ...form, contactEmail: event.target.value })} required /></div></section>}
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="status">Starting stage</Label><select id="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={event => setForm({ ...form, status: event.target.value as Status })}>{Object.entries(statusConfig).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="follow-up">Follow-up date <span className="text-muted-foreground">(optional)</span></Label><Input id="follow-up" type="date" value={form.followUpAt} onChange={event => setForm({ ...form, followUpAt: event.target.value })} /></div></div>
        <div className="space-y-2"><Label htmlFor="next-action">Next action <span className="text-muted-foreground">(optional)</span></Label><Input id="next-action" value={form.nextAction} onChange={event => setForm({ ...form, nextAction: event.target.value })} placeholder="For example: send the hiring manager a short note" /></div>
        {mode !== "limited" && <div className="space-y-2"><Label htmlFor="description">Job description</Label><Textarea id="description" value={form.jobDescription} onChange={event => setForm({ ...form, jobDescription: event.target.value })} className="min-h-52 leading-6" placeholder="Paste the full job description here, or import a public job link above…" required /></div>}
        <DialogFooter><Button type="submit" disabled={busy}><Sparkles className="mr-2 h-4 w-4" />{create.isPending ? "Saving application…" : generate.isPending ? "Creating drafts…" : mode === "limited" ? "Save and create outreach" : "Save and create drafts"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function displayDate(value: Date | null) { return value ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value)) : null; }

export default function JobsDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();
  const refresh = () => { void utils.jobs.list.invalidate(); };
  const grouped = useMemo(() => Object.keys(statusConfig).map(status => ({ status: status as Status, jobs: jobs.filter(job => job.status === status) })), [jobs]);
  const trackedJobs = useMemo(() => jobs.filter(job => job.nextAction || job.followUpAt).sort((left, right) => Number(left.followUpAt ?? new Date("9999-12-31")) - Number(right.followUpAt ?? new Date("9999-12-31"))).slice(0, 4), [jobs]);
  const hasResume = Boolean(profile?.resumeText?.trim() || profile?.resumeFileKey);
  return <div className="mx-auto max-w-[1600px] space-y-8"><section className="relative overflow-hidden rounded-[1.8rem] border border-border bg-[radial-gradient(circle_at_86%_10%,oklch(0.88_0.07_70),transparent_27%),linear-gradient(135deg,oklch(0.99_0.006_80),oklch(0.955_0.018_72))] px-6 py-8 sm:px-9 sm:py-10 dark:bg-[radial-gradient(circle_at_86%_10%,oklch(0.36_0.07_55),transparent_30%),linear-gradient(135deg,oklch(0.18_0.022_40),oklch(0.22_0.026_42))]"><div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-primary/20" /><p className="data-label text-primary">Personal application studio</p><div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h1 className="editorial-title max-w-2xl text-5xl leading-[0.94] sm:text-6xl">Make each application feel considered.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Use a full JD, a public posting link, or just an email and role. The studio adapts without inventing context.</p></div><StartApplicationDialog onDone={refresh} /></div></section>
  {!hasResume && <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-accent/50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Begin with your master profile</p><p className="mt-1 text-sm text-muted-foreground">Add your factual base resume before asking the studio to draft anything for you.</p></div><Button variant="outline" className="shrink-0 bg-card" onClick={() => setLocation("/profile")}>Set up profile <ArrowRight className="ml-2 h-4 w-4" /></Button></section>}
  <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">{grouped.map(column => <div key={column.status} className="paper-panel rounded-2xl border p-4"><div className="flex items-center justify-between"><span className="data-label text-muted-foreground">{statusConfig[column.status].label}</span><span className={`h-2 w-2 rounded-full ${statusConfig[column.status].accent}`} /></div><p className="editorial-title mt-2 text-3xl">{column.jobs.length}</p></div>)}</section>
  {trackedJobs.length > 0 && <section className="paper-panel rounded-[1.4rem] border p-5 sm:p-6"><div className="flex items-end justify-between"><div><p className="data-label text-primary">Action tracker</p><h2 className="editorial-title mt-1 text-3xl">What deserves your attention</h2></div><Badge variant="secondary" className="rounded-full px-3 py-1">{trackedJobs.length} in view</Badge></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{trackedJobs.map(job => <Link key={job.id} href={`/jobs/${job.id}`} className="group flex gap-3 rounded-xl border bg-card/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><CalendarClock className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="data-label text-muted-foreground">{job.company} · {displayDate(job.followUpAt) ?? "No date"}</p><p className="mt-1 text-sm font-semibold">{job.nextAction || `Review ${job.role}`}</p><p className="mt-1 truncate text-xs text-muted-foreground">{job.role}</p></div><ArrowRight className="mt-2 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" /></Link>)}</div></section>}
  <section><div className="mb-4 flex items-end justify-between"><div><p className="data-label text-primary">Pipeline</p><h2 className="editorial-title mt-1 text-4xl">Your active applications</h2></div>{jobs.length > 0 && <Badge variant="secondary" className="rounded-full px-3 py-1">{jobs.length} total</Badge>}</div>{isLoading ? <div className="grid gap-4 xl:grid-cols-5">{Object.keys(statusConfig).map(status => <div key={status} className="h-56 animate-pulse rounded-2xl border bg-card/60" />)}</div> : jobs.length === 0 ? <div className="paper-panel flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><CheckCircle2 className="h-5 w-5" /></div><h3 className="editorial-title mt-5 text-3xl">Ready when you are.</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Start with a full posting, a public link, or just a role and contact email.</p></div> : <div className="grid gap-4 xl:grid-cols-5">{grouped.map(column => <div key={column.status} className="rounded-2xl border border-border/80 bg-card/45 p-3"><div className="mb-3 flex items-center gap-2 px-1"><span className={`h-2 w-2 rounded-full ${statusConfig[column.status].accent}`} /><span className="text-sm font-semibold">{statusConfig[column.status].label}</span><span className="ml-auto text-xs text-muted-foreground">{column.jobs.length}</span></div><div className="space-y-3">{column.jobs.map(job => <Link key={job.id} href={`/jobs/${job.id}`} className="paper-panel group block rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35"><p className="data-label text-muted-foreground">{job.company}</p><h3 className="mt-2 line-clamp-2 text-base font-semibold leading-5 tracking-tight">{job.role}</h3>{job.contextMode === "limited" ? <p className="mt-3 text-xs font-medium leading-5 text-amber-700 dark:text-amber-300">Limited context · email-first</p> : <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{job.jobDescription}</p>}{job.nextAction && <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-primary">Next: {job.nextAction}</p>}<div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Open workspace <ArrowRight className="ml-1 h-3.5 w-3.5" /></div></Link>)}</div></div>)}</div>}</section></div>;
}
