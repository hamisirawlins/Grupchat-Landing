---
title: Workplan — Firestore-direct frontend, payments-only backend
status: active
updated: 2026-09-05
read_when: you are choosing or executing the next phase; for line items use 11-checklist.md
---

# Workplan

**Goal.** Ship the Apple-centric product UX first, on the existing REST backend; then, as the
**last step before test release**, move the frontend to Firestore-direct and shrink gc-payments to
payments only (D-013). This ordering is deliberate: the UX work is the experiment's subject, and
the data-layer switch is isolated behind `lib/api.js` so it can happen once, late.

**Order of phases (2026-09-05):** U (UX build-out, checklist A–H) → P0.1 (security, manual, any time)
→ P0.2–P5 (migration) → Z (release). Design rules: `25-spec-design-system.md`. Line items: `11-checklist.md`.

**Rules of the road.** Every slice is independently shippable and reversible. A slice is not
done until its "Done when" holds *and* its checklist item is ticked. Order within a phase is
the recommended order, not a hard dependency unless marked **→ requires**.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## U — Product build-out on REST *(first; checklist A–H)*
Home with real data → Your plans → Plan details (+ Go to Home) → Create plan → Discover + curated join
→ Invites incl. signed-out preview (26) → Audit + admin view (27). Every screen follows 25.
*Done when:* checklist A–H ticked; journeys acceptance criteria met on the dev server. *Rollback:* per screen.

## P0 — Security and foundations *(P0.1 any time; P0.2+ after U)*

- [ ] **P0.1 Rotate the Admin SDK credential.** The committed `gc-payments/firebase-service-account.json` is live in git history (since `c83f2fc`). Create a new key in the Firebase console, delete the old one, load the new one from `GOOGLE_APPLICATION_CREDENTIALS` or a base64 env var, add the filename to `.gitignore`, purge from history (`git filter-repo`), force-push with the team's agreement.
  *Done when:* old key returns 401; repo history has no key; `lib/firebase-config.js` reads from env. *Rollback:* n/a (security).
- [ ] **P0.2 Initialise Firestore in the web app.** `lib/firebase.js` exports `db = getFirestore(app)`. Nothing uses it yet.
  *Done when:* build passes; bundle diff reviewed. *Rollback:* revert one file.
- [ ] **P0.3 Version Firebase config in the web app.** Add `firebase.json`, `.firebaserc`, `firebase/firestore.rules`, `firebase/firestore.indexes.json`. Rules start as **deny-all** — identical to today's effective behaviour for the client, since it holds no rules.
  *Done when:* `firebase deploy --only firestore:rules,firestore:indexes --project <id>` succeeds from CI or a dev machine (see 40). *Rollback:* redeploy the previous rules file.
- [ ] **P0.4 Data-source flag.** `NEXT_PUBLIC_DATA_SOURCE=rest|firestore` read once in `lib/db/index.js`. Default `rest` until P2 completes.
  *Done when:* flag flips nothing yet; documented in 23. *Rollback:* remove.
- [ ] **P0.5 Emulator profile.** `firebase emulators:start --only firestore,auth` + `NEXT_PUBLIC_USE_EMULATOR=1` wiring in `lib/firebase.js`. Seed via `gc-payments` `npm run firebase:seed` pointed at the emulator.
  *Done when:* app signs in and reads a seeded plan against the emulator. *Rollback:* env off.

## P1 — Security rules for the V2 schema **→ requires P0.3**

- [ ] **P1.1 Write rules** per `21-spec-security-rules.md`: read paths for members/owners/invitees, client-writable fields whitelisted per collection, backend-owned fields denied to clients, `usernames` uniqueness via create-only.
- [ ] **P1.2 Rules unit tests** with `@firebase/rules-unit-testing` covering the matrix in 21 §Test matrix (member reads own plan; non-member denied; client cannot write `currentBalance`; client cannot touch `transactions`; owner can update metadata; invitee can accept own invite).
- [ ] **P1.3 Deploy rules** (still effectively read-only for clients until P2 flips).
  *Done when:* tests green; deploy succeeds; a signed-in client can read its own plan in the console emulator. *Rollback:* redeploy deny-all.

## P2 — Client reads (inventory) **→ requires P1**
Move one collection at a time behind the flag; verify parity against the REST response before flipping. Lowest blast radius first.

- [ ] **P2.1 `transactions` (read-only)** — fixes the standing "Failed to get user transactions" (there is no V2 REST endpoint for it). Query: `where userId == uid orderBy createdAt desc`. Needs index (20 §Indexes).
- [ ] **P2.2 `plans` list + detail** — `where ownerId == uid` ∪ membership join via `planMembers where userId == uid`.
- [ ] **P2.3 `planMembers`** — per plan.
- [ ] **P2.4 `planCatalogue`** — `where status == active`, optional `category`.
- [ ] **P2.5 `invitations`** — pending for me (`inviteeUserId == uid, status == pending`) and by `inviteCode`.
- [ ] **P2.6 `notifications`** — list + unread count (aggregate query or counter doc).
- [ ] **P2.7 `users` (own profile)** — replaces `usersAPI.getMe()` in `AuthContext`.
- [ ] **P2.8 Realtime** — `onSnapshot` on `transactions/{id}` during a payment and on `plans/{id}` on Plan Details. Retire `lib/websocket.js` usage on the client.
  *Done when (each):* flag on in dev shows identical data to REST; loading/empty/error states exist; index deployed. *Rollback:* flip flag.

## P3 — Client writes (inventory) **→ requires P1 tests green for the collection**

- [ ] **P3.1 Plans create/update** — owner-only; never `currentBalance`, `status: locked`, `platformFeeRate`.
- [ ] **P3.2 Invitations** — issue (owner/member), accept/decline (invitee), revoke (inviter/owner). Accept also creates the `planMembers` doc in a batch and bumps `membersCount` — **counter is client-written; see 30 D-010 for why that's accepted for now**.
- [ ] **P3.3 Resources and milestones** — arrayUnion on `plans.resources`; `milestones` CRUD.
- [ ] **P3.4 Users / usernames** — profile update; username claim as a transaction over `usernames/{username}` create-only.
- [ ] **P3.5 Catalogue admin** — gated on a custom claim `admin: true` (set by a backend admin script, see 24).
  *Done when (each):* rules test proves the negative cases; REST equivalent removed from `lib/api.js`. *Rollback:* flag to `rest` (REST endpoint still exists until P5).

## P4 — Payments contract hardening (backend) *(can run in parallel with P2–P3)*

- [x] **P4.1 Reconciliation job** *(2026-09-06)* replaces the in-memory `setTimeout` that fails pending M-Pesa transactions (lost on restart). Cron: every 5 min, `transactions where status == pending and createdAt < now-15m` → query provider status → settle or fail.
- [ ] **P4.2 Idempotency** — current webhook filters `status == pending` so a replay after success is ignored; make the increment live inside the same `runTransaction` read (it does) and add a `processedEvents/{providerRef}` guard doc for replays that race.
- [x] **P4.3 Field-name alignment** *(2026-09-06)* — code writes `currentBalance`; `MVP_USER_JOURNEYS.md` says `currentAmount`. Decision D-003: **`currentBalance` stays.** Update the journeys doc appendix.
- [x] **P4.4 Client-facing verify endpoint** *(2026-09-06)* — `GET /v2/transactions/:id/verify` for the redirect-back case where the webhook hasn't landed yet.
- [x] **P4.5 Socket emits retired** *(2026-09-06; server init removed with the dependency in P5.3)*.
  *Done when:* a killed-and-restarted server still settles a pending STK within one cron tick; replayed webhook does not double-increment. *Rollback:* feature-flag the job.

## P5 — Decommission **→ requires P2, P3, P4**

- [ ] **P5.1 Remove V1 routes** (`/v1/*`, `/core`, `/core/paystack`) and their controllers/services.
- [ ] **P5.2 Remove Supabase**: `@supabase/supabase-js`, `services/supabaseService.js`, `database/`, `SUPABASE_*`, `SKIP_SUPABASE_TEST`, the 13 importing files (24 §Delete list).
- [ ] **P5.3 Remove socket.io** from both repos.
- [ ] **P5.4 Prune `lib/api.js`** to payment initiation + uploads + admin.
- [ ] **P5.5 Delete dead code**: `gc-payments/lib/firebaseCollections.js` (imports the client SDK and a non-existent export; nothing imports it).
- [ ] **P5.6 Archive legacy docs** per 90.
  *Done when:* both repos build; `grep -r supabase` is empty; 90 lists every removed doc. *Rollback:* git revert per slice.

## P6 — *(merged into U; kept for history)* Product build-out
Follow `MVP_USER_JOURNEYS.md`. Suggested order: Home with real stats (replace `SAMPLE` in `app/home/page.js`) → Your plans → Plan Details (+ Go to Home CTA) → Create plan (self-managed, M-Pesa) → Discover + curated join (Paystack) → Invites/notifications → Settings.
Design language is fixed: white, Figtree, `purple-600` actions, outline alternatives, `[0.32,0.72,0,1]` easing, 16px inputs, 44pt targets (30 D-007–D-009).

---

## Risks the plan is shaped around
1. **Rules are the only wall.** Today authorisation lives in Express middleware; after P3 it is `firestore.rules`. Hence P1 before any client write, with tests.
2. **Counters and joins.** Firestore has no server-side joins; `membersCount` and unread counts are denormalised. Accept small drift; a backend job can recount nightly.
3. **Cost.** Client reads bill per document; paginate lists, use `limit`, prefer `onSnapshot` only where the document actually changes (payments, Plan Details).
4. **Composite indexes must be deployed before queries ship** or they fail in production. Every P2 slice names its index in 20.
