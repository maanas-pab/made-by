"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Artist } from "@/lib/data";
import { useStore } from "@/lib/store";
import { loadPublicArtists } from "@/lib/cloud";

/* Homepage showcase: demos plus every real published page (Maya stays featured above). */
export default function ArtistExamples() {
  const { artists } = useStore();
  const [pub, setPub] = useState<Artist[]>([]);

  useEffect(() => {
    loadPublicArtists().then(setPub).catch(() => {});
  }, []);

  const list = useMemo(() => {
    const seen = new Map<string, Artist>();
    for (const a of [...artists, ...pub]) {
      const k = a.username.toLowerCase();
      if (!seen.has(k) && a.published && a.username.toLowerCase() !== "mayachen") seen.set(k, a);
    }
    return Array.from(seen.values()).slice(0, 6);
  }, [artists, pub]);

  if (!list.length) return null;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <h2 className="serif text-4xl">Made by artists</h2>
        <Link href="/explore" className="text-[11px] tracking-[0.16em] uppercase font-medium hover:opacity-60"><span className="border-b border-current pb-0.5">Explore all</span> →</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {list.map(a => (
          <Link key={a.username} href={`/${a.username}`} className="border border-line group" style={{ background: a.theme.bg, color: a.theme.fg }}>
            <div className="art-frame aspect-[4/3]">
              {a.artworks[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.artworks[0].images[0]} alt={a.artworks[0].title} loading="lazy" className="art-img w-full h-full object-cover" />
              ) : <div className="w-full h-full bg-clay" />}
            </div>
            <div className="p-5">
              <p className="micro-label opacity-60 mb-1">{a.location}{a.demo && <span className="ml-2 border border-current px-1.5 py-0.5">Demo</span>}</p>
              <p className="serif text-3xl">{a.name}</p>
              <p className="text-[13px] opacity-70 mt-1">{a.disciplines.join(" / ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
