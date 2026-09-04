"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MadeByMark, Input, Field, Button, MicroLabel } from "@/components/ui";

export default function SignIn() {
  const { signInDemo, signInCloud, isCloud } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email."); return; }
    if (isCloud) {
      if (password.length < 6) { setErr("Password needs at least 6 characters."); return; }
      setBusy(true); setErr("");
      const error = await signInCloud(email, password);
      setBusy(false);
      if (error) { setErr(error); return; }
      router.push("/dashboard");
    } else {
      signInDemo(email);
      router.push("/dashboard");
    }
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
        <form className="flex flex-col justify-center px-6 md:px-16 py-14 max-w-md w-full mx-auto" onSubmit={submit}>
          <MicroLabel>Sign in</MicroLabel>
          <h1 className="serif text-4xl mt-2 mb-6">Your page is waiting.</h1>
          {!isCloud && (
            <p className="border border-line bg-softwhite text-[12px] p-3 mb-5 text-ink/70">
              Demo mode — no password yet. Sign-in here only opens pages <em>in this browser</em>.
              Real password accounts activate once cloud keys are set.
            </p>
          )}
          <div className="space-y-4">
            <Field label="Email"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" /></Field>
            {isCloud && (
              <Field label="Password"><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></Field>
            )}
          </div>
          {err && <p role="alert" className="text-[13px] text-red-800 mt-3">{err}</p>}
          <Button type="submit" disabled={busy} className="mt-5 w-full">{busy ? "Signing in…" : "Continue →"}</Button>
          <p className="text-[13px] mt-6 text-center">New here? <Link href="/create" className="underline underline-offset-4">Make your page</Link></p>
        </form>
      </div>
    </div>
  );
}
