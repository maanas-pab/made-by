"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Artist, DEMO_ARTISTS, Artwork, Exhibition, Series, FieldNote, StudioItem } from "./data";
import { cloudEnabled, loadRemoteById, saveRemoteById, cloudRequestLink, cloudFinalizeLink, cloudSignOut, cloudSessionUser } from "./cloud";

interface User { email: string; username: string; }

interface Store {
  user: User | null;
  artists: Artist[];
  myUsername: string | null;
  /** true when Supabase keys exist → magic-link accounts. false → local demo. */
  isCloud: boolean;
  /** Local demo sign-in (no email sent). Only used when cloud is off. */
  signInDemo: (email: string, username?: string) => void;
  /** Sends the magic link. Resolves null on success, error message on failure. */
  requestLink: (email: string) => Promise<string | null>;
  /** Picks up a clicked magic link (or resumed session). True when signed in. */
  refreshCloudSession: () => Promise<boolean>;
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

interface Envelope { v: 1; updatedAt: string; artists: Artist[]; }

function readEnvelope(): Envelope | null {
  try {
    const raw = localStorage.getItem(LS_ARTISTS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { v: 1, updatedAt: "", artists: parsed };
    if (parsed && Array.isArray(parsed.artists)) return { v: 1, updatedAt: parsed.updatedAt || "", artists: parsed.artists };
  } catch {}
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[]>(DEMO_ARTISTS);
  const [savedState, setSavedState] = useState("Saved");
  const [loaded, setLoaded] = useState(false);
  const [cloudUid, setCloudUid] = useState<string | null>(null);

  // Version discipline (the whole save system rests on this):
  // - lastTsRef always describes the CURRENT artists array.
  // - commit() = a real local edit → mints a fresh timestamp.
  // - adopt() = incoming data (cloud pull, other tab) → keeps ITS timestamp.
  // - the save effect only ever persists { lastTsRef, artists } — it never
  //   mints. So a tab holding stale data can never outrank fresh data.
  const lastTsRef = useRef("");
  const latestRef = useRef({ artists, user, cloudUid });
  latestRef.current = { artists, user, cloudUid };

  const commit = (fn: (prev: Artist[]) => Artist[]) => {
    lastTsRef.current = new Date().toISOString();
    setArtists(fn);
  };

  const adopt = (next: Artist[], ts: string) => {
    lastTsRef.current = ts;
    setArtists(next);
  };

  const persistLocalUser = (u: User | null) => {
    try {
      if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
      else localStorage.removeItem(LS_USER);
    } catch {}
  };

  const displayNameFor = (email: string) =>
    email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "New Artist";

  const freshArtistFor = (uname: string, email: string): Artist => ({
    username: uname,
    name: displayNameFor(email),
    location: "Your City",
    disciplines: ["Painting"],
    bio: "Tell us who you are — one quiet paragraph is enough.",
    statement: "What do you make, and why?",
    email, instagram: "@you",
    theme: { layout: "editorial", palette: "paper", typeface: "cormorant", spacing: "balanced", bg: "#F5F2EC", fg: "#1C1C1A" },
    isPro: false, published: false,
    artworks: [], exhibitions: [], series: [], notes: [], studio: [],
  });

  const ensureArtist = (uname: string, email: string) =>
    commit(prev => (prev.find(a => a.username === uname) ? prev : [...prev, freshArtistFor(uname, email)]));

  useEffect(() => {
    (async () => {
      const env = readEnvelope();
      let nextArtists = env && env.artists.length ? env.artists : DEMO_ARTISTS;
      let nextTs = env?.updatedAt || "";
      let nextUser: User | null = null;
      try {
        const u = localStorage.getItem(LS_USER);
        if (u) nextUser = JSON.parse(u);
      } catch {}
      if (cloudEnabled()) {
        try {
          const su = await cloudSessionUser();
          if (su) {
            setCloudUid(su.id);
            const remote = await loadRemoteById(su.id);
            const remoteTs = remote?.updatedAt || "";
            if (remote && remote.artists.length && remoteTs !== "" && remoteTs >= nextTs) {
              // Cloud is genuinely newer → adopt it (timestamp travels along).
              nextArtists = remote.artists;
              nextTs = remoteTs;
              nextUser = { email: remote.email, username: remote.username };
              persistLocalUser(nextUser);
            } else {
              if (su.email) nextUser = { email: su.email, username: nextUser?.username ?? su.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "") };
              // Local is newer (or cloud empty): push it up so other devices catch up.
              if (nextUser) saveRemoteById(su.id, nextUser.email, nextUser.username, nextArtists).catch(() => {});
            }
          }
        } catch {}
      }
      lastTsRef.current = nextTs;
      setArtists(nextArtists);
      setUser(nextUser);
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // Persist WITHOUT minting: the stamp belongs to the data, set by
    // commit()/adopt(). Rewriting the same stamp is harmless.
    try {
      localStorage.setItem(LS_ARTISTS, JSON.stringify({ v: 1, updatedAt: lastTsRef.current, artists }));
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch {}
    setSavedState("Saving…");
    const t = setTimeout(async () => {
      if (user && cloudUid && cloudEnabled()) {
        try {
          const ok = await saveRemoteById(cloudUid, user.email, user.username, artists);
          setSavedState(ok ? "Saved to cloud" : "Saved · this device");
          return;
        } catch {}
      }
      setSavedState(user && cloudEnabled() && !cloudUid ? "Sign in to save online" : "Saved · this device");
    }, 500);
    return () => clearTimeout(t);
  }, [artists, user, cloudUid, loaded]);

  // Other tabs on this browser edit → follow along live, but only forward
  // (incoming timestamp must beat ours).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_ARTISTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const arts = Array.isArray(parsed) ? parsed : parsed.artists;
          const ts = Array.isArray(parsed) ? "" : (parsed.updatedAt || "");
          if (Array.isArray(arts) && arts.length && ts >= lastTsRef.current) adopt(arts, ts);
        } catch {}
      }
      if (e.key === LS_USER) {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Leaving / closing mid-save: flush the latest state to the cloud now
  // instead of letting the debounce die with the tab.
  useEffect(() => {
    const flush = () => {
      const s = latestRef.current;
      if (!s.user || !s.cloudUid || !cloudEnabled()) return;
      saveRemoteById(s.cloudUid, s.user.email, s.user.username, s.artists).catch(() => {});
    };
    const onVis = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const api: Store = useMemo(() => ({
    user, artists,
    myUsername: user?.username ?? null,
    savedState,
    isCloud: cloudEnabled(),
    signInDemo: (email, username) => {
      const uname = (username || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "");
      const u = { email, username: uname };
      setUser(u);
      persistLocalUser(u);
      ensureArtist(uname, email);
    },
    requestLink: async (email) => cloudRequestLink(email),
    refreshCloudSession: async () => {
      try {
        const su = await cloudFinalizeLink();
        if (!su) return false;
        setCloudUid(su.id);
        const remote = await loadRemoteById(su.id).catch(() => null);
        if (remote && remote.artists.length) {
          adopt(remote.artists, remote.updatedAt || "");
          const u = { email: remote.email, username: remote.username };
          setUser(u);
          persistLocalUser(u);
        } else if (su.email) {
          // First arrival (new account, or email just confirmed): adopt this device's page.
          const uname = su.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "");
          const u = { email: su.email, username: uname };
          setUser(u);
          persistLocalUser(u);
          ensureArtist(uname, u.email);
        }
        return true;
      } catch {
        return false;
      }
    },
    signOut: () => { cloudSignOut().catch(() => {}); setCloudUid(null); setUser(null); persistLocalUser(null); },
    getArtist: (username) => artists.find(a => a.username.toLowerCase() === username.toLowerCase()),
    updateArtist: (username, patch) => commit(prev => prev.map(a => a.username === username ? { ...a, ...patch } : a)),
    addArtwork: (username, a) => commit(prev => prev.map(p => {
      if (p.username !== username) return p;
      const id = `w${Date.now()}`;
      const order = p.artworks.length;
      const taken = new Set(p.artworks.map(w => w.slug));
      let slug = a.slug || `work-${order + 1}`;
      if (taken.has(slug)) slug = `${slug}-${Date.now().toString(36)}`;
      const art: Artwork = {
        id, slug, title: a.title || "Untitled", year: a.year || "2026",
        medium: a.medium || "Oil on canvas", dimensions: a.dimensions || "",
        description: a.description || "", price: a.price || "", showPrice: a.showPrice ?? true,
        available: a.available ?? false, showInquire: a.showInquire ?? true,
        images: a.images?.length ? a.images : ["/art/starry-night.jpg"],
        order,
      };
      return { ...p, artworks: [...p.artworks, art] };
    })),
    updateArtwork: (username, id, patch) => commit(prev => prev.map(p => p.username === username ? { ...p, artworks: p.artworks.map(w => w.id === id ? { ...w, ...patch } : w) } : p)),
    deleteArtwork: (username, id) => commit(prev => prev.map(p => p.username === username ? { ...p, artworks: p.artworks.filter(w => w.id !== id) } : p)),
    moveArtwork: (username, id, dir) => commit(prev => prev.map(p => {
      if (p.username !== username) return p;
      const arr = [...p.artworks].sort((x, y) => x.order - y.order);
      const i = arr.findIndex(w => w.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, artworks: arr.map((w, k) => ({ ...w, order: k })) };
    })),
    addExhibition: (username, e) => commit(prev => prev.map(p => {
      if (p.username !== username) return p;
      const ex: Exhibition = {
        id: `e${Date.now()}`, slug: e.slug || "new-exhibition", title: e.title || "Untitled Exhibition",
        year: e.year || "2026", type: e.type || "Solo Exhibition", venue: e.venue || "Venue", city: e.city || "City",
        description: e.description || "",
      };
      return { ...p, exhibitions: [ex, ...p.exhibitions] };
    })),
    deleteExhibition: (username, id) => commit(prev => prev.map(p => p.username === username ? { ...p, exhibitions: p.exhibitions.filter(e => e.id !== id) } : p)),
    addSeries: (username, s) => commit(prev => prev.map(p => {
      if (p.username !== username) return p;
      const se: Series = { id: `s${Date.now()}`, slug: s.slug || "new-series", title: s.title || "New Series", dateRange: s.dateRange || "2026", description: s.description || "", cover: s.cover || (p.artworks[0]?.images[0] || "") };
      return { ...p, series: [...p.series, se] };
    })),
    addNote: (username, n) => commit(prev => prev.map(p => {
      if (p.username !== username) return p;
      const note: FieldNote = { id: `n${Date.now()}`, index: String(p.notes.length + 1).padStart(2, "0"), text: n.text || "", date: n.date || "Now" };
      return { ...p, notes: [...p.notes, note] };
    })),
    deleteNote: (username, id) => commit(prev => prev.map(p => p.username === username ? { ...p, notes: p.notes.filter(n => n.id !== id) } : p)),
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
