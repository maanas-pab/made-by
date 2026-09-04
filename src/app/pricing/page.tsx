import Link from "next/link";
import { SiteTopbar, SiteFooter, MicroLabel } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata = { title: "Pricing — made by" };

export default function Pricing() {
  return (
    <div className="bg-paper text-ink min-h-screen page-fade">
      <SiteTopbar right={<><Link href="/explore">Explore</Link><Link href="/create" className="bg-ink text-paper px-4 py-2">Make your page</Link></>} />
      <main className="mx-auto max-w-2xl px-6 py-14 text-center">
        <MicroLabel>Pricing</MicroLabel>
        <h1 className="serif text-6xl mt-2">Free.<br />All of it.</h1>
        <p className="text-[15px] text-ink/70 mt-4 max-w-md mx-auto">
          No tiers. No trials. No &ldquo;Pro&rdquo; holding your best work hostage.
          If you make things, you deserve a place for them — that shouldn&apos;t cost you.
        </p>

        <div className="mt-10 border border-line bg-softwhite p-8 md:p-10 text-left">
          <div className="flex items-baseline justify-between">
            <p className="brand-mark">made by</p>
            <p className="serif text-5xl">$0</p>
          </div>
          <p className="micro-label text-warmgray mt-1">forever · for every artist</p>
          <ul className="mt-6 space-y-2.5 text-[14px]">
            {[
              `Your artist page — ${SITE.domain}/you`,
              "Unlimited artworks",
              "All four layouts: editorial, gallery, archive, full-bleed",
              "All 8 palettes + all 8 typefaces",
              "Available work + inquiry",
              "Exhibitions archive, series, studio, field notes",
              "Exhibition mode",
              "Artist card + QR code",
              "Simple analytics",
              "Custom domain",
            ].map(f => <li key={f} className="flex gap-3"><span aria-hidden>—</span>{f}</li>)}
          </ul>
          <Link href="/create" className="block text-center bg-ink text-paper px-5 py-3.5 text-[15px] mt-8 hover:opacity-85">Make your page →</Link>
        </div>

        <div className="mt-10 text-left border-t hairline pt-8 space-y-4 text-[14px] text-ink/70">
          <h2 className="serif text-3xl text-ink">Why free?</h2>
          <p>Because emerging artists already pay in every other way — studio rent, materials, time, courage. A digital home shouldn&apos;t be another bill.</p>
          <p>Made by is free like a public gallery is free: someone keeps the lights on because the work matters. We&apos;re building this with artists, not extracting from them.</p>
          <p className="serif italic text-xl text-ink pt-2">If you ever pay for anything here, it&apos;ll be optional, obvious, and never your own work held ransom.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
