# V2 Schema Architecture (Frontend-Driven)

This document maps the V2 frontend pages (overview, plans, plot, notifications,
settings) to the data model required to support them. It also covers media
assets (plan images, profile images) and the unique username system used for
plan invites.

## Page-to-Data Map

### Overview (`app/dashboard/page.js`)
- User identity: `UserProfile.displayName`, `UserProfile.avatar`
- Recent plans list: `Plan` with `updated_at`, `created_at`, `progress`
- Milestones summary: `Milestone` with `completed` flag
- Quick actions: plan creation, settings link

### Plans (`app/plans/page.js`)
- Plans list: `Plan` with `status`, `targetDate`, `membersCount`, `progress`
- Plan details: `Plan.description`, `Plan.category`
- Plan status + progress bar: `Plan.progress`, `Plan.status`
- Pagination: `PlanListCursor` or `page/limit` support

### Plot (`app/plot/page.js`)
- Timeline entries: `PlanMemoryEntry` or `Plan` with memory metadata
- Premium visuals: `Plan.isMemory` or `Plan.memoryTier`
- Member avatars/initials: `PlanMember` with `UserProfile.initials`
- Snapshot fields: `Plan.title`, `Plan.summary`, `Plan.memoryMilestone`, `Plan.memoryDate`

### Notifications (`app/notifications/page.js`)
- Categories: invitations, updates, reminders
- Actions: accept/decline invite, mark read, view plan
- Unread counters: `Notification.unread`

### Settings (`app/settings/page.js`)
- Username update: `UserProfile.username` (unique)
- Profile image upload: `UserProfile.avatar` (image asset)
- Preferences: `NotificationPreferences`
- Feedback: `FeedbackSubmission`

## Core Entities

### UserProfile
Represents the authenticated user and public identity.

```
UserProfile {
  id: string (uuid)
  email: string
  displayName: string
  username: string (unique, immutable id, but displayable and updatable)
  avatar: ImageAssetRef | null
  createdAt: datetime
  updatedAt: datetime
}
```

Notes:
- `username` is required for invites. It should be unique and indexed.
- `displayName` can be used for greetings; `username` is for identity/share.
- For onboarding, `username` can be derived from name + suffix.

### UsernameReservation
Tracks uniqueness and changes over time (auditing, conflict checks).

```
UsernameReservation {
  id: string (uuid)
  userId: string (fk UserProfile.id)
  username: string (unique)
  status: "active" | "released"
  createdAt: datetime
  releasedAt: datetime | null
}
```

Rules:
- Only one `active` username per user.
- Changing username releases old reservation.
- Validate format: lowercase, `a-z0-9_`, 3-20 chars.

### Plan
Core plan data used by overview, plans, and plot.

```
Plan {
  id: string (uuid)
  ownerId: string (fk UserProfile.id)
  name: string
  description: string | null
  category: string | null
  status: "active" | "paused" | "completed" | "memory"
  targetDate: date | null
  progress: number (0-100)
  membersCount: number
  createdAt: datetime
  updatedAt: datetime
  memoryTier: "standard" | "premium" | null
  memoryDate: date | null
}
```

### PlanMember
Keeps track of participants for avatars, counts, and permissions.

```
PlanMember {
  id: string (uuid)
  planId: string (fk Plan.id)
  userId: string (fk UserProfile.id)
  role: "owner" | "admin" | "member"
  joinedAt: datetime
}
```

Data freshness:
- Plan detail responses should join `PlanMember` to `UserProfile` to return
  current `username`, `displayName`, and `avatar` (avoid caching stale names).
- `Plan.membersCount` should be computed from `PlanMember` or updated via
  triggers/jobs whenever membership changes.

### Milestone
Used for progress calculations and notifications.

```
Milestone {
  id: string (uuid)
  planId: string (fk Plan.id)
  title: string
  description: string | null
  dueDate: date | null
  completed: boolean
  completedAt: datetime | null
  createdAt: datetime
  updatedAt: datetime
}
```

## Media Assets (Plans + Profile)

### ImageAsset
Stores metadata for uploaded images (plans + profile).

```
ImageAsset {
  id: string (uuid)
  ownerId: string (fk UserProfile.id)
  planId: string | null (fk Plan.id)
  type: "profile" | "plan-cover" | "plan-memory" | "message"
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  bytes: number | null
  mimeType: string | null
  createdAt: datetime
}
```

Notes:
- `planId` is optional to allow profile assets.
- `type` helps organize by use-case (profile vs plan memory).
- Store storage provider metadata if needed (bucket, path, etag).

### PlanImageLink
Optional join table to order images per plan.

```
PlanImageLink {
  id: string (uuid)
  planId: string (fk Plan.id)
  imageAssetId: string (fk ImageAsset.id)
  position: number
  caption: string | null
  createdAt: datetime
}
```

## Notifications

### Notification
Used by the notifications page across invitations, updates, reminders.

```
Notification {
  id: string (uuid)
  userId: string (fk UserProfile.id)
  type: "invitation" | "plan-update" | "reminder" | "system"
  title: string
  message: string
  planId: string | null (fk Plan.id)
  senderId: string | null (fk UserProfile.id)
  createdAt: datetime
  readAt: datetime | null
}
```

### Invitation
Allows invites by username and tracks status.

```
Invitation {
  id: string (uuid)
  planId: string (fk Plan.id)
  inviterId: string (fk UserProfile.id)
  inviteeUserId: string | null (fk UserProfile.id)
  inviteeUsername: string
  status: "pending" | "accepted" | "declined" | "revoked"
  createdAt: datetime
  respondedAt: datetime | null
}
```

Notes:
- `inviteeUsername` is mandatory to support invites by username.
- `inviteeUserId` is resolved when the username is claimed.

## Settings & Preferences

### NotificationPreferences
```
NotificationPreferences {
  userId: string (fk UserProfile.id)
  appEnabled: boolean
  emailEnabled: boolean
  updatedAt: datetime
}
```

### FeedbackSubmission
```
FeedbackSubmission {
  id: string (uuid)
  userId: string (fk UserProfile.id)
  message: string
  createdAt: datetime
  status: "new" | "triaged" | "resolved"
}
```

## Plot/Memory Extensions

### PlanMemoryEntry
Optional timeline entries if we need richer plot data than `Plan`.

```
PlanMemoryEntry {
  id: string (uuid)
  planId: string (fk Plan.id)
  title: string
  summary: string
  highlight: string | null
  memoryDate: date
  tier: "standard" | "premium"
  createdAt: datetime
}
```

## Username Generation & Update Flow

Rules for onboarding:
- Base username from `displayName` (lowercase, remove non-alphanumerics).
- Append a short suffix to ensure uniqueness (e.g. `jane`, `jane17`).
- Reserve via `UsernameReservation` before user creation completes.

Update flow:
- Validate format + uniqueness.
- Create new `UsernameReservation` and set old to `released`.
- Update `UserProfile.username`.

## Indexing & Constraints (Recommended)

- Unique: `UserProfile.username`, `UsernameReservation.username`
- Foreign key indexes: `Plan.ownerId`, `PlanMember.planId`, `PlanMember.userId`
- Notifications: `(userId, readAt)` index for unread counts
- Invitations: `(planId, inviteeUsername)` for lookups

## Future-Ready Fields

- `Plan.coverImageId` (fk ImageAsset.id) for immediate plan thumbnails
- `ImageAsset.tags` or `metadata` for memories (location, people, event date)
- `Notification.actionUrl` to deep-link to plans or invitations

