import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

async function readAsBase64(file: File) {
  const encoded = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  return encoded.split(",")[1] ?? "";
}

export default function MasterProfilePage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.profile.get.useQuery();
  const [resumeText, setResumeText] = useState("");
  const [personalBio, setPersonalBio] = useState("");
  useEffect(() => { setResumeText(profile?.resumeText ?? ""); setPersonalBio(profile?.personalBio ?? ""); }, [profile]);
  const save = trpc.profile.save.useMutation({ onSuccess: () => { toast.success("Master profile saved."); void utils.profile.get.invalidate(); }, onError: error => toast.error(error.message) });
  const upload = trpc.profile.uploadPdf.useMutation({ onSuccess: () => { toast.success("PDF resume stored securely."); void utils.profile.get.invalidate(); }, onError: error => toast.error(error.message) });
  function submit(event: FormEvent) { event.preventDefault(); save.mutate({ resumeText, personalBio }); }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; if (file.size > 8 * 1024 * 1024) { toast.error("Choose a PDF smaller than 8 MB."); return; } try { upload.mutate({ filename: file.name, mimeType: file.type || "application/pdf", base64: await readAsBase64(file) }); } catch { toast.error("The selected file could not be read."); } finally { event.target.value = ""; } }
  const hasPdf = Boolean(profile?.resumeFileKey);
  return <div className="mx-auto max-w-5xl space-y-7"><section className="rounded-[1.8rem] border bg-[linear-gradient(125deg,oklch(0.99_0.006_80),oklch(0.94_0.024_72))] px-6 py-8 sm:px-9"><p className="data-label text-primary">Grounding source</p><h1 className="editorial-title mt-3 text-5xl">Master profile</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Your base resume and personal context are the only candidate sources used for every tailored resume and outreach draft. Keep both current and factual.</p></section><form onSubmit={submit} className="space-y-6"><section className="paper-panel rounded-[1.4rem] border p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="data-label text-primary">Base resume</p><h2 className="editorial-title mt-1 text-3xl">Paste text or store a PDF</h2></div>{hasPdf ? <Badge variant="secondary" className="w-fit gap-1 rounded-full px-3 py-1"><FileText className="h-3.5 w-3.5" />PDF stored</Badge> : null}</div><p className="mt-3 text-sm leading-6 text-muted-foreground">You can keep an editable text version, a PDF, or both. The AI only works from what you save here.</p><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]"><Textarea value={resumeText} onChange={event => setResumeText(event.target.value)} placeholder="Paste your full, factual master resume here…" className="min-h-80 leading-6" /><div className="flex flex-col justify-end gap-2"><Label htmlFor="resume-file" className="sr-only">Upload PDF resume</Label><Input id="resume-file" type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} /><Button type="button" variant="outline" className="bg-background" onClick={() => document.getElementById("resume-file")?.click()} disabled={upload.isPending}><Upload className="mr-2 h-4 w-4" />{upload.isPending ? "Uploading…" : "Upload PDF"}</Button><p className="max-w-44 text-xs leading-5 text-muted-foreground">PDF only, up to 8 MB. The file is stored separately from your records.</p></div></div></section><section className="paper-panel rounded-[1.4rem] border p-5 sm:p-7"><p className="data-label text-primary">Personal context</p><h2 className="editorial-title mt-1 text-3xl">Your voice and positioning</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Add factual context that helps the drafts sound like you, such as work preferences, the types of roles you seek, or a concise professional bio.</p><Textarea value={personalBio} onChange={event => setPersonalBio(event.target.value)} placeholder="Example: the work you want to be known for, your preferred tone, and other factual context…" className="mt-5 min-h-48 leading-6" /></section><div className="flex justify-end"><Button type="submit" size="lg" disabled={save.isPending || isLoading}>{save.isPending ? "Saving…" : "Save master profile"}</Button></div></form></div>;
}
