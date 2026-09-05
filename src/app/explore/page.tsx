import Link from "next/link";
import { SiteTopbar, SiteFooter, MicroLabel } from "@/components/ui";
import ExploreClient from "./explore-client";

export const metadata = { title: "Explore — made by" };

export default function ExplorePage() {
  return (
    <div className="bg-paper text-ink min-h-screen page-fade">
      <SiteTopbar right={<><Link href="/pricing" className="hover:opacity-60">Pricing</Link><Link href="/create" className="bg-ink text-paper px-4 py-2">Make your page</Link></>} />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <MicroLabel>Explore</MicroLabel>
        <h1 className="serif text-5xl mt-2 mb-2">A catalogue, not a feed.</h1>
        <p className="text-[14px] text-warmgray max-w-lg mb-8">No likes. No follower counts. Just artists, organised the way a fair or catalogue would organise them.</p>
        <ExploreClient />
      </main>
      <SiteFooter />
    </div>
  );
}
