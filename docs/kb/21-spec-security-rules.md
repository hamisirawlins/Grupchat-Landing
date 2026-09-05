---
title: Security rules for client-direct Firestore access
status: draft
updated: 2026-09-05
read_when: you are writing, testing or deploying firestore.rules, or deciding whether a client may perform a write
supersedes: ../../../gc-payments/firestore-security-rules.txt (obsolete schema: pools/memberships/prepackagedPlans)
---

# Security rules

**Status: proposed.** Nothing below is deployed. Deploy path and tests: 40 §Rules. Until P1
ships, the effective client rule is deny-all (the client SDK holds no rules today).

## Principles
1. **Deny by default**; open exactly the paths 20 §Ownership allows.
2. **Backend-owned fields are unwritable from the client**, even by owners. Use `affectedKeys()` whitelists on update.
3. **Membership is the read boundary** for plan-scoped data. Two `get()` calls per rule max (cost).
4. **Creates set identity from `request.auth.uid`**, never from the payload.
5. **Enumerations are enforced in rules** (`status in [...]`) so a client cannot invent states.
6. **`allow delete: if false` on every collection** (D-019). Clients soft-delete by writing `deletedAt` where the update whitelist permits it.

## Helpers
```
function signedIn()            { return request.auth != null; }
function uid()                 { return request.auth.uid; }
function isAdmin()             { return signedIn() && request.auth.token.admin == true; }
function plan(planId)          { return get(/databases/$(database)/documents/plans/$(planId)).data; }
function isPlanOwner(planId)   { return signedIn() && plan(planId).ownerId == uid(); }
function isPlanMember(planId)  {
  return signedIn() && exists(/databases/$(database)/documents/planMembers/$(planId + "_" + uid()));
}
function onlyKeys(keys)        { return request.resource.data.diff(resource.data).affectedKeys().hasOnly(keys); }
function unchanged(field)      { return request.resource.data[field] == resource.data[field]; }
```
`isPlanMember` assumes the deterministic member id `${planId}_${uid}` (D-011). Until that lands, membership checks must go through a query the rules cannot express — which is why **P3 writes wait for D-011**.

## Rules (proposed)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read:   if signedIn() && (uid() == userId || isAdmin());
      allow create: if signedIn() && uid() == userId;
      allow update: if signedIn() && uid() == userId
                    && onlyKeys(['displayName','username','avatarImageId','phone','updatedAt']);
    }

    match /usernames/{username} {
      allow read:   if signedIn();
      allow create: if signedIn() && request.resource.data.userId == uid()
                    && request.resource.data.status == 'active';
      allow update, delete: if false;          // release via backend only
    }

    match /plans/{planId} {
      allow read:   if isPlanOwner(planId) || isPlanMember(planId) || isAdmin();
      allow create: if signedIn() && request.resource.data.ownerId == uid()
                    && request.resource.data.currentBalance == 0
                    && request.resource.data.status == 'active'
                    && request.resource.data.planType in ['free','premium'];
      allow update: if isPlanOwner(planId)
                    && onlyKeys(['name','description','category','targetDate','targetAmount',
                                 'currency','resources','visibility','status','updatedAt'])
                    && request.resource.data.status in ['active','completed','archived'];  // never 'locked'
      allow delete: if false;
    }

    match /planMembers/{memberId} {
      allow read:   if signedIn() && (resource.data.userId == uid()
                    || isPlanOwner(resource.data.planId) || isPlanMember(resource.data.planId));
      allow create: if signedIn() && request.resource.data.userId == uid()
                    && memberId == request.resource.data.planId + '_' + uid()
                    && request.resource.data.role == 'member'
                    && !('paymentStatus' in request.resource.data);
      allow update: if signedIn() && resource.data.userId == uid()
                    && onlyKeys(['commitmentStatus','updatedAt'])
                    && request.resource.data.commitmentStatus in ['in','tentative','watching'];
      allow delete: if false;
    }

    match /invitations/{inviteId} {
      allow read:   if signedIn() && (resource.data.inviterId == uid()
                    || resource.data.inviteeUserId == uid()
                    || isPlanOwner(resource.data.planId));
      allow create: if signedIn() && request.resource.data.inviterId == uid()
                    && (isPlanOwner(request.resource.data.planId) || isPlanMember(request.resource.data.planId))
                    && request.resource.data.status == 'pending';
      allow update: if signedIn() && (
                      // invitee responds
                      (request.resource.data.inviteeUserId == uid()
                        && onlyKeys(['status','inviteeUserId','respondedAt','updatedAt'])
                        && request.resource.data.status in ['accepted','declined'])
                      // inviter or owner revokes
                      || ((resource.data.inviterId == uid() || isPlanOwner(resource.data.planId))
                        && onlyKeys(['status','respondedAt','updatedAt'])
                        && request.resource.data.status == 'revoked'));
    }

    match /milestones/{id} {
      allow read, create, update: if signedIn() && isPlanMember(resource.data.planId);
    }

    match /planCatalogue/{id} {
      allow read:   if signedIn() && (resource.data.status == 'active' || isAdmin());
      allow write:  if isAdmin();
    }

    match /transactions/{id} {
      allow read:   if signedIn() && (resource.data.userId == uid() || isPlanMember(resource.data.planId));
      allow write:  if false;                  // Admin SDK only
    }

    match /notifications/{id} {
      allow read:   if signedIn() && resource.data.userId == uid();
      allow update: if signedIn() && resource.data.userId == uid() && onlyKeys(['read','updatedAt']);
      allow create, delete: if false;
    }

    match /notificationPreferences/{userId} { allow read, write: if signedIn() && uid() == userId; }
    match /feedback/{id} { allow create: if signedIn() && request.resource.data.userId == uid(); }

    match /{document=**} { allow read, write: if false; }
  }
}
```
**Resolved gap (D-014):** the by-`inviteCode` lookup for signed-out visitors is served by a public projection — REST today (`GET /v2/invites/:code/preview`), and in this phase by `inviteLinks/{code}` with `allow read: if true; allow write: if false;` written by the backend. See 26.

## Test matrix (P1.2)
| # | Actor | Action | Expect |
|---|---|---|---|
| 1 | member | read own plan | allow |
| 2 | stranger | read plan | deny |
| 3 | owner | update `name` | allow |
| 4 | owner | update `currentBalance` | **deny** |
| 5 | owner | set `status: locked` | **deny** |
| 6 | any | create `transactions` doc | **deny** |
| 7 | payer | read own transaction | allow |
| 8 | invitee | accept own invite | allow |
| 9 | invitee | set invite `status: revoked` | deny |
| 10 | user | create `usernames/{taken}` | deny (exists) |
| 11 | non-admin | write `planCatalogue` | deny |
| 12 | member | update another member's `commitmentStatus` | deny |
