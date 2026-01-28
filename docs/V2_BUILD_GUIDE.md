# GrupChat V2 Build Guide

This document captures the core product direction, MVP scope, and design/UX
intent for the V2 build. It reflects the agreed pivot: a social, goal-tracking
app that turns group plans into shared memories, with payments as an optional
future layer.

## 1) Product Positioning

**Core idea**
GrupChat is a social commitment engine that helps friends move from "we should"
to "we did." It tracks shared progress, nudges momentum, and preserves memories
without relying on payments.

**Tagline**
"Powering Plans Beyond The Chat"

**Theme**
"Turn group chat plans into group chat memories."

**Why it works**
- People don’t get excited about payments; they get excited about the plan.
- Group accountability is the real bottleneck — visibility and momentum solve it.
- Manual progress is acceptable and human; it lowers friction.

## 2) Product Principles

1. **Social over financial**: Momentum and accountability before money.
2. **Manual over magical**: Keep it simple; don’t over-automate in V2.
3. **Visible over perfect**: Make progress visible to the group.
4. **Lightweight UX**: Fast entry, minimal setup, minimal gating.

## 3) Core Loop (No Payments Needed)

1. **Create a plan** ("Thing")
2. **Invite friends**
3. **Set commitments + steps**
4. **Post updates**
5. **Track progress**
6. **Celebrate milestones**

## 4) V2 MVP Feature Set (Week 1–2)

### Must-Haves
- **Create a Plan**
  - Name, category, target date/duration, description.
  - Visibility (private or shareable link).
  - Milestone checklist (create, complete, reorder).
- **Invite Friends (email + link)**
  - Add emails up front or share link later.
  - Join with name + emoji.
- **Commitment Status**
  - "I’m In", "Tentative", "Watching" (always visible).
- **Group Progress Bar**
  - Based on commitments + completed steps.
- **Steps / Milestones (Manual)**
  - Per person completion.
- **Check-ins**
  - Lightweight update feed + emoji reactions.

### Engagement Boosters (Still MVP-safe)
- Countdown timer for target date.
- Simple system nudges ("3 people still watching").
- Single-question polls.

### Explicitly NOT in MVP
- In-app payments
- Expense splitting
- DMs
- Complex roles
- Analytics dashboards
- Calendar integrations

## 5) North Star Metric

**Plans that reach “Locked In” status**

Definition:
- At least 60% of members are "I’m In" **and**
- At least one step is completed by 50% of members
- **Before** the target date.

**Supporting metrics**
- Median time to first action (commitment or check-in).
- Silent group rate (no updates after Day 3).
- Plan completion rate.

## 6) Monetization: Memories Mode

### Free Mode
- Plans auto-archive after 90 days.
- Group can see summary snapshot (final status + who was in).
- No detailed check-in replay.

### Paid: Memories Mode
- Plans never expire.
- Full replay of updates, milestones, polls.
- Reopen or duplicate a plan.

**Backend flag suggestion**
- `status`: active | archived
- `archived_at`: timestamp
- `is_permanent`: boolean

## 7) Backend Direction (V2 - Firebase Only)

- V2 routes use Firebase for Auth, database, and file storage.
- User profiles move to Firebase (no Supabase dependency).

## 8) Plan Data Model + Memory Mode (Firebase)

**Plan (plans/{planId})**
- `name`, `category`, `description`, `target_date`
- `visibility`: private | public
- `created_by`, `created_at`, `updated_at`
- `status`: active | archived
- `archived_at`
- `is_permanent`: boolean (Memories Mode)
- `expires_at`: timestamp or null (null if permanent)
- `last_activity_at`
- `invitees`: array of email strings or invite objects
- `milestones`: array of `{ id, text, completed, order }`

**Memberships (plans/{planId}/members/{userId})**
- `role`: creator | admin | member
- `commitment_status`: in | tentative | watching
- `joined_at`

**Invites (plans/{planId}/invites/{inviteId})**
- `email`
- `status`: pending | accepted | expired
- `sent_at`, `accepted_at`

**Memory Mode rule**
- Default `is_permanent = false`
- If not permanent, set `expires_at = target_date + 90 days` (or `created_at + 90` when no target date)
- Archive when `expires_at` passes (set `status=archived`, `archived_at`)

## 9) Create Plan API + Frontend Integration

**API**
- `POST /v2/plans`
- Auth: Firebase ID token (Bearer)
- Server verifies token, creates plan, creates creator membership, stores invites, returns `{ planId }`

**Frontend**
- `app/create-plan/page.js` should POST form data on submit.
- On success: show confirmation + route to dashboard or plan detail.
- On error: surface message and keep user on the form.

## 10) Content + Copy Direction

**Voice**
- Human, social, upbeat.
- Focus on plans, progress, and memories.

**Preferred vocabulary**
- "Plans" instead of pools.
- "Progress" / "Updates" instead of transactions.
- "Memories" instead of completed payments.

## 11) Dashboard Content Direction

Align dashboard UI with the new V2 positioning:

- **Total Income** → **Group Momentum**
- **Payment Overview** → **Goal Progress**
- **Quick Send** → **Quick Update**
- **Recent Activity** → Updates across group plans

Examples:
- "24 milestones this month"
- "Trip to Nairobi — 68% complete"

## 12) Future V2+ (Optional Later Layers)

- Optional contribution tracking (manual).
- "Mark as paid externally."
- Split-cost summaries.
- In-app payments when providers allow.

## 13) UX / UI Notes

- Favor community-driven, celebratory UI.
- Warm gradients, clean white spaces.
- Shimmer/hover effects for CTAs.
- Use the homepage aesthetic as the tone reference.

## 14) UNSDG Alignment (For Partnerships / Grants)

- **SDG 3**: Well-being via shared fitness + accountability.
- **SDG 4**: Education via study groups + skill sprints.
- **SDG 8**: Decent work via side projects + group coordination.
- **SDG 10**: Reduced inequalities via low-cost access.
- **SDG 11**: Community building and shared memory.

---

## Implementation Checklist (Rolling)

- [ ] Replace all fintech language in UI with social/plan language.
- [ ] Build Plan creation + invite flow.
- [ ] Implement Firebase create-plan endpoint + auth guard.
- [ ] Store `is_permanent` + `expires_at` for Memory Mode.
- [ ] Implement commitment statuses.
- [ ] Add steps + check-ins feed.
- [ ] Build archiving flag + Memory Mode logic.
- [ ] Add soft archive messaging (Day 85+ warning).
