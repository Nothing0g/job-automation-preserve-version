import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, FileSpreadsheet, Plus, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const statusConfig = {
  "to-apply": { label: "To apply", accent: "bg-stone-400" },
  applied: { label: "Applied", accent: "bg-sky-500" },
  interview: { label: "Interview", accent: "bg-violet-500" },
  offer: { label: "Offer", accent: "bg-emerald-500" },
  rejected: { label: "Rejected", accent: "bg-rose-400" },
} as const;

type Status = keyof typeof statusConfig;
const initialJob = { company: "", role: "", jobDescription: "", status: "to-apply" as Status };

function JobDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialJob);
  const create = trpc.jobs.create.useMutation({ onSuccess: () => { toast.success("Job added to your pipeline."); onDone(); setForm(initialJob); setOpen(false); }, onError: error => toast.error(error.message) });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add job</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="editorial-title text-3xl">Add an application</DialogTitle><DialogDescription>Keep the job description complete. It is the only employer context used for tailoring.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={event => setForm({ ...form, company: event.target.value })} required /></div><div className="space-y-2"><Label htmlFor="role">Role title</Label><Input id="role" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })} required /></div></div><div className="space-y-2"><Label htmlFor="status">Current status</Label><select id="status" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={event => setForm({ ...form, status: event.target.value as Status })}>{Object.entries(statusConfig).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="description">Job description</Label><Textarea id="description" value={form.jobDescription} onChange={event => setForm({ ...form, jobDescription: event.target.value })} className="min-h-56 leading-6" required /></div><DialogFooter><Button type="submit" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add to pipeline"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function SheetImportDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const importSheet = trpc.jobs.importSheet.useMutation({ onSuccess: result => { toast.success(`Imported ${result.imported} job${result.imported === 1 ? "" : "s"}${result.skipped ? `; skipped ${result.skipped}` : ""}.`); onDone(); setOpen(false); setSheetUrl(""); setSheetName(""); }, onError: error => toast.error(error.message) });
  function submit(event: FormEvent) { event.preventDefault(); importSheet.mutate({ sheetUrl, sheetName }); }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="gap-2 bg-card"><FileSpreadsheet className="h-4 w-4" />Import Sheet</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle className="editorial-title text-3xl">Import from Google Sheets</DialogTitle><DialogDescription>Use a link-viewable Google Sheet. Select the exact tab name. The sheet must contain Company, Role, and Job Description headers; Status is optional.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="sheet-url">Google Sheet URL</Label><Input id="sheet-url" type="url" placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={event => setSheetUrl(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="sheet-name">Sheet tab name</Label><Input id="sheet-name" placeholder="Applications" value={sheetName} onChange={event => setSheetName(event.target.value)} required /></div><DialogFooter><Button type="submit" disabled={importSheet.isPending}>{importSheet.isPending ? "Importing…" : "Import jobs"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export default function JobsDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();
  const refresh = () => { void utils.jobs.list.invalidate(); };
  const grouped = useMemo(() => Object.keys(statusConfig).map(status => ({ status: status as Status, jobs: jobs.filter(job => job.status === status) })), [jobs]);
  const hasResume = Boolean(profile?.resumeText?.trim() || profile?.resumeFileKey);

  return <div className="mx-auto max-w-[1600px] space-y-8"><section className="relative overflow-hidden rounded-[1.8rem] border border-border bg-[radial-gradient(circle_at_86%_10%,oklch(0.88_0.07_70),transparent_27%),linear-gradient(135deg,oklch(0.99_0.006_80),oklch(0.955_0.018_72))] px-6 py-8 sm:px-9 sm:py-10"><div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-primary/15" /><p className="data-label text-primary">Application command center</p><div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h1 className="editorial-title max-w-2xl text-5xl leading-[0.94] sm:text-6xl">Make each application feel considered.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Keep the job, tailored resume, personalized draft, and practical notes in one focused workspace.</p></div><div className="flex flex-wrap gap-2"><SheetImportDialog onDone={refresh} /><JobDialog onDone={refresh} /></div></div></section>
  {!hasResume && <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-accent/50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Begin with your master profile</p><p className="mt-1 text-sm text-muted-foreground">Add a base resume and any personal context before requesting AI drafts.</p></div><Button variant="outline" className="shrink-0 bg-background" onClick={() => setLocation("/profile")}>Set up profile <ArrowRight className="ml-2 h-4 w-4" /></Button></section>}
  <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">{grouped.map(column => <div key={column.status} className="paper-panel rounded-2xl border p-4"><div className="flex items-center justify-between"><span className="data-label text-muted-foreground">{statusConfig[column.status].label}</span><span className={`h-2 w-2 rounded-full ${statusConfig[column.status].accent}`} /></div><p className="editorial-title mt-2 text-3xl">{column.jobs.length}</p></div>)}</section>
  <section><div className="mb-4 flex items-end justify-between"><div><p className="data-label text-primary">Pipeline</p><h2 className="editorial-title mt-1 text-4xl">Your active applications</h2></div>{jobs.length > 0 && <Badge variant="secondary" className="rounded-full px-3 py-1">{jobs.length} total</Badge>}</div>{isLoading ? <div className="grid gap-4 xl:grid-cols-5">{Object.keys(statusConfig).map(status => <div key={status} className="h-56 animate-pulse rounded-2xl border bg-card/60" />)}</div> : jobs.length === 0 ? <div className="paper-panel flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><Sparkles className="h-5 w-5" /></div><h3 className="editorial-title mt-5 text-3xl">Your pipeline is ready.</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add one job manually, or import the jobs you already track in a Google Sheet.</p></div> : <div className="grid gap-4 xl:grid-cols-5">{grouped.map(column => <div key={column.status} className="rounded-2xl border border-border/80 bg-card/45 p-3"><div className="mb-3 flex items-center gap-2 px-1"><span className={`h-2 w-2 rounded-full ${statusConfig[column.status].accent}`} /><span className="text-sm font-semibold">{statusConfig[column.status].label}</span><span className="ml-auto text-xs text-muted-foreground">{column.jobs.length}</span></div><div className="space-y-3">{column.jobs.map(job => <Link key={job.id} href={`/jobs/${job.id}`} className="paper-panel group block rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35"><p className="data-label text-muted-foreground">{job.company}</p><h3 className="mt-2 line-clamp-2 text-base font-semibold leading-5 tracking-tight">{job.role}</h3><p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">{job.jobDescription}</p><div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Open workspace <ArrowRight className="ml-1 h-3.5 w-3.5" /></div></Link>)}</div></div>)}</div>}</section></div>;
}
