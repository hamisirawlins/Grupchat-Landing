---
title: Backend surface — what gc-payments keeps, deletes, and runs
status: active
updated: 2026-09-06
read_when: you are changing routes, controllers or jobs in gc-payments, or deciding whether something belongs on the backend at all
---

# Backend surface (gc-payments / `gc-gateway`)

Express 4, ESM, port **4000**, firebase-admin 13, socket.io (to be retired). Entry `index.js`.

## Keep (target surface)

| Area | Routes | Controller |
|---|---|---|
| Payment initiation | `POST /v2/plans/:planId/contribute`, `…/contribute/paystack`, `…/join-premium/paystack`, `…/join-premium/mpesa`, `…/payout` | `controllers/v2/premiumController.js` |
| Provider callbacks | `POST /v2/paystack/webhook`, `POST /v2/mpesa/stk-callback`, `POST /v2/payments/*` (review) | `premiumController`, `v2/paymentsController.js` |
| Reconciliation (P4, shipped) | `GET /v2/transactions/:id/verify`; 5-min job | `services/reconciliationService.js`, `settlementService.js` |
| Uploads | `POST /v2/uploads/image` | `routes/v2/uploads.js` |
| Admin | `npm run admin:grant -- <uid|email>` / `admin:revoke` (sets `users/{uid}.role`); `planCatalogue` writes (`POST /v2/catalogue`, `PUT /v2/catalogue/:id` incl. `status`) driven by `/admin/catalogue`; `GET /v2/audit/events` | `scripts/admin-grant.js`, `controllers/v2/auditController.js` |
| Public | `GET /v2/invites/:code/preview` — signed-out invite projection (26) | `controllers/v2/invitesPublicController.js` |
| Health | `GET /` | `index.js` |

## Deletes
All `DELETE` routes are soft (D-019): milestones and images set `deletedAt`; resources are marked `removedAt` in place; invitations `status: revoked`. `getPlan` strips removed resources; list endpoints filter `deletedAt`. Guard: `npm run check:no-hard-delete`.

## Jobs
- **`autoLockService`** — every interval: premium plans `status == active && lockDate <= now` → `status: locked`; 48h-before reminders to `paymentStatus == unpaid` members. **Keeps.** Needs the `plans(planType, status, lockDate)` index.
- **Reconciliation** (P4.1, shipped) — see 22.
- **Recount** (optional) — nightly `membersCount` recompute to correct client-side counter drift.

## Delete (P5)

| What | Why |
|---|---|
| `/v1/auth`, `/v1/users`, `/v1/pools`, `/v1/transactions`, `/v1/invitations`, `/v1/memberships`, `/v1/notifications`, `/v1/community`, `/core`, `/core/paystack` | V1, Supabase-backed; frontend no longer calls them |
| `services/supabaseService.js`, `@supabase/supabase-js`, `database/**`, `scripts/startup-phone-hash.js` (verify), `SUPABASE_*`, `SKIP_SUPABASE_TEST` | Supabase is deprecated |
| Importers to fix/remove: `controllers/{auth,invitation,membership,mpesa,notification,paystack,pool,transaction,user}Controller.js`, `services/notificationService.js`, `services/paybillIdentifierService.js`, `database/migrations/phone-hash-migration.js` | the 13 Supabase importers |
| `services/websocketService.js`, `socket.io`, `socket.io-client` | replaced by `onSnapshot` |
| `lib/firebaseCollections.js` | dead: imports the *client* SDK and a `db` export `firebase-config.js` doesn't have; no importers |
| Inventory GET/POST/PUT under `/v2/plans`, `/v2/users`, `/v2/invitations`, `/v2/catalogue`, `/v2/notifications`, `/v2/community`, `/v2/insights`, `/v2/plan-memories`, `/v2/feedback`, `/v2/notification-preferences` | move to client-direct per P2/P3; delete each once its client path ships |

## Credential handling (P0.1)
`lib/firebase-config.js` currently reads `../firebase-service-account.json` from disk — **and that file is committed**. Target:
```js
const sa = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString())
  : undefined; // else rely on GOOGLE_APPLICATION_CREDENTIALS / ADC
admin.initializeApp(sa ? { credential: admin.credential.cert(sa) } : {});
```
Add `firebase-service-account*.json` to `.gitignore`; rotate the key; purge history (40 §Rotate).

## CORS
`index.js` allow-lists frontend origins (localhost:3000, grupchat.vercel.app, www.grupchat.net) and Safaricom IPs. Callbacks don't need CORS (server-to-server); keep the list for browser-initiated calls only.
