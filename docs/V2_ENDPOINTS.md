# V2 URLs to Set Up (Frontend Screens)

This list maps the V2 frontend screens (dashboard, plans, plot, notifications,
settings) to the API routes required to power them.

## Dashboard (Overview)

- `GET /v2/plans?limit=10&page=1`
  - Used for recent plans list.
- `GET /v2/plans/:planId`
  - Used to open a plan from recent list.
- `GET /v2/users/:userId/insights`
  - Dashboard summaries: yearly milestone count, top 4 interacted plans,
    and last active users (for the 6 most recent interactions within the
    user’s plans). Bar chart stays static on the client.
  - Response should include:
    - `yearlyMilestoneCount`
    - `topPlans` (limit 4)
    - `recentActiveUsers` (limit 6, include avatar image ids/urls)

## Plans

- `GET /v2/plans?limit=&page=&search=`
  - Paginated plans list with optional search by plan name.
- `POST /v2/plans`
  - Create plan.
- `GET /v2/plans/:planId`
  - Plan detail.
- `PUT /v2/plans/:planId`
  - Update plan meta (name, description, status, targetDate, coverImageId).
- `GET /v2/plans/:planId/members`
  - Up-to-date member list (join with users).
- `GET /v2/plans/:planId/milestones`
  - List milestones for progress.

## Plot

- `GET /v2/plan-memories?limit=&page=`
  - Timeline view for memory entries.
- `GET /v2/plans?status=memory`
  - Alternate approach if using plans-as-memories.
- `GET /v2/plans/:planId/members`
  - Avatar/initials for timeline cards.

## Notifications

- `GET /v2/notifications?limit=&offset=&unreadOnly=`
  - List notifications.
- `GET /v2/notifications/unread-count`
  - Unread badge counts.
- `PUT /v2/notifications/:notificationId/read`
  - Mark one read.
- `PUT /v2/notifications/read-all`
  - Mark all read.

### Invitations (Notifications actions)

- `GET /v2/invitations/pending`
  - Pending invites for the user.
- `POST /v2/invitations/accept`
  - Accept invite.
- `PUT /v2/invitations/:invitationId/decline`
  - Decline invite.
- `DELETE /v2/invitations/:invitationId/revoke`
  - Revoke invite (owner/admin).
- `GET /v2/invitations/code/:inviteCode`
  - Resolve invite from code (optional).
- `POST /v2/invitations/by-username`
  - Invite by username.

## Settings

- `GET /v2/users/me`
  - Current user profile.
- `PUT /v2/users/me`
  - Update display name and username.
- `POST /v2/users/me/avatar`
  - Upload profile image (returns `imageId` + URLs).
- `PUT /v2/notification-preferences`
  - Update notification preferences.
- `POST /v2/feedback`
  - Submit feedback.

## Media (Plans)

- `POST /v2/plans/:planId/images`
  - Upload plan cover or memory image.
- `GET /v2/plans/:planId/images`
  - List plan images.
- `DELETE /v2/plans/:planId/images/:imageId`
  - Remove an image.

## Utilities

- `POST /v2/uploads/image`
  - Uploads a file to Firebase Storage and returns `url` + `storagePath`.
