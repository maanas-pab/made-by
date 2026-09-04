"use client";
import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ArtistTopbar, ArtistHero, Portfolio, AvailableWork, Exhibitions, SeriesSection, StudioNotes, AboutContact, ExhibitionMode } from "@/components/artist";
import { SiteFooter } from "@/components/ui";

export default function ArtistPage({ params }: { params: { username: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper text-ink flex items-center justify-center serif text-3xl">Loading…</div>}>
      <Inner username={params.username} />
    </Suspense>
  );
}

function Inner({ username }: { username: string }) {
  const { getArtist } = useStore();
  const search = useSearchParams();
  const router = useRouter();
  const artist = getArtist(username);
  const view = search.get("view");
  const section = search.get("section");
  useEffect(() => {
    if (artist) {
      document.title = `${artist.name} — ${artist.disciplines.join(" / ")} | made by`;
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", artist.bio.slice(0, 155));
    }
  }, [artist]);

  const showSections = useMemo(() => {
    if (!section) return ["portfolio", "available", "exhibitions", "series", "studio", "about"];
    return [section];
  }, [section]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center px-6 text-center">
        <p className="micro-label text-warmgray">made by</p>
        <h1 className="serif text-5xl mt-3">This wall is empty.</h1>
        <p className="text-[14px] text-warmgray mt-3">No artist lives at /{username} — yet.</p>
        <Link href="/create" className="mt-6 bg-ink text-paper px-6 py-3 text-[14px]">Claim this URL</Link>
      </div>
    );
  }

  const bg = artist.theme.bg, fg = artist.theme.fg;

  return (
    <div className="min-h-screen page-fade" style={{ background: bg, color: fg }}>
      <ArtistTopbar artist={artist} />
      {artist.demo && (
        <p className="text-center text-[11px] tracking-[0.14em] uppercase border-b px-6 py-2 opacity-70" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
          Demo portfolio — {artist.name} is fictional; email & handle don&apos;t reach anyone
        </p>
      )}
      <main className="mx-auto max-w-6xl px-6">
        <ArtistHero artist={artist} />
        {showSections.includes("portfolio") && artist.artworks.length > 0 && artist.theme.layout === "editorial" && (
          <section className="grid md:grid-cols-[1fr_220px] gap-6 items-end mb-20">
            <Link href={`/${artist.username}/work/${[...artist.artworks].sort((a,b)=>a.order-b.order)[0].slug}`} className="art-frame block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={[...artist.artworks].sort((a,b)=>a.order-b.order)[0].images[0]} alt="Featured work" className="art-img w-full h-[280px] md:h-[440px] object-cover" />
            </Link>
            <div className="text-[13px] leading-relaxed opacity-80">
              <p>{artist.statement}</p>
              <Link href={`/${artist.username}?view=exhibition`} className="inline-block mt-4 text-[11px] tracking-[0.16em] uppercase border-b border-current pb-0.5 hover:opacity-60">View as Exhibition →</Link>
            </div>
          </section>
        )}

        <div className="space-y-24 pb-8">
          {showSections.includes("portfolio") && (
            <section aria-label="Portfolio">
              {artist.theme.layout === "editorial" && <div className="flex items-baseline justify-between mb-8"><h2 className="serif text-3xl">Recent Work</h2><span className="micro-label opacity-50">{artist.artworks.length} works</span></div>}
              {artist.artworks.length === 0 ? (
                <div className="border p-12 text-center"><p className="serif text-3xl">Your wall is empty.</p><p className="text-[13px] opacity-60 mt-2">Upload your first work.</p></div>
              ) : <Portfolio artist={artist} />}
            </section>
          )}
          {(showSections.includes("available") || !section) && <AvailableWork artist={artist} />}
          {(showSections.includes("exhibitions") || !section) && <Exhibitions artist={artist} />}
          {!section && <SeriesSection artist={artist} />}
          {showSections.includes("series") && <SeriesSection artist={artist} />}
          {!section && <StudioNotes artist={artist} />}
          {(showSections.includes("contact") || showSections.includes("about") || !section) && <AboutContact artist={artist} />}
        </div>

        <div className="text-center pt-10 pb-4">
          <p className="text-[13px] opacity-70">{artist.name}</p>
          <p className="text-[12px] opacity-50">{artist.location}</p>
          <p className="text-[12px] opacity-50 mt-4">made by</p>
          <div className="mt-4 flex justify-center gap-3 text-[12px]">
            <Link href={`/${artist.username}/card`} className="border px-4 py-2 hover:opacity-70" style={{ borderColor: "color-mix(in srgb, currentColor 25%, transparent)" }}>Artist Card + QR</Link>
            <Link href={`/${artist.username}?view=exhibition`} className="border px-4 py-2 hover:opacity-70" style={{ borderColor: "color-mix(in srgb, currentColor 25%, transparent)" }}>Exhibition Mode</Link>
          </div>
        </div>
      </main>
      <div style={{ background: bg, color: fg }} className="opacity-90">
        <SiteFooter artistName={artist.name} artistLocation={artist.location} />
      </div>
      {view === "exhibition" && <ExhibitionMode artist={artist} onClose={() => router.push(`/${artist.username}`)} />}
    </div>
  );
}
