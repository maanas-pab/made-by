import Link from "next/link";
import { SiteTopbar, SiteFooter, MicroLabel } from "@/components/ui";
import { SITE } from "@/lib/site";
export const metadata = { title: "About — made by" };
export default function About() {
  return (
    <div className="bg-paper text-ink min-h-screen page-fade">
      <SiteTopbar right={<><Link href="/explore">Explore</Link><Link href="/create" className="bg-ink text-paper px-4 py-2">Make your page</Link></>} />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <MicroLabel>About</MicroLabel>
        <h1 className="serif text-5xl mt-2 leading-tight">Artists make things. Made by gives those things a place to exist.</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/80">
          <p>Made by is a digital identity card, exhibition space and living portfolio for emerging artists. A card that became a website — closer to a museum catalogue than to a website builder.</p>
          <p>We believe in restraint: generous whitespace, strong typography, large artwork, subtle borders. The art is always the visual focus.</p>
          <p>Made by is not a social network. No likes, no follower counts, no algorithmic feed. It is the place you send someone <em>after</em> they discover you — at a fair, an opening, a studio visit.</p>
          <p className="serif text-2xl text-ink pt-4">Maximum feeling with minimum interface.</p>
        </div>
        <div className="mt-12 border-t hairline pt-8">
          <p className="micro-label text-warmgray">The maker</p>
          <p className="serif text-3xl mt-2">Hi, I&apos;m Maanas.</p>
          <p className="text-[15px] leading-relaxed text-ink/80 mt-4">
            I&apos;m a painter in Dallas, TX. Made by started because I watched talented friends send galleries
            a link they were embarrassed by — or worse, just an Instagram handle. Artists deserve better than
            that, so I&apos;m building the quiet, beautiful home I always wished existed. It&apos;s free, and
            it&apos;s personal: if something feels wrong, tell me and I&apos;ll fix it.
          </p>
          <p className="text-[14px] mt-4">— Maanas · <a href={`mailto:${SITE.email}`} className="border-b border-current pb-0.5 hover:opacity-60">{SITE.email}</a></p>
        </div>
        <div className="mt-8">
          <Link href="/create" className="inline-block bg-ink text-paper px-6 py-3 text-[14px] mt-2 hover:opacity-85">Make something worth finding</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
