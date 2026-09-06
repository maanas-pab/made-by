"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MadeByMark, MicroLabel, Button } from "@/components/ui";

/* Landing spot for magic-link clicks: picks up the session, then dashboard. */
export default function AuthCallback() {
  const { refreshCloudSession, isCloud } = useStore();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [hint, setHint] = useState("");
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    if (!isCloud) { setErr("Cloud saving isn't configured on this site yet."); return; }
    (async () => {
      for (let i = 0; i < 8; i++) {
        if (await refreshCloudSession()) { router.replace("/dashboard"); return; }
        await new Promise(r => setTimeout(r, 800));
      }
      setErr("That link didn't sign you in.");
      setHint("Two usual causes: it was opened in a different browser than the one that requested it (Gmail's in-app browser counts as different — open it in the same browser), or it was a first-time confirmation link, in which case just request one more link and you'll glide in.");
    })();
  }, [isCloud, refreshCloudSession, router]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 h-14 flex items-center border-b hairline">
        <MadeByMark />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <MicroLabel>Signing in</MicroLabel>
        {!err ? (
          <><p className="serif text-4xl mt-2">Opening your studio…</p>
          <p className="text-[14px] text-warmgray mt-3">Reading your magic link.</p></>
        ) : (
          <><p className="serif text-4xl mt-2">That link fizzled.</p>
          <p className="text-[14px] text-warmgray mt-3 max-w-sm">{err}</p>
          {hint && <p className="text-[13px] text-ink/70 mt-3 max-w-sm">{hint}</p>}
          <Button href="/signin" className="mt-6">Try again →</Button></>
        )}
        <p className="text-[12px] text-warmgray mt-8"><Link href="/" className="hover:text-ink">Home</Link></p>
      </div>
    </div>
  );
}
