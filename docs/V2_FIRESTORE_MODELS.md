# V2 Firestore Models (Firestore + Firebase Storage)

This document defines the Firestore collection structures based on the V2 schema
architecture and clarifies how image assets are stored in Firebase Storage.

## Collections Overview

- `users` (UserProfile)
- `usernames` (UsernameReservation)
- `plans` (Plan)
- `planMembers` (PlanMember)
- `milestones` (Milestone)
- `images` (ImageAsset)
- `planImages` (PlanImageLink)
- `notifications` (Notification)
- `invitations` (Invitation)
- `notificationPreferences` (NotificationPreferences)
- `feedback` (FeedbackSubmission)
- `planMemories` (PlanMemoryEntry)

## Firestore Models

### users/{userId}
```
{
  id: string,
  email: string,
  displayName: string,
  username: string,
  avatarImageId: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Indexes:
- unique on `username` (via `usernames` collection + security rules)

### usernames/{username}
```
{
  username: string,
  userId: string,
  status: "active" | "released",
  createdAt: Timestamp,
  releasedAt: Timestamp | null
}
```

Notes:
- Store the reservation under the username as the document id for uniqueness.
- Only one active username per user.

### plans/{planId}
```
{
  id: string,
  ownerId: string,
  name: string,
  description: string | null,
  category: string | null,
  status: "active" | "paused" | "completed" | "memory",
  targetDate: Timestamp | null,
  progress: number,
  membersCount: number,
  memoryTier: "standard" | "premium" | null,
  memoryDate: Timestamp | null,
  coverImageId: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Data freshness:
- `membersCount` should be derived from `planMembers` or maintained by
  a Cloud Function on membership change.

### planMembers/{planMemberId}
```
{
  id: string,
  planId: string,
  userId: string,
  role: "owner" | "admin" | "member",
  joinedAt: Timestamp
}
```

Recommended view:
- For plan details, fetch `planMembers` by `planId` and join `users` by `userId`
  to return up-to-date `username`, `displayName`, and `avatarImageId`.

### milestones/{milestoneId}
```
{
  id: string,
  planId: string,
  title: string,
  description: string | null,
  dueDate: Timestamp | null,
  completed: boolean,
  completedAt: Timestamp | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### images/{imageId}
```
{
  id: string,
  ownerId: string,
  planId: string | null,
  type: "profile" | "plan-cover" | "plan-memory" | "message",
  url: string,
  thumbnailUrl: string | null,
  width: number | null,
  height: number | null,
  bytes: number | null,
  mimeType: string | null,
  storagePath: string,
  createdAt: Timestamp
}
```

Notes:
- `url` should be a signed or public download URL generated after upload.
- `storagePath` stores the Firebase Storage path for revocation or cleanup.

### planImages/{planImageId}
```
{
  id: string,
  planId: string,
  imageId: string,
  position: number,
  caption: string | null,
  createdAt: Timestamp
}
```

### notifications/{notificationId}
```
{
  id: string,
  userId: string,
  type: "invitation" | "plan-update" | "reminder" | "system",
  title: string,
  message: string,
  planId: string | null,
  senderId: string | null,
  createdAt: Timestamp,
  readAt: Timestamp | null
}
```

Indexes:
- compound on `userId` + `readAt`
- compound on `userId` + `createdAt`

### invitations/{invitationId}
```
{
  id: string,
  planId: string,
  inviterId: string,
  inviteeUserId: string | null,
  inviteeUsername: string,
  status: "pending" | "accepted" | "declined" | "revoked",
  createdAt: Timestamp,
  respondedAt: Timestamp | null
}
```

Indexes:
- compound on `planId` + `inviteeUsername`

### notificationPreferences/{userId}
```
{
  userId: string,
  appEnabled: boolean,
  emailEnabled: boolean,
  updatedAt: Timestamp
}
```

### feedback/{feedbackId}
```
{
  id: string,
  userId: string,
  message: string,
  status: "new" | "triaged" | "resolved",
  createdAt: Timestamp
}
```

### planMemories/{memoryId}
```
{
  id: string,
  planId: string,
  title: string,
  summary: string,
  highlight: string | null,
  memoryDate: Timestamp,
  tier: "standard" | "premium",
  createdAt: Timestamp
}
```

## Firebase Storage Layout

```
gs://<bucket>/
  users/<userId>/profile/<imageId>
  plans/<planId>/cover/<imageId>
  plans/<planId>/memories/<imageId>
  plans/<planId>/messages/<imageId>
```

Notes:
- Use the same `imageId` for both Firestore and storage object name.
- Store `storagePath` in `images/{imageId}` for quick delete/replace.
- Generate thumbnails via controller-managed jobs and write `thumbnailUrl`.

## Controller Responsibilities (No Cloud Functions)

- Update `plans/{planId}.membersCount` when membership changes.
- Enforce unique username reservations and status transitions.
- Persist `images/{imageId}` metadata after upload and thumbnail generation.
- On invitation acceptance, create `planMembers` and notification records.
- On plan updates, fan out notifications to relevant members.

