# GrupChat MVP User Journeys (Stable Reference)

## Purpose
This document defines the **simplest end-to-end MVP journeys** to implement and review. It is intentionally minimal, implementation-oriented, and reusable as a stable product/engineering reference.

## Scope (MVP)
There are two primary journeys:

1. **Self-managed plans** (M-Pesa pooled contributions)
2. **Curated provider plans** (Paystack direct/pooled contributions)

Both journeys:
- support inviting friends/group members
- support partial/flexible contribution amounts by each member
- end at the **Plan Details page** after completion
- provide a clear **Go to Homepage** action from Plan Details

---

## Core Product Rules

1. **Landing page stays as-is**.
2. **First-time users** choose one journey during onboarding.
3. **Returning users** log in directly to Homepage.
4. Homepage shows:
   - light stats
   - 2 primary actions:
     - **Create Self-Managed Plan**
     - **Join Curated Plan with Friends**
5. Group invites exist for both journeys.
6. Total required amount for a plan can be funded by multiple members with custom amounts.
7. Final target amount for pooled journeys is determined by accepted members and plan requirements.

---

## Shared Entities (Conceptual)

- **User**
- **Plan**
  - type: `self_managed` | `curated`
  - target amount / total required amount
  - status: draft, active, funded, completed
- **Invite**
  - inviter, invitee, status (pending/accepted/declined)
- **Membership**
  - user in plan/group
- **Contribution**
  - amount, payer, payment method, status
- **Resources** (self-managed only)
  - links/documents/booking refs

---

## Global Navigation Outcome

After completion of either journey, route user to:
- **Plan Details** (for that plan)

From Plan Details, provide:
- **Go to Homepage** CTA

Homepage MVP contains:
- Light stats card(s):
  - active plans
  - pooled progress (simple)
  - pending invites
- Two high-visibility CTAs:
  - Create Self-Managed Plan
  - Join Curated Plan

---

## First-Time Onboarding Decision Flow

1. User signs up/signs in first time.
2. Show simple choice screen:
   - “I want to create/manage a plan”
   - “I want to discover/join a curated plan with friends”
3. Route to selected journey.
4. On completion, route to Plan Details (with Homepage CTA).

---

## Journey 1: Self-Managed Plan (M-Pesa Pooling)

## Goal
User creates a group plan, invites collaborators, adds basic resources, and members contribute via M-Pesa pooling.

## End-to-End Steps

1. **Create Plan Basics**
   - name/title
   - category
   - short description
   - provisional target amount

2. **Invite Group Members**
   - add invitees (phone/email as supported)
   - send invites
   - invited users accept/decline

3. **Finalize Required Amount**
   - when acceptance window closes (or minimum accepted reached), set/confirm final required amount
   - amount may be auto-derived from accepted count + plan inputs (simple formula) or manually confirmed by creator

4. **Add Basic Resources**
   - optional links (inspiration, booking links, docs)
   - lightweight list only (URLs with inferred names)

5. **Open Pooling**
   - status becomes active for contributions
   - members can contribute custom amounts via M-Pesa

6. **M-Pesa Contribution Flow**
   - member enters Kenyan phone + desired amount
   - STK push initiated
   - payment callback updates contribution status
   - pooled total increases on success

7. **Completion Rule**
   - when pooled total >= required amount:
     - mark as funded/completed (MVP simple state)
     - show completion confirmation

8. **Navigation Rule (independent of completion)**
   - route user to Plan Details after setup/payment steps
   - always provide Go to Homepage CTA from Plan Details
   - user can continue to Homepage even before funding is complete

## MVP Acceptance Criteria

- Creator can create plan with minimal required fields.
- Invites can be sent and accepted.
- Resources list can store/display links.
- Members can contribute flexible amounts via M-Pesa.
- Pool total updates on successful callback.
- Journey ends at Plan Details with a Go to Homepage CTA.

---

## Journey 2: Curated Provider Plan (Paystack)

## Goal
User discovers a provider plan, can invite friends to join attendance group, and members contribute directly via Paystack toward required total.

## End-to-End Steps

1. **Discover Plan**
   - browse list of curated plans
   - open plan details (provider, date/time, summary, required amount)

2. **Start Group Participation (Optional but supported)**
   - user chooses:
     - continue solo, or
     - invite friends/group members

3. **Invite Friends**
   - send invites to friends
   - accepted members become participants

4. **Determine Group Required Total**
   - total can reflect participant count and selected plan pricing model
   - keep formula simple and transparent in MVP

5. **Paystack Contribution Flow**
   - participant enters desired contribution amount
   - redirected to Paystack checkout
   - webhook confirms successful payment
   - contribution added to group total

6. **Completion Rule**
   - when total paid >= required amount:
     - mark plan payment as complete/funded
     - show confirmation

7. **Navigation Rule (independent of completion)**
   - route user to Plan Details after setup/payment steps
   - always provide Go to Homepage CTA from Plan Details
   - user can continue to Homepage even before full payment completion

## MVP Acceptance Criteria

- User can discover and select a curated plan.
- User can invite friends for group attendance.
- Participants can pay custom amounts via Paystack.
- Total updates from webhook-confirmed payments.
- Journey ends at Homepage.

---

## Returning User Flow

1. User logs in.
2. User lands on Homepage directly.
3. User sees light stats + 2 main actions:
   - Create Self-Managed Plan
   - Join Curated Plan
4. User can continue existing plans or start a new journey.

---

## Simplified State Model (MVP)

For each plan:
- `draft` -> `active` -> `funded` -> `completed`

For invites:
- `pending` -> `accepted` or `declined`

For contributions:
- `pending` -> `success` or `failed`

---

## Payment Integration Boundaries (Current Architecture)

- **M-Pesa**: self-managed pooling contributions
- **Paystack**: curated plan contributions
- Backend service role: payment initiation + callback/webhook processing + transaction status updates
- Frontend role: initiate payment, show status, allow skip/continue where needed, and reflect final totals

---

## UX Constraints for MVP Simplicity

1. One primary action per screen.
2. Keep forms short (only required fields).
3. Allow optional skip where non-critical.
4. Avoid technical payment/callback wording in user copy.
5. Always provide a clear “what next” action.

---

## Homepage Entry Conditions

User should be routed to Plan Details during/after journey setup steps.

Homepage access is always allowed via explicit CTA from Plan Details, including when:
- funding is still in progress
- invites are still pending
- user skipped optional onboarding steps

Completion state updates plan status, but does not block Homepage navigation.

---

## Implementation Checklist (Execution-Oriented)

1. Keep landing page unchanged.
2. Implement/retain first-time journey selector post-login.
3. Finalize self-managed flow screens in sequence.
4. Finalize curated flow screens in sequence.
5. Ensure invite acceptance affects required amount logic.
6. Ensure custom contribution amount is allowed in both journeys.
7. Ensure M-Pesa + Paystack callback/webhook update totals.
8. Route both journeys to Plan Details during/after setup steps (not completion-gated).
9. Ensure Plan Details always includes Go to Homepage CTA.
10. Allow Homepage navigation even when plan is not yet funded/completed.
11. Homepage shows light stats + 2 dominant CTA actions.

---

## Non-Goals for this MVP document

- Advanced retention mechanics
- Deep analytics/event taxonomy
- complex recommendation engines
- high-fidelity 3D interactions (can be layered later)

This document intentionally captures the **minimum stable journeys** to ship and test quickly.

---

## Technical Development Appendix (Firebase MVP)

This appendix defines the minimum technical contract required to implement both journeys with Firebase as source of truth.

### Architecture responsibility split

- **Frontend (Grupchat-Landing, fullstack Firebase app logic)**
  - Creates/updates plan setup data (plans, invites, resources, checkpoints, memberships bootstrap)
  - Reads and renders plan, membership, invite, and contribution progress state
  - Initiates payment intents via backend API for M-Pesa/Paystack
- **Backend (gc-payments microservice)**
  - Initiates provider transactions
  - Processes provider callbacks/webhooks
  - Updates transaction status and payment-derived plan totals directly in Firebase

### Firestore collections (MVP schemas)

1. **users**
- `id` (uid, string, doc id)
- `email` (string)
- `displayName` (string)
- `phone` (string, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

2. **plans**
- `id` (string, doc id)
- `type` (`self_managed` | `curated`)
- `title` (string)
- `category` (string)
- `description` (string)
- `status` (`draft` | `active` | `funded` | `completed`)
- `ownerId` (user uid)
- `targetAmount` (number)
- `requiredAmount` (number)
- `currentBalance` (number)
- `currency` (`KES` default)
- `invitePolicy` (`open` | `owner_only`, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `lastActivityAt` (timestamp)

3. **planMembers**
- `id` (string, doc id)
- `planId` (string)
- `userId` (uid)
- `role` (`owner` | `member`)
- `status` (`active` | `left`)
- `commitmentStatus` (`in` | `out` | `pending`)
- `joinedAt` (timestamp)
- `updatedAt` (timestamp)

4. **invites**
- `id` (string, doc id)
- `planId` (string)
- `inviterId` (uid)
- `inviteeEmail` (string, optional)
- `inviteePhone` (string, optional)
- `inviteeUserId` (uid, optional)
- `status` (`pending` | `accepted` | `declined` | `expired`)
- `token` (string)
- `expiresAt` (timestamp, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

5. **planResources**
- `id` (string, doc id)
- `planId` (string)
- `createdBy` (uid)
- `title` (string)
- `url` (string)
- `type` (`link` | `booking` | `document`)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

6. **planCheckpoints**
- `id` (string, doc id)
- `planId` (string)
- `title` (string)
- `description` (string, optional)
- `dueAt` (timestamp, optional)
- `ownerId` (uid, optional)
- `status` (`todo` | `in_progress` | `done`)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

7. **transactions**
- `id` (string, doc id)
- `planId` (string)
- `userId` (uid)
- `type` (`contribution` | `premium-join` | `payout`)
- `provider` (`daraja` | `paystack`)
- `amount` (number)
- `platformFee` (number)
- `currency` (string)
- `status` (`pending` | `success` | `failed`)
- `paystackReference` (string, optional)
- `paystackTransactionId` (string, optional)
- `darajaCheckoutRequestId` (string, optional)
- `darajaReceiptNumber` (string, optional)
- `description` (string)
- `processedAt` (timestamp, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Relations and cardinality

- `users (1) -> (N) plans` via `plans.ownerId`
- `plans (1) -> (N) planMembers` via `planMembers.planId`
- `users (1) -> (N) planMembers` via `planMembers.userId`
- `plans (1) -> (N) invites` via `invites.planId`
- `plans (1) -> (N) planResources` via `planResources.planId`
- `plans (1) -> (N) planCheckpoints` via `planCheckpoints.planId`
- `plans (1) -> (N) transactions` via `transactions.planId`
- `users (1) -> (N) transactions` via `transactions.userId`

### Required logical indexes (MVP)

- `plans`: `(ownerId, updatedAt desc)`, `(type, status, updatedAt desc)`
- `planMembers`: `(planId, userId) unique-intent`, `(userId, status)`
- `invites`: `(planId, status)`, `(inviteeUserId, status)`, `(token)`
- `planResources`: `(planId, createdAt desc)`
- `planCheckpoints`: `(planId, status, dueAt)`
- `transactions`: `(planId, status, createdAt desc)`, `(userId, createdAt desc)`, `(paystackReference)`, `(darajaCheckoutRequestId)`

### State transitions

- **Plan status**: `draft -> active -> funded -> completed`
- **Invite status**: `pending -> accepted|declined|expired`
- **Transaction status**: `pending -> success|failed` (terminal once final)

### Write ownership (critical)

Frontend writes:
- `plans`, `invites`, `planResources`, `planCheckpoints`, initial `planMembers`
- non-payment edits to plan metadata and participation setup

Backend writes (`gc-payments`) only:
- payment-result fields in `transactions`
- status transitions `pending -> success|failed`
- payment-derived plan amount increments (`plans.currentBalance`)
- optional membership payment flags where needed

Conflict rule:
- frontend must not overwrite backend-owned transaction result fields
- backend must only mutate payment-owned fields and totals, not user-authored plan content

### Callback and webhook reconciliation contract

- Use provider references as idempotency keys:
  - Paystack: `paystackReference`
  - M-Pesa: `darajaCheckoutRequestId`
- Callback handler flow:
  1. locate `transactions` by provider reference + `status=pending`
  2. if not found, treat as already processed or invalid and return accepted (store the record anyway approriately for audit - even just as a raw data store)
  3. update transaction to terminal status
  4. if success, update `plans.currentBalance` in same logical transaction
  5. stamp `processedAt` and `updatedAt`
- Idempotency behavior:
  - repeated callbacks for same reference must not double-increment plan totals

### Journey routing contract (implementation rule)

For both self-managed and curated journeys:
- primary destination after setup/payment interaction is **Plan Details**
- **Go to Homepage** CTA is always visible from Plan Details
- Homepage navigation is never blocked by funding completion

### Firebase security rules guidance (MVP)

- Authenticated users can read plans they own/join/are invited to (as per membership/invite checks)
- Only plan owner (or allowed role) can mutate plan metadata, resources, checkpoints, and invite issuance
- Members can create contribution intents through approved flow only
- Client writes to backend-owned payment result fields should be denied
- Backend service account bypasses client rules and performs callback/webhook updates securely

### Minimal audit fields

Use these fields consistently on mutable docs:
- `createdAt`, `updatedAt`
- `createdBy` where relevant
- `lastActivityAt` on plans for sorting and homepage summaries

This appendix is intentionally MVP-scoped and should be treated as the implementation confirmation baseline before coding journey flows.
