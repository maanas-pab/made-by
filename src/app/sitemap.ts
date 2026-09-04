import { DEMO_ARTISTS } from "@/lib/data";
import { SITE } from "@/lib/site";
export default function sitemap() {
  const base = SITE.baseUrl;
  const staticRoutes = ["", "/explore", "/pricing", "/about", "/create"].map(r => ({ url: `${base}${r}`, lastModified: new Date() }));
  const artists = DEMO_ARTISTS.flatMap(a => [
    { url: `${base}/${a.username}`, lastModified: new Date() },
    ...a.artworks.map(w => ({ url: `${base}/${a.username}/work/${w.slug}`, lastModified: new Date() })),
  ]);
  return [...staticRoutes, ...artists];
}
