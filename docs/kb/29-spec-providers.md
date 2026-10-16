---
title: Experience providers — applications, market checklists, listings, tickets
status: active
updated: 2026-10-16
read_when: you are touching the provider application, the admin review queue, market checklists, a provider's listings, or tickets for them
---

# Experience providers (D-043)

Businesses that run trips, outdoor activities, food walks or events apply once, are checked
against **their market's checklist**, and once approved publish listings (`experiences`)
themselves. Code: `gc-payments/controllers/v2/{provider,providerAdmin,experience}Controller.js`,
`services/{providerService,providerMarkets,storageFiles,experienceSchedule,providerEmails}.js`.
Web: `/providers/*` (welcome, apply, status, terms), `/provider/*` (portal), `/admin/providers`,
`/admin/checklists`.

## Collections (all ⚙ backend-owned; no client-direct access)

| Doc | Holds | Notes |
|---|---|---|
| `providers/{uid}` | `status`, `business{name,type,town,categories,waterActivities,phone,email,website}`, `market`, `marketName`, `currency`, `documents{checkId: [file]}`, `payout{method,backup,label,backupLabel,payeeName,bankCode,bankName,bankListed,branch,accountLast4,accountName,mpesa{kind,number,account,accountName},nameMatches,subaccountCode,settledTo,setupError,setupManual}`, `review{results{checkId:{state,note,respondedAt}},reviewerUid,decision,decisionNote,decidedAt}`, `checklistVersionId`, `checklistLabel`, `recheckVersionId`, `history[]`, `submittedAt`, `approvedAt`, `termsAcceptedAt` | One business per account; doc id = owner uid. `users/{uid}.providerStatus` mirrors `status` so Home can show the way back in. |
| `providerSecrets/{uid}` | `primary`, `bank{bankCode,bankName,accountNumber}`, `mpesa{kind,number,account}`; `accountNumber`, `bankCode` on records from before D-063 | Never returned to any client, including admins. Only `setUpPayout` reads it. |
| `providerMarkets/{code}` | `name`, `currency`, `phonePrefix`, `paystackCountry`, `utcOffsetMinutes`, `live`, `draft`, `versions[]` | `live` = the published checklist; `draft` = the next one being edited. A market with no `live` is **not open**. |
| `providerChecklistVersions/{code}-v{n}` | frozen `checks[]`, `label`, `changeNote`, `publishedAt`, `publishedBy` | Label for version *n* is `1.(n-1)`. An application is judged against the version it was submitted under. |
| `experiences/{id}` | `providerId`, `status` (draft · live · paused · archived), `title`, `category`, `meetingPoint`, `town`, `description`, `duration`, `included`, `photos[]`, `schedule{days,startTime,dates,spaces}`, `price`, `cancellation` (`48h` · `none`), `chargesRate`, `stats.ticketsSold` | Archive is a soft delete (D-019). Photos are removed by `removedAt`. |

**Check** = `{ id, title, help, kind, appliesTo, required }`. `kind`: `document`,
`photos-document`, `payout`, `terms`. `appliesTo`: `all`, `water` (business runs water
activities), `food` (category `food`). A checklist has exactly one `payout` and one `terms` check.

## Application states

`draft` → `submitted` → `in-review` → `approved` | `changes-requested` | `declined`.
A market that isn't open sends a submission to `waiting`; publishing that market's first
checklist moves its waiting applications back to `draft` and emails them. `changes-requested`
returns to `submitted` when the provider sends it back; earlier results stay until the
reviewer changes them. Editable states: `draft`, `waiting`, `changes-requested`.

## Review

Kenya 1.0 asks for business registration and a payout account (plus the terms); D-046.

Per check, an admin sets `pass`, `fix` (with a note the provider sees) or `fail`.
**Approve** needs every required check to pass and none to fail; it creates the Paystack
subaccount (`setUpPayout`, never throws — a failure is stored in `payout.setupError` and
retried from the review page; §Payout methods). **Request changes** needs at least one `fix`. **Decline**
pauses any live listings. Every decision emails the provider (`providerEmails.js`, one send
per history entry).

Publishing a new checklist version with "re-check approved providers" ticked sets
`recheckVersionId` on every approved provider in that market; they stay live and appear in
the queue under *Re-check*. Note is required for `fix` and `fail`.

## Payout methods (D-063)

A provider is paid to one of: a **bank account** (a bank from Paystack's list for the market,
or one typed in, with an optional branch, when it isn't listed), an **M-Pesa Paybill** (the
business number, plus the account number to pay into when the paybill needs one) or an
**M-Pesa Till**. They can add the other kind as a **backup**: a bank with M-Pesa behind it, or
M-Pesa with a bank behind it. `PUT /v2/providers/me/payout` takes
`{ primary: "bank"|"mpesa", bank?, mpesa? }`; the older bank-only body still works.
`services/providerPayout.js` checks it, writes what screens show to `providers.payout`
(`label` such as "Equity Bank ••• 8901" or "M-Pesa Till 5123456") and the numbers to
`providerSecrets`. A bank account number never leaves `providerSecrets`; a Paybill's account
number is a reference and shows whole.

`GET /v2/providers/banks` returns `{ banks, mpesa: { paybill, till } }`. Paystack's list is
asked for the country and currency first and widened until it answers; an empty answer is
never cached. M-Pesa entries (`type: mobile_money_business`) come from a second ask and are
kept out of `banks`. When the list won't load, the form asks for the bank's name instead.

On approval, `setUpPayout` tries the chosen method, then the backup. What Paystack can't take
automatically is marked `payout.setupManual` with the reason: a bank not on its list, M-Pesa
when its list has no Paybill or Till option, and a Paybill with an account number (a
subaccount carries one number). An admin creates that subaccount in Paystack's dashboard and
saves its code on the review page (`PUT /v2/admin/providers/:uid/payout/subaccount`, a code
starting `ACCT_`); `POST …/payout/retry` answers 409 for these.

## Files

Uploads are raw request bodies (`express.raw`), `?fileName=` in the query. Documents: PDF,
JPG, PNG up to 10 MB, private in Storage, read through a ten-minute signed URL. Listing photos:
JPG, PNG, WebP up to 8 MB, public via a Firebase download token at
`experiences/{id}/photos/{fileId}` (no uid in the path).

A storage failure never reaches the person as Google's error: `services/storageFiles.js`
answers 503 with a `code` (`storage_not_configured`, `storage_bucket_missing`,
`storage_denied`, `storage_unreachable`), a sentence saying the problem is ours and nothing is
wrong with the file, and a `ref`; the log line `[storage] save failed ref=… code=… bucket=…
status=…` carries Google's message. At start the server logs whether the bucket is usable
(`checkStorage`). The web refuses a wrong type or size before sending, keeps each file that
did upload, and offers **Try again** for the rest (`components/providers/DocumentRow.js`,
`components/kit/ErrorNote.js`).

## Listings

A provider can publish when the listing has a title and 3 photos, a meeting point,
a description of 20+ characters and a duration, at least one upcoming session (weekly days +
start time, or one-off dates) with spaces, a price, and a cancellation rule. A live listing
must stay complete: edits that would break that are refused, and photos can't drop below
three. Session times are the market's local time (`utcOffsetMinutes`; Kenya 180).
Admins can pause any listing with a reason (`POST /v2/admin/experiences/:id/pause`).

The provider's share per ticket is `price × (1 − chargesRate)`; `chargesRate` is
`PROVIDER_CHARGES_RATE` (default `0.1`) captured when the listing is published.
Copy shows it as **Provider charges**, never as a percentage on public pages.

## Tickets (D-044)

A checkout is **one order for one session**, 1–10 places, one code (`GC-7Q4K-2M`, no
look-alike characters). Code: `controllers/v2/ticketController.js`, `services/ticketService.js`.
Web: `/experiences/:id` (public listing and checkout), `/tickets`, `/tickets/:orderId`,
`/provider/bookings`.

| Doc | Holds | Notes |
|---|---|---|
| `ticketOrders/{id}` | `code`, `status` (pending · paid · failed), `experienceId`, `providerId`, `buyerUid`, `buyerName`, listing snapshot (`title`, `cover`, `town`, `meetingPoint`, `duration`, `cancellation`), `session{key,date,time,startsAt}`, `quantity`, `unitPrice`, `amount`, `charges`, `providerReceives`, `txId`, `paystackReference`, `holdExpiresAt`, `paidAt`, `checkedInAt` | The buyer reads it through `/v2/tickets`; the code is shown only once paid. |
| `experienceSessions/{experienceId}_{YYYY-MM-DDTHHMM}` | `capacity`, `booked`, `held`, `startsAt` | Places left = capacity − booked − held. Created on first checkout. |
| `ticketCodes/{code}` | `orderId` | Uniqueness guard and lookup for check-in. |

**Flow.** `POST /v2/experiences/:id/checkout` holds the places (transaction), writes the
order and a pending `ticket-sale` transaction (22), and returns Paystack's checkout URL.
Paystack returns the buyer to `/tickets/:orderId?payment=done`, which calls
`GET /v2/transactions/:txId/verify` (the server asks Paystack), again with `?wait=20` only if
it is still pending, and shows the ticket. Settlement books the places,
issues the code, emails the buyer ("You're going") and the provider ("New booking").
A failed or abandoned payment releases the places once the hour's hold ends.

**At the door.** The ticket's QR opens `/provider/bookings?code=…` on the provider's phone,
which finds the booking and offers **Check in** (undo allowed). Codes can also be typed.
`GET /v2/providers/me/bookings` returns this month's totals and every upcoming session with
bookings, each with its guest list.

## Endpoints
Listed in 24 §Keep. All return `{ success, data }`; errors carry `message` and, where useful,
`details`, `code` and `ref` (24 §Errors).
