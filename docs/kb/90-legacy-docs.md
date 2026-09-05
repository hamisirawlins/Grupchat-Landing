---
title: Legacy documents map
status: active
updated: 2026-09-05
read_when: you found a .md outside docs/kb and need to know whether to trust it
---

# Legacy documents

Everything that existed before the KB. **Do not act on `superseded` items**; they are kept for history.
"Still relevant" items are read via the KB pointer, not independently.

## Grupchat-Landing/docs

| File | Verdict | Replaced by / note |
|---|---|---|
| `MVP_USER_JOURNEYS.md` | **still relevant** — product journeys, UX constraints, routing contract | KB 00 links it. Appendix field `currentAmount` → read as `currentBalance` (D-003); its "Firestore client writes" split is now the plan (D-002/D-004). |
| `V2_FIRESTORE_MODELS.md` | superseded | KB 20 (reflects what the code writes) |
| `V2_SCHEMA_ARCHITECTURE.md` | superseded | KB 20 + 00 |
| `V2_ENDPOINTS.md` | superseded | KB 24 (what remains) — most listed endpoints are slated for removal |
| `V2_PAGE_INTEGRATION_CHECKLIST.md` | superseded | pages it references were deleted 2026-09-05; KB 10 P6 |
| `V2_BUILD_GUIDE.md` | superseded | KB 10 |
| `FRONTEND_DEVELOPMENT_PLAN.md` | superseded | KB 10 |

## gc-payments (root and docs/)

| File | Verdict | Replaced by / note |
|---|---|---|
| `README.md` | partially relevant | keep for install; architecture claims (Supabase) are wrong → KB 00 |
| `API_DOCUMENTATION.md` | superseded | KB 22 + 24 |
| `BACKEND_ARCHITECTURE_ANALYSIS.md` | superseded (Supabase/SQL design) | KB 00, 20 |
| `MIGRATION_AND_IMPLEMENTATION_NOTES.md` | superseded (targets Supabase) | KB 10 |
| `NEXT_STEPS.md` | superseded (V1 roadmap) | KB 10 |
| `PHASE_2_COMPLETION_SUMMARY.md` | historical | — |
| `TRANSACTION_IMPLEMENTATION_SUMMARY.md` | superseded | KB 22 |
| `PAYSTACK_INTEGRATION_CHECKLIST.md` | superseded | KB 22 |
| `INVITATION_SYSTEM_SUMMARY.md` | superseded | KB 20 `invitations`, 21 |
| `MEMBERSHIP_MANAGEMENT_SUMMARY.md` | superseded (V1 pools) | KB 20 `planMembers` |
| `ADVANCED_NOTIFICATIONS_SUMMARY.md` | partially relevant | notification types → KB 20; socket parts superseded by D-005 |
| `FIREBASE_SEED_IMPLEMENTATION.md` | still relevant | KB 40 §Seed links it |
| `DEPLOYMENT_AND_TESTING_GUIDE.md` | partially relevant | KB 40 |
| `docs/V2_ROUTE_CHECKLIST.md` | superseded | KB 24 — useful as the pre-migration inventory |
| `docs/V2_CONTROLLER_CHECKLIST.md` | superseded | KB 24 |
| `docs/PAYBILL_IDENTIFIER_IMPLEMENTATION.md` | review in P5 | paybill flow lives in `v2/paymentsController.js`; decide keep/drop |
| `docs/PHONE_HASH_IMPLEMENTATION.md` | review in P5 | tied to Supabase migration script |
| `firestore-security-rules.txt` | superseded (obsolete schema) | KB 21 |
| `database/schema.sql`, `database/migrations/*` | superseded (Supabase) | delete in P5.2 |

## Housekeeping
When P5.6 runs: move superseded gc-payments root docs into `gc-payments/docs/archive/` (don't delete — history), and delete the superseded `Grupchat-Landing/docs/V2_*.md` files after confirming nothing links to them.
