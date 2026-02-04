# Plan Invitation System - Implementation Checklist

> **⚠️ IMPORTANT: This checklist includes WebSocket real-time notifications with toast UI.**  
> **📊 Progress tracking is shown at the bottom of this document.**  
> **🔄 Always refer to this checklist for invitation system implementation status.**

## 📋 Overview
Complete invitation flow from the "Invite members" button in plan details page to user accepting/declining invitations. Includes real-time WebSocket notifications with toast UI for instant invitation alerts.

---

## ✅ Backend Status Check

### Already Implemented ✅
- [x] **V2 Invitation Controller** (`gc-payments/controllers/v2/invitationController.js`)
  - `inviteByUsername(planId, inviteeUsername)` - Send invite by username
  - `getPendingInvitations()` - Get user's pending invites
  - `acceptInvitation(invitationId)` - Accept an invitation
  - `declineInvitation(invitationId)` - Decline an invitation
  - `revokeInvitation(invitationId)` - Revoke sent invitation

- [x] **V2 Invitation Routes** (`gc-payments/routes/v2/invitations.js`)
  - `POST /v2/invitations/by-username` ✅
  - `GET /v2/invitations/pending` ✅
  - `POST /v2/invitations/accept` ✅
  - `PUT /v2/invitations/:invitationId/decline` ✅
  - `DELETE /v2/invitations/:invitationId/revoke` ✅

- [x] **Firestore Schema**
  - `invitations` collection with proper indexes ✅
  - `planMembers` collection for membership management ✅
  - `notifications` collection for in-app alerts ✅

### Backend Gaps to Fill

- [x] **User Search Endpoint** ✅ COMPLETED
  - Endpoint: `GET /v2/users/search?q={query}` 
  - Returns: List of users matching username/email query
  - **Searches both username and email** ✅
  - Security: Authenticated users only
  - Limit: 10 results max, exclude current user
  - Deduplication: Results are unique by userId
  - Files modified:
    - `gc-payments/controllers/v2/userController.js`
    - `gc-payments/routes/v2/users.js`
    - `Untitled/lib/api.js`

- [ ] **Batch Invite Endpoint** (Optional Enhancement)
  - Need: `POST /v2/invitations/batch` 
  - Accepts: Array of usernames
  - Returns: Success/failure per username

- [ ] **Plan Member Check**
  - Enhance: `inviteByUsername` should check if user is already a member
  - Return: Better error message if duplicate invite

- [ ] **WebSocket Events for Real-Time Invitations**
  - Emit: `invitation:sent` event when invitation created
  - Emit: `invitation:accepted` event when invitation accepted
  - Emit: `invitation:declined` event when invitation declined
  - Room: Join user-specific room `user:{userId}`
  - Payload: `{ invitationId, planId, planName, inviterName, inviterUsername, timestamp }`

---

## 🎨 Frontend Implementation Tasks

### Phase 1: Invite Modal UI ✅ (Partially Complete)
Current button exists but needs modal implementation.

#### Tasks:
- [ ] **1.1: Create InviteMembersModal Component**
  - Location: `components/InviteMembersModal.js`
  - Features:
    - Modal overlay with backdrop
    - Header: "Invite Members to [Plan Name]"
    - Close button (X icon)
    - Search input with debounce
    - Multi-select user list
    - Selected users display (chips)
    - Send button with loading state
    - Success/error messages

- [ ] **1.2: Wire up "Invite members" Button**
  - File: `app/plans/[planId]/page.js`
  - Current line: ~700 (button exists, no onClick)
  - Add: `onClick={() => setInviteModalOpen(true)}`
  - Add state: `const [inviteModalOpen, setInviteModalOpen] = useState(false)`

- [ ] **1.3: Style Consistency**
  - Match purple theme: `#7a73ff`
  - Use existing patterns from memory upgrade modal
  - Rounded corners: `rounded-3xl`
  - Animations: fade-in backdrop

---

### Phase 2: User Search Implementation

#### Tasks:
- [ ] **2.1: Create User Search API Function**
  - File: `lib/api.js`
  - Add to `usersAPI`:
    ```javascript
    async searchUsers(query) {
      return apiRequest(`/v2/users/search?q=${encodeURIComponent(query)}`);
    }
    ```

- [ ] **2.2: Backend User Search Controller**
  - File: `gc-payments/controllers/v2/userController.js`
  - Method: `searchUsers(req, res)`
  - Logic:
    - Get query param
    - Search `usernames` collection (starts with query)
    - Search `users` collection (email/displayName contains query)
    - Combine and deduplicate results
    - Exclude current user
    - Limit to 10 results
    - Return: `{ id, username, displayName, avatarImageId }`

- [ ] **2.3: User Search Route**
  - File: `gc-payments/routes/v2/users.js`
  - Add: `router.get("/search", userControllerV2.searchUsers.bind(userControllerV2))`

- [ ] **2.4: Frontend Search Input with Debounce**
  - File: `components/InviteMembersModal.js`
  - State: `searchQuery`, `searchResults`, `searchLoading`
  - Debounce: 300ms
  - Display: Dropdown with user cards (avatar, username, displayName)

---

### Phase 3: Multi-Select Implementation

#### Tasks:
- [ ] **3.1: Selected Users State Management**
  - State: `const [selectedUsers, setSelectedUsers] = useState([])`
  - Structure: `[{ id, username, displayName, avatarImageId }]`

- [ ] **3.2: User Selection UI**
  - Click user card → Add to `selectedUsers`
  - Display selected users as chips below search
  - Chip design: Purple background, username, X button
  - X button → Remove from `selectedUsers`

- [ ] **3.3: Validation**
  - Prevent duplicate selections
  - Disable already-invited users (check planMembers)
  - Show "Already a member" badge if user is in plan
  - Min 1 user required to send

---

### Phase 4: Send Invitations

#### Tasks:
- [ ] **4.1: Batch Send Function**
  - File: `app/plans/[planId]/page.js`
  - Function: `handleSendInvites()`
  - Logic:
    ```javascript
    const handleSendInvites = async () => {
      setSendingInvites(true);
      const results = await Promise.allSettled(
        selectedUsers.map(user => 
          invitationsAPI.inviteByUsername({
            planId: planId,
            inviteeUsername: user.username
          })
        )
      );
      // Handle successes/failures
      // Show toast with count
      // Close modal
    };
    ```

- [ ] **4.2: Loading States**
  - Disable send button during sending
  - Show spinner + "Sending invites..."
  - Disable modal close during send

- [ ] **4.3: Success Handling**
  - Close modal after send
  - Show toast: "5 invitations sent!"
  - Clear selected users
  - Optionally refresh plan members

- [ ] **4.4: Error Handling**
  - Display failed invites
  - Show specific error per user
  - Allow retry for failed only

---

### Phase 5: Pending Invitations View

#### Tasks:
- [x] **5.1: Invitations Display Section** ✅ NEW
  - Location: `app/plans/[planId]/page.js` (after members section)
  - Shows: Pending invitations sent by user for this plan
  - Fetch: Automatic on plan load
  
- [x] **5.2: Invitation Card Design** ✅ NEW
  - Invitee name/username
  - Date invited
  - Revoke button (amber theme)
  - Loading state on revoke

- [x] **5.3: Revoke Functionality** ✅ NEW
  - Function: `handleRevokeInvite(invitationId)`
  - Updates: Removes from list on success
  - Error handling: Shows error message

- [x] **5.4: Accept/Decline Invitations Received** ✅ COMPLETED
  - Location: `app/notifications/page.js`
  - Features implemented:
    - Accept handler with success message
    - Decline handler with success message  
    - Auto-remove from list on accept/decline
    - Auto-navigate to plan 2 seconds after accept
    - Error handling with user-friendly messages

---

### Phase 6: Notifications Integration

#### Tasks:
- [ ] **6.1: Send Notification on Invite**
  - Backend: `invitationController.inviteByUsername()`
  - After creating invitation:
    ```javascript
    await firebaseService.db.collection('notifications').add({
      userId: inviteeUserId, // if user exists
      type: 'plan_invite',
      title: `${inviterName} invited you to ${planName}`,
      message: `Join the plan to collaborate`,
      data: { planId, invitationId },
      readAt: null,
      createdAt: Timestamp.now()
    });
    ```

- [ ] **6.2: Send Notification on Accept**
  - Backend: `invitationController.acceptInvitation()`
  - Notify inviter:
    ```javascript
    await firebaseService.db.collection('notifications').add({
      userId: inviterId,
      type: 'invite_accepted',
      title: `${accepterName} joined ${planName}`,
      message: `Your invitation was accepted`,
      data: { planId },
      readAt: null,
      createdAt: Timestamp.now()
    });
    ```

- [ ] **6.3: Frontend Notification Display**
  - Already exists in `app/notifications/page.js`
  - Add handlers for `plan_invite` and `invite_accepted` types
  - Clickable → Navigate to plan or invitations page

---

### Phase 7: WebSocket Real-Time Notifications + Toast UI 🔥 NEW

#### Tasks:
- [ ] **7.1: WebSocket Connection Management**
  - File: `lib/websocket.js` (already exists ✅)
  - Enhance: Add invitation-specific event listeners
  - Events:
    ```javascript
    socket.on('invitation:received', (data) => {
      const event = new CustomEvent('invitation-received', { detail: data });
      window.dispatchEvent(event);
    });
    ```

- [ ] **7.2: Toast Notification Component**
  - File: `components/ToastNotification.js` (new)
  - Features: Slide down from top-right, auto-dismiss 5s, stack vertically
  - Action buttons: Accept / Decline / View

- [ ] **7.3: Toast Manager Context**
  - File: `contexts/ToastContext.js` (new)
  - State: `toasts[]` array with queue management
  - Methods: `addToast()`, `removeToast()`, `clearToasts()`

- [ ] **7.4: WebSocket Integration in App Layout**
  - File: `app/layout.js`
  - Connect WebSocket on auth
  - Listen for invitation events
  - Trigger toast on `invitation-received` event

- [ ] **7.5: Toast Actions Handler**
  - Accept/Decline directly from toast
  - View: Navigate to plan page
  - Success: Remove toast, show success message

- [ ] **7.6: Backend WebSocket Server Setup**
  - File: `gc-payments/index.js`
  - Add invitation event emitters in controllers
  - Emit to user-specific rooms

- [ ] **7.7: CSS Animations for Toast**
  - File: `app/globals.css`
  - Add `@keyframes slideDown` and `slideUp`
  - Animation duration: 0.3s ease-out

- [ ] **7.8: Toast Notification Sound (Optional)**
  - File: `public/sounds/notification.mp3`
  - Play subtle sound on invitation received
  - Respect user notification preferences

---

### Phase 8: Revoke Invitations (Inviter Side)

#### Tasks:
- [ ] **7.1: Sent Invitations View**
  - Location: `app/plans/[planId]/page.js` (new tab/section)
  - OR: `app/notifications/page.js` (sent invites tab)
  - Fetch: Need new endpoint `GET /v2/plans/:planId/invitations`
  - Display: List of pending invites sent by current user

- [ ] **7.2: Revoke Button**
  - Show on each pending invite card
  - Function: `handleRevokeInvite(invitationId)`
  - Call: `invitationsAPI.revokeInvitation(invitationId)`
  - Success: Remove from list, show toast

- [ ] **7.3: Backend Endpoint**
  - File: `gc-payments/controllers/v2/invitationController.js`
  - Method: `getPlanInvitations(req, res)` (might already exist)
  - Route: `GET /v2/plans/:planId/invitations`
  - Returns: All invitations for plan (filterable by status)

---

## 🔧 Technical Implementation Details

### User Search Algorithm
```javascript
// Backend: userController.searchUsers()
async searchUsers(req, res) {
  const { q } = req.query;
  const { uid } = req.user;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ success: false, message: "Query too short" });
  }

  const query = q.toLowerCase();
  
  // Search usernames (starts with)
  const usernamesSnap = await firebaseService.db
    .collection("usernames")
    .where("username", ">=", query)
    .where("username", "<=", query + "\uf8ff")
    .where("status", "==", "active")
    .limit(10)
    .get();
  
  const userIds = usernamesSnap.docs.map(doc => doc.data().userId);
  
  // Fetch user details
  const userPromises = userIds.map(id => 
    firebaseService.db.collection("users").doc(id).get()
  );
  
  const userSnaps = await Promise.all(userPromises);
  
  const results = userSnaps
    .filter(snap => snap.exists && snap.id !== uid)
    .map(snap => ({
      id: snap.id,
      username: snap.data().username,
      displayName: snap.data().displayName,
      avatarImageId: snap.data().avatarImageId
    }));
  
  return res.status(200).json({ success: true, data: results });
}
```

### Duplicate Invite Prevention
```javascript
// Backend: invitationController.inviteByUsername()
// Add before creating invitation:

// Check if user is already a member
const memberSnap = await firebaseService.db
  .collection("planMembers")
  .where("planId", "==", planId)
  .where("userId", "==", inviteeUserId)
  .limit(1)
  .get();

if (!memberSnap.empty) {
  return res.status(400).json({
    success: false,
    message: "User is already a member of this plan"
  });
}

// Check for pending invitation
const pendingInviteSnap = await firebaseService.db
  .collection("invitations")
  .where("planId", "==", planId)
  .where("inviteeUsername", "==", inviteeUsername)
  .where("status", "==", "pending")
  .limit(1)
  .get();

if (!pendingInviteSnap.empty) {
  return res.status(400).json({
    success: false,
    message: "User already has a pending invitation"
  });
}
```

---

## 🎯 UI/UX Requirements

### Invite Modal Specifications
- **Size**: Medium (max-w-2xl)
- **Search**: Debounced 300ms, min 2 chars
- **Results**: Show max 10 users
- **User Card**:
  - Avatar (32px circle)
  - Username (bold, primary)
  - Display name (gray, secondary)
  - Status badge if already member
- **Selected Chips**:
  - Purple background `bg-purple-100`
  - Purple text `text-purple-700`
  - X button to remove
  - Max 3 per row, wrap
- **Buttons**:
  - Send: Primary purple, disabled if none selected
  - Cancel: Secondary gray

### Invitation Card (Pending View)
- **Layout**: Horizontal card
- **Avatar**: Left side, 48px
- **Content**: Plan name, inviter, timestamp
- **Actions**: Right side, Accept/Decline buttons
- **States**:
  - Default: White bg, gray border
  - Hover: Purple shadow
  - Loading: Buttons disabled, spinner

---

## 📱 Edge Cases & Validation

### Must Handle:
- [ ] User searches for themselves (filter out)
- [ ] User already invited (show badge "Pending")
- [ ] User already a member (show badge "Member")
- [ ] Network timeout during batch send (retry mechanism)
- [ ] Invitee deletes account (show "User not found")
- [ ] Plan deleted while invitation pending (show error on accept)
- [ ] Multiple invitations to same user (prevent duplicates)
- [ ] Invitation expired (add 7-day expiry check)

---

## 🧪 Testing Checklist

### Manual Testing:
- [ ] Search users by username (partial match)
- [ ] Search users by email (partial match)
- [ ] Select multiple users (5+)
- [ ] Deselect users (remove chips)
- [ ] Send invites to selected users
- [ ] Accept invitation → joins plan
- [ ] Decline invitation → removed from pending
- [ ] Revoke sent invitation
- [ ] Notification appears for invitee
- [ ] Notification appears for inviter on accept

### Error Scenarios:
- [ ] Send invite with no users selected
- [ ] Accept already-accepted invitation
- [ ] Revoke already-accepted invitation
- [ ] Search with 1 character (should require 2+)
- [ ] Network failure during send
- [ ] Backend rate limiting

---

## 📊 Success Metrics
- Time from button click to send: < 10 seconds
- Search results appear: < 500ms
- Invitation delivered: < 2 seconds
- Notification received: < 5 seconds

---

## 🚀 Implementation Priority

### Phase 1 (Critical): Core Flow
1. User search endpoint (backend)
2. Invite modal UI (frontend)
3. Send invitations (batch)
4. Accept/decline flow
5. Basic notifications

### Phase 2 (Important): Enhancements
1. Duplicate prevention
2. Member status badges
3. Revoke functionality
4. Sent invitations view

### Phase 3 (Nice to Have): Polish
1. Real-time updates (on accept)
2. Email notifications
3. Invitation analytics
4. Bulk actions (select all, clear all)

---

## 📝 Notes & Considerations

### Performance:
- Debounce search to avoid excessive API calls
- Batch invites in parallel with Promise.allSettled
- Cache search results for 30 seconds
- Virtualize long lists (if >50 results)

### Security:
- Validate plan ownership/membership before allowing invites
- Rate limit: Max 20 invites per user per hour
- Sanitize username inputs
- Prevent invite spam

### Accessibility:
- Keyboard navigation for search results
- Screen reader labels for buttons
- Focus management in modal
- Escape key closes modal

---

## ✅ Done Criteria

**MVP Complete When:**
1. ✅ Can search users by username from plan details page
2. ✅ Can select multiple users
3. ✅ Can send batch invitations
4. ✅ Invitees receive notification
5. ✅ Invitees can accept/decline from notifications page
6. ✅ Accepting adds user to plan members
7. ✅ Inviter receives notification on accept

**Production Ready When:**
- All edge cases handled
- Error messages user-friendly
- Loading states smooth
- Mobile responsive
- Tested with 100+ users
- Rate limiting active
- Analytics tracking implemented
- **WebSocket real-time notifications working** 🔥
- **Toast UI responsive and accessible**

---58% Complete** ✅
- [x] Invitation CRUD endpoints (5/5)
- [x] Firestore schema (1/1)
- [x] User search endpoint (1/1) ✅ NEW
- [ ] Batch invite endpoint (0/1)
- [ ] Member duplicate check (0/1)
- [ ] WebSocket event emitters (0/3)

**Backend: 7 of 12 tasks = 580/1)
- [ ] Member duplicate check (0/1)
- [ ] WebSocket event emitters (0/3)

**Backend: 7 of 12 tasks = 58%**

### Frontend Status: **59% Complete** 🟢 ⬆️ +12%
- [x] Basic invitation API in `lib/api.js` (1/1)
- [x] WebSocket service exists (1/1)
- [x] Invite modal UI (1/1) ✅
- [x] User search implementation (4/4) ✅
- [x] Multi-select UI (3/3) ✅
- [x] **Send invitations flow (4/4)** ✅
  - [x] Batch send with Promise.allSettled()
  - [x] Loading states and button disable
  - [x] Success message with count
  - [x] Error handling per user
- [x] **Pending invitations view (4/4)** ✅
  - [x] Show invites sent by user for plan
  - [x] Display invitee info and date
  - [x] Revoke button functionality
  - [x] Error handling
- [x] **Received invitations handlers (4/4)** ✅ NEW
  - [x] Accept handler with success message
  - [x] Decline handler with success message
  - [x] Auto-remove from list on action
  - [x] Auto-navigate to plan on accept
- [ ] Notifications integration (0/3)
- [ ] WebSocket toast UI (0/8)

**Frontend: 23 of 32 tasks = 72%**

### **🎯 Overall Progress: 59% Complete** ⬆️ +9%

**Total Completed:** 30 of 44 tasks  
**Remaining:** 14 tasks
**Estimated Time:** 1-2 days for remaining implementation  

### Priority Breakdown:
🔴 **Critical (Must Have):** 20 tasks (45%)  
🟡 **Important (Should Have):** 14 tasks (32%)  
🟢 **Enhancement (Nice to Have):** 10 tasks (23%)  

### Next 3 Tasks:
1. � **Backend:** Add notification creation on invite send (1-2 hours)
2. 🟡 **Backend:** Add notification creation on invite accept (1 hour)
3. 🔥 **Frontend:** WebSocket toast component (3-4 hours)

---

## 🎯 Quick Reference

**Key Files to Modify:**
- `gc-payments/controllers/v2/userController.js` - Add search
- `gc-payments/controllers/v2/invitationController.js` - WebSocket emitters
- `app/plans/[planId]/page.js` - Invite button & modal
- `components/InviteMembersModal.js` - NEW
- `components/ToastNotification.js` - NEW
- `contexts/ToastContext.js` - NEW
- `lib/api.js` - Add searchUsers
- `app/globals.css` - Toast animations

---

**📌 Remember: This progress tracker updates with each implementation phase.**  
**🔄 Always check this section at the end for current status.**  
**💡 Current focus: Backend user search + Frontend invite modal.**
