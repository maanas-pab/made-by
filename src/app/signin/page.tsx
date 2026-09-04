"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MadeByMark, Input, Field, Button, MicroLabel } from "@/components/ui";

export default function SignIn() {
  const { signIn } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
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
        <form className="flex flex-col justify-center px-6 md:px-16 py-14 max-w-md w-full mx-auto" onSubmit={e => {
          e.preventDefault();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email."); return; }
          signIn(email);
          router.push("/dashboard");
        }}>
          <MicroLabel>Sign in</MicroLabel>
          <h1 className="serif text-4xl mt-2 mb-6">Your page is waiting.</h1>
          <Field label="Email"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com" /></Field>
          {err && <p role="alert" className="text-[13px] text-red-800 mt-3">{err}</p>}
          <Button type="submit" className="mt-5 w-full">Continue →</Button>
          <p className="text-[12px] text-warmgray mt-4 text-center">Magic link + password supported in production. Demo signs you straight in.</p>
          <p className="text-[13px] mt-6 text-center">New here? <Link href="/create" className="underline underline-offset-4">Make your page</Link></p>
        </form>
      </div>
    </div>
  );
}
