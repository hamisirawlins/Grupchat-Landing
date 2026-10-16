---
title: Quick Pool — link pools paid by M-Pesa
status: draft
updated: 2026-10-16
read_when: you touch Quick Pool screens or endpoints, its members, paybill codes, caps or refunds
---

# Quick Pool

The owner's brief of 2026-10-15, settled in conversation the same day (D-048 to D-055).
**Proposed** until `feat/quick-pool` (gc-payments) and `feat/quick-pool-web` (this repo) merge.
Insights and the AI behind them are in 2b.

## What it is
A verified creator makes a pool in a few taps and shares a link. Anyone with the link pays by
M-Pesa with a phone number and an amount. Poolers need no account. Kenya and KES only.
Private pools ship first; open pools are built and switched off (`QUICK_POOL_OPEN=1` turns them
on) until a payments lawyer answers the holding-money and public-appeal questions (D-048).

## Journeys
**Creator** (verified email; D-053): Home → **Quick Pool** card (the M-Pesa chip) → name → target
(required, suggestion chips, maximum = the creator's cap, D-050) → duration chips (1 day, 3 days,
1 week, 2 weeks, 1 month, or a date up to 90 days ahead) → access (private, with a members limit
of 2–1,000; open shown as coming soon) → the pool page, with share (native share sheet, else
copy + toast).
**Pooler**: opens the link → the pool page (progress, charts, insights, the anonymous feed) →
**Pool**: phone, amount, email (optional) → an STK prompt, or the paybill number and their own
account number → the page settles when M-Pesa confirms. Then, optionally: claim a username or get
receipts (email link sign-in creates the account, D-053), or ask for a refund (D-052).

## Data (backend-written only)
`plans/{planId}`: `planType: "quick"`, `poolMode: "pool"`, `currency: "KES"`, `ownerId`, `name`,
`status` (`active` → `completed` at `endsAt`), `currentBalance` / `heldBalance` as for any pool
(22), and a `quickPool` map:

| Field | Meaning |
|---|---|
| `linkCode` | the live link code; `quickPoolLinks/{code}` resolves it |
| `access` | `private` \| `open` |
| `memberLimit` | private: 2–1,000; open: `null` (the 1,000 ceiling still applies) |
| `memberCount` | phone numbers with at least one successful payment and money still in |
| `holds` | `{ phoneHash: expiresAtMillis }`, pruned on every write (D-049) |
| `target`, `cap` | the target (≤ cap) and the cap captured at creation (D-050) |
| `endsAt`, `durationLabel` | when contributions close |
| `overCap`, `overCapAt` | set once collected passes `cap` |
| `stats` | `count`, `sum`, `refunded`, `byHour{0–23}`, `byDow{0–6}`, `bands{…}`, `daily{YYYY-MM-DD}` (last 60 days), `firstAt`, `lastAt` |
| `recent` | the last 20 contributions as `{ amount, at }`: the anonymous feed |
| `theme` | `{ kind, hue, seed }`, chosen by code from the name (2b) |
| `insights` | the cached AI commentary and its basis (2b) |

| Collection | Holds |
|---|---|
| `planMembers/{planId}_{ownerUid}` | the creator (role `owner`), so the pool lists under Your plans |
| `quickPoolLinks/{code}` | `{ planId, active }`. A reset deactivates the old code; nothing is deleted (D-019) |
| `quickPoolMembers/{planId}_{phoneHash}` | `phone`, `email`, `userId`, `accountCode`, `totalPaid`, `refunded`, `refundPending`, `payments`, `firstPaidAt`, `lastPaidAt`, `overLimit`, `status` (`member` \| `left`) |
| `quickPoolCodes/{accountCode}` | `{ planId, memberKey, phone }`, for paybill reconciliation |
| `quickPoolUnmatched/{id}` | paybill payments whose account number looks like a Quick Pool code but matches none |
| `rateLimits/{key}` | attempt timestamps for the pay throttle |

`phoneHash` = HMAC-SHA256 of the normalised `2547…` number with `QUICK_POOL_PHONE_SECRET`. Without
the secret, Quick Pool answers 503 `not-configured` (and `options.available` is false): set it once,
before the first pool, because changing it later splits every member in two. Custom caps live in
`quickPoolCreators/{uid}` (backend-only; `users` docs are client-writable). Phone
numbers stay on backend-only documents and transactions. They never reach the public projection,
the AI, or another pooler.

## Rules
- **Members and seats (D-049).** A member is a phone number with at least one successful payment.
  A new number holds a seat for **3 minutes** when it starts paying, by STK or paybill. Seats in
  use = `memberCount` + live holds. When a private pool is full, the link still opens, and
  existing members can top up; the pay form answers the same way for every number ("If this
  number is in the pool, check your phone"), so it never confirms who is in: a new number gets no
  prompt, its payment fails like an unanswered one, and a quick retry gets the same "prompt on its
  way" answer a member would. The page's "places left" counts members only, never live holds,
  so a hold can't reveal whether a number was already in.
- **The limit** can be set anywhere from the seats in use to 1,000. Lowering it to the seats in
  use closes the pool to new numbers at once. **Reset link** issues a new code; members are
  recognised by phone, so they keep their place.
- **Money is never refused.** A payment that lands with no seat (a late paybill payment into a
  full pool) is booked, the member is flagged `overLimit`, the creator and admins are told, and
  that member's refund is 100% (D-052).
- **Caps (D-050).** Every pool is capped at **KES 1,000,000**. An admin may set a custom cap only
  for a creator who has been on GrupChat for 90 days, completed 3 pools and pooled more than
  KES 1,000,000 in total. Money past the cap is accepted; the pool is flagged and admins are
  alerted, and a withdrawal from a flagged pool needs the admin to approve with
  `allowBeyondCap: true`.
- **Amounts**: whole shillings, KES 10–250,000 per payment.
- **Throttle**: one open prompt per number; at most 3 prompts per number per 10 minutes; at most
  20 pay attempts per IP per 10 minutes.
- **Names**: 2–60 characters; no links, phone numbers or email addresses (a pool page is
  public), and a short blocklist. The name never reaches the AI.
- **Closing**: at `endsAt` contributions stop and the pool becomes `completed`; the creator
  withdraws through the usual request (22, D-028).

## Endpoints (gc-payments)

| Method + path | Auth | Does |
|---|---|---|
| `GET /v2/quick-pools/options` | public (cap when signed in) | the creator's cap, target and duration chips, limits, `openPools`, `available` |
| `POST /v2/quick-pools` | verified creator | create: `{ name, target, duration: { days } \| { endsAt }, access, memberLimit }` |
| `GET /v2/quick-pools/mine` | signed in | pools created, and pools pooled into (by `userId`, or the verified email) |
| `GET /v2/quick-pools/link/:code` | public (owner extras when the token is the owner's) | the public projection: progress, stats, feed, insights, seats, theme |
| `PUT /v2/quick-pools/:planId` | owner | `{ memberLimit }` and/or `{ resetLink: true }` |
| `POST /v2/quick-pools/link/:code/pay` | public | `{ phone, amount, email?, method: "stk" \| "paybill" }` → `{ txId, statusKey }` or `{ paybill, account, amount }` |
| `GET /v2/quick-pools/tx/:txId?key=&wait=25` | the `statusKey` | the payment's outcome, awaited like `verify` (D-023) |
| `POST /v2/quick-pools/:planId/refunds` | signed in, verified | a member's refund request `{ amount }` |
| `POST /v2/quick-pools/:planId/refunds/:txId/approve` · `/decline` | owner | passes it to the admin queue, or releases it |
| `GET /v2/usernames/:name/available` | public | `{ available, reason }` for the as-you-type check |
| `POST /v2/auth/email-link` | public | sends a passwordless sign-in link through Resend |
| `GET /v2/admin/quick-pools/flags` | admin | over-cap pools, over-limit members, unmatched and near-miss paybill payments |
| `POST /v2/admin/quick-pools/unmatched/:id/resolve` | admin | `{ action: "assign", accountCode }` books it to that member; `{ action: "refunded", note }` records a refund made by hand |
| `POST /v2/admin/quick-pools/members/:memberKey/refund` | admin | opens a refund for a member who can't ask (no account); it starts in the admin queue |
| `GET` · `PUT /v2/admin/quick-pools/creators/:uid/cap` | admin | the eligibility check; `{ cap, note }` sets a custom cap (above KES 1M, up to KES 10M) |

## Paybill: versioned inside the registered URLs (D-051)
The URLs Safaricom calls do not change. `paybillConfirmation` and `paybillCallback` log the raw
payload as before, then ask `quickPoolService.routeC2B(payload)` first. An 8-character code from
the Quick Pool alphabet (no 0/O/1/I/L) that resolves in `quickPoolCodes` is booked as a Quick Pool
contribution; one that resolves to nothing goes to `quickPoolUnmatched`; anything else runs the
existing V1 logic unchanged. No validation URL: a mistyped code still arrives, and admins match or
refund it. Idempotency: the transaction id is `c2b_<TransID>`, and a receipt that an STK payment
already booked is not booked twice.

## Settlement
Quick Pool contributions are `transactions` of `type: "contribution"` with a `quick` map
(`memberKey`, `phoneHash`, `email`, `channel`). `settleSuccess` (22, D-021) books them like any
contribution and, inside the same Firestore transaction, upserts the member, moves the seat from
`holds` to `memberCount`, updates `stats` and `recent`, sets `overCap` and `overLimit`, and marks
the insights stale (2b). Refunds are `payout` transactions with `quick.kind: "refund"`; their
success also updates the member, and a full refund frees the seat.

## Emails (28)
Q1 receipt to the pooler, when their email belongs to a verified account · Q2 closing summary to
the creator and to verified poolers · admin alerts for over-cap pools, over-limit members and
unmatched paybill payments · refunds reuse M6 (approval) once the creator has passed them on.
Per-payment emails to the creator are not sent; the in-app notification stands.

## Screens (this repo)
`/home` (four cards, 2×2) · `/quick-pools/new` · `/q/[code]` (the pool page; noindex, like
invites, D-039) · `/quick-pools` (My pools) · `/auth/email-link` (completes the sign-in link) ·
`/admin/insights` (2b). A plan with `planType: "quick"` opens its pool page from Your plans.

## Before going live (owner)
Rotate the admin key (KB 10 P0.1) before any AI ships · set `QUICK_POOL_PHONE_SECRET` and
`ANTHROPIC_API_KEY` on Railway · enable Email link sign-in in the Firebase console · the payments
lawyer before `QUICK_POOL_OPEN=1`.
