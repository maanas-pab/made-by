"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useStore, fileToDataUrl } from "@/lib/store";
import { MadeByMark, Input, Textarea, Select, Field, Button, MicroLabel, EmptyState } from "@/components/ui";
import { LAYOUTS, PALETTES, TYPEFACES, slugify } from "@/lib/data";
import { artistPath, artistUrl } from "@/lib/site";

type Tab = "portfolio" | "available" | "exhibitions" | "series" | "notes" | "customize" | "share";

export default function Dashboard() {
  return (<Suspense fallback={<div className="p-20 serif text-3xl text-center">Loading…</div>}><DashInner /></Suspense>);
}
function DashInner() {
  const store = useStore();
  const { user, myUsername, getArtist, updateArtist, addArtwork, updateArtwork, deleteArtwork, moveArtwork, addExhibition, deleteExhibition, addSeries, addNote, deleteNote, signOut, savedState } = store;
  const [tab, setTab] = useState<Tab>("portfolio");
  const [toast, setToast] = useState("");

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const artist = myUsername ? getArtist(myUsername) : undefined;

  if (!user || !artist) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between border-b hairline"><MadeByMark /><Link href="/" className="text-[13px]">← Home</Link></div>
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="serif text-4xl">Sign in to tend your wall.</p>
          <p className="text-[14px] text-warmgray mt-3">Your dashboard is intentionally tiny — the page is the product.</p>
          <div className="flex gap-3 justify-center mt-8">
            <Button href="/signin">Sign in</Button><Button href="/create" variant="line">Make a page</Button>
          </div>
        </div>
      </div>
    );
  }

  const works = [...artist.artworks].sort((a, b) => a.order - b.order);

  async function handleUpload(files: FileList | null, patch?: { available?: boolean }) {
    if (!files?.length) return;
    for (const f of Array.from(files).slice(0, 8)) {
      const url = await fileToDataUrl(f);
      addArtwork(artist!.username, { title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 60) || "Untitled", slug: slugify(f.name.replace(/\.[^.]+$/, "")) + "-" + Date.now().toString(36), images: [url], available: patch?.available ?? false });
    }
    say("Added to your wall.");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between border-b hairline">
        <MadeByMark />
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-warmgray hidden sm:inline">{savedState === "Saved" ? "● Saved" : "○ Saving…"} · {artist.published ? "Live" : "Draft"}</span>
          <Link href={`/${artist.username}`} className="hover:opacity-60">View page</Link>
          <button onClick={() => { signOut(); window.location.href = "/"; }} className="hover:opacity-60">Sign out</button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* left — the tiny dashboard */}
        <aside>
          <MicroLabel>made by</MicroLabel>
          <h1 className="serif text-4xl mt-1">{artist.name}</h1>
          <p className="text-[13px] text-warmgray mt-1">{artistPath(artist.username)}</p>
          <div className="flex gap-2 mt-4">
            <Button href={`/${artist.username}`} className="!px-4 !py-2 text-[12px]">View page</Button>
            <button onClick={() => { navigator.clipboard?.writeText(artistUrl(artist.username)); say("Link copied."); }} className="border border-line px-4 py-2 text-[12px] hover:border-ink">Copy link</button>
          </div>
          <div className="mt-6 border border-line divide-y text-[14px] bg-softwhite">
            {[["Portfolio", `${works.length} works`, "portfolio"], ["Available", `${works.filter(w => w.available).length} works`, "available"], ["Exhibitions", `${artist.exhibitions.length} exhibitions`, "exhibitions"], ["Series & Notes", `${artist.series.length} series`, "series"], ["Look", artist.theme.layout, "customize"], ["Card & QR", "share", "share"]].map(([t, sub, id]) => (
              <button key={id} onClick={() => setTab(id as Tab)} className={`w-full text-left px-4 py-3 flex justify-between items-center ${tab === id ? "bg-ink text-paper" : "hover:bg-clay/40"}`}>
                <span>{t}</span><span className={`text-[12px] ${tab === id ? "opacity-70" : "text-warmgray"}`}>{sub}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 border border-line p-4 text-[13px] bg-softwhite">
            <div className="flex items-center justify-between"><span>{artist.published ? "Your page is live." : "Your page is a draft."}</span>
              <button onClick={() => { updateArtist(artist.username, { published: !artist.published }); say(artist.published ? "Unpublished — private for now." : "Published — the world can visit."); }} className="underline underline-offset-4">{artist.published ? "Unpublish" : "Publish"}</button></div>
            <p className="text-[12px] text-warmgray mt-1">{artistPath(artist.username)}</p>
          </div>
          <div className="mt-4 border border-line p-4 text-[13px] bg-softwhite">
            <p className="font-medium">Free forever.</p>
            <p className="text-warmgray text-[12px] mt-1">Every layout, palette, typeface and feature — no tiers, no catch.</p>
          </div>
        </aside>

        {/* right — editor */}
        <section key={tab} className="fade-up min-w-0">
          {tab === "portfolio" && (
            <div>
              <div className="flex items-center justify-between mb-5"><h2 className="serif text-3xl">Portfolio</h2>
                <label className="border border-line px-4 py-2 text-[13px] cursor-pointer hover:border-ink">+ Add work<input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} /></label></div>
              {!works.length ? <EmptyState title="Your wall is empty." body="Upload your first work." /> : (
                <div className="space-y-3">
                  {works.map((w, i) => (
                    <WorkRow key={w.id} n={i + 1} title={w.title} meta={`${w.year} · ${w.medium}`} img={w.images[0]}
                      onUp={() => moveArtwork(artist.username, w.id, -1)} onDown={() => moveArtwork(artist.username, w.id, 1)}
                      onDelete={() => { if (confirm(`Remove "${w.title}"?`)) deleteArtwork(artist.username, w.id); }}
                      editor={<WorkEditor username={artist.username} id={w.id} />} />
                  ))}
                </div>
              )}
              <details className="mt-8 border border-line p-5 text-[13px]"><summary className="cursor-pointer font-medium">Profile & statement</summary>
                <div className="grid gap-4 mt-4">
                  <Field label="Name"><Input value={artist.name} onChange={e => updateArtist(artist.username, { name: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Location"><Input value={artist.location} onChange={e => updateArtist(artist.username, { location: e.target.value })} /></Field>
                    <Field label="Status"><Input value={artist.status ?? ""} onChange={e => updateArtist(artist.username, { status: e.target.value })} placeholder="Open for commissions" /></Field>
                  </div>
                  <Field label="Bio"><Textarea value={artist.bio} onChange={e => updateArtist(artist.username, { bio: e.target.value })} /></Field>
                  <Field label="Statement"><Textarea value={artist.statement} onChange={e => updateArtist(artist.username, { statement: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email"><Input value={artist.email} onChange={e => updateArtist(artist.username, { email: e.target.value })} /></Field>
                    <Field label="Instagram"><Input value={artist.instagram} onChange={e => updateArtist(artist.username, { instagram: e.target.value })} /></Field>
                  </div>
                </div>
              </details>
            </div>
          )}

          {tab === "available" && (
            <div>
              <h2 className="serif text-3xl mb-1">Available Work</h2>
              <p className="text-[13px] text-warmgray mb-5">A private gallery inventory — not a store. Toggle availability, price, inquire per work.</p>
              <div className="space-y-3">{works.map(w => (
                <div key={w.id} className="border border-line p-4 grid grid-cols-[64px_1fr] gap-4 items-start bg-softwhite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.images[0]} alt={w.title} className="w-16 h-20 object-cover" />
                  <div>
                    <p className="font-medium text-[14px]">{w.title}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-[13px]">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={w.available} onChange={e => updateArtwork(artist.username, w.id, { available: e.target.checked })} /> Available</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={w.showPrice} onChange={e => updateArtwork(artist.username, w.id, { showPrice: e.target.checked })} /> Show price</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={w.showInquire} onChange={e => updateArtwork(artist.username, w.id, { showInquire: e.target.checked })} /> Inquire button</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Input value={w.price ?? ""} placeholder="$1,200" onChange={e => updateArtwork(artist.username, w.id, { price: e.target.value })} />
                      <Input value={w.medium} onChange={e => updateArtwork(artist.username, w.id, { medium: e.target.value })} />
                      <Input value={w.dimensions} placeholder="24 × 30 in." onChange={e => updateArtwork(artist.username, w.id, { dimensions: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              {!works.length && <EmptyState title="Nothing available right now." body="That's perfectly okay." />}</div>
            </div>
          )}

          {tab === "exhibitions" && (
            <div>
              <div className="flex items-center justify-between mb-5"><h2 className="serif text-3xl">Exhibitions</h2>
                <button onClick={() => { addExhibition(artist.username, { title: "New Exhibition", year: "2026" }); say("Exhibition added."); }} className="border border-line px-4 py-2 text-[13px] hover:border-ink">+ Add exhibition</button></div>
              {!artist.exhibitions.length ? <EmptyState title="Nothing archived yet." body="Your first exhibition will live here." /> : (
                <div className="space-y-3">{artist.exhibitions.map(e => (
                  <div key={e.id} className="border border-line p-4 bg-softwhite grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input defaultValue={e.title} onBlur={ev => { if (ev.target.value !== e.title) updateArtist(artist.username, { exhibitions: artist.exhibitions.map(x => x.id === e.id ? { ...x, title: ev.target.value } : x) }); }} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input defaultValue={e.year} onBlur={ev => updateArtist(artist.username, { exhibitions: artist.exhibitions.map(x => x.id === e.id ? { ...x, year: ev.target.value } : x) })} />
                        <Input defaultValue={e.venue} onBlur={ev => updateArtist(artist.username, { exhibitions: artist.exhibitions.map(x => x.id === e.id ? { ...x, venue: ev.target.value } : x) })} />
                        <Input defaultValue={e.city} onBlur={ev => updateArtist(artist.username, { exhibitions: artist.exhibitions.map(x => x.id === e.id ? { ...x, city: ev.target.value } : x) })} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-warmgray">{e.type} · {e.year}</span>
                      <button onClick={() => deleteExhibition(artist.username, e.id)} className="text-warmgray hover:text-ink underline underline-offset-4">Remove</button>
                    </div>
                  </div>
                ))}</div>)}
            </div>
          )}

          {tab === "series" && (
            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-5"><h2 className="serif text-3xl">Series</h2>
                  <button onClick={() => { addSeries(artist.username, { title: "New Series", slug: `series-${Date.now().toString(36)}` }); say("Series created."); }} className="border border-line px-4 py-2 text-[13px] hover:border-ink">+ New series</button></div>
                {!artist.series.length ? <EmptyState title="No series yet." body="Group a body of work into a catalogue." /> : (
                  <div className="space-y-3">{artist.series.map(s => (
                    <div key={s.id} className="border border-line p-4 bg-softwhite">
                      <p className="font-medium">{s.title}</p><p className="text-[12px] text-warmgray">{s.dateRange} · /{artist.username}/series/{s.slug}</p>
                      <p className="text-[13px] mt-2">{s.description || "Add a description from your page data."}</p>
                      <div className="mt-3"><p className="micro-label text-warmgray mb-2">Assign works</p>
                        <div className="flex flex-wrap gap-2">{works.map(w => (
                          <button key={w.id} onClick={() => updateArtwork(artist.username, w.id, { seriesId: w.seriesId === s.id ? undefined : s.id })} className={`px-3 py-1.5 text-[12px] border ${w.seriesId === s.id ? "bg-ink text-paper border-ink" : "border-line"}`}>{w.title}</button>))}</div></div>
                    </div>
                  ))}</div>)}
              </div>
              <div>
                <div className="flex items-center justify-between mb-5"><h2 className="serif text-3xl">Field Notes</h2>
                  <NoteAdder onAdd={(t) => { addNote(artist.username, { text: t }); say("Note pinned."); }} /></div>
                <div className="space-y-3">{artist.notes.map(n => (
                  <div key={n.id} className="border border-line p-4 bg-softwhite flex justify-between gap-4">
                    <div><p className="micro-label text-warmgray">/{n.index} · {n.date}</p><p className="serif italic text-xl mt-1">“{n.text}”</p></div>
                    <button onClick={() => deleteNote(artist.username, n.id)} className="text-[12px] text-warmgray hover:text-ink underline underline-offset-4 shrink-0">Remove</button>
                  </div>
                ))}
                {!artist.notes.length && <p className="text-[13px] text-warmgray">Fragments, not posts. e.g. “Started with a portrait. Ended somewhere else.”</p>}</div>
              </div>
              <div>
                <h2 className="serif text-3xl mb-4">Studio</h2>
                <label className="border border-dashed border-warmgray p-6 block text-center text-[13px] cursor-pointer hover:border-ink">+ Add studio image<input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await fileToDataUrl(f);
                  updateArtist(artist.username, { studio: [...artist.studio, { id: `st${Date.now()}`, image: url, caption: "Studio, " + new Date().toLocaleDateString() }] });
                  say("Added to studio.");
                }} /></label>
                <div className="grid grid-cols-3 gap-2 mt-3">{artist.studio.map(s => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={s.id} src={s.image} alt={s.caption} className="aspect-square object-cover w-full border border-line" />))}</div>
              </div>
            </div>
          )}

          {tab === "customize" && (
            <div>
              <h2 className="serif text-3xl mb-1">Look</h2>
              <p className="text-[13px] text-warmgray mb-6">Customization within taste — curated, never chaotic.</p>
              <p className="micro-label text-warmgray mb-3">Layout · all yours</p>
              <div className="grid grid-cols-2 gap-3">
                {LAYOUTS.map(l => {
                  const locked = false;
                  return (
                    <button key={l.id} disabled={locked} onClick={() => { updateArtist(artist.username, { theme: { ...artist.theme, layout: l.id } }); say(`${l.name} applied.`); }}
                      className={`border p-5 text-left ${artist.theme.layout === l.id ? "border-ink bg-softwhite" : "border-line hover:border-ink"} ${locked ? "opacity-50" : ""}`}>
                      <p className="font-medium text-[14px]">{l.name}</p><p className="text-[12px] text-warmgray mt-1">{l.desc}</p>
                    </button>);
                })}
              </div>
              <p className="micro-label text-warmgray mt-8 mb-3">Palette · 8 curated</p>
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map(p => (
                  <button key={p.id} onClick={() => { updateArtist(artist.username, { theme: { ...artist.theme, palette: p.id, bg: p.bg, fg: p.fg } }); }}
                    className={`border p-3 text-left ${artist.theme.palette === p.id ? "border-ink" : "border-line"}`}>
                    <span className="block h-10" style={{ background: p.bg, border: "1px solid #D9D5CC" }} />
                    <span className="text-[12px] mt-1 block">{p.name}</span>
                  </button>))}
              </div>
              <p className="micro-label text-warmgray mt-8 mb-3">Typeface</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPEFACES.slice(0, 4).map(t => (
                  <button key={t.id} onClick={() => { updateArtist(artist.username, { theme: { ...artist.theme, typeface: t.id } }); }}
                    className="border border-line p-3 text-left hover:border-ink"><span className="text-[18px]" style={{ fontFamily: t.serif }}>{t.name} — Ag</span></button>))}
              </div>
              <div className="mt-6 flex gap-4 text-[13px]">
                <label className="flex items-center gap-2">Spacing<Select value={artist.theme.spacing} onChange={e => updateArtist(artist.username, { theme: { ...artist.theme, spacing: e.target.value as never } })} className="!w-auto"><option value="compact">Compact</option><option value="balanced">Balanced</option><option value="spacious">Spacious</option></Select></label>
                <Link href={`/${artist.username}`} className="underline underline-offset-4">Preview live page →</Link>
              </div>
            </div>
          )}

          {tab === "share" && (
            <div>
              <h2 className="serif text-3xl mb-4">Card & QR</h2>
              <div className="border border-line bg-softwhite p-8 text-center max-w-sm">
                <p className="text-[13px] font-semibold">made by</p>
                <p className="serif text-4xl mt-2">{artist.name}</p>
                <p className="text-[12px] text-warmgray mt-1">{artist.location} · {artist.disciplines.join(" / ")}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(artistUrl(artist.username))}`} alt="QR" className="mx-auto mt-5 border border-line" width={150} height={150} />
                <p className="text-[12px] mt-3 border border-line inline-block px-3 py-1.5">{artistPath(artist.username)}</p>
              </div>
              <div className="flex gap-3 mt-5">
                <Button href={`/${artist.username}/card`}>Open artist card</Button>
                <Button variant="line" onClick={() => { navigator.clipboard?.writeText(artistUrl(artist.username)); say("Link copied."); }}>Copy link</Button>
              </div>
              <div className="mt-8 border border-line p-5 text-[13px]">
                <p className="font-medium mb-1">Simple analytics</p>
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                  {[["Views", "1,284"], ["Visitors", "862"], ["Top work", works[0]?.title?.slice(0, 18) || "—"]].map(([k, v]) => (
                    <div key={k} className="border border-line p-3"><p className="micro-label text-warmgray">{k}</p><p className="font-medium mt-1">{v}</p></div>))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-[13px] px-4 py-2.5 z-[60]">{toast}</div>}
    </div>
  );
}

function WorkRow({ n, title, meta, img, onUp, onDown, onDelete, editor }: { n: number; title: string; meta: string; img: string; onUp: () => void; onDown: () => void; onDelete: () => void; editor: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line bg-softwhite">
      <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={title} className="w-14 h-16 object-cover" />
        <div className="min-w-0"><p className="text-[14px] font-medium truncate">{String(n).padStart(2, "0")} · {title}</p><p className="text-[12px] text-warmgray truncate">{meta}</p></div>
        <div className="flex items-center gap-1 text-[13px] pr-1">
          <button onClick={onUp} aria-label="Move up" className="border border-line w-8 h-8 hover:border-ink">↑</button>
          <button onClick={onDown} aria-label="Move down" className="border border-line w-8 h-8 hover:border-ink">↓</button>
          <button onClick={() => setOpen(o => !o)} className="border border-line px-3 h-8 hover:border-ink">{open ? "Close" : "Edit"}</button>
          <button onClick={onDelete} aria-label="Delete" className="text-warmgray hover:text-ink px-2">✕</button>
        </div>
      </div>
      {open && <div className="border-t hairline p-4">{editor}</div>}
    </div>
  );
}

function WorkEditor({ username, id }: { username: string; id: string }) {
  const { getArtist, updateArtwork } = useStore();
  const w = getArtist(username)?.artworks.find(x => x.id === id);
  if (!w) return null;
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title"><Input value={w.title} onChange={e => updateArtwork(username, id, { title: e.target.value, slug: slugify(e.target.value) })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year"><Input value={w.year} onChange={e => updateArtwork(username, id, { year: e.target.value })} /></Field>
          <Field label="Price"><Input value={w.price ?? ""} onChange={e => updateArtwork(username, id, { price: e.target.value })} placeholder="$1,200" /></Field>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Medium"><Input value={w.medium} onChange={e => updateArtwork(username, id, { medium: e.target.value })} /></Field>
        <Field label="Dimensions"><Input value={w.dimensions} onChange={e => updateArtwork(username, id, { dimensions: e.target.value })} /></Field>
      </div>
      <Field label="Description"><Textarea value={w.description ?? ""} onChange={e => updateArtwork(username, id, { description: e.target.value })} /></Field>
      <Field label="Image URL (or keep upload)"><Input value={w.images[0]} onChange={e => updateArtwork(username, id, { images: [e.target.value] })} /></Field>
    </div>
  );
}

function NoteAdder({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (!v.trim()) return; onAdd(v.trim()); setV(""); }}>
      <Input value={v} onChange={e => setV(e.target.value)} placeholder="“I kept painting over the blue…”" />
      <button className="bg-ink text-paper px-4 text-[13px] shrink-0">Pin</button>
    </form>
  );
}
