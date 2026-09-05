---
title: Frontend data layer — lib/db on Firestore
status: draft
updated: 2026-09-06
read_when: you are adding a read or write of Firestore to the Next.js app, or deciding whether something goes through REST
---

# Frontend data layer

**Status: proposed** (P0.2–P0.4, P2, P3). Today the app reads nothing from Firestore; all data is REST via `lib/api.js`.

## Boundaries
- **Firestore SDK** for inventory: plans, members, invitations, milestones, catalogue, users, notifications, and *reading* transactions.
- **REST (`lib/api.js`)** only for: payment initiation (22), image upload signing (`POST /v2/uploads/image`), admin claim management. Everything else in `lib/api.js` is deleted in P5.4.

## Module layout
```
lib/
  firebase.js          + export const db = getFirestore(app)   (P0.2); emulator wiring (P0.5)
  db/
    index.js           dataSource() → "rest" | "firestore" from NEXT_PUBLIC_DATA_SOURCE (P0.4)
    converters.js      toDate(ts), fromDate(d), withId(snap) — one place for Timestamp handling
    collections.js     typed refs: plans(), plan(id), planMembers(), … (names from 20)
    plans.js           listMine(uid), get(id), create(data), update(id, patch), subscribe(id, cb)
    members.js         forPlan(planId), commit(planId, uid, status)
    invitations.js     pendingFor(uid), byCode(code)*, issue(), accept(id), decline(id), revoke(id)
    catalogue.js       listActive({ category })
    transactions.js    listMine(uid), subscribe(id, cb)      (read-only)
    users.js           me(uid), updateMe(patch), claimUsername(name)
    notifications.js   list(uid), unreadCount(uid), markRead(id)
  hooks/
    useDoc(ref), useQuery(q)   — onSnapshot wrappers returning { data, loading, error }
    usePlan(id), useMyPlans(), useTransaction(id), useMe()
```
`*` by-code lookups for anonymous visitors stay on REST until D-012.

## Conventions
- Every module function returns plain objects with `id` and JS `Date`s (via `converters.js`) — components never see `Timestamp`.
- Writes set `updatedAt: serverTimestamp()`; creates also set `createdAt` and identity from `auth.currentUser.uid`, never from arguments.
- Multi-doc writes use `writeBatch` (e.g. accept invite = update invite + create member + increment `membersCount`).
- Never write a backend-owned field (20 ⚙). Rules will reject it; the code shouldn't try.
- Pagination: `limit(20)` + `startAfter(lastDoc)`; no unbounded lists.
- Listeners only where the doc changes underneath the user (payment in flight, Plan Details). Lists use one-shot `getDocs` + manual refresh.
- Errors: surface `permission-denied` as "You don't have access to this plan" — it is the rules speaking, not a bug.

## Flag behaviour (P0.4 → P2)
```js
export const dataSource = () => process.env.NEXT_PUBLIC_DATA_SOURCE === "firestore" ? "firestore" : "rest";
```
Each `lib/db/*.js` function branches once at the top: `if (dataSource() === "rest") return legacy…`. When a collection's REST path is deleted (P5.4), the branch goes with it.

## Auth
**Session loss (D-020):** any `apiRequest` with no user, a failed token refresh, or a 401 calls `resetSession()` → sign out, clear session storage, hard-redirect to `/sign-in?reason=…&redirect=…`, and throws `SessionError`. Never surface "not authenticated" to users. `publicRequest` is unaffected.

`contexts/AuthContext.js` keeps Firebase Auth; `profile` moves from `usersAPI.getMe()` to `users.me(uid)` in P2.7. Admin UI checks `getIdTokenResult().claims.admin`.

## Emulator (P0.5)
`NEXT_PUBLIC_USE_EMULATOR=1` → `connectFirestoreEmulator(db, "127.0.0.1", 8080)` and `connectAuthEmulator(auth, "http://127.0.0.1:9099")` in `lib/firebase.js`, guarded to run once.
