"use client";
import Link from "next/link";
import { usePublicArtist, LoadingWall } from "@/lib/use-public-artist";
import { ArtistTopbar } from "@/components/artist";
import { SiteFooter } from "@/components/ui";

export default function WorkDetail({ params }: { params: { username: string; slug: string } }) {
  const { artist, loading } = usePublicArtist(params.username);
  if (loading) return <div className="min-h-screen bg-paper text-ink"><LoadingWall /></div>;
  if (!artist) return <div className="p-20 text-center serif text-3xl">Artist not found.</div>;
  const work = artist.artworks.find(w => w.slug === params.slug);
  if (!work) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: artist.theme.bg, color: artist.theme.fg }}>
        <p className="serif text-4xl">This work has moved — or never hung here.</p>
        <Link href={`/${artist.username}`} className="mt-5 underline underline-offset-4 text-[14px]">← Back to {artist.name}</Link>
      </div>
    );
  }
  const idx = [...artist.artworks].sort((a,b)=>a.order-b.order).findIndex(w => w.id === work.id);
  const sorted = [...artist.artworks].sort((a,b)=>a.order-b.order);
  const prev = sorted[(idx - 1 + sorted.length) % sorted.length];
  const next = sorted[(idx + 1) % sorted.length];

  return (
    <div className="min-h-screen page-fade" style={{ background: artist.theme.bg, color: artist.theme.fg }}>
      <ArtistTopbar artist={artist} />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href={`/${artist.username}`} className="text-[12px] tracking-[0.16em] uppercase opacity-50 hover:opacity-100">← {artist.name}</Link>
        <div className="mt-8 art-frame bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={work.images[0]} alt={work.title} className="w-full max-h-[76vh] object-contain mx-auto" />
        </div>
        {work.images.slice(1).map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={s} alt={`${work.title} — view ${i + 2}`} loading="lazy" className="w-full mt-4 object-contain max-h-[70vh] mx-auto" />
        ))}
        <div className="mt-10 grid md:grid-cols-[1fr_220px] gap-8">
          <div>
            <h1 className="serif text-5xl">{work.title}</h1>
            <div className="mt-4 text-[14px] opacity-70 space-y-0.5">
              <p>{work.year}</p><p>{work.medium}</p>{work.dimensions && <p>{work.dimensions}</p>}
              {work.edition && <p>{work.edition}</p>}{work.location && <p>{work.location}</p>}
            </div>
            {work.description && <p className="mt-6 text-[15px] leading-relaxed opacity-90 max-w-xl">{work.description}</p>}
          </div>
          <div className="text-[14px]">
            {work.available ? <p className="font-medium">Available</p> : <p className="opacity-50">Not available</p>}
            {work.showPrice && work.price && <p className="serif text-3xl mt-2">{work.price}</p>}
            {work.showInquire && work.available && (
              <a href={`mailto:${artist.email}?subject=${encodeURIComponent(`Inquiry: ${work.title}`)}&body=${encodeURIComponent(`Hi ${artist.name},\n\nI'm interested in "${work.title}" (${work.year}). Is it still available?\n\nThank you.`)}`}
                className="block text-center mt-4 px-5 py-3 bg-current" style={{ background: artist.theme.fg }}>
                <span style={{ color: artist.theme.bg }}>Inquire about this work</span>
              </a>
            )}
            <div className="flex justify-between mt-8 text-[12px] tracking-[0.14em] uppercase opacity-60">
              <Link href={`/${artist.username}/work/${prev.slug}`} className="hover:opacity-100">← Prev</Link>
              <Link href={`/${artist.username}/work/${next.slug}`} className="hover:opacity-100">Next →</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter artistName={artist.name} artistLocation={artist.location} />
    </div>
  );
}
