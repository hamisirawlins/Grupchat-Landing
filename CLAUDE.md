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
- Experience providers (D-043, KB 29): `/providers/*` is the public welcome, the application and its status; `/provider/*` is the approved provider's portal (`PortalShell` + `useProvider`); review and checklists live under `/admin`, which `components/providers/AdminConsole.js` wraps. Inside a portal, `PageFrame` drops the app chrome (`useInPortal`).
- Tickets (D-044, KB 29): `/experiences/[id]` is the public listing with checkout (its metadata comes from the API), `/tickets` and `/tickets/[orderId]` are the buyer's (the return from Paystack lands on `?payment=done` and verifies at once), `/provider/bookings` is check-in. `qrcode` is imported only inside `components/tickets/TicketQR.js`, dynamically; keep it out of shared bundles.
- Search (D-047): public pages paint text without JavaScript (`.gc-rise` / `.gc-word` CSS entrances, never an opacity reveal above the fold); public reads go through `lib/publicApi.js`; JSON-LD through `components/site/JsonLd.js`. The blog is Markdown in `content/blog/` (`lib/blog.js`); AI drafts, a person approves, and the build refuses a published article without `approvedBy`. Workflow: `content/blog/README.md`.
- After any change that alters a fact recorded in the KB, follow `docs/kb/CONVENTIONS.md` §Update protocol.
