"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { artistPath, artistUrl } from "@/lib/site";

export default function ArtistCard({ params }: { params: { username: string } }) {
  const { getArtist } = useStore();
  const artist = getArtist(params.username);
  if (!artist) return <div className="p-20 text-center">Not found.</div>;
  const url = artistPath(artist.username);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&color=1C1C1A&bgcolor=FBFAF7&data=${encodeURIComponent(artistUrl(artist.username))}`;
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 h-14 flex items-center justify-between border-b hairline">
        <Link href="/" className="brand-mark">made by</Link>
        <Link href={`/${artist.username}`} className="text-[13px] hover:opacity-60">← {artist.name}</Link>
      </div>
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-14 text-center">
        <p className="micro-label text-warmgray">Digital business card</p>
        <h1 className="serif text-4xl mt-2">Made by Artist Card</h1>
        {/* card */}
        <div className="mx-auto mt-10 max-w-md border border-line bg-softwhite p-10 shadow-sm">
          <p className="brand-mark">made by</p>
          <p className="serif text-5xl mt-3">{artist.name}</p>
          <p className="text-[13px] text-warmgray mt-2">{artist.location}</p>
          <p className="text-[13px] mt-1">{artist.disciplines.join(" / ")}</p>
          <p className="text-[13px] text-warmgray mt-2">{artist.instagram}</p>
          <div className="flex justify-center mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code for ${url}`} width={150} height={150} className="border border-line" loading="lazy" />
          </div>
          <p className="text-[13px] mt-4 border border-line inline-block px-4 py-2">{url}</p>
        </div>
        <p className="text-[13px] text-warmgray mt-6 max-w-sm mx-auto">Scan at openings, fairs, studio visits and portfolio reviews — it opens {artist.name}&apos;s page instantly.</p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => window.print()} className="border border-line px-5 py-2.5 text-[13px] hover:border-ink">Download / Print card</button>
          <button onClick={() => navigator.clipboard?.writeText(`https://${url}`)} className="bg-ink text-paper px-5 py-2.5 text-[13px] hover:opacity-85">Copy link</button>
        </div>
        <div className="mt-10 text-left border border-line p-6 grid grid-cols-2 gap-4 text-[13px]">
          <div><p className="micro-label text-warmgray mb-1">Email</p><p>{artist.email}</p></div>
          <div><p className="micro-label text-warmgray mb-1">Instagram</p><p>{artist.instagram}</p></div>
          <div><p className="micro-label text-warmgray mb-1">Location</p><p>{artist.location}</p></div>
          <div><p className="micro-label text-warmgray mb-1">Link</p><p>{url}</p></div>
        </div>
      </main>
    </div>
  );
}
