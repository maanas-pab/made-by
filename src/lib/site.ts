/* Single source of truth for the public site identity.
   Change the domain once here (or via NEXT_PUBLIC_SITE_DOMAIN) and every
   link, QR code, sitemap entry and email follows. */

export const SITE = {
  name: "made by",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "madeby.vercel.app",
  email: "hello@madeby.vercel.app",
  get baseUrl() {
    return `https://${SITE.domain}`;
  },
};

export const artistPath = (username: string) => `${SITE.domain}/${username}`;
export const artistUrl = (username: string) => `${SITE.baseUrl}/${username}`;
