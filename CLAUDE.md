# Grupchat-Landing

Next.js 15 (App Router, React 19, Tailwind v4) fullstack web app for GrupChat. **Not Nuxt.**

## Read first
`docs/kb/INDEX.md` — the knowledgebase. Open only the documents whose `read_when` matches your task.
Product journeys: `docs/MVP_USER_JOURNEYS.md`.

## Operating notes
- A dev server is usually running on :3000. **Never run `next build` while it runs** (shared `.next`). Verify against the dev server instead. Kill servers by port (`lsof -ti :PORT | xargs kill`), never `pkill -f`.
- Landing page: the hero is `components/landing/Hero.js` (D-031; the old freeze is lifted). Re-shoot `public/preview.png` after any hero change — the recipe is in D-033.
- Design tokens/rules for new UI: `docs/kb/30-decisions.md` D-008. Reference implementations: `components/auth/AuthShell.js`, `components/app/AppShell.js`.
- Page metadata: `lib/seo.js` (D-038). A new route needs a `layout.js` beside it or it inherits the root tags. Copy rule: say the job, never the terms — no rates, no counts, no platform lists.
- Two component sets, different jobs (D-032): `components/ui/Bits.js` is structure (Tag, Avatar, Skeleton…), `components/bits/` is motion (SplitText, CountUp, SpotlightCard…). Both honour reduced motion.
- Backend for payments is `../gc-payments` on :4000 (`NEXT_PUBLIC_API_URL`).
- After any change that alters a fact recorded in the KB, follow `docs/kb/CONVENTIONS.md` §Update protocol.
