# V2 Frontend Page Integration Checklist

Use this checklist to wire each V2 page to the corresponding endpoints and
data models. Check items as the frontend integrations are completed.

## Dashboard (Overview) — `app/dashboard/page.js`

- [x] Load `GET /v2/users/:userId/insights`
  - Map: `yearlyMilestoneCount` → “Group Momentum” count
  - Map: `topPlans` (limit 4) → “Goal Progress” cards
  - Map: `recentActiveUsers` (limit 6) → avatar row (currently placeholder circles)
- [x] Load recent plans via `GET /v2/plans?limit=10&page=1`
- [x] Hook “Post update” action to `/plans` (already wired)

## Plans — `app/plans/page.js`

- [x] Load `GET /v2/plans?limit=&page=` for list + pagination
- [ ] Wire “Open” → `GET /v2/plans/:planId` (detail page)
- [ ] Wire “Create plan” → `POST /v2/plans`

## Plan Detail — `app/plans/[planId]/page.js`

- [x] Load `GET /v2/plans/:planId`
- [x] Load members `GET /v2/plans/:planId/members`
- [x] Load milestones `GET /v2/plans/:planId/milestones`
- [x] Update plan `PUT /v2/plans/:planId`
- [x] Upload plan images `POST /v2/plans/:planId/images`
- [x] List plan images `GET /v2/plans/:planId/images`
- [x] Delete plan image `DELETE /v2/plans/:planId/images/:imageId`

## Plot — `app/plot/page.js`

- [x] Load `GET /v2/plan-memories?limit=&page=`
- [x] Map `PlanMemoryEntry` fields to timeline cards

## Notifications — `app/notifications/page.js`

- [x] Load `GET /v2/notifications?limit=&offset=&unreadOnly=`
- [x] Load `GET /v2/notifications/unread-count`
- [x] Mark read `PUT /v2/notifications/:notificationId/read`
- [x] Mark all read `PUT /v2/notifications/read-all`
- [x] Load invites `GET /v2/invitations/pending`
- [x] Accept invite `POST /v2/invitations/accept`
- [x] Decline invite `PUT /v2/invitations/:invitationId/decline`
- [x] Revoke invite `DELETE /v2/invitations/:invitationId/revoke`
- [x] Invite by username `POST /v2/invitations/by-username`

## Settings — `app/settings/page.js`

- [x] Load profile `GET /v2/users/me`
- [x] Update profile `PUT /v2/users/me`
- [x] Upload avatar `POST /v2/users/me/avatar`
- [x] Update preferences `PUT /v2/notification-preferences`
- [x] Submit feedback `POST /v2/feedback`
