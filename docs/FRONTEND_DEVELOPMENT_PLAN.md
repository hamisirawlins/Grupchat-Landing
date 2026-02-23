# Frontend Development Plan (Based on Current State)

## Current Functionality Review

### Working and integrated (V2-focused)

- Authenticated app shell and route gating are in place.
- Core V2 flows are wired through shared API clients:
  - Dashboard overview (`/dashboard`)
  - Plans list + detail (`/plans`, `/plans/[planId]`)
  - Create plan (`/create-plan`)
  - Plot/memories (`/plot`)
  - Notifications + invitation actions (`/notifications`)
  - Settings/profile/preferences/feedback (`/settings`)
- Firebase auth + backend token handoff are implemented.
- Media upload flows exist for avatar and plan images.

### Present but mixed/legacy

- V1/legacy pool and transaction routes still coexist with V2 plan flows:
  - `/create-pool`, `/pools`, `/pools/[poolId]`, `/transactions`, `/notifications-v1`
- Payments references remain in V2-adjacent experience (Paystack memory upgrade + some legacy copy).
- API layer includes both old (`dashboardAPI`) and newer typed V2 clients.

### Gaps and risks identified

- Product experience is split between V2 "plans/memories" and older pool/payment UX.
- Some pages still use blocking alerts and verbose console logging in production paths.
- Operational pages (manage-data, bug report, delete-account) are functional but not integrated into a unified in-app support center.
- No clearly documented release checklist for frontend regression, performance, and accessibility.

---

## Development Plan

## Phase 1 (Week 1): Stabilize V2 Core Experience

### Goals

- Make V2 routes the consistent primary user journey.
- Remove obvious friction from auth and key plan flows.

### Deliverables

1. Route and nav coherence
   - Ensure sidebar/top CTAs consistently route to V2 screens.
   - De-emphasize or hide legacy links from primary navigation.
2. Auth hardening
   - Standardize sign-in/sign-up error handling and loading states.
   - Remove noisy debug logging from auth screens and API proxy routes.
3. Plans workflow polish
   - Validate create-plan > plans list > plan detail > invite member > milestone update path end-to-end.

### Acceptance criteria

- New user can complete full V2 flow without touching legacy pages.
- No raw `alert()` UX in authenticated critical flows.
- Auth failures return user-friendly messages with no console noise in normal operation.

---

## Phase 2 (Week 2): V1/V2 Consolidation and Copy Alignment

### Goals

- Align product language and interaction model to V2 direction.
- Reduce maintenance burden from duplicate features.

### Deliverables

1. Copy and terminology pass
   - Replace residual pool/payment-first language where V2 intends plan/memory framing.
2. Legacy route strategy
   - Mark V1 routes as legacy and restrict discoverability, or route users to V2 equivalents.
3. API client cleanup
   - Introduce clearer separation for legacy vs V2 API services and migrate shared screens to V2 clients first.

### Acceptance criteria

- Primary UI vocabulary consistently reflects plans/milestones/memories.
- Legacy routes are no longer reachable through core nav.
- Core pages (`dashboard`, `plans`, `notifications`, `settings`) rely on V2 endpoints only.

---

## Phase 3 (Week 3): UX Quality and Reliability

### Goals

- Improve perceived quality and reduce support incidents.

### Deliverables

1. Form and feedback improvements
   - Replace blocking alerts with inline status/toast patterns.
   - Add consistent validation messaging and disabled/loading states.
2. Loading and empty states
   - Standardize skeleton/empty/error states across V2 pages.
3. Error boundary and retry patterns
   - Add robust retry and fallback UX for key data fetches.

### Acceptance criteria

- All major forms provide inline feedback and non-blocking errors.
- All major data sections have explicit loading, empty, and error states.
- Recoverable network failures offer retry affordances.

---

## Phase 4 (Week 4): Performance, Accessibility, and Release Readiness

### Goals

- Prepare frontend for predictable production releases.

### Deliverables

1. Performance
   - Audit large pages (especially plan detail and landing page) for bundle size and render cost.
   - Defer or split non-critical visual effects.
2. Accessibility
   - Keyboard navigation checks, semantic headings, aria labels, contrast checks.
3. QA and release checklist
   - Define smoke tests for auth, plans, invites, notifications, settings.
   - Add pre-release checks for env vars, API URL validity, and analytics instrumentation.

### Acceptance criteria

- Critical screens pass manual keyboard and screen-reader sanity checks.
- Core V2 journey meets agreed load/performance targets.
- Team has a repeatable frontend release checklist.

---

## Suggested Workstreams and Ownership

- **Track A: Product UX** — copy alignment, navigation cleanup, visual consistency.
- **Track B: Frontend Platform** — API client consolidation, auth hardening, error patterns.
- **Track C: Quality** — regression scripts, accessibility checks, performance audits.

Run Track A + B in parallel during Weeks 1–2, then Track C in Weeks 3–4.

---

## Priority Backlog (Top 10)

1. Remove debug logs in auth/sign-in and API proxy routes.
2. Standardize error handling (replace `alert()` and inconsistent messages).
3. Lock primary navigation to V2 pages.
4. Finalize V1 route deprecation strategy.
5. Consolidate API client usage patterns (V2-first).
6. Normalize loading/empty/error states in plans, notifications, and plot.
7. Add regression smoke test checklist for key user journeys.
8. Accessibility pass on dashboard/plans/settings/notifications.
9. Performance pass on heavy pages (`/plans/[planId]`, landing page animations).
10. Publish frontend release and rollback runbook.

---

## Definition of Done (for this plan)

- V2 journey is clearly dominant and reliable from sign-up to plan collaboration.
- Legacy V1 features are intentionally hidden, deprecated, or isolated.
- UX feedback, errors, and loading behavior are consistent across core pages.
- Team can ship confidently using a documented QA and release process.
