"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Artist } from "@/lib/data";
import { useStore } from "@/lib/store";
import { loadPublicArtists } from "@/lib/cloud";

const FILTERS = ["All", "Painting", "Photography", "Sculpture", "Textiles", "Mixed Media"];

/* Local pages first, then every published page in the cloud. */
export default function ExploreClient() {
  const { artists } = useStore();
  const [pub, setPub] = useState<Artist[]>([]);
  const [f, setF] = useState("All");

  useEffect(() => {
    loadPublicArtists().then(setPub).catch(() => {});
  }, []);

  const all = useMemo(() => {
    const seen = new Map<string, Artist>();
    for (const a of [...artists, ...pub]) {
      const k = a.username.toLowerCase();
      if (!seen.has(k) && a.published) seen.set(k, a);
    }
    return Array.from(seen.values());
  }, [artists, pub]);

  const list = all.filter(a => f === "All" || a.disciplines.some(d => d.toLowerCase().includes(f.toLowerCase())));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter by discipline">
        {FILTERS.map(x => (
          <button key={x} onClick={() => setF(x)} className={`px-4 py-2 text-[13px] border ${f === x ? "bg-ink text-paper border-ink" : "border-line hover:border-ink"}`}>{x}</button>
        ))}
      </div>
      {!list.length && (
        <div className="border border-line p-12 text-center">
          <p className="serif text-3xl">Quiet here — for now.</p>
          <p className="text-[13px] text-warmgray mt-2">Publish a page and it will hang in this catalogue.</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        {list.map(a => (
          <Link key={a.username} href={`/${a.username}`} className="border border-line group grid grid-cols-[140px_1fr] md:grid-cols-[220px_1fr]" style={{ background: "#FBFAF7" }}>
            <div className="art-frame aspect-square md:aspect-[4/5]">
              {a.artworks[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.artworks[0].images[0]} alt={a.name} loading="lazy" className="art-img w-full h-full object-cover" />
              ) : <div className="w-full h-full bg-clay" />}
            </div>
            <div className="p-5 flex flex-col justify-center">
              <p className="micro-label mb-1">{a.location}{a.demo && <span className="ml-2 border border-current px-1.5 py-0.5">Demo</span>}</p>
              <p className="serif text-3xl leading-none">{a.name}</p>
              <p className="text-[13px] text-warmgray mt-2">{a.disciplines.join(" / ")}</p>
              <p className="text-[13px] mt-2 line-clamp-2 text-ink/70">{a.statement}</p>
              <p className="mt-3 text-[11px] tracking-[0.16em] uppercase border-b border-current self-start pb-0.5 group-hover:opacity-60">Visit page →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
