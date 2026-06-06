# Community Feature Requirements

# Community Feature Requirements

## Development Status
- **Current Phase:** Scaffold UI & Feature Development
- **Organization Gating:** TODO - Will be implemented as final step before release
- **Note:** Community feature is currently visible to all users during development. Organization-based access control will be added in the final phase per the Access Control & Organization Gating section below.

### Completed Implementation ✅
- [x] Community Dashboard Layout & Insights Cards (New Goals, Completed Goals, Incomplete Goals, Trends)
- [x] Role-based PM/Member View Toggle for Testing
- [x] Goal Completion Activity Heatmap with System Color Palette
- [x] **Create Group Slideover Panel** (PM-only, form with name & description)
- [x] **Add Goal Slideover Panel** (PM with multi-group targeting, Members with single group, searchable dropdowns with chips)
- [x] System Purple Color Scheme (#7a73ff) Integration throughout UI
- [x] **Manage Groups Page Scaffold** (Groups grid with member/goal counts, action buttons)

### In Progress / TODO
- [ ] Manage Groups Details (Members list, Goals management per group)
- [ ] Group Edit/Delete Functionality
- [ ] Members Management (add, remove, role management)
- [ ] Goal Management per Group
- [ ] Manage Resources Action Panel
- [ ] View Resources Action Panel
- [ ] API Integration for all CRUD operations
- [ ] Organization Gating & Access Control
- [ ] Email Invite Functionality (standard flow)
- [ ] Spreadsheet Invite Token Generation (bootstrap only)

## Feature Scope
- Add a Community section to GrupChat that lets Program Managers (PMs) create and monitor groups, and lets regular members post and update goals.
- Community feature is organization-scoped: users with an assigned organization can access the Community feature; users without an organization will not see or access Community functionality.
- Community sidebar item visibility is conditional on user having an assigned organization.

## Role‑based Access
- **PMs (Organization-level):** Full read-write visibility across all groups within their organization. Can create groups, send invites, remove members, delete groups, create/edit goals for any group or multiple groups, manage all group data and metrics.
- **Members (Group-level):** Can accept/decline group invites, leave groups, add/update goals within their own groups only. Can view read-only data (insights, goals, heatmap) across all groups within their organization.
- **All users with organization:** can view a read-only “Cross‑Group Goals” list and aggregated dashboard metrics within their organization.
- **Users without organization:** cannot access Community feature; sidebar item not visible.

## Data Model
- Define TypeScript interfaces:
  - User (id, name, email, organizationId?: string, role: “pm” | “member” | “admin”) – organizationId optional; users without organization cannot access Community
  - Organization (id, name, createdAt) – Scope for all Community groups and features
  - Group (id, name, members array, goals array, resources array, organizationId, createdAt, updatedAt, createdBy: PM userId)
  - Member (userId, role: “pm” | “member”, status: “invited” | “active” | “left”, joinedAt, inviteToken)
  - Goal (id, title, complexity: “simple” | “medium” | “complex”, status: “todo” | “in-progress” | “done”, groupId, createdBy, createdAt, completedAt, resources: array of {type: “link” | “document”, url, title})
  - Resource (id, title, type: “link” | “document”, url, groupId, createdBy, createdAt) – Group-level or goal-level
  - DashboardInsights (weekNewGoals, weekCompletedGoals, weekIncompleteGoals, trendPercentage, trendDirection)
  - GoalCompletion (userId, goalId, completedDate, complexity, count)

## Access Control & Organization Gating
- **Community Feature Availability:**
  - Feature is only accessible to users with an assigned `organizationId`
  - Users without organization bypass Community entirely
- **Sidebar Visibility:**
  - Community sidebar item (👥 icon) only displays if user has `organizationId` assigned
  - Routes to `/community` are protected; users without organization redirected to main dashboard
- **Data Isolation:**
  - All groups, goals, resources, and metrics are scoped to the user's organization
  - Users only see data from their own organization
  - PMs can only manage groups/goals within their organization
- **API Protection:**
  - All Community API endpoints require valid `organizationId` in request context
  - Requests from users without organization return 403 Forbidden

## API Endpoints
- CRUD for groups (PM action - full access)
- Send invite to member (PM action)
- Accept/decline group invite (Member action)
- Leave group (Member action)
- Remove member from group (PM action)
- Create/update goals (Member action scoped to own groups; PM action can target any group(s) across the organization)
- Fetch group details (PMs see and can edit all; members see own + read-only for others)
- `/groups?view=all` endpoint that returns all groups (full data and edit capabilities for PMs; read-only for members).
- `/api/community/insights` – Returns weekly metrics aggregated across all groups (read-only for members; PMs can drill down to individual group metrics)
- `/api/community/heatmap?weeks=12` – Returns goal completion data aggregated by day across all groups with complexity weighting (read-only visualization for all users; PMs can access underlying group-level data)
- `/api/resources/goals` – CRUD for goal-level resources (documents, links), scoped to user's own goals or PM-managed goals
- `/api/resources/groups` – CRUD for group-level resources (e.g., certifications, shared documents). PMs can manage all; members can view across all groups but manage only within their own groups.
- `/api/invites/:token` – Accept/process group invite via token from spreadsheet link

## UI Components

### Community Dashboard (General View)
The default community page serves as a hub displaying aggregated insights across all member groups (read-only for members, editable for PMs).

#### 1. Insights Cards Section (Top)
Displays weekly statistics aggregated across all groups:
- **New Goals This Week** – Count of goals created this week across all groups
- **Completed Goals** – Count of goals marked as “done” this week across all groups
- **Incomplete Goals** – Count of active/pending goals across all groups
- **Goal Trends** – Visual indicator (e.g., % change vs. previous week across all groups)

Each card displays:
- Large number/metric
- Brief description
- Visual indicator (up/down arrow for trends)
- Consistent styling with project theme colors (purple accents)

Note: All users see these aggregated metrics (organization-wide view). PMs have edit capabilities via the Actions section; members have read-only access to these metrics.

#### 2. Actions Section (Middle)
Context-aware action buttons based on user role:

**For Program Managers (PMs - Organization-level access):**
- **Create Group** – Opens dialog to create a new group
- **Manage Groups** – Navigates to groups management table with options to edit, view members, delete, and manage goals
- **Add Goal** – Opens goal creation form with group multi-select (can create for one, multiple, or all groups at once)
- **Manage Resources** – Opens resources management for group-level resources (e.g., certifications, shared documents) and goal-level resources

**For Group Members (Group-level access):**
- **Add Goal** – Opens goal creation form for their own group(s) only, with option to attach goal-level resources
- **View Resources** – Opens panel displaying group-level resources from all groups (read-only) and their goal-level resources (editable)

Note: PMs have read-write access across all groups and can manage both group-level and goal-level resources. Members have read-only access to group-level resources across all groups but can create/manage goal-level resources within their own goals.

#### 3. Goals Completion Heatmap (Bottom)
Interactive visualization similar to GitHub contributions graph showing aggregated goal completions across all groups:
- **Display:** Grid of weeks (horizontal) × days (vertical) showing goal completion activity across all groups
- **Styling:** Purple gradient theme (light purple → dark purple based on intensity)
- **Metrics:** Number of goals completed per day, weighted by complexity
  - Simple: 1 point
  - Medium: 2 points
  - Complex: 3 points
- **Complexity Indicators:** Color intensity or secondary visual (icon/badge) distinguishing completion levels
- **Interactivity:** Hover to see day details (e.g., “5 goals completed on May 15: 2 simple, 2 medium, 1 complex”)
- **Timeframe:** Typically last 12 weeks or configurable date range
- **Legend:** Color scale showing completion intensity and complexity level mapping

Note: All users see this organization-wide heatmap. PMs can drill down into individual group data via Manage Groups; members see aggregated data only.

### Additional UI Components
- **Goal Editor** – Add/update form with:
  - Title field
  - Complexity selector (dropdown: Simple / Medium / Complex)
  - Status selector (todo / in-progress / done)
  - Goal-level resources section (add links, upload/reference documents)
  - **PM-only: Group Target Selector** – Multi-select dropdown to choose one, multiple, or all groups
- **Group Resources Panel** – Displays group-level resources for viewing by all members across all groups
  - **PM-only: Edit capability** – Add, update, or delete group-level resources for any group
  - **Member view:** Read-only access to all group resources, with ability to manage (add/edit/delete) resources within their own groups
- **Group Leave Confirmation** – Modal confirming member intent to leave group
- **Sidebar entry “Community”** – 👥 icon next to “Groups” (visible only if user has assigned organization; hidden otherwise)
- Group detail view showing members, goals, group-level resources, with action buttons appropriate to the logged‑in role.
- Styling & polish – Apply existing Tailwind CSS classes, implement smooth transitions/animations (Framer Motion) for goal/status updates.
- Navigation – Update routing to include `/community`, `/community/groups`, and `/community/join/:token` for invite processing.

## Initial Cohort Onboarding Strategy (Bootstrap Only)
For the current cohort of established groups - temporary spreadsheet approach for first-time onboarding only:
1. **PM prepares invite links:** Generate invite tokens for existing group members and compile in a shareable spreadsheet (e.g., Google Sheets with format: “Group Name | Member Name | Invite Link”).
2. **Member self-serves:** Members receive spreadsheet access, click their group's invite link, and join instantly.
3. **Standard approach thereafter:** Once initial cohort is onboarded, all subsequent invites are sent via email by PMs (see User Flow #3).

## Design & Visual Theme
- **Color Scheme:** Purple as primary accent (align with project theme), white/light backgrounds, dark text
- **Heatmap Gradient:** Light purple → Medium purple → Dark purple (based on goal completion intensity)
- **Typography:** Consistent with existing GrupChat styling (Tailwind CSS)
- **Icons:** Use react-icons or similar for action buttons (📊 for insights, ➕ for create, 🔗 for resources)
- **Spacing & Layout:** Responsive grid layout with insights cards stacking on mobile
- **Animations:** Smooth transitions on goal/status updates using Framer Motion

## Sample Data Mapping (From RETURNING TRACK CSV)
Based on the manual tracking sheet:
- **Weekly Goals:** Extracted from "WEEK X GOALS" columns (multiple entries per week)
- **Weekly Progress:** Extracted from "WEEK X PROGRESS REPORT" columns (completion status)
- **Goal Status:** Inferred from progress reports (completed vs. pending)
- **Goal Metrics:** Quantifiable goals (e.g., "5 sellers integration", "3 posts across platforms") serve as trackable metrics

## User Flows
1. **PM creates a new group**
   - Opens the Community page.
   - Clicks **Create Group** (PM‑only button).
   - Fills in the group name and confirms.
   - Backend creates the Group record, adds the PM as a member, and generates invite tokens.
   - PM distributes invite links (via spreadsheet or direct link) to target members.

2. **Member joins a group via invite link (Initial Onboarding - Spreadsheet, Bootstrap Only)**
   - Receives a spreadsheet with preset invite links for their respective group(s).
   - Clicks the invite link, which routes to `/community/join/:token`.
   - Backend validates the token and adds the member to the group with status "active".
   - Member can now view group details, see goals, and create/update goals.
   - Note: This is temporary; standard approach uses email invites (see Flow #3).

3. **Member joins a group via email invite (Standard Approach)**
   - PM generates invite token and sends via email with a link to `/community/join/:token`.
   - Member clicks link in email, which routes to the join page.
   - Backend validates the token and adds the member to the group with status "active".
   - Member can now view group details, see goals, and create/update goals.

4. **Member leaves a group**
   - From the group detail view, member clicks **Leave Group**.
   - Backend updates member status to "left" and removes them from active membership.
   - Member loses access to group details and goal collaboration.

5. **Goal creation and tracking**
   - Member clicks **Add Goal** from dashboard or group view.
   - Fills in goal title, selects complexity level (simple/medium/complex), optionally adds resources.
   - Goal is created with status "todo" and appears in group and personal tracking.
   - Member updates goal status as progress is made (todo → in-progress → done).
   - Upon completion, goal is recorded in heatmap with its complexity weight.

6. **PM creates goals for one or multiple groups**
   - PM clicks **Add Goal** from dashboard.
   - Fills in goal title, complexity level, and optionally resources.
   - Selects target group(s):
     - Single group: Select one specific group
     - Multiple groups: Select multiple groups via checkbox or multi-select dropdown
     - All groups: Click "Apply to all groups" option
   - Backend creates the goal in each selected group with PM as creator.
   - Goal appears in all targeted groups' dashboards and in the aggregated heatmap.

7. **PM manages group-level resources**
   - PM clicks **Manage Resources** from dashboard or group detail view.
   - Can add group-level resources (e.g., business certifications, shared documents, links).
   - Selects which group(s) the resource belongs to.
   - Members can view these shared resources from the group's Resources panel but cannot edit them.

8. **Member views and uses group resources**
   - Member clicks **View Resources** from the group detail view or dashboard.
   - Sees group-level resources from all groups (read-only for other groups) and their own goal-level resources.
   - Can add/edit/delete resources only for groups they belong to.
   - Can reference cross-group resources when creating/updating goals within their own groups.

---

# Backend Implementation Plan (gc-payments + Firebase)

> **Added:** Implementation knowledge base for Community backend work in `gc-payments`.  
> **API base path:** `/v2/community` (Firebase `firebaseAuthMiddleware`, same pattern as `/v2/plans`, `/v2/users`).  
> **Frontend client:** `lib/api.js` → `communityAPI` (Bearer token via Firebase Auth).  
> **Do not use:** `/v1/community` in-memory stub for new work; Firebase custom claims for org/role (load from `users` doc only).

## Decisions (locked)

| Topic | Decision |
|-------|----------|
| Organization gating | **Always enforced.** Users without `organizationId` on their `users/{uid}` doc receive **403** on every Community route. No dev bypass env flag. |
| `organizationId` source | Loaded from Firestore `users` doc in middleware — **never** from request body/query. |
| Member creates goal without `groupIds` | **400 Bad Request** with a clear message (e.g. `"groupIds is required and must include at least one group you belong to"`). Do **not** default to all member groups. |
| Group-level vs goal-level resources | `/community/resources` = **group-level only**. **Goal-level resources** live on a dedicated **View Group** page (`/community/groups/[groupId]`) with edit rights based on PM status / active group membership. |
| Auth claims | **Not used.** `organizationId` and `communityRole` live on the user document only. |
| PM multi-group goals | One `communityGoals` document per target `groupId` (batch write). |
| Heatmap points | Simple = 1, Medium = 2, Complex = 3; store events in `goalCompletionEvents` on status → `done`. |
| Group delete | **Soft delete** — set `deletedAt` + `deletedBy` on `communityGroups`; exclude from list/get; members/goals retained. |
| User feedback | **Sonner toasts** (not `alert`) for Community actions. |
| Cohort data | Created manually in Firestore (no seed script). |
| Member remove | **Soft remove** — set `status: "left"` on `communityGroupMembers`; revoke pending invites. |
| Member DELETE path | Uses member record `id` (not `userId`) so invited users without accounts can be removed. |

## Architecture

```
Grupchat-Landing (Next.js)
  └── lib/api.js → communityAPI
        └── Authorization: Bearer <Firebase ID token>
              └── gc-payments /v2/community/*
                    └── firebaseAuthMiddleware
                    └── communityMiddleware (org + role from users doc)
                    └── communityController + communityService
                          └── Firestore (Admin SDK)
```

### Firestore collections

| Collection | Purpose |
|------------|---------|
| `organizations` | Tenant scope (`id`, `name`, `createdAt`) |
| `communityGroups` | Groups (`organizationId`, `name`, `description`, `createdBy`, counts, timestamps) |
| `communityGroupMembers` | Membership (`groupId`, `userId`, `organizationId`, `role`, `status`, `email`, `joinedAt`, `inviteToken`) |
| `communityGoals` | Goals per group (`groupId`, `organizationId`, `title`, `complexity`, `status`, `createdBy`, `completedAt`) |
| `communityResources` | Group-level resources (`groupId`, `organizationId`, `title`, `type`, `url`, `createdBy`) |
| `communityGoalResources` | Goal-level resources (subcollection `communityGoals/{goalId}/resources` or top-level with `goalId`) |
| `communityInvites` | Invite tokens (`groupId`, `email`, `token`, `status`, `expiresAt`) |
| `goalCompletionEvents` | Heatmap source (`organizationId`, `completedDate`, `complexity`, `points`, `goalId`, `groupId`) |

### User document extensions (`users/{uid}`)

```ts
organizationId: string | null   // required for Community access
communityRole: "pm" | "member" | null  // org-level PM vs default member
```

### Composite indexes (create before querying)

- [ ] `communityGroups` — `organizationId` + `createdAt` desc
- [ ] `communityGroupMembers` — `groupId` + `status`; `userId` + `status`; `organizationId` + `userId`
- [ ] `communityGoals` — `groupId` + `status`; `organizationId` + `createdAt`
- [ ] `communityResources` — `groupId` + `createdAt`
- [ ] `communityInvites` — `token` (unique lookup)
- [ ] `goalCompletionEvents` — `organizationId` + `completedDate`

---

## Implementation checklist

Use this section to track progress. Check items as they ship in `gc-payments` and `Grupchat-Landing`.

### Phase 0 — Foundation ✅ COMPLETE

**gc-payments**

- [x] Create `middleware/communityMiddleware.js` — load `users/{uid}`; attach `req.community = { organizationId, communityRole, isPM }`; **403** if `!organizationId`
- [x] Create `services/communityService.js` — shared Firestore helpers, org scoping, count updates
- [x] Create `controllers/v2/communityController.js`
- [x] Create `routes/v2/community.js` — `router.use(firebaseAuthMiddleware)` + `communityMiddleware`
- [x] Mount in `index.js`: `app.use("/v2/community", communityRoutes)`
- [ ] Deprecate or remove in-memory `/v1/community` stub when v2 is wired

**Data / admin**

- [ ] Define `organizations` + assign `organizationId` / `communityRole` on cohort `users` docs (manual in Firestore)
- [ ] Firestore indexes deployed

**Grupchat-Landing**

- [x] Add `communityAPI` object to `lib/api.js` (groups methods; expand as phases ship)
- [ ] Extend `/v2/users/me` consumption to expose `organizationId` + `communityRole` (when backend returns them)
- [ ] Hide Community nav + guard routes when `organizationId` is null (replace dev role toggle with real role when ready)

---

### Phase 1 — Groups ✅ COMPLETE

**Endpoints**

- [x] `GET /v2/community/groups?view=all` — list org groups with `memberCount`, `goalCount`, `canEdit`
- [x] `GET /v2/community/groups/:groupId` — single group (for View Group page)
- [x] `POST /v2/community/groups` — PM only; body `{ name, description? }`; creator added as active PM member
- [x] `PUT /v2/community/groups/:groupId` — PM only; body `{ name, description? }`
- [x] `DELETE /v2/community/groups/:groupId` — PM only; **soft delete** (`deletedAt`, `deletedBy`)

**Response shape (list item — matches Manage Groups UI)**

```json
{
  "id": "abc",
  "name": "Frontend Team",
  "description": "",
  "memberCount": 5,
  "goalCount": 12,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "canEdit": true
}
```

**Grupchat-Landing**

- [x] Wire `CreateGroupForm` → `communityAPI.createGroup`
- [x] Wire `/community/groups` list → `communityAPI.getGroups`
- [x] Wire `EditGroupForm` → `communityAPI.updateGroup`
- [x] Wire `DeleteConfirmationModal` → `communityAPI.deleteGroup`
- [x] Replace mock `mockGroups` on dashboard with `getGroups` for Add Goal dropdown

---

### Phase 2 — Members & invites ✅ COMPLETE

**Endpoints**

- [x] `GET /v2/community/groups/:groupId/members`
- [x] `POST /v2/community/groups/:groupId/members` — PM; body `{ email }`; creates invite + `invited` member stub; returns `inviteUrl`
- [x] `DELETE /v2/community/groups/:groupId/members/:memberId` — PM; soft remove (`status: "left"`)
- [x] `POST /v2/community/groups/:groupId/leave` — member; set `status: "left"`
- [x] `GET /v2/community/invites/:token` — preview for join page
- [x] `POST /v2/community/invites/:token/accept` — authenticated accept (email must match invite)
- [x] `POST /v2/community/invites/:token/decline`
- [x] `POST /v2/community/invites/bootstrap` — PM bulk tokens for spreadsheet cohort
- [ ] `POST /v2/community/invites` — standalone PM email invite (optional; add member endpoint covers standard flow)

**Member list item shape**

```json
{
  "userId": "uid",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "pm",
  "status": "active",
  "joinedAt": "2024-01-15T00:00:00.000Z"
}
```

**Grupchat-Landing**

- [x] Wire `ManageMembersPanel` → get/add/remove members APIs
- [x] Build `/community/join/[token]/page.js` → preview + accept/decline invite
- [x] `communityAPI` — members + invite methods
- [ ] Leave-group confirmation on View Group page (`/community/groups/[groupId]` — not built yet)

---

### Phase 3 — Goals 🚀 IN PROGRESS

**Backend** ✅ COMPLETE

- [x] `GET /v2/community/groups/:groupId/goals`
- [x] `POST /v2/community/goals` — body `{ title, complexity, status, groupIds[] }` or PM `applyToAll: true`
- [x] `PUT /v2/community/goals/:goalId` — status/complexity/title; on `done` set `completedAt` + write `goalCompletionEvents`
- [x] `DELETE /v2/community/goals/:goalId` — PM (optional for members on own goals)

**Frontend** 🚀 IN PROGRESS

- [x] **View Group page** (`/community/groups/[groupId]`) ✅ BUILT
  - [x] Display group info (name, members list, goal count)
  - [x] List goals with status/complexity badges
  - [x] Inline status update buttons (todo → in-progress → done)
  - [x] Goal creation form for group
  - [x] Leave group button (member only)
  - [ ] Goal-level resources placeholder (Phase 5)
- [x] Updated Manage Groups page to navigate to View Group page
- [x] Updated AddGoalForm to support group context
- [x] Added goal API methods to `communityAPI` in lib/api.js

**Validation rules**

- [x] PM: `groupIds` required unless `applyToAll: true` (expands to all org groups)
- [x] Member: `groupIds` **required**; each id must be a group where user has `status: "active"`; else **403**
- [x] Member: missing or empty `groupIds` → **400** `"groupIds is required and must include at least one group you belong to"`

---

### Phase 4 — Dashboard analytics ✅ COMPLETE

**Endpoints**

- [x] `GET /v2/community/insights` — `{ weekNewGoals, weekCompletedGoals, weekIncompleteGoals, trendPercentage, trendDirection }`
- [x] `GET /v2/community/heatmap?weeks=12` — supports `4`, `12`, `26`, `52`; returns weeks/days grid with complexity breakdown

**Heatmap day cell shape**

```json
{
  "date": "2026-02-23",
  "day": 0,
  "count": 5,
  "points": 8,
  "complexity": { "simple": 2, "medium": 2, "complex": 1 }
}
```

**Grupchat-Landing**

- [x] Replaced `mockInsights` on `/community` with `communityAPI.getInsights`
- [x] Replaced random heatmap generator with `communityAPI.getHeatmap(weeks)`; wired date-range select
- [x] Added real goal creation with API calls to community page

---

### Phase 5 — Resources

**Group-level** (`/community/resources` and group management)

- [ ] `GET /v2/community/resources/groups` — all org group resources with `canDelete` flag
- [ ] `POST /v2/community/resources/groups` — body `{ title, type, url, groupId }`
- [ ] `PUT /v2/community/resources/groups/:id`
- [ ] `DELETE /v2/community/resources/groups/:id`

**Goal-level** (View Group page only)

- [ ] `GET /v2/community/goals/:goalId/resources`
- [ ] `POST /v2/community/goals/:goalId/resources`
- [ ] `PUT /v2/community/goals/:goalId/resources/:resourceId`
- [ ] `DELETE /v2/community/goals/:goalId/resources/:resourceId`
- [ ] Document uploads: reuse `/v2/uploads/image` for `type: "document"` URLs

**Access**

- [ ] PM: CRUD group + goal resources for any org group
- [ ] Member: read all group-level resources; CRUD group-level only in own active groups; CRUD goal-level only on goals in own active groups

**Grupchat-Landing**

- [ ] Wire `/community/resources` → group resources API only
- [ ] **View Group page** (`/community/groups/[groupId]`): group info, members summary, goals list, goal-level resource editor per goal
- [ ] PM “Manage Resources” dashboard action → `/community/resources`
- [ ] Member “View Resources” → `/community/resources` (read-focused; edits on own group via View Group)

---

### Phase 6 — Organization gating (production behavior)

- [ ] All `/v2/community/*` routes return **403** when user has no `organizationId` (no env bypass)
- [ ] Sidebar: show Community only when `organizationId` present
- [ ] Route guard: redirect `/community/*` → dashboard if no org
- [ ] Remove PM/Member dev toggle; use `communityRole` from API
- [ ] Cohort bootstrap: organizations + user assignments + spreadsheet invite export

---

### Phase 7 — Polish & ops

- [ ] Email delivery for standard invites (reuse notification/email infra)
- [ ] Denormalized `memberCount` / `goalCount` on group docs (transaction or trigger on member/goal changes)
- [ ] Rate limit invite creation endpoints
- [ ] Firestore security rules: deny client direct writes to community collections (Admin SDK only)
- [ ] Integration tests for org isolation and RBAC

---

## API reference (`communityAPI` — frontend)

Planned methods in `lib/api.js`:

| Method | HTTP | Path |
|--------|------|------|
| `getGroups(view?)` | GET | `/v2/community/groups?view=all` |
| `getGroup(groupId)` | GET | `/v2/community/groups/:groupId` |
| `createGroup(body)` | POST | `/v2/community/groups` |
| `updateGroup(id, body)` | PUT | `/v2/community/groups/:id` |
| `deleteGroup(id)` | DELETE | `/v2/community/groups/:id` |
| `getGroupMembers(groupId)` | GET | `/v2/community/groups/:groupId/members` |
| `addMember(groupId, email)` | POST | `/v2/community/groups/:groupId/members` |
| `removeMember(groupId, userId)` | DELETE | `/v2/community/groups/:groupId/members/:userId` |
| `leaveGroup(groupId)` | POST | `/v2/community/groups/:groupId/leave` |
| `getInsights()` | GET | `/v2/community/insights` |
| `getHeatmap(weeks)` | GET | `/v2/community/heatmap?weeks=` |
| `getGroupGoals(groupId)` | GET | `/v2/community/groups/:groupId/goals` |
| `createGoal(body)` | POST | `/v2/community/goals` |
| `updateGoal(goalId, body)` | PUT | `/v2/community/goals/:goalId` |
| `getGroupResources()` | GET | `/v2/community/resources/groups` |
| `createGroupResource(body)` | POST | `/v2/community/resources/groups` |
| `deleteGroupResource(id)` | DELETE | `/v2/community/resources/groups/:id` |
| `getGoalResources(goalId)` | GET | `/v2/community/goals/:goalId/resources` |
| `createGoalResource(goalId, body)` | POST | `/v2/community/goals/:goalId/resources` |
| `acceptInvite(token)` | POST | `/v2/community/invites/:token/accept` |
| `bootstrapInvites(body)` | POST | `/v2/community/invites/bootstrap` |

**Standard response envelope:** `{ success: true, data: ... }` / `{ success: false, message: "..." }`

---

## UI routes (updated)

| Route | Purpose |
|-------|---------|
| `/community` | Dashboard: insights, heatmap, actions |
| `/community/groups` | PM manage all groups (table/cards) |
| `/community/groups/[groupId]` | **View Group** — group detail, goals, goal-level resources, leave group |
| `/community/resources` | Group-level resources only (PM manage / member view) |
| `/community/join/[token]` | Accept invite |

---

## Sprint order (recommended)

1. **Phase 0 + 1** — middleware, groups CRUD, wire Manage Groups + Create Group  
2. **Phase 2** — members, invites, join page  
3. **Phase 3 + View Group page** — goals + goal resource placeholders  
4. **Phase 4** — insights + heatmap  
5. **Phase 5** — group resources page + goal resources on View Group  
6. **Phase 6** — nav gating, remove dev toggle, cohort seed  
7. **Phase 7** — email invites, counts, hardening  

---

## Known gaps (track during implementation)

- [ ] Member **Add Goal** UI must collect `groupIds` (backend returns **400** if missing)
- [ ] `/community/join/[token]` page not built yet
- [ ] View Group page (`/community/groups/[groupId]`) not built yet — required for goal-level resources
- [ ] Requirements originally listed `/api/community/...`; implementation standardizes on **`/v2/community`**