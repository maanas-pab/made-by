"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Artist, DEMO_ARTISTS, Artwork, Exhibition, Series, FieldNote, StudioItem } from "./data";
import { cloudEnabled, loadRemoteById, saveRemoteById, cloudSignIn, cloudSignUp, cloudSignOut, cloudSessionUser } from "./cloud";

interface User { email: string; username: string; }

interface Store {
  user: User | null;
  artists: Artist[];
  myUsername: string | null;
  /** true when Supabase keys exist → real password accounts. false → local demo. */
  isCloud: boolean;
  /** Local demo sign-in (no password). Only used when cloud is off. */
  signInDemo: (email: string, username?: string) => void;
  /** Real sign-in. Resolves null on success, error message on failure. */
  signInCloud: (email: string, password: string) => Promise<string | null>;
  signUpCloud: (email: string, password: string, username?: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
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
  const [cloudUid, setCloudUid] = useState<string | null>(null);

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
    setArtists(prev => (prev.find(a => a.username === uname) ? prev : [...prev, freshArtistFor(uname, email)]));

  useEffect(() => {
    (async () => {
      let nextArtists = DEMO_ARTISTS;
      let nextUser: User | null = null;
      try {
        const a = localStorage.getItem(LS_ARTISTS);
        const u = localStorage.getItem(LS_USER);
        if (a) {
          const parsed = JSON.parse(a);
          if (Array.isArray(parsed) && parsed.length) nextArtists = parsed;
        }
        if (u) nextUser = JSON.parse(u);
      } catch {}
      if (cloudEnabled()) {
        // Resume a real session if one exists; its cloud page wins.
        try {
          const su = await cloudSessionUser();
          if (su) {
            setCloudUid(su.id);
            const remote = await loadRemoteById(su.id);
            if (remote && remote.artists.length) {
              nextArtists = remote.artists;
              nextUser = { email: remote.email, username: remote.username };
              persistLocalUser(nextUser);
            } else if (su.email) {
              nextUser = { email: su.email, username: nextUser?.username ?? su.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "") };
            }
          }
        } catch {}
      }
      setArtists(nextArtists);
      setUser(nextUser);
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
      if (user && cloudUid && cloudEnabled()) {
        try {
          const ok = await saveRemoteById(cloudUid, user.email, user.username, artists);
          setSavedState(ok ? "Saved to cloud" : "Saved · this device");
          return;
        } catch {}
      }
      setSavedState(user && cloudEnabled() && !cloudUid ? "Sign in to save online" : "Saved · this device");
    }, 900);
    return () => clearTimeout(t);
  }, [artists, user, cloudUid, loaded]);

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
    signInCloud: async (email, password) => {
      const { user: su, error } = await cloudSignIn(email, password);
      if (error || !su) return error || "Sign in failed.";
      setCloudUid(su.id);
      const remote = await loadRemoteById(su.id).catch(() => null);
      if (remote && remote.artists.length) {
        setArtists(remote.artists);
        const u = { email: remote.email, username: remote.username };
        setUser(u);
        persistLocalUser(u);
      } else {
        // First sign-in (e.g. after email confirmation): adopt this device's page.
        const uname = (remote?.username || su.email!.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "");
        const u = { email: (su.email || email).toLowerCase(), username: uname };
        setUser(u);
        persistLocalUser(u);
        ensureArtist(uname, u.email);
      }
      return null;
    },
    signUpCloud: async (email, password, username) => {
      const uname = (username || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "");
      const { user: su, hasSession, needsConfirmation, error } = await cloudSignUp(email, password);
      if (error || !su) return { error: error || "Sign up failed.", needsConfirmation: false };
      const u = { email: email.toLowerCase(), username: uname };
      setUser(u);
      persistLocalUser(u);
      ensureArtist(uname, u.email);
      if (hasSession) setCloudUid(su.id);
      return { error: null, needsConfirmation };
    },
    signOut: () => { cloudSignOut().catch(() => {}); setCloudUid(null); setUser(null); persistLocalUser(null); },
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
