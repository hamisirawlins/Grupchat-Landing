---
title: Decision log
status: active
updated: 2026-10-16
read_when: you want to know why something is the way it is, or you are about to make a choice that others will need to understand later
---

# Decision log

Append-only. Newest at the bottom. To reverse a decision, add a new entry that names the one it supersedes.
Format: `D-nnn · date · title` → **Decision** · **Why** · **Consequences**.

---

### D-001 · 2026-09-05 · Firestore is the sole database
**Decision.** Firestore (one Firebase project, shared by both repos) is the system of record. Supabase/Postgres is removed.
**Why.** V2 already writes everything to Firestore; V1's Supabase path is unused by the current frontend; two databases means two truths.
**Consequences.** P5 deletes V1 + Supabase. Joins are denormalised (counters, membership docs). Security moves to rules (D-004).

### D-002 · 2026-09-05 · Write ownership: web app owns inventory, backend owns money
**Decision.** Clients write plans/members/invites/catalogue/users; only gc-payments writes `transactions`, `plans.currentBalance`, `planMembers.paymentStatus/amountPaid`, `status: locked`.
**Why.** Money mutations must be idempotent, signed, and auditable; provider callbacks can only land on a server. Everything else is CRUD that a rules-guarded client does more simply.
**Consequences.** 20 §Ownership is the contract; 21 enforces the client half; backend half is by review.

### D-003 · 2026-09-05 · `plans.currentBalance` is the field name
**Decision.** Keep `currentBalance` (what the code writes). `MVP_USER_JOURNEYS.md`'s `currentAmount` is a doc error.
**Why.** Renaming a live, incremented field for a doc is risk without benefit.
**Consequences.** Update the journeys appendix (P4.3).

### D-004 · 2026-09-05 · Client-direct Firestore replaces REST for inventory
**Decision.** Frontend reads/writes inventory with the Firestore SDK behind `NEXT_PUBLIC_DATA_SOURCE`, collection by collection.
**Why.** Removes a hop and a whole class of endpoints; gives realtime for free; the backend shrinks to what only a server can do.
**Consequences.** Rules become the authorisation layer — P1 precedes any client write. Composite indexes must ship with each query.

### D-005 · 2026-09-05 · `onSnapshot` replaces socket.io
**Decision.** Realtime via Firestore listeners on `transactions/{id}` and `plans/{id}`. socket.io removed from both repos.
**Why.** The backend already writes terminal status to Firestore; a second realtime channel is redundant and unauthenticated.
**Consequences.** P2.8 client, P4.5 backend, P5.3 removal.

### D-006 · 2026-09-05 · KB lives in `Grupchat-Landing/docs/kb`, indexed by `INDEX.md`
**Decision.** One versioned KB in the product repo; `gc-payments/CLAUDE.md` points at it. One topic per file, ≤250 lines, frontmatter with `read_when`, append-only decisions.
**Why.** Optimises for repeated partial reading as it grows; avoids the 15 overlapping summary docs that preceded it (90).
**Consequences.** CONVENTIONS.md governs edits. Legacy docs are mapped, not deleted, in 90.

### D-007 · 2026-09-05 · Post-login routes: `/home`, `/plans`, `/plans/new`, `/discover`
**Decision.** New route names for the rebuilt UX; `/dashboard*` 307s to `/home` (`next.config.mjs`).
**Why.** Clean slate; REST-ish nouns; old bookmarks don't 404.
**Consequences.** Journeys doc's "Homepage" = `/home`.

### D-008 · 2026-09-05 · Design language for the rebuilt app
**Decision.** White ground, Figtree, `purple-600` (the landing's "Open Web App" colour) for primary actions, `border-2 border-purple-600` outline for alternatives, `rounded-xl`, ease `[0.32,0.72,0,1]`, 16px inputs, ≥44pt touch targets, reduced-motion respected. Landing page itself is unchanged.
**Why.** Requested Apple-like minimalism tied to an existing brand colour; 16px avoids iOS focus-zoom; purple-600 on white is 5.38:1 (AA) both ways.
**Consequences.** `components/auth/AuthShell.js` and `components/app/AppShell.js` are the reference implementations. Supersedes the earlier gold (`#b5975a`) exploration.

### D-009 · 2026-09-05 · Sign-up consent is clickwrap, not a checkbox
**Decision.** "By creating an account, you agree to…" under the button; the required checkbox was removed.
**Why.** Matches the requested Apple-style form; industry norm.
**Consequences.** Flagged to product; revert is a five-line change in `app/sign-up/page.js` if explicit opt-in is required.

### D-010 · 2026-09-05 · `membersCount` may be incremented by the client (for now)
**Decision.** Accept-invite batch increments `plans.membersCount` from the client.
**Why.** A Cloud Function would be cleaner but adds a runtime; drift is cosmetic.
**Consequences.** Rules allow `membersCount` in the owner/member update whitelist **only** via `increment(1)` semantics — enforce with `request.resource.data.membersCount == resource.data.membersCount + 1`. Optional nightly recount job (24).

### D-011 · 2026-09-05 · Deterministic `planMembers` id `${planId}_${uid}`
**Decision.** New member docs use a composite id; rules use `exists()` on it for membership.
**Why.** Rules cannot run queries; `exists()` on a known path is the only cheap membership check. Also gives uniqueness for free.
**Consequences.** Backend `_getExistingMember` should read by id, falling back to the query for legacy docs; a one-off migration renames existing docs (P3 prerequisite).

### D-012 · 2026-09-05 · **Open:** invite-by-code lookup for signed-out visitors
**Options.** (a) keep `GET /v2/invitations/code/:code` on the backend; (b) Cloud Function; (c) make `invitations` readable by code via a separate public `inviteLinks/{code}` doc with minimal fields.
**Leaning.** (c) — no server runtime, tiny public surface. Decide before P3.2.

### D-013 · 2026-09-05 · Defer the Firestore-direct migration to the last step before test release
**Decision.** Build the product UX now against the existing REST API (`lib/api.js` → gc-payments V2). Execute P0.2–P5 only after the UX is tested and release-ready. P0.1 (credential rotation) is independent and may run any time.
**Why.** This build is an experiment in AI-driven delivery flow; the UX is the subject and the data layer is a confound. `lib/api.js` isolates the switch so it can be done once, late, with the UI stable.
**Consequences.** Realtime uses short polling of REST endpoints until P2.8. `23` stays `draft`. Checklist phase I holds the migration items. Anything in 20/21 remains the target contract.

### D-014 · 2026-09-05 · Signed-out invite preview via a public projection (resolves D-012 as option c)
**Decision.** A minimal, id-free projection of an invitation (`inviteService.publicProjection`) is served today by public REST `GET /v2/invites/:code/preview`, and in the migration phase by `inviteLinks/{code}` with `allow read: if true`.
**Why.** Party invitations need no login to read; nothing sensitive is in the projection; no Cloud Function runtime required.
**Consequences.** `/invite/[code]` page (checklist G1). Every preview audited. `/join/:code` redirects.

### D-015 · 2026-09-05 · Audit trail is append-only, backend-written, admin-readable
**Decision.** `auditEvents` written only via Admin SDK; clients may emit a whitelisted `ui.*` set through the backend; admins read via `/v2/audit/events` and `/admin/audit`.
**Why.** Traceability for support and for reviewing the automation experiment, without letting clients forge history. PII (phones) excluded by sanitizer.
**Consequences.** Every write handler gains a one-line `auditService.log` in its success path (checklist H4). In-memory filtering over the latest 500 until indexes land (phase I).

### D-016 · 2026-09-06 · Curated plans pool with custom amounts
**Decision.** `createPlan` keeps `poolMode` for premium plans (default `pool`); `contribute*` no longer require `planType == free`. Group total = listed price × people chosen at start; owner can adjust.
**Why.** Curated plans are admin-generated inventory; the journeys doc requires custom contributions for them too. Before this, `poolMode` was silently nulled and every contribution to a curated plan failed with "Plan does not have pooling enabled".
**Consequences.** `platformFeeRate ?? 0.01` (was `||`): premium plans' explicit `0` fee now stays `0` instead of becoming 1%. Legacy curated plans (no `poolMode`) still pay the listed price via `join-premium`.

### D-017 · 2026-09-06 · Payment rails follow plan type
**Decision.** Self-managed plans take **M-Pesa** contributions only; curated plans take **Paystack (card)** only. Enforced in the pay sheet (rail chosen from `planType`, no toggle) and server-side in `contribute` / `contributePaystack`.
**Why.** Matches `MVP_USER_JOURNEYS.md` §Payment Integration Boundaries; one rail per journey keeps copy, reconciliation and support simple.
**Consequences.** `joinPremiumMpesa` stays in the backend but is unreachable from the UI. Relaxing a rail is a one-line change in each place.

### D-018 · 2026-09-06 · Unused query paths are removed, not indexed
**Decision.** Three backend queries needing composite indexes the project lacks — insights "recent active users" (`planMembers planId in · lastActiveAt`), notifications `unreadOnly`, catalogue `city` filter — were deleted rather than indexed. `firestore.indexes.json` equals the live project (20).
**Why.** No shipped screen calls them; an index for dead code is maintenance without benefit; git history keeps the code.
**Consequences.** `npm run indexes:probe` is the gate: a new screen that needs an index adds it to `wanted` in `index-sync.js` and deploys via CLI (the service account cannot create indexes — 403).

### D-019 · 2026-09-06 · No hard deletes anywhere; soft delete with audit
**Decision.** Nothing in the system deletes a document, an array item, or a stored file. Deleting means `deletedAt`, `deletedBy`, optional `deleteReason` on the doc (array items: `removedAt`, `removedBy`); readers filter them out; every soft delete emits an audit event (`milestone.deleted`, `image.deleted`, `resource.removed`; catalogue uses `status: inactive`; invitations `status: revoked`; community already used `deletedAt`). Helper: `gc-payments/services/softDelete.js`. Guard: `npm run check:no-hard-delete` (greps the live backend for `.delete()`, `batch.delete`, `arrayRemove`, storage deletes).
**Why.** Auditability and reversibility beat storage savings at this scale; disputes about money and membership need history. One convention (`deletedAt`) keeps reads cheap: in-memory filtering, no index churn.
**Consequences.** Storage bytes for "deleted" images are kept (cost is negligible now; a retention job can archive later). Reads must use `omitDeleted` / `activeItems`. Rules (21) keep `allow delete: if false` on every collection. V1's five hard deletes go with the V1 code in P5. Admin "show deleted" views are a later addition — data is already there.

### D-020 · 2026-09-06 · A dead session resets to sign-in with clean state, never an error string
**Decision.** `lib/api.js` no longer throws "User not authenticated". When there is no user after `auth.authStateReady()`, when a token refresh fails with an `auth/*` error, or when the backend answers **401**, `resetSession(reason)` runs: Firebase `signOut`, `sessionStorage.clear()`, then a hard `location.replace("/sign-in?reason=…&redirect=<where you were>")`. Callers receive a `SessionError` (`code: auth/session-ended`) so nothing else runs. Sign-in shows a one-line notice from `reason` and returns the user via `redirect` after auth. `AppShell`'s gate also carries `redirect`.
**Why.** An error toast about authentication is a dead end; the only correct next step is signing in again, and a hard navigation is the cheapest way to guarantee no stale in-memory state.
**Consequences.** Idempotent under concurrent requests (single in-flight reset); no-op on auth pages (no loops) and on the server. `localStorage` (only `gc.debug`) is kept. Pages already gate requests on `user`, and `authStateReady()` guards the first-load race.

### D-021 · 2026-09-06 · One settlement path; reconciliation replaces in-process timers
**Decision.** `settlementService.js` is the sole writer of transaction outcomes and plan balances. Callbacks, the 5-minute reconciliation job and the verify endpoint all call it. Pending transactions are re-checked against the provider after 15 min and failed after 48 h without confirmation. The in-process `setTimeout` that used to fail STK pushes is deleted.
**Why.** Three code paths booking money three ways is how double-increments and stuck transactions happen; a restart must not lose a payment's fate.
**Consequences.** `settleSuccess` re-reads inside the transaction and no-ops unless still `pending` — replays are safe. The job queries `status == pending` only and filters age in memory (no new index, D-018). Daraja needs `STK_QUERY_URL` or derives it from `STK_PUSH_URL`.

### D-022 · 2026-09-06 · V2 STK callbacks go to the V2 route; V1 callback routes bridge and always acknowledge
**Decision.** V2 STK pushes set `CallBackURL` to `mpesaService.stkCallbackUrlV2()` (`STK_CALLBACK_URL`, else `/v2/mpesa/stk-callback` on `DEPOSIT_CALLBACK_URL`'s origin). `/core/deposit_callback` (V1) first checks Firestore for the `CheckoutRequestID` and, if found, delegates to the V2 handler. `/core/paybill-*` (C2B) persist the raw payload to `mpesa_logs` and always return 200.
**Why.** Incident 2026-09-05 22:39Z: a V2 contribution's STK result was delivered to the V1 URL (still in `DEPOSIT_CALLBACK_URL`), whose Supabase lookup failed → 500 ×3; the transaction sat pending until the reconciliation job settled it 18 min later. Safaricom retries non-200 acknowledgements, and C2B confirmations for V2 payments never match a V1 pool.
**Consequences.** No env change needed in production. Reconciliation now runs every 2 min for transactions ≥3 min old. Re-registering the Safaricom callback URLs to `/v2/...` is still worthwhile (removes the bridge hop) — see 40.

### D-023 · 2026-09-06 · Clients await settlement; no timers
**Decision.** No `setInterval`/polling on the client for payment state. The pay sheet, the Plan-details pending watcher and the post-redirect check all `await premiumAPI.verifyTransaction(id, { wait: 25 })`, which the server holds on a Firestore listener until the transaction leaves `pending` (then asks the provider once). Loops are bounded by attempts, not clocks.
**Why.** Timers guess; an awaited listener knows. It is also the REST-era shape of D-005's `onSnapshot`, so phase I swaps the transport without touching the UI.
**Consequences.** `waitForTerminal` in `settlementService.js`; `?wait` capped at 25s per request to stay under proxy limits. Reconciliation's cadence stays timer-based — that is server infrastructure, not UX.

### D-024 · 2026-09-06 · Plan checklists live on `milestones` with a scope
**Decision.** The journeys doc's "checkpoints" are the existing `milestones` collection, extended with `scope: "group" | "everyone"` and, for `everyone`, a `completions: { [uid]: Timestamp }` map. A group item is one shared tick; an everyone item is ticked per member and is `completed` once every active member has. Available on coordinate-only and pooled plans alike; coordinate-only plans use checklist progress as their hero ring.
**Why.** Coordinate-only plans had no purpose beyond membership; a checklist is the smallest thing that makes them worth opening. Reusing `milestones` keeps one collection, its indexes, soft delete and audit.
**Consequences.** `POST /v2/plans/:id/milestones { title, scope, dueDate?, description? }`; `PUT …/:milestoneId { completed }` toggles the caller's own tick for `everyone` items and the shared state for `group` items. `plans.progress` keeps counting `completed` items.

### D-025 · 2026-09-06 · An independent, append-only ledger of money movements
**Decision.** `ledgerEntries` is a journal written only by the backend: settlement entries are staged inside the same Firestore transaction that books `plans.currentBalance`; payout debits are posted at initiation (when the balance moves). Entry ids are deterministic (`<txId>:<n>`) so re-posting is a no-op. Accounts: `plan:<id>`, `platform:fees`. `verifyPlan` compares the ledger's balance with `plans.currentBalance` and reports drift; `npm run ledger:backfill` posts entries for transactions settled before the ledger existed (`source: backfill`, running balances rebuilt in time order).
**Why.** `transactions` records provider intent and outcome; it is not a statement of account. Support, disputes and the automation review need a journal that cannot disagree with the balance and that survives provider quirks (e.g. a missing receipt).
**Consequences.** Admin `/admin/ledger` with cursor pagination and per-plan verify; members can read their plan's journal (`GET /v2/ledger/plans/:id`). Never edited or deleted; corrections are `adjustment` entries (future, audited). Indexes: single-field `at`; filters in memory over ≤500 (D-018) until phase I.

### D-026 · 2026-09-06 · Withdrawals hold the pool until M-Pesa confirms; 2% fee; member or custom recipient
**Decision.** A payout request puts the gross amount on `plans.heldBalance` (available = `currentBalance − heldBalance`, re-checked inside the transaction) and sends `gross − 2%` by B2C to a plan member (number from profile or their last M-Pesa contribution) or a custom name + number. Only the B2C **result** debits the pool and posts the ledger (payout debit + fee credit). **Nothing releases a hold automatically**: a failed, timed-out or rejected transfer is parked for review (`needsReview`, hold kept, no journal entry), and an admin either **refunds the full amount to the pool** (`outcome: failed`) so the owner can withdraw again, or marks it sent with the receipt. The hold is internal — users are never shown "on hold"; funds awaiting confirmation are simply not offered for withdrawal.
**Why.** Debiting on initiation double-counts a failed transfer and needs a reversal nobody wrote. A hold is honest: the money is neither available nor gone until Daraja says so.
**Consequences.** `/v2/mpesa/b2c-result`, `/v2/mpesa/b2c-timeout`; the V1 `withdrawal_callback`/`queue_timeout` routes bridge on `OriginatorConversationID = WITHDRAW_<txId>`. Plan details has an owner-only Withdraw sheet that awaits confirmation (D-023) and reports a parked transfer as "we couldn't complete it — the amount will be restored so you can try again". Admin screen: `/admin/payouts`.

### D-027 · 2026-09-10 · Email MVP: verification gates withdrawals; five transactional emails
**Decision.** Sender `GrupChat <hello@mailing.grupchat.net>` via Resend (verified subdomain `mailing.grupchat.net`; reply-to `info@grupchat.net`). The email-verification link is generated server-side and sent through the same pipeline, with Firebase's own mailer as fallback. Email verification is sent at sign-up and gates **withdrawals only** — contributions never wait on it. Transactional set: invitation (known invitee), payment receipt (payer + owner), withdrawal confirmation (owner), payout-needs-review alert (admins). One shared minimal layout; every send is idempotent per event and audited; failures never block a settlement.
**Why.** MVP: only the emails that carry money or access. Gating contributions would cost payments to protect the payer from nothing; gating withdrawals protects the pool.
**Consequences.** Until the domain verifies, sends fail and are audited as `email.failed` (Resend's sandbox sender delivers only to the account owner). No marketing, digests or welcome mail.

### D-028 · 2026-09-12 · Admin approval comes before the transfer; every provider callback is kept
**Decision.** A withdrawal request stops at `approvalState: "pending"`. The gross is held exactly as in D-026, but **nothing reaches Daraja until an admin approves it** on `/admin/payouts`: approval flips the state inside a Firestore transaction and only then calls B2C, and a decline (reason required) releases the whole hold and emails the owner. The post-send exception path is unchanged — a transfer M-Pesa never confirms is still parked and resolved by `…/resolve`. Separately, every inbound provider callback, and every outbound B2C request with the provider's synchronous answer, is written verbatim to `providerCallbacks` and readable by admins under each payout.
**Why.** Money left on the owner's say-so alone. Approval is where a human catches a wrong number or an amount that doesn't belong, and it is what makes a version-one deploy safe while the provider side is still being set up. Reviewing a payout means reading what Daraja actually said; a status field is not enough.
**Consequences.** The Withdraw sheet no longer waits for a transfer — it confirms the request and says the amount is set aside. `/admin/payouts` becomes three queues (approval · needs review · with M-Pesa) with the provider log under each one. Reconciliation skips awaiting-approval payouts and ages the rest from `sentToProviderAt`. `providerCallbacks` holds recipient phone numbers, so it is admin-only and never client-readable. A request left unapproved holds the owner's funds indefinitely — nothing ages it out yet. `npm run check:payout-flow` exercises request → decline → approve → result against a mock Daraja on a throwaway plan; `EMAIL_DISABLED=1` keeps such runs from alerting real admins.

### D-029 · 2026-09-13 · Paying in is free; the platform's only cut is the 2% on withdrawals
**Decision.** Contributions carry no platform fee. `contribute` and `contributePaystack` store `platformFee: 0`, so a plan is credited the full amount paid in, and `plans.platformFeeRate` is no longer read (new plans store `0`). The 2% withdrawal fee (D-026) is unchanged and remains the only charge.
**Why.** A 1% deposit fee was both invisible and lumpy: `Math.round` meant contributions under 50 paid nothing and a 50 shilling deposit paid one, so the pool credited 49 with nothing in the UI to explain it. Charging on the way out is legible, charged once per amount, and does not tax the behaviour we want.
**Consequences.** Plan totals now equal the sum of what members paid in. The pay sheet says contributing is free and names the 2% withdrawal fee. Transactions settled before this date keep the fee they were charged — their ledger entries stand, so a plan's balance can sit below the sum of its contributions by the fees already taken (one shilling on plan `Az0i0jkz…`). `platformFeeRate` stays on the document as a hook for a future per-plan rate; anything that reads it again must not resurrect a deposit fee by accident.

### D-030 · 2026-09-13 · Approving a payout takes two deliberate steps and must name the amount
**Decision.** `POST /v2/payouts/:txId/approve` requires `{ amount }` equal to the payout's `netAmount`; without it, or with the wrong figure, it returns 400 and nothing is sent. The console asks twice: the first tap opens a confirmation naming the amount and the recipient, and the confirm button sits where Decline was, so a repeat tap in the same spot cancels instead of sending.
**Why.** The first live test of D-028 ended with money gone and the admin sure they had not approved it. The audit showed the gate working exactly as designed, which is the problem: one tap stood between an admin and an irreversible M-Pesa transfer, so an approval could happen without the person feeling they had approved anything.
**Consequences.** The transaction and the audit record `confirmedAmount`, so what an admin agreed to send sits beside what was sent. Any client that approves must state the amount, so a replayed or misdirected call cannot move money. `check:payout-flow` asserts that a bare approval and a wrong-amount approval both send nothing.

### D-031 · 2026-09-24 · The landing hero is rebuilt on the app's design language, and the freeze is lifted
**Decision.** `app/page.js`'s hero is replaced by `components/landing/Hero.js`: an asymmetric
two-column layout, an oversized headline whose accent is **`purple-600`**, a blueprint dot field,
and an illustrative plan card (`components/landing/PlanCardMock.js`) standing in for a product
screenshot. The "landing page is frozen" rule in `CLAUDE.md` is removed — the owner asked for the
change directly on 2026-09-24.
**Why.** The landing was still on the gold `#b5975a` that D-008 superseded, so the marketing page
and the product did not look related. The 2026 pattern for this kind of page is to answer "what is
this" with the thing itself rather than another sentence, which is what the plan card does.
**Consequences.** `components/RotatingText.js` is no longer used by the landing (it and its gold
pill remain in the tree for other callers). The hero states three product facts and no traction
numbers: "free to contribute" and "2% only on withdrawal" are D-029, the rails are D-026. Any
future claim added here needs a decision behind it in the same way. The stats section's floating
discs were blurred and dropped to 16% opacity so they read as wash rather than as artefacts.

### D-032 · 2026-09-24 · React Bits micro-interactions live in `components/bits/`, separate from `components/ui/Bits.js`
**Decision.** A new `components/bits/` directory holds nine micro-interaction components in the
[React Bits](https://reactbits.dev) idiom — `SplitText`, `CountUp`, `ShinyText`, `SpotlightCard`,
`ClickSpark`, `Magnet`, `AnimatedContent`, `DotGrid`, `Marquee` — written against this project's
`framer-motion` and `lib/motion.js` rather than copied. `components/ui/Bits.js` is unchanged and
keeps its own meaning: house primitives (Tag, Avatar, ProgressBar, Stepper, EmptyState, Skeleton,
StickyAction, TextLink).
**Why.** Two things were about to be called "Bits". The split is by job: `ui/Bits.js` is structure,
`bits/` is motion. React Bits is copy-in rather than a package, so these are ours to maintain.
**Consequences.** Every component honours `prefers-reduced-motion` — a reveal becomes a fade, a
counter lands on its value, the dot field holds still and the spark does not fire. Applied so far:
the hero, the pooled-balance figure on `app/plans/[planId]/page.js` (`CountUp`), and the
`app/discover` cards (`SpotlightCard`). They decorate and never carry meaning: every number is
legible before its animation finishes and nothing is hidden behind a hover.

### D-033 · 2026-09-24 · SEO: one metadata source, JSON-LD in the body, and the OG image is a real screengrab
**Decision.** `app/layout.js` carries a title template, canonical, robots (with `max-image-preview:
large`), keywords, `en_KE` locale and a `viewport` export. A JSON-LD `@graph` (Organization,
WebSite, SoftwareApplication) is rendered **in the body**, not in a hand-written `<head>`. New
`app/sitemap.js` and `app/robots.js` list only pages a signed-out visitor can open. `public/preview.png`
is regenerated as a 1200×630 screengrab of the live hero.
**Why.** A hand-written `<head>` in the App Router fights the `metadata` export and raised a dev-overlay
issue; Next's own docs put JSON-LD in the body. The previous `preview.png` was 2868×1538 while the
tags declared 1200×630, so every share card was being resampled from a file that did not match its
own metadata.
**Consequences.** Re-shoot `preview.png` whenever the hero changes: viewport 1280×900, clip
`{x:0, y:78, w:1280, h:672}` at DPR 2, scale to 1200×630 with lanczos. That offset clears the nav
pill above and the next section's floating discs below; check both edges after any layout change. Signed-in routes (`/home`,
`/plans`, `/notifications`, `/admin`, `/manage-data`, …) are disallowed in `robots.txt`.

### D-034 · 2026-09-24 · Every absolute URL names `www`, because the apex redirects
**Decision.** `SITE` in `app/layout.js`, `app/robots.js` and `app/sitemap.js` is
`https://www.grupchat.net`, not the apex.
**Why.** `https://grupchat.net/*` answers 307 to `https://www.grupchat.net/*`. With the apex in
`metadataBase`, `og:image` resolved to a redirecting URL — and several link-preview scrapers do not
follow redirects when fetching an image, so the card renders with no picture. `canonical` and
`og:url` pointing at a URL that immediately redirects also splits the signal for no gain.
**Consequences.** Anything that emits an absolute URL uses `SITE`. If the apex is ever made the
canonical host, this is the one constant to change.

### D-035 · 2026-09-24 · The hero states the benefit, not the pricing
**Decision.** The hero subline is "Less apps, notifications and follow ups to make those group
plans reality!". The fact row keeps only **Free · to contribute**; the 2% withdrawal fee and the
"M-Pesa and card" rails were removed from it. The floating discs in the "A rich history of"
section are restored to their original weight — the blur and 16% opacity from D-031 are reverted.
**Why.** Owner's direction, 2026-09-24. The hero's job is the reason to care; a fee schedule and a
list of rails are answers to questions a visitor has not asked yet.
**Consequences.** The pay sheet and the plan detail screen remain the places the 2% is stated, per
D-029. The plan card's footnote was reworded on the same day to "Pooling is free, withdrawal
charges apply" — the hero now names no rate at all, so the landing cannot go stale if D-029's 2%
ever changes.

### D-036 · 2026-09-24 · The share-card description is one line, and the eyebrow reads "Plans to memories"
**Decision.** `DESCRIPTION` in `app/layout.js` is "Plan, manage, track and pool for group plans and
ideas with ease." — one sentence, carried by `description`, `og:description` and `twitter:description`.
The hero eyebrow reads **Plans to memories** in place of "Live on Android and web".
**Why.** Owner's direction, 2026-09-24: the previous description recited the product and the fee
schedule, which is more than a link preview will show and more than a reader will finish. The
eyebrow was a platform note where a promise belongs.
**Consequences.** The description is the one string three tags read; change it in one place. Since
it no longer names the rails or the platforms, anything that needs to say "Android and web" says it
in the page body, not in the metadata.

### D-037 · 2026-09-24 · The landing page renders its own copy; no early return for auth
**Decision.** `app/page.js` no longer returns a spinner while `authLoading` is true. The marketing
page always renders; the existing effect still sends a signed-in visitor to `/home` once auth
resolves.
**Why.** The early return meant the server-rendered HTML *was* the spinner — 52 characters of
visible text. Crawlers that do not execute JS, and anything reading the raw document, saw no
headline, no copy and no calls to action. After the change the same request returns 2,458
characters including the whole hero.
**Consequences.** A signed-in visitor may see the landing for the moment before the redirect
fires, instead of a loader. That is the trade: a flash for them, a page for everyone else. Any
future "gate the page on auth" idea must not reintroduce an early return above the content.

### D-038 · 2026-09-24 · Page metadata comes from `lib/seo.js`, and the copy names no figures
**Decision.** `lib/seo.js` exports `pageMeta({ title, description, path, noIndex, image })` and
`privateMeta(title)`. Every route gets its own metadata through a `layout.js` beside it — client
components cannot export `metadata`, so the layout is the seam. Public routes are indexed; every
signed-in surface (`/home`, `/plans`, `/notifications`, `/admin`, `/manage-data`, `/delete-account`,
`/verify-email`, `/reset-password`, `/forgot-password`) is `noindex, nofollow`.
**Why.** Before this, **no route had its own metadata** — all 27 pages inherited the landing's title
and description, so every result and every share card said the same thing.
**Consequences.** House rule, written at the top of `lib/seo.js`: **say the job, never the terms.**
No rates, no counts, no platform lists. "Pooling is free, withdrawal charges apply" survives a
change to the fee; "2% on withdrawal" does not. A description naming a number is one somebody has
to remember to come back and fix. A new route without a `layout.js` silently inherits the root
metadata — adding one is part of adding a page.

### D-039 · 2026-09-24 · An invite previews richly and is never indexed
**Decision.** `app/invite/[code]/layout.js` reads the public projection
(`GET /v2/invites/:code/preview`, D-014) in `generateMetadata` and titles the card "Join {plan}".
Both the resolved and the fallback path set `noIndex`, and `robots.txt` disallows `/invite/`.
**Why.** An invite link is pasted into a group chat, so its preview is the first thing most people
ever see of GrupChat — it was showing the generic landing card. But an invite code sitting in a
search index is a code that has leaked, so the page must preview well and index never.
**Consequences.** The fetch carries a 2.5s timeout, a 300s revalidate and a try/catch; a slow or
dead backend falls back to wording true of every invite rather than failing the card. The host's
name and the member count are deliberately left out — the count changes and the card gets cached
by whatever scraped it.

### D-040 · 2026-09-24 · Network baseline, measured — and what actually costs the time
**Measured from Nairobi against `api.grupchat.net`, 2026-09-24:**

| | |
|---|---|
| TCP connect | ~70 ms |
| TLS | ~150 ms |
| **TTFB, trivial `/` route** | **~650–780 ms** |
| CORS preflight (`OPTIONS /v2/plans`) | **858 ms**, and no `Access-Control-Max-Age` was returned |
| `Content-Encoding` on JSON | **absent** |
| Railway edge | `x-railway-edge: jnb1` (Johannesburg) |

**The finding that matters.** Connect is 70 ms but TTFB is ~650 ms on a route that only
serialises four fields. TLS terminates at Railway's Johannesburg edge; the container answering
is not near it. Roughly 500–600 ms per request is geography, and **no change in this repo or in
`gc-payments` touches it** — moving the Railway service to a region near `jnb1` would.

**Fixed today (D-041).** Preflight caching and compression. Everything else in the review —
a client cache over `useAsync`, the `/home` N+1 in `lib/data/home.js:34` (up to 12 requests to
draw one dashboard), the plan-detail waterfall at `app/plans/[planId]/page.js:64–77`, and the
per-request Firebase token await — is listed and not yet done.

### D-041 · 2026-09-24 · Preflight cached, responses compressed, four dead dependencies dropped
**Decision.** `gc-payments/index.js` sets `maxAge: 7200` on `cors()` and adds `compression()`
above the routes. `Grupchat-Landing` drops `mapbox-gl`, `chart.js`, `react-chartjs-2` and
`socket.io-client`.
**Why.** Every authenticated call was paying for a preflight the browser cached for ~5 s.
Responses were uncompressed: a 400-row plan list measures 52,590 B raw against 2,318 B gzipped,
96% smaller. The four packages had **zero references anywhere in source** — the charts in
`components/home/Charts.js` are hand-rolled with framer-motion — so they never reached the
client bundle but were installed on every build.
**Consequences.** No response body or status code changes. `maxAge: 7200` is Chrome's ceiling;
Firefox clamps its own 24 h. If a chart library is ever wanted, add it back deliberately rather
than assuming it is still there.

### D-042 · 2026-10-11 · The privacy policy covers the AI, and describes providers by kind
**Decision.** `app/privacy-policy/page.js` gains an AI Features section (what the AI sees, who
processes it, what is kept, safety, labels and choices) and two new sections, International
Transfers and Children (accounts are 18 and over). Information We Collect adds device and
security signals and approximate location; Sharing adds experience providers on Discover; Your
Rights adds human review and objection. Service providers are described by kind (hosting and
storage, analytics, payments, fraud prevention, email, AI), never by name. AI request records
are kept 12 months, or deleted with the account. "Goals and challenges" become plans.
**Why.** The AI planner sends plan details to an AI provider, and the January policy said nothing
about AI. It also never mentioned the device risk score that loads on every page, or data
processed outside Kenya. Names would publish the stack, and the AI layer is built to swap
providers by configuration.
**Consequences.** Swapping a provider for another of the same kind changes the private list kept
for anyone who asks, not the policy; a new kind of provider, or a new use of members' data,
needs a policy update. An AI provider serves members only if its terms bar training on their
data and limit how long it keeps it. Export and account deletion must cover AI drafts and recap
cards when the AI ships.

### D-043 · 2026-10-11 · Experience providers apply once, are checked per market, and publish directly
**Decision.** Businesses that run experiences get an account-level application
(`providers/{uid}`, one business per account) judged against **their market's checklist**,
kept as versioned documents (`providerMarkets/{code}` live and draft,
`providerChecklistVersions/{code}-v{n}` frozen). An admin decides each check (pass, needs fix,
fail); approval needs every required check to pass and creates the provider's Paystack
subaccount. Approved providers publish listings (`experiences`) without a second review;
admins can pause any listing. Countries we haven't opened collect applications as `waiting`.
The bank account number lives apart in `providerSecrets/{uid}`; documents are private files
behind ten-minute signed links. Shapes and states: 29.
**Why.** What a provider must prove differs by country and changes as we learn, so the
checklist is data an admin edits with an advisor, not code. Versioning keeps a decision
explainable against the list it was made under. Reviewing every listing would make the admin
queue the bottleneck; the business is what we vouch for, and pausing covers the exceptions.
**Consequences.** Opening a country is an admin task (40 §Open a provider market), not a
deploy. Kenya's first checklist ships as a draft until an advisor has read it. A new version
can ask for approved providers to be re-checked without taking them offline. Provider terms
(`/providers/terms`) are a draft for the owner to approve before launch.

### D-044 · 2026-10-11 · Tickets split to the provider at checkout; GrupChat keeps its charges and pays the fee
**Decision.** Groups buy tickets for provider listings from Discover. Each checkout is one
order for one session (1–10 places, one code) and a `ticket-sale` transaction. Paystack splits
the payment at source: the provider's subaccount gets the price less **provider charges**
(`PROVIDER_CHARGES_RATE`, 10% by default, passed as `transaction_charge`), and GrupChat bears
Paystack's fee out of those charges (`bearer: "account"`). Places are held for an hour while
the buyer is on Paystack's page; a payment confirmed after that is flagged for a person, never
booked silently. Providers check guests in from `/provider/bookings`; the ticket's QR opens it
with the code filled in. Shapes and flow: 29; money: 22.
**Why.** A split at source means GrupChat never holds ticket money, so there is no payout queue
to run for providers and nothing to reconcile by hand when they ask where their money is.
Bearing the fee keeps the provider's number simple: the price less one line. A hold stops two
groups paying for the last places; an hour covers a slow card or a bank redirect. A QR that
opens a page needs no scanner in the app.
**Consequences.** Ticket sales depend on the provider's subaccount; a listing whose provider
has none shows "Tickets open soon". Refunds happen in Paystack by hand until a flow is agreed,
and the owner is confirming the split's set-up with Paystack's account manager before the
first live sale. Copy says "provider charges", never the rate, on public pages.

### D-045 · 2026-10-11 · The "Plans to memories" scheme ships as tokens, springs and a kit
**Decision.** The design canvas's scheme becomes Tailwind tokens in `app/globals.css`
(`@theme`: action, memory, ink, sheet, status tints, dark surfaces, radii, `ease-gc`), the
films' four springs in `lib/motion.js` (`SPRING.soft`, `ui`, `heavy`, `playful`), and a third
component set, `components/kit/`, for the surfaces built on it. `/scheme` shows every piece
live and is kept out of indexes.
**Why.** The provider portal, the provider application and the admin console are the first
screens drawn in the scheme; tokens let them say `bg-action-tint` instead of repeating hex
values, and one set of springs makes the app and the motion graphics move alike. A separate
kit keeps the screens built under D-008 untouched until each is restyled on purpose.
**Consequences.** Three component sets now (D-032 named two): `components/ui` serves screens
built before the scheme, `components/bits` is motion, `components/kit` is the scheme. A
restyle of an older screen moves it onto the kit rather than editing `components/ui`. Gold is
never text on white. A dark theme can reuse the `-dark` tokens without new names.

### D-046 · 2026-10-11 · Kenya asks for business registration and the payout account; the terms carry the rest
**Decision.** Kenya's first published checklist asks for two things: the **business
registration** certificate and a **payout account** in the business's name, plus acceptance of
the provider terms (the checklist's one `terms` check). The other checks in the seed (owner's
ID, KRA PIN, activity licence, liability insurance, water safety, food handling) stay in
`KENYA_CHECKS` as a menu to add back from `/admin/checklists`, but are removed from the draft
before publishing. In their place the provider terms gain **Responsibility**: the provider runs
the experience; safety, licences and insurance are theirs (we recommend liability insurance);
incidents are reported within 24 hours; the provider indemnifies GrupChat except where GrupChat
caused the loss; GrupChat's liability to a provider is capped at the provider charges kept in
the previous 12 months. The Terms of Service gain §6 Experiences and Tickets for guests (the
agreement is with the provider, the provider's cancellation policy applies, GrupChat checks
registration and payout only, and is not responsible for what a provider does except where the
law says otherwise), and §8 lists providers' acts among what GrupChat is not liable for.
Listings say **Registered business** instead of "Checked by GrupChat". Confirmed by the owner.
**Why.** The owner wants providers live quickly; most documents on the long list are things a
reviewer can't verify well from a scan anyway. What we do check (who gets paid, and that the
business exists) is what protects the money; the terms put responsibility for the experience
where the control is. The badge must not claim more than we check.
**Consequences.** Review is two documents and a name match. A guest's protection for the
experience itself rests on the provider's terms and the law, not on our checks, and copy says
so. Adding a check back is a new checklist version, optionally re-checking approved providers.
The liability wording should be read by the advisor; the cap and indemnity are the clauses most
likely to need local tailoring (consumer protection limits what can be excluded for guests).

### D-047 · 2026-10-12 · Search: words on the first paint, a public experiences hub, and a blog AI drafts and people approve
**Decision.** Public pages paint their text on the first frame: entrances are CSS (`.gc-rise`,
`.gc-word` in `app/globals.css`) or transform-only, never an opacity that waits for JavaScript,
and decorative loops run as CSS (`.gc-drift`). `/experiences` is a server-rendered hub of live
listings, and each `/experiences/[id]` is fetched on the server (`lib/publicApi.js`) so its words,
photos and TouristTrip/Breadcrumb JSON-LD are in the first HTML. `/discover` (signed in) is
noindex. The sitemap lists only pages a stranger can use, with real change dates, plus live
listings and published articles. The home title leads with what GrupChat does. The blog lives
at `/blog`: Markdown in `content/blog/`, four pillars (tech and AI and people; planning
together; money together; experiences in Kenya), RSS, BlogPosting JSON-LD, and
`/blog/how-we-write`. AI may draft; an article is published only with `approvedBy` and
`approvedAt`, enforced by the build; drafts show on preview deployments only. Covers are real
photos from Pexels, served from Pexels' CDN at the size each screen needs (`coverSrc`/`coverSrcSet`
in `lib/blog.js`) and credited under the image; the build refuses a web cover that isn't Pexels or
lacks its credit.
**Why.** Lighthouse (phone) measured the largest content at 6.9–7.2 s on every public page, 93% of
it render delay from text faded in by JavaScript; twelve looping JS animations kept the home
page's main thread busy. Outside the brand name GrupChat had about ten indexable pages, most of
them thin, and the sitemap pointed search engines at a sign-in redirect. Google's guidance rewards
helpful content whoever drafts it, treats mass-produced AI pages as spam, and asks sites to say
who made content and how; a named approver and a public policy do both.
**Consequences.** New public pages use the CSS entrances, not `useRevealVariants`, for anything
above the fold. Articles follow content/blog/README.md; a published article without an approver
fails the build. The blog and the hub are noindex while empty. Social profile links stay hidden
until real URLs exist. Rankings are tracked in the SEO report doc and, once verified, Search Console.

### D-048 · 2026-10-15 · Quick Pool: link pools paid by M-Pesa, private first
**Decision.** A verified creator can make a Quick Pool (name, required target, duration, private
with a members limit) and share its link; anyone with the link pools by phone and amount, by STK or
paybill, with no account. Open pools are built and switched off (`QUICK_POOL_OPEN`) until a payments
lawyer answers whether holding pooled money needs a licence or a licensed partner (the draft National
Payment System Bill, 22 Sep 2026) and whether a shared open link is a public appeal (the Public
Fundraising Appeals Bill, Senate Bills No. 36 of 2024). Spec: 2a. Confirmed by the owner.
**Why.** The owner's brief of 2026-10-15. Private pools are what friends already do in a chat; open
links to strangers are where both bills bite.
**Consequences.** Quick Pools are `plans` with `planType: "quick"`, so the one settlement path, the
ledger and the admin-approved withdrawal all apply unchanged. Kenya and KES only.

### D-049 · 2026-10-15 · A member is a paying phone number; seats are held for 3 minutes
**Decision.** A member is a phone number with at least one successful payment. A new number holds a
seat for 3 minutes when it starts paying, by STK or paybill. The limit runs from the seats in use to
1,000; a full pool still takes top-ups from members; a payment that lands without a seat is booked
and flagged, never refused, and refunded at 100% if the member asks. The creator can reset the link.
The pay form answers alike for every number, so it never reveals who is in.
**Why.** Three minutes matches the M-Pesa prompt. Money that has moved cannot be refused, so the
honest answer to a late payment is to book it and make leaving free.
**Consequences.** Holds live in the pool document (`quickPool.holds`), pruned on each write, so a
seat check is one document read inside one transaction.

### D-050 · 2026-10-15 · Every pool is capped at KES 1M; past the cap is accepted and flagged
**Decision.** The cap is KES 1,000,000 for every creator. An admin may set a custom cap only for a
creator with 90 days on GrupChat, 3 completed pools and more than KES 1,000,000 pooled in total.
Money past a pool's cap is accepted; the pool is flagged and admins alerted; a withdrawal from a
flagged pool is approved only with `allowBeyondCap: true`. The target's maximum is the cap, so no
separate notice is shown.
**Why.** The owner's settlement of the caps. Refusing money after it has moved helps no one; a
person deciding the payout is where the risk is managed.
**Consequences.** `quickPool.cap` is captured at creation; eligibility is checked by the admin endpoint.

### D-051 · 2026-10-15 · Paybill confirmations keep their URLs; the handler is versioned inside them
**Decision.** The URLs registered with Safaricom do not change. Their handlers route a Quick Pool
account code to the V2 Quick Pool settlement first, send an unknown code of the same shape to an
admin queue, and run the V1 logic for everything else. No validation URL. The paybill agreement
already allows collecting for others (owner, 2026-10-15).
**Why.** The owner: "don't change the addresses currently handling callbacks, just version the
functionalities that run". The same shape as D-022 for STK.
**Consequences.** Transaction id `c2b_<TransID>`; a receipt already booked by STK is not booked again.

### D-052 · 2026-10-15 · Refunds go to the member's number at 98%, creator first, then an admin
**Decision.** A member who is signed in with the verified email on their member record can ask for
part or all of their contribution back. It is held at once, approved by the creator (or passed to
an admin after 7 days), then approved by an admin as any payout (D-028, D-030), and sent by B2C to
the member's number. The fee is the 2% owners pay (D-026); an over-limit member pays nothing. A full
refund frees the seat.
**Why.** The owner chose 98%, like owners. Refunds only to the member's own number keep pools from
becoming a way to move money between strangers.
**Consequences.** A refund is a `payout` with `quick.kind: "refund"` and `approvalState: "creator"`
until the creator passes it on.

### D-053 · 2026-10-15 · Poolers need no account; a verified email unlocks receipts and My pools
**Decision.** Pooling needs a phone and an amount; email is optional. A verified email (an account,
created by a passwordless sign-in link when needed) unlocks a receipt per payment, a summary when
the pool closes, and My pools. Usernames come only with an account, checked as typed. Creating a
Quick Pool needs a verified email; existing unverified users are sent the link when they sign in,
and only creation and withdrawals wait on it (D-027 unchanged otherwise).
**Why.** Pooling must take seconds; a name or a report is worth a sign-in, and a username without an
account could be squatted.
**Consequences.** Email link sign-in must be enabled in the Firebase console. Links are generated by
the Admin SDK and sent through Resend, like M1.

### D-054 · 2026-10-15 · Insights: numbers in code, words from the model, totals only, cached
**Decision.** Pool insights are computed in code from the pool's stats; a small model (Haiku 5.5)
writes two short lines from those totals only, after 5 contributors, cached on the pool and refreshed
at most every 6 hours or at a milestone; Swahili sign-offs are chosen by code. Spec: 2b.
**Why.** The owner asked for AI insights "without naming anyone or accessing any personally
identifiable information" and to be "extremely efficient" with the credits.
**Consequences.** A page view never calls a model. The AI layer, limits and ledger in 2b serve every
later AI job.

### D-055 · 2026-10-15 · Admin system insights, with a weekly premium-model review
**Decision.** `/admin/insights` charts the whole system's totals and shows a review written by the
premium model (Opus 5.5) from those totals: weekly, and on demand at most once a day.
**Why.** The owner asked for the admin "deeply built to collect insights across the full system",
with premium requests "well spaced".
**Consequences.** Spend is bounded by the job's daily ceiling and the once-a-day rule.

### D-056 · 2026-10-15 · The `2x` spec group continues with letters
**Decision.** With 20–29 taken, new specs are `2a`, `2b`, … They sort after `29`.
**Why.** Keeps specs together without renumbering anything.
**Consequences.** CONVENTIONS' numbering line reads "2x (then 2a, 2b…)".

### D-057 · 2026-10-16 · Quick Pool waits for its phone secret; caps and refunds that admins open
**Decision.** Quick Pool answers 503 `not-configured` until `QUICK_POOL_PHONE_SECRET` is set, and
the secret is set once, before the first pool. Custom caps live in backend-only
`quickPoolCreators/{uid}`, above KES 1,000,000 and up to KES 10,000,000. An admin may open a refund
for a member who can't ask (money over the limit from someone without an account); it starts in
the admin queue and still needs an approval that names the amount (D-030).
**Why.** Members are keyed by an HMAC of their number, so changing the secret later would split
every member in two. `users` documents are client-writable, so a cap kept there could be raised by
its owner. Money that landed with no seat must be returnable even when its payer has no account.
**Consequences.** Set the secret on Railway before the screens ship (2a §Before going live). A cap
above KES 10M is a new decision.

### D-058 · 2026-10-16 · Quick Pool ships private-only; the committed keys are deleted, not purged
**Decision.** Quick Pool goes to production with private pools only; open pools stay off until a
payments lawyer answers (D-048), which the owner is arranging. The Admin SDK keys that were ever
committed to gc-payments are deleted, and their copies stay in git history.
**Why.** The owner: "lawyer we can leave for now - focusing on closed while I reach out", and "the
old keys are deleted already". A deleted key can't be used, so purging history would only rewrite
every branch for no security gain.
**Consequences.** KB 10 P0.1 is done without the `git filter-repo` step. `QUICK_POOL_OPEN` stays unset.

### D-059 · 2026-10-16 · The store apps show "coming soon" while the mobile app is rebuilt
**Decision.** The landing page's Google Play badge opens the same "Coming soon" popup as the App
Store badge, `/rate-app` drops its store links for a "coming soon" note, and the JSON-LD
`SoftwareApplication` in `app/layout.js` lists `operatingSystem: "Web"` with no `downloadUrl`.
**Why.** Owner, 2026-10-16: the mobile app is being redone in Flutter, and the old build machine's
Play signing setup may not have survived a reset. Until the new app ships, nobody should land on
the old listing, and search should not advertise an Android download.
**Consequences.** When the Flutter app is live, restore the Play link, `operatingSystem` and
`downloadUrl` in a new decision, with one package id: the site had linked both `com.grupchat` and
`com.grupchat.app`.

### D-060 · 2026-10-16 · A plan's transaction list never carries a payer's number
**Decision.** `GET /v2/plans/:planId/transactions` returns each transaction without `mpesaPhone`,
the phone hash and email in `quick` (only `quick.kind` stays), `c2b`, and the Daraja and Paystack
references (`forMember` in `controllers/v2/planExtController.js`).
**Why.** Every member can list a plan's transactions, and a Quick Pool's creator is a member of
it, so the endpoint handed every pooler's M-Pesa number to the creator. The pool page and the
launch say "your number is never shown to the group" (2a). No screen read those fields.
**Consequences.** Admin screens keep the full record through their own routes
(`/v2/payouts/review`). `check:quickpool-flow` asserts the list is clean.

### D-061 · 2026-10-16 · The plans list carries what a row needs
**Decision.** `GET /v2/plans` items add `ownerId`, `planType`, `poolMode`, `targetAmount`,
`currentBalance`, `currency`, and `quickPool: { linkCode }` for a Quick Pool (else `null`).
**Why.** The list was a slim projection, so on the web the Mine/Joined filter, the type label, the
progress %, opening a Quick Pool from the list and Home's "Pooled" figure silently did nothing.
The Flutter app (D-062) needs the same fields.
**Consequences.** Only the link code leaves the `quickPool` map. `check:quickpool-flow` asserts the
row; the offline Firestore double gains `offset()`, which the list query uses.

### D-062 · 2026-10-16 · The mobile app is rebuilt in Flutter, Quick Pool and plans first
**Decision.** A new Flutter app replaces the current Android app. Its first release covers
sign-in, Quick Pool (create, the pool page, pay by M-Pesa, My pools) and group plans (list,
detail, create, invites, contribute, withdraw requests), on the existing `gc-payments` API. It
ships to the existing Play listing `com.grupchat`; it builds for iOS from the start but ships
there later.
**Why.** Owner, 2026-10-16: the build machine was reset and the old app's setup may not have
survived; Flutter gives one codebase for both stores.
**Consequences.** Keeping `com.grupchat` needs an upload-key reset in Play Console, which works
only if the app is enrolled in Play App Signing. Until the app ships, the site says "coming soon"
(D-059). The app's own KB and its API contract live in its repo.
