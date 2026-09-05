import Link from "next/link";
import { MadeByMark, ArrowLink, SiteFooter } from "@/components/ui";
import { DEMO_ARTISTS } from "@/lib/data";
import { SITE } from "@/lib/site";
import ArtistExamples from "@/components/artist-examples";

export default function Home() {
  const maya = DEMO_ARTISTS[0];
  return (
    <div className="page-fade bg-paper text-ink min-h-screen">
      {/* top bar */}
      <header className="border-b hairline">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <MadeByMark />
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink/80">
            <Link href="/explore" className="hover:text-ink">Explore</Link>
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/about" className="hover:text-ink">About</Link>
            <Link href="/signin" className="hover:text-ink">Sign in</Link>
            <Link href="/create" className="bg-ink text-paper px-4 py-2 text-[13px] hover:opacity-85">Make your page</Link>
          </nav>
          <Link href="/create" className="md:hidden bg-ink text-paper px-4 py-2 text-[13px]">Make your page</Link>
        </div>
      </header>

      {/* hero — mirrors reference: small location, giant serif name, discipline, hero art */}
      <main className="mx-auto max-w-6xl px-6">
        <section className="pt-14 pb-10 text-center">
          <p className="micro-label mb-5">A digital home for artists</p>
          <h1 className="serif font-medium leading-[1.02] text-[44px] md:text-[76px] max-w-3xl mx-auto">
            Your work deserves a place of its own.
          </h1>
          <p className="mt-5 text-[15px] text-ink/70 max-w-md mx-auto">
            A beautiful artist card, miniature gallery and living archive — quiet, editorial, timeless.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <Link href="/create" className="bg-ink text-paper px-6 py-3 text-[14px] hover:opacity-85">Make your page</Link>
            <Link href="/explore" className="border border-line px-6 py-3 text-[14px] hover:border-ink">Explore artists</Link>
          </div>
          <p className="mt-4 text-[12px] text-warmgray">Free forever · No template look · Your link in minutes</p>
        </section>

        {/* featured artist card — Maya Chen like reference */}
        <section className="border border-line bg-softwhite">
          <div className="flex items-center justify-between px-5 md:px-8 h-12 border-b hairline text-[12px]">
            <span className="brand-mark">made by</span>
            <div className="hidden md:flex gap-6 text-ink/70">
              <Link href="/mayachen">Portfolio</Link>
              <Link href="/mayachen?section=available">Available Work</Link>
              <Link href="/mayachen?section=exhibitions">Exhibitions</Link>
              <Link href="/mayachen?section=contact">Contact</Link>
            </div>
            <span className="md:hidden">＝</span>
          </div>
          <div className="text-center pt-10 pb-8 px-6">
            <p className="micro-label mb-3">Austin, TX</p>
            <Link href="/mayachen"><h2 className="serif text-[56px] md:text-[96px] leading-none hover:opacity-80">Maya Chen</h2></Link>
            <p className="mt-3 text-[14px]">Painting / Mixed Media</p>
          </div>
          <div className="grid md:grid-cols-[1fr_220px] gap-6 px-5 md:px-8 pb-8 items-end">
            <Link href="/mayachen" className="art-frame block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={maya.artworks[0].images[0]} alt="The Birth of Venus — Maya Chen" className="art-img w-full h-[280px] md:h-[420px] object-cover" />
            </Link>
            <div className="text-[13px] leading-relaxed text-ink/80">
              <p>Exploring memory, time, and the spaces between what was and what could be.</p>
              <div className="mt-5"><ArrowLink href="/mayachen">View portfolio</ArrowLink></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-5 border-t hairline text-[10px] tracking-[0.18em] uppercase text-warmgray">
            <span className="w-px h-6 bg-line" /> Scroll to explore <span className="w-px h-6 bg-line" />
          </div>
          <div className="px-5 md:px-8 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="serif text-2xl">Recent Work</h3>
              <Link href="/mayachen" className="micro-label hover:text-ink">View all works</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {maya.artworks.slice(2, 5).map(w => (
                <Link key={w.id} href={`/mayachen/work/${w.slug}`} className="group">
                  <div className="art-frame aspect-[4/5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.images[0]} alt={w.title} loading="lazy" className="art-img w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-[12px] font-medium group-hover:opacity-70">{w.title}</p>
                  <p className="text-[11px] text-warmgray">{w.year} · {w.medium}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* artist examples — each looks different because art is different */}
        <ArtistExamples />

        {/* philosophy */}
        <section className="mt-20 grid md:grid-cols-2 gap-10 border-t hairline pt-12">
          <h2 className="serif text-4xl md:text-5xl leading-tight">Not a portfolio template.</h2>
          <div className="text-[15px] leading-relaxed text-ink/80 space-y-4">
            <p>Made by was built around the way artists actually present work — like a wall, a catalogue, a card handed over at an opening.</p>
            <p>Artist card → work → objects → history → contact. No dashboards-as-product. No SaaS chrome. The art stays the hero.</p>
            <ArrowLink href="/about">Our philosophy</ArrowLink>
          </div>
        </section>

        {/* features */}
        <section className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-px bg-line border border-line">
          {[["Portfolio", "Editorial, grid, masonry, full-bleed."], ["Available Work", "A private gallery inventory, not a store."], ["Exhibitions", "Your CV, made beautiful."], ["Series", "A digital catalogue raisonné."], ["Studio + Field Notes", "Process and fragments, if you want them."], ["Artist Card + QR", "Your link, your card, your code."]].map(([t, d]) => (
            <div key={t} className="bg-paper p-6">
              <p className="font-medium text-[14px] mb-1">{t}</p>
              <p className="text-[13px] text-warmgray">{d}</p>
            </div>
          ))}
        </section>

        {/* pricing teaser */}
        <section className="mt-16 border border-line grid md:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="micro-label mb-3">Pricing</p>
            <h3 className="serif text-4xl mb-3">Free.<br />All of it.</h3>
            <p className="text-[14px] text-ink/70 mb-6">No tiers. No trials. Every layout, palette, typeface and feature — $0, forever.</p>
            <ArrowLink href="/pricing">Why free?</ArrowLink>
          </div>
          <div className="border-t md:border-t-0 md:border-l hairline p-8 md:p-12 bg-softwhite">
            <div className="flex justify-between text-[14px] py-3 border-b hairline"><span>Everything</span><span>$0</span></div>
            <div className="flex justify-between text-[14px] py-3 border-b hairline"><span>Catch</span><span>None</span></div>
            <p className="text-[12px] text-warmgray mt-4">Unlimited work · all layouts · all palettes & type · domain · analytics</p>
          </div>
        </section>

        {/* final CTA */}
        <section className="text-center py-20">
          <h2 className="serif text-5xl md:text-6xl">Make something worth finding.</h2>
          <div className="mt-6"><Link href="/create" className="bg-ink text-paper px-8 py-3.5 text-[15px] hover:opacity-85 inline-block">Create your made by</Link></div>
          <p className="mt-4 text-[13px] text-warmgray">{SITE.domain}/you — live in minutes</p>
        </section>

        {/* value strip like reference */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line mb-4">
          {[["Your space", "A beautiful home for your art and your story."], ["Share anywhere", "Your link, your card, your QR code."], ["Built for artists", "Made by artists, for artists."], ["Free forever", "Every feature. $0. That's the whole pricing page."]].map(([t, d]) => (
            <div key={t} className="bg-paper p-5">
              <p className="text-[13px] font-semibold mb-1">{t}</p>
              <p className="text-[12px] text-warmgray">{d}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
