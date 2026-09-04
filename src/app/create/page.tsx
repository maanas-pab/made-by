"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, fileToDataUrl } from "@/lib/store";
import { MadeByMark, Input, Textarea, Button, MicroLabel } from "@/components/ui";
import { LAYOUTS } from "@/lib/data";
import { SITE } from "@/lib/site";

const DISCIPLINES = ["Painting", "Photography", "Sculpture", "Mixed Media", "Illustration", "Ceramics", "Textiles", "Digital"];

export default function Create() {
  const { signInDemo, requestLink, refreshCloudSession, isCloud, updateArtist, addArtwork } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [discs, setDiscs] = useState<string[]>(["Painting"]);
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [layout, setLayout] = useState("editorial");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const username = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "") || "you";

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const urls: string[] = [];
    for (const f of Array.from(list).slice(0, 6)) urls.push(await fileToDataUrl(f));
    setFiles(p => [...p, ...urls].slice(0, 6));
  }

  function applyPage() {
    updateArtist(username, { name, disciplines: discs, location: location || "Your City", theme: { layout: layout as never, palette: "paper", typeface: "cormorant", spacing: "balanced", bg: "#F5F2EC", fg: "#1C1C1A" }, published: true } as never);
    files.forEach((src, i) => addArtwork(username, { title: `Untitled No. ${String(i + 1).padStart(2, "0")}`, year: "2026", medium: discs[0] === "Photography" ? "Archival pigment print" : "Oil on canvas", images: [src], available: false } as never));
  }

  async function finish() {
    if (!name.trim()) { setErr("Please tell us your name."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please add a valid email so you can sign back in."); return; }
    setErr("");
    if (isCloud) {
      applyPage();
      const error = await requestLink(email);
      if (error) { setErr(error); return; }
      setLinkSent(true);
      setInfo(`Magic link sent to ${email} — check your inbox and open it on this device.`);
    } else {
      signInDemo(email, username);
      setTimeout(() => { applyPage(); router.push(`/${username}`); }, 150);
    }
  }

  async function checkNow() {
    const ok = await refreshCloudSession();
    if (ok) router.push(`/${username}`);
    else setInfo("Not yet — click the link in your email first (on this device).");
  }

  // After the link is sent, glide in the moment they click it.
  useEffect(() => {
    if (!linkSent) return;
    let alive = true;
    const id = setInterval(async () => {
      if (await refreshCloudSession()) {
        clearInterval(id);
        if (alive) router.push(`/${username}`);
      }
    }, 2500);
    const stop = setTimeout(() => clearInterval(id), 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); clearTimeout(stop); };
  }, [linkSent, refreshCloudSession, router, username]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 h-14 flex items-center justify-between border-b hairline">
        <MadeByMark />
        <p className="text-[12px] text-warmgray">Step {step} of 6 · <span className="text-ink">{["Name", "Practice", "Place", "Work", "Look", "Ready"][step - 1]}</span></p>
      </div>
      <div className="h-px bg-line"><div className="h-px bg-ink transition-all" style={{ width: `${(step / 6) * 100}%` }} /></div>

      <main className="flex-1 mx-auto w-full max-w-xl px-6 py-14 fade-up" key={step}>
        {step === 1 && (
          <><MicroLabel>Step 1</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">What&apos;s your name?</h1>
          <p className="text-[14px] text-warmgray mb-8">This becomes your card, your URL, your signature.</p>
          <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Maya Chen" className="text-lg py-3.5" /></>
        )}
        {step === 2 && (
          <><MicroLabel>Step 2</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">What do you make?</h1>
          <p className="text-[14px] text-warmgray mb-6">Choose as many as feel true.</p>
          <div className="flex flex-wrap gap-2">{DISCIPLINES.map(d => (
            <button key={d} onClick={() => setDiscs(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
              className={`px-4 py-2.5 text-[13px] border ${discs.includes(d) ? "bg-ink text-paper border-ink" : "border-line hover:border-ink"}`}>{d}</button>))}</div></>
        )}
        {step === 3 && (
          <><MicroLabel>Step 3</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">Where are you based?</h1>
          <p className="text-[14px] text-warmgray mb-8">City is enough. Mystery is allowed.</p>
          <Input autoFocus value={location} onChange={e => setLocation(e.target.value)} placeholder="Austin, TX" className="text-lg py-3.5" /></>
        )}
        {step === 4 && (
          <><MicroLabel>Step 4</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">Show us your work.</h1>
          <p className="text-[14px] text-warmgray mb-6">Drag & drop, or browse. Up to 6 to start — you can add more later.</p>
          <label onDragOver={e => e.preventDefault()} onDrop={async e => { e.preventDefault(); await onFiles(e.dataTransfer.files); }}
            className="block border border-dashed border-warmgray p-10 text-center cursor-pointer hover:border-ink">
            <p className="text-[14px]">Drop images here, or <span className="underline underline-offset-4">browse files</span></p>
            <p className="text-[12px] text-warmgray mt-2">JPG / PNG / WEBP · saved with your page</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
          </label>
          {files.length > 0 && <div className="grid grid-cols-3 gap-2 mt-4">{files.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={s} alt={`Upload ${i + 1}`} className="aspect-square object-cover w-full border border-line" />))}</div>}</>
        )}
        {step === 5 && (
          <><MicroLabel>Step 5</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">Choose your look.</h1>
          <p className="text-[14px] text-warmgray mb-6">Tasteful constraints — you can&apos;t make it ugly.</p>
          <div className="grid grid-cols-2 gap-3">{LAYOUTS.map(l => (
            <button key={l.id} onClick={() => setLayout(l.id)} className={`border p-5 text-left ${layout === l.id ? "border-ink bg-softwhite" : "border-line hover:border-ink"}`}>
              <p className="font-medium text-[14px]">{l.name}</p><p className="text-[12px] text-warmgray mt-1">{l.desc}</p>
            </button>))}</div></>
        )}
        {step === 6 && (
          <><MicroLabel>Step 6</MicroLabel><h1 className="serif text-5xl mt-2 mb-2">Your page is ready.</h1>
          <div className="border border-line bg-softwhite p-6 mt-6 text-center">
            <p className="micro-label">made by</p>
            <p className="serif text-4xl mt-1">{name || "Your Name"}</p>
            <p className="text-[13px] text-warmgray mt-1">{location || "Your City"} · {discs.join(" / ")}</p>
            <p className="text-[13px] mt-4 border border-line inline-block px-4 py-2">{SITE.domain}/{username}</p>
          </div>
          <div className="mt-6">
            <label className="micro-label block mb-2">Email to claim it</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" />
            {isCloud && <p className="text-[12px] text-warmgray mt-2">We&apos;ll email you a magic link — no password, nothing to remember. Open it on this device.</p>}
          </div></>
        )}
        {err && <p role="alert" className="text-[13px] text-red-800 mt-4">{err}</p>}
        {info && <p role="status" className="text-[13px] text-ink/70 border border-line bg-softwhite p-3 mt-4">{info}</p>}
        <div className="flex items-center justify-between mt-10">
          <div>{step > 1 && <button onClick={() => { setStep(s => s - 1); setErr(""); }} className="text-[13px] underline underline-offset-4 hover:opacity-60">← Back</button>}</div>
          {step < 6
            ? <Button onClick={() => { if (step === 1 && !name.trim()) { setErr("Please tell us your name."); return; } setErr(""); setStep(s => s + 1); }}>Continue →</Button>
            : linkSent
              ? <Button onClick={checkNow}>I clicked it →</Button>
              : <Button onClick={finish}>Publish my page →</Button>}
        </div>
        <p className="text-center mt-8 text-[12px] text-warmgray"><Link href="/" className="hover:text-ink">Never mind — take me home</Link></p>
      </main>
    </div>
  );
}
