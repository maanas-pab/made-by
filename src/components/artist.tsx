"use client";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import type { Artist, Artwork } from "@/lib/data";
import { ArrowLink, Hairline, MicroLabel } from "./ui";

/* ---------- header ---------- */
export function ArtistTopbar({ artist, section }: { artist: Artist; section?: string }) {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [
    ["Portfolio", `/${artist.username}`],
    ["Available Work", `/${artist.username}?section=available`],
    ["Exhibitions", `/${artist.username}?section=exhibitions`],
    ["Contact", `/${artist.username}?section=contact`],
  ];
  return (
    <header className="border-b" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="serif font-medium tracking-tight text-[22px] leading-none">made by</Link>
        <nav className="hidden md:flex items-center gap-7 text-[13px] opacity-80">
          {links.map(([t, h]) => <Link key={t} href={h} className="hover:opacity-60">{t}</Link>)}
          {artist.instagram && <a href={`https://instagram.com/${artist.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="hover:opacity-60">Instagram</a>}
          <Link href={`/${artist.username}?view=exhibition`} className="border border-current px-3 py-1.5 text-[12px] hover:opacity-70">View as Exhibition</Link>
        </nav>
        <button className="md:hidden text-lg" aria-label="Menu" onClick={() => setOpen(o => !o)}>＝</button>
      </div>
      {open && (
        <nav className="md:hidden border-t px-6 py-4 flex flex-col gap-3 text-[14px]" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
          {links.map(([t, h]) => <Link key={t} href={h} onClick={() => setOpen(false)}>{t}</Link>)}
          <Link href={`/${artist.username}?view=exhibition`} onClick={() => setOpen(false)} className="underline underline-offset-4">View as Exhibition</Link>
        </nav>
      )}
    </header>
  );
}

export function ArtistHero({ artist }: { artist: Artist }) {
  return (
    <section className="text-center pt-12 pb-10 px-6">
      <p className="micro-label opacity-60 mb-4">{artist.location}</p>
      <h1 className="serif leading-[0.95] text-[52px] md:text-[88px] font-medium">{artist.name}</h1>
      <p className="mt-4 text-[14px] opacity-80">{artist.disciplines.join(" / ")}</p>
      {artist.status && (
        <p className="mt-4 inline-block border border-current px-4 py-1.5 text-[12px] tracking-wide opacity-80">{artist.status}</p>
      )}
    </section>
  );
}

/* ---------- portfolio layouts ---------- */
function Meta({ w, light = false }: { w: Artwork; light?: boolean }) {
  return (
    <div className={`text-[13px] leading-relaxed ${light ? "text-white/70" : ""}`}>
      <p className={`font-medium text-[14px] ${light ? "text-white" : "text-ink"}`}>{w.title}</p>
      <p className="opacity-70">{w.year}</p>
      <p className="opacity-70">{w.medium}</p>
      {w.dimensions && <p className="opacity-70">{w.dimensions}</p>}
    </div>
  );
}

export function Portfolio({ artist }: { artist: Artist }) {
  const list = useMemo(() => [...artist.artworks].sort((a, b) => a.order - b.order), [artist]);
  const layout = artist.theme.layout;
  if (!list.length) return null;

  if (layout === "gallery") {
    return (
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-12">
        {list.map(w => (
          <Link key={w.id} href={`/${artist.username}/work/${w.slug}`} className="group">
            <div className="art-frame aspect-[4/5]"><ArtImg src={w.images[0]} alt={w.title} /></div>
            <div className="mt-3"><Meta w={w} /></div>
          </Link>
        ))}
      </div>
    );
  }
  if (layout === "archive") {
    return (
      <div className="columns-2 md:columns-3 gap-4 [&>*]:mb-4">
        {list.map(w => (
          <Link key={w.id} href={`/${artist.username}/work/${w.slug}`} className="group block break-inside-avoid">
            <div className="art-frame"><ArtImg src={w.images[0]} alt={w.title} /></div>
            <div className="mt-2"><Meta w={w} /></div>
          </Link>
        ))}
      </div>
    );
  }
  if (layout === "fullbleed") {
    return (
      <div className="space-y-16 -mx-6">
        {list.map(w => (
          <Link key={w.id} href={`/${artist.username}/work/${w.slug}`} className="group block">
            <div className="art-frame"><ArtImg src={w.images[0]} alt={w.title} cls="w-full max-h-[82vh] object-cover" /></div>
            <div className="px-6 mt-3 flex items-baseline justify-between"><Meta w={w} />
              <span className="text-[11px] tracking-[0.16em] uppercase opacity-50 group-hover:opacity-100">View →</span></div>
          </Link>
        ))}
      </div>
    );
  }
  // editorial (default): large + offset rhythm
  return (
    <div className="space-y-20">
      {list.map((w, i) => (
        <article key={w.id} className={i % 3 === 1 ? "md:ml-24" : i % 3 === 2 ? "md:mr-24" : ""}>
          <p className="micro-label opacity-50 mb-4">Work {String(i + 1).padStart(2, "0")}</p>
          <Link href={`/${artist.username}/work/${w.slug}`} className="group block">
            <div className="art-frame">
              <ArtImg src={w.images[0]} alt={w.title} cls={i === 0 ? "w-full h-[320px] md:h-[540px] object-cover" : "w-full aspect-[4/3] md:aspect-[16/9] object-cover"} />
            </div>
          </Link>
          <div className="mt-4 flex items-start justify-between gap-6">
            <Meta w={w} />
            <Link href={`/${artist.username}/work/${w.slug}`} className="text-[11px] tracking-[0.16em] uppercase opacity-50 hover:opacity-100 shrink-0 mt-1">View →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ArtImg({ src, alt, cls = "w-full h-full object-cover" }: { src: string; alt: string; cls?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`art-img ${cls}`} onError={e => { (e.target as HTMLImageElement).style.opacity = "0.25"; }} />
  );
}

/* ---------- available ---------- */
export function AvailableWork({ artist }: { artist: Artist }) {
  const avail = artist.artworks.filter(w => w.available);
  return (
    <section id="available" aria-label="Available work">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="serif text-4xl md:text-5xl">Available Work</h2>
        <span className="micro-label">Inquire ⌗</span>
      </div>
      <p className="text-[14px] opacity-70 mb-8">A curated selection of works currently available.</p>
      {!avail.length ? (
        <div className="border p-10 text-center" style={{ borderColor: "color-mix(in srgb, currentColor 18%, transparent)" }}>
          <p className="serif text-3xl">Nothing available right now.</p>
          <p className="text-[13px] opacity-60 mt-2">That&apos;s perfectly okay.</p>
        </div>
      ) : (
        <div className="border-t" style={{ borderColor: "color-mix(in srgb, currentColor 18%, transparent)" }}>
          {avail.map(w => (
            <div key={w.id} className="grid grid-cols-[96px_1fr_auto] md:grid-cols-[140px_1fr_auto] gap-4 md:gap-8 py-6 border-b items-start" style={{ borderColor: "color-mix(in srgb, currentColor 12%, transparent)" }}>
              <Link href={`/${artist.username}/work/${w.slug}`} className="art-frame aspect-[3/4] block">
                <ArtImg src={w.images[0]} alt={w.title} />
              </Link>
              <div>
                <Link href={`/${artist.username}/work/${w.slug}`} className="font-medium text-[15px] hover:opacity-70">{w.title}</Link>
                <p className="text-[13px] opacity-60 mt-1">{w.year} · {w.medium}</p>
                {w.dimensions && <p className="text-[13px] opacity-60">{w.dimensions}</p>}
                <Link href={`/${artist.username}/work/${w.slug}`} className="inline-block mt-3 text-[11px] tracking-[0.16em] uppercase opacity-50 hover:opacity-100 border-b border-current pb-0.5">View →</Link>
              </div>
              <div className="text-right">
                {w.showPrice && w.price && <p className="text-[14px] font-medium">{w.price}</p>}
                <p className="text-[12px] opacity-60 mt-1">Available</p>
                {w.showInquire && <a href={`mailto:${artist.email}?subject=${encodeURIComponent(`Inquiry: ${w.title}`)}`} className="inline-block mt-3 border px-4 py-2 text-[12px] hover:opacity-70" style={{ borderColor: "color-mix(in srgb, currentColor 25%, transparent)" }}>Inquire</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- exhibitions / series / studio / notes / about / contact ---------- */
export function Exhibitions({ artist }: { artist: Artist }) {
  const byYear = useMemo(() => {
    const m = new Map<string, typeof artist.exhibitions>();
    [...artist.exhibitions].sort((a, b) => b.year.localeCompare(a.year)).forEach(e => {
      if (!m.has(e.year)) m.set(e.year, []);
      m.get(e.year)!.push(e);
    });
    return Array.from(m.entries());
  }, [artist]);
  return (
    <section id="exhibitions" aria-label="Exhibitions">
      <h2 className="serif text-4xl md:text-5xl mb-8">Exhibitions</h2>
      {!byYear.length ? (
        <div className="border p-10 text-center"><p className="serif text-3xl">Nothing archived yet.</p><p className="text-[13px] opacity-60 mt-2">Your first exhibition will live here.</p></div>
      ) : (
        <div className="space-y-10">
          {byYear.map(([year, list]) => (
            <div key={year} className="grid md:grid-cols-[80px_1fr] gap-4">
              <p className="text-[13px] opacity-50 pt-1">{year}</p>
              <div className="space-y-6">
                {list.map(e => (
                  <div key={e.id}>
                    <p className="font-medium text-[15px]">{e.title}</p>
                    <p className="text-[13px] opacity-60">{e.type}</p>
                    <p className="text-[13px] opacity-60">{e.venue}</p>
                    <p className="text-[13px] opacity-60">{e.city}</p>
                    {e.description && <p className="text-[13px] mt-2 max-w-md opacity-80">{e.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function SeriesSection({ artist }: { artist: Artist }) {
  if (!artist.series.length) return null;
  return (
    <section aria-label="Series">
      <h2 className="serif text-4xl mb-2">Series</h2>
      <p className="text-[13px] opacity-60 mb-8">Bodies of work — a digital catalogue raisonné.</p>
      <div className="grid md:grid-cols-2 gap-5">
        {artist.series.map(s => {
          const count = artist.artworks.filter(w => w.seriesId === s.id).length;
          return (
            <Link key={s.id} href={`/${artist.username}/series/${s.slug}`} className="border group grid grid-cols-[120px_1fr]" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
              <div className="art-frame aspect-square">{s.cover && <ArtImg src={s.cover} alt={s.title} />}</div>
              <div className="p-5">
                <p className="micro-label opacity-50">{s.dateRange} · {count} works</p>
                <p className="serif text-2xl mt-1 group-hover:opacity-70">{s.title}</p>
                <p className="text-[13px] opacity-60 mt-1 line-clamp-2">{s.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function StudioNotes({ artist }: { artist: Artist }) {
  if (!artist.studio.length && !artist.notes.length) return null;
  return (
    <>
      {!!artist.studio.length && (
        <section aria-label="Studio">
          <h2 className="serif text-4xl mb-2">Studio</h2>
          <p className="text-[13px] opacity-60 mb-8">Process, sketches, materials — only what you choose to share.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {artist.studio.map(s => (
              <figure key={s.id}>
                <div className="art-frame aspect-[4/3]"><ArtImg src={s.image} alt={s.caption} /></div>
                <figcaption className="text-[12px] opacity-60 mt-2">{s.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {!!artist.notes.length && (
        <section aria-label="Field notes">
          <h2 className="serif text-4xl mb-8">Field Notes</h2>
          <div className="space-y-8 max-w-xl">
            {artist.notes.map(n => (
              <div key={n.id} className="border-l-2 pl-5" style={{ borderColor: "color-mix(in srgb, currentColor 25%, transparent)" }}>
                <p className="micro-label opacity-50">Field Note / {n.index} · {n.date}</p>
                <p className="serif text-2xl italic mt-2 leading-snug">“{n.text}”</p>
                <p className="text-[13px] opacity-60 mt-2">— {artist.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function AboutContact({ artist }: { artist: Artist }) {
  return (
    <>
      <section id="about" aria-label="About" className="grid md:grid-cols-[200px_1fr] gap-6">
        <h2 className="serif text-3xl">About {artist.name.split(" ")[0]}</h2>
        <div>
          <p className="text-[15px] leading-relaxed opacity-90 max-w-xl">{artist.bio}</p>
          <p className="text-[13px] opacity-60 mt-4">Based in {artist.location}<br />Working primarily in {artist.disciplines.join(" and ").toLowerCase()}</p>
          {artist.statement && <p className="serif italic text-xl mt-6 max-w-md opacity-80">“{artist.statement}”</p>}
        </div>
      </section>
      <section id="contact" aria-label="Contact" className="max-w-xl">
        <h2 className="serif text-4xl mb-3">Contact</h2>
        <p className="text-[14px] opacity-70 mb-6">Interested in a work, exhibition, collaboration, or just saying hello?</p>
        <a href={`mailto:${artist.email}`} className="inline-flex items-center gap-2 border-b border-current pb-1 text-[15px] hover:opacity-60">Email {artist.name.split(" ")[0]} <span aria-hidden>→</span></a>
        <div className="mt-6 space-y-2 text-[14px]">
          {artist.instagram && <p><span className="opacity-50 text-[12px] uppercase tracking-[0.16em] block">Instagram</span><a className="hover:opacity-60" target="_blank" rel="noreferrer" href={`https://instagram.com/${artist.instagram.replace("@", "")}`}>{artist.instagram}</a></p>}
          <p><span className="opacity-50 text-[12px] uppercase tracking-[0.16em] block">Location</span>{artist.location}</p>
        </div>
        {artist.demo && <p className="text-[12px] opacity-50 mt-4">Demo profile — the email & Instagram above are fictional.</p>}
      </section>
    </>
  );
}

/* ---------- exhibition mode ---------- */
export function ExhibitionMode({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  const list = useMemo(() => [...artist.artworks].sort((a, b) => a.order - b.order), [artist]);
  const [i, setI] = useState(0);
  const [showMeta, setShowMeta] = useState(true);
  const next = useCallback(() => setI(v => (v + 1) % Math.max(list.length, 1)), [list.length]);
  const prev = useCallback(() => setI(v => (v - 1 + list.length) % Math.max(list.length, 1)), [list.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setShowMeta(false), 4000);
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; clearTimeout(t); };
  }, [next, prev, onClose]);

  if (!list.length) return null;
  const w = list[i];
  return (
    <div role="dialog" aria-modal="true" aria-label="Exhibition view" className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: artist.theme.bg, color: artist.theme.fg }} onMouseMove={() => setShowMeta(true)}>
      <div className={`flex items-center justify-between px-6 h-14 transition-opacity ${showMeta ? "opacity-100" : "opacity-0"}`}>
        <span className="text-[13px] font-semibold">made by · {artist.name}</span>
        <div className="flex items-center gap-5 text-[13px]">
          <span className="opacity-60">{i + 1} / {list.length}</span>
          <button onClick={onClose} className="hover:opacity-60" aria-label="Exit exhibition">✕ Close</button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 min-h-0" onClick={() => setShowMeta(s => !s)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={w.id} src={w.images[0]} alt={w.title} className="exhibition-fade max-h-full max-w-full object-contain shadow-2xl" style={{ maxHeight: "72vh" }} />
      </div>
      <div className={`px-6 pb-8 text-center transition-opacity ${showMeta ? "opacity-100" : "opacity-0"}`}>
        <p className="serif text-3xl">{w.title}</p>
        <p className="text-[13px] opacity-60 mt-1">{w.year} · {w.medium}{w.dimensions ? ` · ${w.dimensions}` : ""}</p>
        <div className="flex items-center justify-center gap-8 mt-5 text-[13px]">
          <button onClick={prev} className="hover:opacity-60" aria-label="Previous">← previous</button>
          <button onClick={next} className="hover:opacity-60" aria-label="Next">next →</button>
        </div>
      </div>
      <button onClick={prev} aria-label="Previous artwork" className="absolute left-0 top-0 bottom-0 w-16 opacity-0 hover:opacity-100">‹</button>
      <button onClick={next} aria-label="Next artwork" className="absolute right-0 top-0 bottom-0 w-16 opacity-0 hover:opacity-100">›</button>
    </div>
  );
}
