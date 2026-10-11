# Grupchat-Landing

Next.js 15 (App Router, React 19, Tailwind v4) fullstack web app for GrupChat. **Not Nuxt.**

## Read first
`docs/kb/INDEX.md` — the knowledgebase. Open only the documents whose `read_when` matches your task.
Product journeys: `docs/MVP_USER_JOURNEYS.md`.

## Operating notes
- A dev server is usually running on :3000. **Never run `next build` while it runs** (shared `.next`). Verify against the dev server instead. Kill servers by port (`lsof -ti :PORT | xargs kill`), never `pkill -f`.
- Landing page: the hero is `components/landing/Hero.js` (D-031; the old freeze is lifted). Re-shoot `public/preview.png` after any hero change — the recipe is in D-033.
- Design tokens/rules for new UI: KB 25 §Scheme (tokens like `bg-action-tint`, springs in `lib/motion.js`, the kit). Older screens follow D-008; reference implementations: `components/auth/AuthShell.js`, `components/app/AppShell.js`.
- Page metadata: `lib/seo.js` (D-038). A new route needs a `layout.js` beside it or it inherits the root tags. Copy rule: say the job, never the terms — no rates, no counts, no platform lists.
- Three component sets, different jobs (D-032, D-045): `components/ui/Bits.js` is structure for screens built before the scheme (Tag, Avatar, Skeleton…), `components/bits/` is motion (SplitText, CountUp, SpotlightCard…), and `components/kit/` is the "Plans to memories" scheme for new surfaces (KB 25 §Scheme; `/scheme` shows it live). All honour reduced motion.
- Backend for payments is `../gc-payments` on :4000 (`NEXT_PUBLIC_API_URL`).
- After any change that alters a fact recorded in the KB, follow `docs/kb/CONVENTIONS.md` §Update protocol.
