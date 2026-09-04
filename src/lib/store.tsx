"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Artist, DEMO_ARTISTS, Artwork, Exhibition, Series, FieldNote, StudioItem } from "./data";
import { cloudEnabled, loadRemote, saveRemote } from "./cloud";

interface User { email: string; username: string; }

interface Store {
  user: User | null;
  artists: Artist[];
  myUsername: string | null;
  signIn: (email: string, username?: string) => void;
  signOut: () => void;
  getArtist: (username: string) => Artist | undefined;
  updateArtist: (username: string, patch: Partial<Artist>) => void;
  addArtwork: (username: string, a: Partial<Artwork>) => void;
  updateArtwork: (username: string, id: string, patch: Partial<Artwork>) => void;
  deleteArtwork: (username: string, id: string) => void;
  moveArtwork: (username: string, id: string, dir: -1 | 1) => void;
  addExhibition: (username: string, e: Partial<Exhibition>) => void;
  deleteExhibition: (username: string, id: string) => void;
  addSeries: (username: string, s: Partial<Series>) => void;
  addNote: (username: string, n: Partial<FieldNote>) => void;
  deleteNote: (username: string, id: string) => void;
  savedState: string;
}

const Ctx = createContext<Store | null>(null);
const LS_ARTISTS = "madeby.artists.v3";
const LS_USER = "madeby.user.v1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[]>(DEMO_ARTISTS);
  const [savedState, setSavedState] = useState("Saved");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      let localArtists = DEMO_ARTISTS;
      let localUser: User | null = null;
      try {
        const a = localStorage.getItem(LS_ARTISTS);
        const u = localStorage.getItem(LS_USER);
        if (a) {
          const parsed = JSON.parse(a);
          if (Array.isArray(parsed) && parsed.length) localArtists = parsed;
        }
        if (u) localUser = JSON.parse(u);
      } catch {}
      // Cloud wins when it exists: logins + pages roam across devices.
      if (localUser && cloudEnabled()) {
        try {
          const remote = await loadRemote(localUser.email);
          if (remote && remote.artists.length) {
            localArtists = remote.artists;
            localUser = { email: remote.email, username: remote.username };
            try { localStorage.setItem(LS_USER, JSON.stringify(localUser)); } catch {}
          }
        } catch {}
      }
      setArtists(localArtists);
      setUser(localUser);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_ARTISTS, JSON.stringify(artists));
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch {}
    setSavedState("Saving…");
    const t = setTimeout(async () => {
      if (user && cloudEnabled()) {
        try {
          const ok = await saveRemote(user.email, user.username, artists);
          setSavedState(ok ? "Saved to cloud" : "Saved · this device");
          return;
        } catch {}
      }
      setSavedState("Saved · this device");
    }, 900);
    return () => clearTimeout(t);
  }, [artists, user, loaded]);

  const api: Store = useMemo(() => ({
    user, artists,
    myUsername: user?.username ?? null,
    savedState,
    signIn: (email, username) => {
      const uname = (username || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "");
      const u = { email, username: uname };
      setUser(u);
      localStorage.setItem(LS_USER, JSON.stringify(u));
      // If this login already lives in the cloud, pull it down (new device).
      // Otherwise back up this fresh state immediately.
      if (cloudEnabled()) {
        loadRemote(email).then(remote => {
          if (remote && remote.artists.length) {
            setArtists(remote.artists);
            const ru = { email: remote.email, username: remote.username };
            setUser(ru);
            try { localStorage.setItem(LS_USER, JSON.stringify(ru)); } catch {}
          } else {
            setArtists(current => {
              saveRemote(email, uname, current).catch(() => {});
              return current;
            });
          }
        }).catch(() => {});
      }
      setArtists(prev => {
        if (prev.find(a => a.username === uname)) return prev;
        const fresh: Artist = {
          username: uname,
          name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "New Artist",
          location: "Your City",
          disciplines: ["Painting"],
          bio: "Tell us who you are — one quiet paragraph is enough.",
          statement: "What do you make, and why?",
          email, instagram: "@you",
          theme: { layout: "editorial", palette: "paper", typeface: "cormorant", spacing: "balanced", bg: "#F5F2EC", fg: "#1C1C1A" },
          isPro: false, published: false,
          artworks: [], exhibitions: [], series: [], notes: [], studio: [],
        };
        return [...prev, fresh];
      });
    },
    signOut: () => { setUser(null); localStorage.removeItem(LS_USER); },
    getArtist: (username) => artists.find(a => a.username.toLowerCase() === username.toLowerCase()),
    updateArtist: (username, patch) => setArtists(prev => prev.map(a => a.username === username ? { ...a, ...patch } : a)),
    addArtwork: (username, a) => setArtists(prev => prev.map(p => {
      if (p.username !== username) return p;
      const id = `w${Date.now()}`;
      const order = p.artworks.length;
      const art: Artwork = {
        id, slug: a.slug || `work-${order + 1}`, title: a.title || "Untitled", year: a.year || "2026",
        medium: a.medium || "Oil on canvas", dimensions: a.dimensions || "",
        description: a.description || "", price: a.price || "", showPrice: a.showPrice ?? true,
        available: a.available ?? false, showInquire: a.showInquire ?? true,
        images: a.images?.length ? a.images : ["/art/starry-night.jpg"],
        order,
      };
      return { ...p, artworks: [...p.artworks, art] };
    })),
    updateArtwork: (username, id, patch) => setArtists(prev => prev.map(p => p.username === username ? { ...p, artworks: p.artworks.map(w => w.id === id ? { ...w, ...patch } : w) } : p)),
    deleteArtwork: (username, id) => setArtists(prev => prev.map(p => p.username === username ? { ...p, artworks: p.artworks.filter(w => w.id !== id) } : p)),
    moveArtwork: (username, id, dir) => setArtists(prev => prev.map(p => {
      if (p.username !== username) return p;
      const arr = [...p.artworks].sort((x, y) => x.order - y.order);
      const i = arr.findIndex(w => w.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, artworks: arr.map((w, k) => ({ ...w, order: k })) };
    })),
    addExhibition: (username, e) => setArtists(prev => prev.map(p => {
      if (p.username !== username) return p;
      const ex: Exhibition = {
        id: `e${Date.now()}`, slug: e.slug || "new-exhibition", title: e.title || "Untitled Exhibition",
        year: e.year || "2026", type: e.type || "Solo Exhibition", venue: e.venue || "Venue", city: e.city || "City",
        description: e.description || "",
      };
      return { ...p, exhibitions: [ex, ...p.exhibitions] };
    })),
    deleteExhibition: (username, id) => setArtists(prev => prev.map(p => p.username === username ? { ...p, exhibitions: p.exhibitions.filter(e => e.id !== id) } : p)),
    addSeries: (username, s) => setArtists(prev => prev.map(p => {
      if (p.username !== username) return p;
      const se: Series = { id: `s${Date.now()}`, slug: s.slug || "new-series", title: s.title || "New Series", dateRange: s.dateRange || "2026", description: s.description || "", cover: s.cover || (p.artworks[0]?.images[0] || "") };
      return { ...p, series: [...p.series, se] };
    })),
    addNote: (username, n) => setArtists(prev => prev.map(p => {
      if (p.username !== username) return p;
      const note: FieldNote = { id: `n${Date.now()}`, index: String(p.notes.length + 1).padStart(2, "0"), text: n.text || "", date: n.date || "Now" };
      return { ...p, notes: [...p.notes, note] };
    })),
    deleteNote: (username, id) => setArtists(prev => prev.map(p => p.username === username ? { ...p, notes: p.notes.filter(n => n.id !== id) } : p)),
  }), [user, artists, savedState]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("store missing");
  return v;
}

export function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}
