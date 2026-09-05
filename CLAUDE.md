# Grupchat-Landing

Next.js 15 (App Router, React 19, Tailwind v4) fullstack web app for GrupChat. **Not Nuxt.**

## Read first
`docs/kb/INDEX.md` — the knowledgebase. Open only the documents whose `read_when` matches your task.
Product journeys: `docs/MVP_USER_JOURNEYS.md`.

## Operating notes
- A dev server is usually running on :3000. **Never run `next build` while it runs** (shared `.next`). Verify against the dev server instead. Kill servers by port (`lsof -ti :PORT | xargs kill`), never `pkill -f`.
- Landing page (`app/page.js`) is frozen; the only permitted change is redirect targets.
- Design tokens/rules for new UI: `docs/kb/30-decisions.md` D-008. Reference implementations: `components/auth/AuthShell.js`, `components/app/AppShell.js`.
- Backend for payments is `../gc-payments` on :4000 (`NEXT_PUBLIC_API_URL`).
- After any change that alters a fact recorded in the KB, follow `docs/kb/CONVENTIONS.md` §Update protocol.
