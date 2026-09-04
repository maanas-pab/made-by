# made by — Your work deserves a place of its own

Quiet, editorial, timeless artist pages. Next.js 14 + TypeScript + Tailwind.
Free forever — no tiers, no gates.

## Run

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build && npm start
```

## Routes

- `/` — landing (Maya Chen feature, artist examples, philosophy, pricing teaser)
- `/explore` — catalogue-style discovery with discipline filter
- `/pricing`, `/about`
- `/create` — 6-step onboarding (name → practice → place → work → look → ready)
- `/signin` — demo auth (localStorage-backed)
- `/dashboard` — tiny dashboard: portfolio / available / exhibitions / series+notes+studio / look / card+QR, publish toggle, Pro upsell
- `/:username` — artist page (`?section=available|exhibitions|contact`, `?view=exhibition`)
- `/:username/work/:slug` — artwork object page with inquire `mailto:`
- `/:username/series/:slug` — series catalogue
- `/:username/card` — digital business card + QR (printable)

Demo artists: `/mayachen` (editorial), `/sofiaalvarez` (archive), `/eliaspark` (full-bleed dark), `/noorrahman` (gallery).

## Accounts that can't be stolen (read this)

Sign-in is magic-link (Supabase Auth, no passwords). Enter your email → click
the link → you're in. The database refuses every read and write unless it comes
from the row's owner (`supabase/schema.sql` RLS) — typing someone else's email
gets you nowhere, because the link goes to THEIR inbox, not yours.

Without Supabase keys the app runs in clearly-labeled local demo mode
("demo sign-in" chip in the dashboard, warning on the sign-in page).

## Saving logins + pages (works for real people)

Local-first: everything autosaves to the browser. For cross-device saving:

1. Create a free project at supabase.com → SQL editor → run `supabase/schema.sql`
2. Supabase dashboard → Authentication → URL Configuration:
   - Site URL → `https://madebyart.vercel.app`
   - Redirect URLs → add `http://localhost:3000/**` AND `https://madebyart.vercel.app/**`
   (magic links are rejected without this — it's the step everyone misses)
3. Copy Project URL + anon key into `.env.local` (see `.env.example`)
4. Same two values → Vercel Project Settings → Environment Variables → redeploy

Email delivery works out of the box (Supabase's mailer, rate-limited — fine for
testing; add your own SMTP before real launch).

Then sign-ins pull the user's page down on any device, and every edit backs up
to Postgres (dashboard shows "Saved to cloud"). Without the keys, the app runs
in local demo mode — nothing breaks.

## Deploy (GitHub → Vercel)

```bash
git init && git add -A && git commit -m "made by"
gh repo create made-by --public --source=. --push   # or: create repo on github.com and push
```

Then vercel.com → Add New Project → import the repo → Deploy.
Add the Supabase + `NEXT_PUBLIC_SITE_DOMAIN` env vars in Vercel before sharing
the URL. Custom domain later: buy it, add in Vercel Domains, set
`NEXT_PUBLIC_SITE_DOMAIN` to it — every link/QR/sitemap follows.

## Notes

- Data persists to `localStorage` (`madeby.artists.v1`, `madeby.user.v1`) — no backend needed for demo. Swap `src/lib/store.tsx` for Supabase/Postgres + Storage + Auth + Stripe to go to production; types in `src/lib/data.ts` already match the spec entities.
- Images: public-domain Wikimedia (Botticelli, Leonardo, Van Gogh) + user uploads via FileReader data-URLs.
- Exhibition mode: `?view=exhibition` — fullscreen, ←/→ + Esc keyboard, auto-hiding metadata, respects `prefers-reduced-motion`.
- Palette: paper `#F5F2EC` / ink `#1C1C1A` / warm gray `#8A877F` / line `#D9D5CC` / soft white `#FBFAF7`. Type: Cormorant Garamond + Inter.
- Free forever: no tiers, no artwork cap, no gates — everything in the dashboard is unlocked.
