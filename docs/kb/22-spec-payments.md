---
title: Payments — initiation, callbacks, reconciliation, realtime
status: active
updated: 2026-09-06
read_when: you touch anything that moves money or shows its status; you are debugging a stuck or duplicated payment
---

# Payments

The backend (`gc-payments`) is the **only writer** of money. The client initiates via REST,
then observes the outcome in Firestore. Provider callbacks land on the backend.

## Endpoints the client calls (kept on the backend — Bearer Firebase ID token)

| Method + path | Purpose | Body | Creates |
|---|---|---|---|
| `POST /v2/plans/:planId/contribute` | M-Pesa STK contribution to a pooled free plan | `{ amount, phone }` | `transactions` (`daraja`, `contribution`, `pending`) → STK push |
| `POST /v2/plans/:planId/contribute/paystack` | Paystack contribution | `{ amount, currency? }` | `transactions` (`paystack`, `contribution`, `pending`) → returns `authorizationUrl`, `txId`, `reference` |
| `POST /v2/plans/:planId/join-premium/paystack` | Pay listed price to join a curated plan | `{ currency }` | `planMembers` (unpaid) + `transactions` (`premium-join`) |
| `POST /v2/plans/:planId/join-premium/mpesa` | Same via STK | `{ phone }` | as above |
| `POST /v2/plans/:planId/payout` | Owner withdraws pooled funds | `{ amount, … }` | `transactions` (`payout`), **decrements** `currentBalance` immediately and posts the ledger debit |

Preconditions enforced server-side: plan exists and `status == active`; for `contribute*` the plan has `poolMode in [pool, both]` (else `"Plan does not have pooling enabled"`); **rails follow plan type (D-017)** — `contribute` (M-Pesa) requires `planType == free`, `contributePaystack` requires `planType == premium`; for legacy premium joins the catalogue item is active and the plan isn't locked.

## Callbacks (provider → backend; unauthenticated, verified by signature/IP)

| Path | Provider | Verification | On success |
|---|---|---|---|
| `POST /v2/paystack/webhook` | Paystack `charge.success` | HMAC-SHA512 of raw body with `PAYSTACK_SECRET_KEY` vs `x-paystack-signature` | see settlement |
| `POST /v2/mpesa/stk-callback` | Daraja STK result | `ResultCode == 0` | see settlement. **V2 STK pushes must name this URL** (`stkCallbackUrlV2()`, D-022) |
| `POST /core/deposit_callback` (V1) | Daraja STK result | — | bridges to the V2 handler when the `CheckoutRequestID` is a Firestore transaction (D-022) |
| `POST /core/paybill-confirmation`, `/core/paybill-callback` (V1 C2B) | Daraja | — | raw payload → `mpesa_logs`; always 200 |
| `POST /v2/payments/*` | Daraja deposit/withdrawal/B2B/paybill/timeouts | per handler | legacy V1-era set; review in P5 |

**Note (P4.2):** the Paystack handler recomputes the signature from `JSON.stringify(req.body)`, not the raw bytes. That works only while Express's JSON parser reserialises identically. Use `express.raw()` on that route and hash the raw buffer.

## Settlement — one path (D-021)
`gc-payments/services/settlementService.js` is the **only** code that books money. Three triggers call it:
provider callbacks (`paystackWebhook`, `mpesaStkCallback`), the reconciliation job, and `GET /v2/transactions/:id/verify`.
- `settleSuccess(txDoc, { amount, currency, providerFields })` — inside `runTransaction` (which also **stages the ledger entries**, D-025): re-reads the tx and returns if it is no longer `pending` (race-safe); sets `success`, `processedAt`, provider ids; `contribution` → `plans.currentBalance += amount − platformFee`; `premium-join` → member `paymentStatus: paid`; plan `lastActivityAt`. Then audit `payment.settled` and in-app notifications (`services/paymentNotifications.js`).
- `settleFailure(txDoc, { reason, resultCode })` — `failed` + `description`; audit `payment.failed`.
- `reconcileTransaction(txDoc)` — asks the provider (Paystack `verify/:reference`; Daraja STK query, pending while `errorCode 500.001.1001`) and calls one of the above. Returns `success | failed | pending | unknown`.
Callbacks now only verify the signature, find the pending tx by provider reference, and hand it over.

## Amount semantics
- Firestore stores **major units** (KES). Paystack sends **minor units**; the webhook divides by 100.
- `platformFee` is computed at initiation from `plans.platformFeeRate ?? 0.01`; premium plans carry an explicit `0`. The plan is credited **net**.
- `payout` decrements `currentBalance` at initiation, not on callback — a failed payout must be **reversed** (P4: add compensating increment on failure; today it isn't).

## Timeouts and reconciliation (P4.1 — shipped 2026-09-06)
`services/reconciliationService.js`: starts 30s after boot, then every 2 min. Loads `transactions where status == pending` (single-field, no index), keeps those ≥3 min old (callbacks own the first 3 minutes), reconciles up to 50 per run, and marks anything still unconfirmed after **48h** as `failed` ("No provider confirmation within 48 hours"). Survives restarts by construction — the old in-process `setTimeout` is gone.

## Verify endpoint (P4.4 — shipped 2026-09-06)
`GET /v2/transactions/:txId/verify[?wait=25]` (auth; payer or plan member). With `wait`, the server holds the request on a listener until the transaction settles, then asks the provider once if it hasn't → `{ id, status, outcome, … }`. Clients **await** this (D-023): the pay sheet after an STK push, the pending-payment watcher on Plan details, and the post-redirect check — no client timers.

## Realtime (client)
Socket emits are **retired** (P4.5, 2026-09-06): no `websocketService.*` calls remain in controllers/services; the socket server init in `index.js` goes with the dependency in P5.3. Until phase I the client awaits `verify?wait` (server-held listener) during a payment — no polling. Target: document listeners —
```js
onSnapshot(doc(db, "transactions", txId), snap => setStatus(snap.data().status));   // during payment
onSnapshot(doc(db, "plans", planId),      snap => setPlan(snap.data()));            // Plan Details
```
Rules allow the payer to read their own transaction and members to read the plan (21). Unsubscribe on unmount; stop listening once `status` is terminal.

## Client UX contract
- Plan details keeps a **pending-payment watcher**: while any of the viewer's transactions is pending it awaits `verify?wait=25` (bounded by attempts) and toasts + refreshes when one settles — so a callback or the reconciliation job surfaces without a manual refresh.
 (from `MVP_USER_JOURNEYS.md` §UX)
- Never block Home on payment completion. After initiation, route to Plan Details; show pending state there.
- No provider jargon in copy ("callback", "STK") — say "Check your phone for the M-Pesa prompt."
- Debug logs: `lib/debug.js`, scope `api` / `journey/*`; enable in prod via `localStorage.gc.debug = "1"`.

## Environment (gc-payments)
Daraja: `CONSUMER_KEY`, `CONSUMER_SECRET`, `BUSINESS_SHORT_CODE`, `PASS_KEY`, `STK_PUSH_URL`, `OAUTH_URL`, `DEPOSIT_CALLBACK_URL`, `WITHDRAWAL_CALLBACK_URL`, `QUEUE_TIMEOUT_URL`, `B2B_*`, `INITIATOR_NAME`, `SECURITY_CREDENTIAL`, `SOURCE_ACCOUNT_SHORTCODE`, `PAYMENT_REQUEST_URL`.
Paystack: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_BASE_URL`, `PAYSTACK_WEBHOOK_SECRET`.
Other: `FRONTEND_URL` (Paystack `callback_url` base), `RESEND_API_KEY`, `EMAIL_*`, `FIREBASE_STORAGE_BUCKET`, `PORT` (4000). **To remove in P5:** `SUPABASE_URL`, `SUPABASE_KEY`, `SKIP_SUPABASE_TEST`.
