---
title: System overview
status: active
updated: 2026-09-05
read_when: you need the shape of the whole system, who writes what, or the gap between today and the target
---

# System overview

GrupChat lets a group turn a chat-level plan into a funded, scheduled outing. Two journeys
(see `../MVP_USER_JOURNEYS.md`): **self-managed plans** pooled via M-Pesa, and **curated
provider plans** paid via Paystack. Both end at Plan Details; Home is always reachable.

## Components

| Component | Repo | Runtime | Role |
|---|---|---|---|
| Web app | `Grupchat-Landing` | Next.js 15 / React 19, Vercel | Landing, auth, product UI. **Target:** reads and writes inventory directly in Firestore. |
| Payments service | `gc-payments` (`gc-gateway`) | Express (ESM), Node, port 4000 | Initiates provider payments, receives callbacks/webhooks, settles `transactions`, updates plan balances, runs jobs. |
| Firebase | one project (both repos confirmed on the same `project_id`) | Auth, Firestore, Storage | Identity, **sole database**, media. |
| Providers | Safaricom Daraja (M-Pesa STK, B2B), Paystack | external | Money movement; call back into gc-payments. |

## Responsibility split (the one invariant)

```
            ┌────────────────────┐   direct SDK (rules-enforced)   ┌───────────────┐
  user ───▶ │  Web app (Next.js) │ ───────────────────────────────▶ │   Firestore   │
            │                    │ ◀─── onSnapshot (realtime) ───── │               │
            └───────┬────────────┘                                  └──────▲────────┘
                    │ POST initiate payment (Bearer Firebase ID token)     │ Admin SDK
                    ▼                                                      │ (backend-owned fields only)
            ┌────────────────────┐   STK push / checkout init      ┌───────┴───────┐
            │    gc-payments     │ ──────────────────────────────▶ │   Providers   │
            │                    │ ◀──── callbacks / webhooks ──── │               │
            └────────────────────┘                                  └───────────────┘
```

- **Web app owns inventory:** `plans` (metadata, resources, status transitions that aren't payment-derived), `planMembers` bootstrap and commitment, `invitations`, `milestones`/checkpoints, `planCatalogue` (admin), `users`/`usernames`, `notifications` read state, `feedback`, images metadata.
- **gc-payments owns money:** every field on `transactions`; `plans.currentBalance`; `planMembers.paymentStatus` / `amountPaid`; `plans.status: locked` via the auto-lock job; payment notifications.
- **Neither overwrites the other's fields.** Enforced by security rules (client side) and by convention + review (backend side). Detail: `20-spec-data-model.md` §Ownership.

## Current state vs target

| Concern | Today | Target |
|---|---|---|
| Frontend data access | All via REST to gc-payments (`lib/api.js`, V1 + V2). Firestore client SDK not initialised. | Firestore SDK for inventory; REST only for payment initiation. |
| Backend surface | V1 (`/v1/*`, `/core/*`, Supabase-backed) **and** V2 (`/v2/*`, Firestore) both mounted. | V2 payments + jobs only. V1 and Supabase removed. |
| Realtime | socket.io rooms `notifications-{uid}`, `tx-{txId}`; event `transaction-updated`. | Firestore `onSnapshot` on the documents themselves. socket.io retired. |
| Security rules | Draft in gc-payments for an obsolete schema; not deployed from any repo. | Rules for the V2 schema, versioned in `Grupchat-Landing/firebase/`, deployed via CLI. |
| Admin credential | `firebase-service-account.json` committed in gc-payments. | Rotated; loaded from env/secret manager; purged from history. |
| Post-login UI | Scaffold: `/home` (sample charts), `/plans`, `/plans/new`, `/discover`; redesigned auth. | Journeys from `MVP_USER_JOURNEYS.md` built on the Firestore data layer. |

## Glossary
- **Plan** — a self-managed (`planType: free`) or curated (`planType: premium`) outing. Curated plans reference a `planCatalogue` item.
- **Pool mode** — for free plans: `coordinate` (no money) · `pool` · `both`. Premium plans have `poolMode: null` and pay per member.
- **Contribution** — a `transactions` doc of `type: contribution`; nets into `plans.currentBalance` after `platformFee`.
- **Premium join** — a `transactions` doc of `type: premium-join`; on success sets the member's `paymentStatus: paid`.
- **Lock** — premium plans flip to `status: locked` at `lockDate` (auto-lock job), after which joins close.
