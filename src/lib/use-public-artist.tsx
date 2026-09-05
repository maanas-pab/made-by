"use client";
import { useEffect, useState } from "react";
import { useStore } from "./store";
import { loadPublicArtist } from "./cloud";
import type { Artist } from "./data";

/* Local first (instant), public cloud fallback (visitors, new devices). */
export function usePublicArtist(username: string): { artist: Artist | undefined; loading: boolean } {
  const { getArtist } = useStore();
  const local = getArtist(username);
  const [remote, setRemote] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(!local);

  useEffect(() => {
    if (local) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    loadPublicArtist(username)
      .then(a => { if (alive) { setRemote(a); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [username, local]);

  return { artist: local ?? remote ?? undefined, loading };
}

export function LoadingWall({ text = "Hanging the work…" }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="serif text-3xl opacity-60">{text}</p>
    </div>
  );
}
