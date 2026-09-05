"use client";
import Link from "next/link";
import { usePublicArtist, LoadingWall } from "@/lib/use-public-artist";
import { ArtistTopbar, ArtImg } from "@/components/artist";
import { SiteFooter } from "@/components/ui";

export default function SeriesDetail({ params }: { params: { username: string; slug: string } }) {
  const { artist, loading } = usePublicArtist(params.username);
  if (loading) return <div className="min-h-screen bg-paper text-ink"><LoadingWall /></div>;
  if (!artist) return <div className="p-20 text-center">Not found.</div>;
  const s = artist.series.find(x => x.slug === params.slug);
  if (!s) return <div className="p-20 text-center"><p className="serif text-4xl">Series not found.</p><Link className="underline" href={`/${artist.username}`}>← Back</Link></div>;
  const works = artist.artworks.filter(w => w.seriesId === s.id);
  return (
    <div className="min-h-screen" style={{ background: artist.theme.bg, color: artist.theme.fg }}>
      <ArtistTopbar artist={artist} />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href={`/${artist.username}`} className="text-[12px] tracking-[0.16em] uppercase opacity-50">← {artist.name}</Link>
        <p className="micro-label opacity-50 mt-8">Series · {s.dateRange}</p>
        <h1 className="serif text-6xl mt-2">{s.title}</h1>
        <p className="text-[15px] opacity-80 max-w-xl mt-4">{s.description}</p>
        <p className="text-[13px] opacity-50 mt-2">{works.length} works</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {works.map(w => (
            <Link key={w.id} href={`/${artist.username}/work/${w.slug}`} className="group">
              <div className="art-frame aspect-[4/5]"><ArtImg src={w.images[0]} alt={w.title} /></div>
              <p className="mt-2 text-[14px] font-medium group-hover:opacity-70">{w.title}</p>
              <p className="text-[12px] opacity-60">{w.year} · {w.medium}</p>
            </Link>
          ))}
          {!works.length && <p className="opacity-60 text-[14px]">Works in this series will appear here.</p>}
        </div>
      </main>
      <SiteFooter artistName={artist.name} artistLocation={artist.location} />
    </div>
  );
}
