"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MadeByMark, Input, Field, Button, MicroLabel } from "@/components/ui";

export default function SignIn() {
  const { signInDemo, requestLink, refreshCloudSession, isCloud } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email."); return; }
    if (isCloud) {
      setBusy(true); setErr("");
      const error = await requestLink(email);
      setBusy(false);
      if (error) { setErr(error); return; }
      setSent(true);
    } else {
      signInDemo(email);
      router.push("/dashboard");
    }
  }

  async function checkNow() {
    const ok = await refreshCloudSession();
    if (ok) router.push("/dashboard");
    else setErr("Not yet — click the link in your email first.");
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 h-14 flex items-center justify-between border-b hairline">
        <MadeByMark /><Link href="/" className="text-[13px] hover:opacity-60">← Back</Link>
      </div>
      <div className="flex-1 grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-center px-16 border-r hairline bg-softwhite">
          <p className="micro-label mb-4">made by</p>
          <p className="serif text-5xl leading-tight">Welcome<br />back.</p>
          <p className="text-[14px] text-warmgray mt-4">Your wall is exactly where you left it.</p>
        </div>
        {sent ? (
          <div className="flex flex-col justify-center px-6 md:px-16 py-14 max-w-md w-full mx-auto text-center">
            <MicroLabel>Check your inbox</MicroLabel>
            <p className="serif text-4xl mt-2">The link is on its way.</p>
            <p className="text-[14px] text-warmgray mt-4">We sent a sign-in link to <span className="text-ink">{email}</span>. Open it on <em>this device</em> — no password, nothing to remember.</p>
            <Button onClick={checkNow} className="mt-6 w-full">I clicked it →</Button>
            <button onClick={() => setSent(false)} className="text-[12px] text-warmgray underline underline-offset-4 mt-4">Use a different email</button>
            {err && <p role="alert" className="text-[13px] text-red-800 mt-3">{err}</p>}
          </div>
        ) : (
          <form className="flex flex-col justify-center px-6 md:px-16 py-14 max-w-md w-full mx-auto" onSubmit={submit}>
            <MicroLabel>Sign in</MicroLabel>
            <h1 className="serif text-4xl mt-2 mb-6">Your page is waiting.</h1>
            {!isCloud && (
              <p className="border border-line bg-softwhite text-[12px] p-3 mb-5 text-ink/70">
                Demo mode — no email is sent. Sign-in here only opens pages <em>in this browser</em>.
                Magic links activate once cloud keys are set.
              </p>
            )}
            <Field label="Email"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" /></Field>
            {err && <p role="alert" className="text-[13px] text-red-800 mt-3">{err}</p>}
            <Button type="submit" disabled={busy} className="mt-5 w-full">{busy ? "Sending link…" : isCloud ? "Email me a sign-in link →" : "Continue →"}</Button>
            <p className="text-[13px] mt-6 text-center">New here? <Link href="/create" className="underline underline-offset-4">Make your page</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
