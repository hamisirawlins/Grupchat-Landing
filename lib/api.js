import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { debugError, debugLog } from "./debug";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
let resetting = null;

/** Thrown when a request cannot proceed because there is no valid session. */
export class SessionError extends Error {
  constructor(reason = "expired") {
    super("Your session ended. Please sign in again.");
    this.name = "SessionError";
    this.code = "auth/session-ended";
    this.reason = reason;
  }
}

/**
 * Clear the auth session and start over at sign-in with clean state.
 * Signs out of Firebase, drops session storage, and hard-navigates (so no
 * in-memory state survives), preserving where the user was via ?redirect=.
 * Idempotent under concurrent calls; a no-op on auth pages and on the server.
 */
export function resetSession(reason = "expired") {
  if (typeof window === "undefined") return Promise.resolve();
  if (resetting) return resetting;
  resetting = (async () => {
    debugLog("auth", "resetting session", { reason });
    try {
      await signOut(auth);
    } catch {
      /* already signed out */
    }
    try {
      window.sessionStorage.clear();
    } catch {
      /* storage blocked */
    }
    const { pathname, search } = window.location;
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return;
    const params = new URLSearchParams({ reason });
    if (pathname !== "/") params.set("redirect", `${pathname}${search}`);
    window.location.replace(`/sign-in?${params.toString()}`);
  })();
  return resetting;
}

/**
 * Make authenticated API requests
 */
export async function apiRequest(endpoint, options = {}) {
  const method = options.method || "GET";
  try {
    // Let Firebase finish restoring a persisted session before judging it absent.
    if (typeof auth.authStateReady === "function") await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) {
      await resetSession("signed-out");
      throw new SessionError("signed-out");
    }

    let idToken;
    try {
      idToken = await user.getIdToken();
    } catch (error) {
      // Token refresh failed (revoked/disabled account, clock skew, offline).
      if (String(error?.code || "").startsWith("auth/")) {
        await resetSession("expired");
        throw new SessionError("expired");
      }
      throw error;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...options.headers,
      },
      ...options,
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not set. Define it in .env.local or your deployment environment.",
      );
    }

    // Parse the outgoing body once so failures can show what was actually sent.
    let sentBody;
    if (options.body) {
      try {
        sentBody = JSON.parse(options.body);
      } catch {
        sentBody = "«unparseable»";
      }
    }

    debugLog("api", `→ ${method} ${endpoint}`, sentBody);

    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      debugError("api", `← ${response.status} ${method} ${endpoint}`, {
        sent: sentBody,
        status: response.status,
        response: data,
      });
      if (response.status === 401) {
        // The backend rejected our token: the session is over.
        await resetSession("expired");
        throw new SessionError("expired");
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    debugLog("api", `← ${response.status} ${method} ${endpoint}`, data);
    return data;
  } catch (error) {
    if (!(error instanceof SessionError)) {
      console.error(`API request failed: ${method} ${endpoint}`, error?.message || error);
    }
    throw error;
  }
}

/**
 * Dashboard API services
 */
export const dashboardAPI = {
  // Get user profile with insights
  async getUserProfile() {
    return apiRequest("/v1/users/profile");
  },

  // Update user profile
  async updateProfile(profileData) {
    return apiRequest("/v1/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Get user insights
  async getUserInsights() {
    return apiRequest("/v1/users/insights");
  },

  // Get user pools
  async getUserPools() {
    return apiRequest("/v1/users/pools");
  },

  // Get user transactions
  async getUserTransactions(options = {}) {
    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);
    if (options.type) params.append("type", options.type);
    if (options.status) params.append("status", options.status);

    const queryString = params.toString();
    const endpoint = `/v1/users/transactions${
      queryString ? `?${queryString}` : ""
    }`;

    return apiRequest(endpoint);
  },

  // Get pool details
  async getPoolDetails(poolId) {
    return apiRequest(`/v1/pools/${poolId}`);
  },

  // Get pool insights
  async getPoolInsights(poolId) {
    return apiRequest(`/v1/pools/${poolId}/insights`);
  },

  // Create a new pool
  async createPool(poolData) {
    return apiRequest("/v1/pools", {
      method: "POST",
      body: JSON.stringify(poolData),
    });
  },

  // Update an existing pool
  async updatePool(poolId, poolData) {
    return apiRequest(`/v1/pools/${poolId}`, {
      method: "PUT",
      body: JSON.stringify(poolData),
    });
  },

  // Make a deposit to a pool
  async makeDeposit(poolId, depositData) {
    return apiRequest(`/v1/transactions/pools/${poolId}/deposits`, {
      method: "POST",
      body: JSON.stringify(depositData),
    });
  },

  // Record a manual transaction (admin/creator only)
  async recordManualTransaction(poolId, data) {
    return apiRequest(`/v1/transactions/pools/${poolId}/manual`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Initiate a withdrawal from a pool
  async initiateWithdrawal(poolId, withdrawalData) {
    return apiRequest(`/v1/transactions/pools/${poolId}/withdrawals`, {
      method: "POST",
      body: JSON.stringify(withdrawalData),
    });
  },

  // Invitation methods
  async createInvitation(poolId, invitationData) {
    return apiRequest(`/v1/invitations/pools/${poolId}/invitations`, {
      method: "POST",
      body: JSON.stringify(invitationData),
    });
  },

  async getPoolInvitations(poolId) {
    return apiRequest(`/v1/invitations/pools/${poolId}/invitations`);
  },

  async getPendingInvitations() {
    return apiRequest("/v1/invitations/invitations/pending");
  },

  async acceptInvitation(invitationData) {
    return apiRequest("/v1/invitations/invitations/accept", {
      method: "POST",
      body: JSON.stringify(invitationData),
    });
  },

  async declineInvitation(invitationId) {
    return apiRequest(`/v1/invitations/invitations/${invitationId}/decline`, {
      method: "PUT",
    });
  },

  async revokeInvitation(invitationId) {
    return apiRequest(`/v1/invitations/invitations/${invitationId}/revoke`, {
      method: "DELETE",
    });
  },

  async getInvitationByCode(inviteCode) {
    return apiRequest(`/v1/invitations/invitations/code/${inviteCode}`);
  },

  // Notification methods
  async getNotifications(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.offset) queryParams.append("offset", options.offset);
    if (options.unreadOnly)
      queryParams.append("unreadOnly", options.unreadOnly);

    return apiRequest(`/v1/notifications?${queryParams}`);
  },

  async getUnreadNotificationCount() {
    return apiRequest("/v1/notifications/unread-count");
  },

  async markNotificationAsRead(notificationId) {
    return apiRequest(`/v1/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  async markAllNotificationsAsRead() {
    return apiRequest("/v1/notifications/read-all", {
      method: "PUT",
    });
  },

  async getNotificationSettings() {
    return apiRequest("/v1/notifications/settings");
  },

  async updateNotificationSettings(settings) {
    return apiRequest("/v1/notifications/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  async addFCMToken(token) {
    return apiRequest("/v1/notifications/fcm-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async removeFCMToken() {
    return apiRequest("/v1/notifications/fcm-token", {
      method: "DELETE",
    });
  },

  // Get global analytics for homepage
  async getGlobalAnalytics() {
    return apiRequest("/v1/users/analytics/global");
  },

  // Test API connection
  async testConnection() {
    try {
      const response = await apiRequest("/v1/users/insights");
      return {
        success: true,
        message: "API connection successful",
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: "API connection failed",
        error: error.message,
      };
    }
  },

  // Paystack methods
  async initializePaystackTransaction(transactionData) {
    return apiRequest("/core/paystack/initialize", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  },

  async verifyPaystackTransaction(reference) {
    return apiRequest("/core/paystack/verify", {
      method: "POST",
      body: JSON.stringify({ reference }),
    });
  },

  async createPaystackTransferRecipient(recipientData) {
    return apiRequest("/core/paystack/transfer-recipient", {
      method: "POST",
      body: JSON.stringify(recipientData),
    });
  },

  async initiatePaystackTransfer(transferData) {
    return apiRequest("/core/paystack/transfer", {
      method: "POST",
      body: JSON.stringify(transferData),
    });
  },

  async getPaystackBanks(country = "US") {
    return apiRequest(`/core/paystack/banks?country=${country}`);
  },

  async getPaystackPublicKey() {
    return apiRequest("/core/paystack/public-key");
  },
};

/**
 * Plans API services (V2)
 */
export const plansAPI = {
  async createPlan(planData) {
    return apiRequest("/v2/plans", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  },
  async getPlans(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);
    if (options.search) params.append("search", options.search);
    const queryString = params.toString();
    return apiRequest(`/v2/plans${queryString ? `?${queryString}` : ""}`);
  },
  async getPlan(planId) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}`);
  },
  async getPlanMembers(planId) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/members`);
  },
  async getPlanMilestones(planId) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/milestones`);
  },
  async addPlanMilestone(planId, payload) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/milestones`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async updateMilestoneOrder(planId, milestoneIds) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/milestones/order`, {
      method: "PUT",
      body: JSON.stringify({ milestoneIds }),
    });
  },
  async updateMilestoneStatus(planId, milestoneId, completed) {
    if (!planId || !milestoneId) {
      throw new Error("Plan ID and milestone ID required");
    }
    return apiRequest(`/v2/plans/${planId}/milestones/${milestoneId}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    });
  },
  async deletePlanMilestone(planId, milestoneId) {
    if (!planId || !milestoneId) {
      throw new Error("Plan ID and milestone ID required");
    }
    return apiRequest(`/v2/plans/${planId}/milestones/${milestoneId}`, {
      method: "DELETE",
    });
  },
  async updatePlan(planId, payload) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async addPlanImage(planId, payload) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/images`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async getPlanImages(planId) {
    if (!planId) {
      throw new Error("Plan ID required");
    }
    return apiRequest(`/v2/plans/${planId}/images`);
  },
  async deletePlanImage(planId, imageId) {
    if (!planId || !imageId) {
      throw new Error("Plan ID and image ID required");
    }
    return apiRequest(`/v2/plans/${planId}/images/${imageId}`, {
      method: "DELETE",
    });
  },
  // V2 — Resource links
  async addResource(planId, payload) {
    return apiRequest(`/v2/plans/${planId}/resources`, { method: "POST", body: JSON.stringify(payload) });
  },
  async removeResource(planId, resourceId) {
    return apiRequest(`/v2/plans/${planId}/resources/${resourceId}`, { method: "DELETE" });
  },

  // V2 — Check-in feed
  async postCheckin(planId, payload) {
    return apiRequest(`/v2/plans/${planId}/checkin`, { method: "POST", body: JSON.stringify(payload) });
  },
  async getFeed(planId, limit = 20) {
    return apiRequest(`/v2/plans/${planId}/feed?limit=${limit}`);
  },

  // V2 — Invite
  async generateInvite(planId) {
    return apiRequest(`/v2/plans/${planId}/invitations`, { method: "POST" });
  },

  // V2 — Commit (no payment)
  async commitToPlan(planId, commitmentStatus = "in") {
    return apiRequest(`/v2/plans/${planId}/commit`, { method: "POST", body: JSON.stringify({ commitmentStatus }) });
  },

  // V2 — Transactions
  async getPlanTransactions(planId) {
    return apiRequest(`/v2/plans/${planId}/transactions`);
  },
};

// V2 Catalogue API
export const catalogueAPI = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/v2/catalogue${q ? `?${q}` : ""}`);
  },
  async getItem(itemId) {
    return apiRequest(`/v2/catalogue/${itemId}`);
  },
  // Admin
  async createItem(data) {
    return apiRequest("/v2/catalogue", { method: "POST", body: JSON.stringify(data) });
  },
  async updateItem(itemId, data) {
    return apiRequest(`/v2/catalogue/${itemId}`, { method: "PUT", body: JSON.stringify(data) });
  },
  async listAdminPlans() {
    return apiRequest("/v2/plans/admin/plans");
  },
};

// V2 Premium Payments API
export const premiumAPI = {
  async joinPaystack(planId, currency = "KES") {
    return apiRequest(`/v2/plans/${planId}/join-premium/paystack`, { method: "POST", body: JSON.stringify({ currency }) });
  },
  async joinMpesa(planId, phone) {
    return apiRequest(`/v2/plans/${planId}/join-premium/mpesa`, { method: "POST", body: JSON.stringify({ phone }) });
  },
  async contribute(planId, payload) {
    return apiRequest(`/v2/plans/${planId}/contribute`, { method: "POST", body: JSON.stringify(payload) });
  },
  async contributePaystack(planId, payload) {
    return apiRequest(`/v2/plans/${planId}/contribute/paystack`, { method: "POST", body: JSON.stringify(payload) });
  },
  async payout(planId, payload) {
    return apiRequest(`/v2/plans/${planId}/payout`, { method: "POST", body: JSON.stringify(payload) });
  },
  /** Settle a pending transaction against the provider (redirect-back case, KB 22). */
  /** Admin: payouts parked for review, and their resolution (KB D-026). */
  async listPayoutReviews() {
    return apiRequest("/v2/payouts/review");
  },
  async resolvePayout(txId, payload) {
    return apiRequest(`/v2/payouts/${encodeURIComponent(txId)}/resolve`, { method: "POST", body: JSON.stringify(payload) });
  },
  /** With `wait`, the server holds the request until the transaction settles (≤25s) — await it, don't poll. */
  async verifyTransaction(txId, { wait } = {}) {
    const q = wait ? `?wait=${Math.min(Number(wait) || 0, 25)}` : "";
    return apiRequest(`/v2/transactions/${encodeURIComponent(txId)}/verify${q}`);
  },

};

/**
 * Unauthenticated request — for public endpoints only (invite previews).
 */
export async function publicRequest(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not set.");
  debugLog("api", `→ ${options.method || "GET"} ${endpoint} (public)`);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    debugError("api", `← ${response.status} ${endpoint} (public)`, data);
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
}

/** Public invite preview for signed-out visitors (KB 26). */
export const invitesAPI = {
  async preview(code) {
    return publicRequest(`/v2/invites/${encodeURIComponent(code)}/preview`);
  },
};

/** Ledger (KB D-025): append-only journal of money movements, written only by the backend. */
export const ledgerAPI = {
  async list(params = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
    return apiRequest(`/v2/ledger${q ? `?${q}` : ""}`);
  },
  async forPlan(planId, params = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
    return apiRequest(`/v2/ledger/plans/${encodeURIComponent(planId)}${q ? `?${q}` : ""}`);
  },
  async verify(planId) {
    return apiRequest(`/v2/ledger/verify/${encodeURIComponent(planId)}`);
  },
};

/** Audit trail (KB 27). `list` is admin-only (cursor via `before`); `emit` accepts whitelisted ui.* actions. */
export const auditAPI = {
  async list(params = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
    return apiRequest(`/v2/audit/events${q ? `?${q}` : ""}`);
  },
  async emit(event) {
    try {
      return await apiRequest("/v2/audit/events", { method: "POST", body: JSON.stringify(event) });
    } catch {
      return null; // never let telemetry break a screen
    }
  },
};

export const usersAPI = {
  async getMe() {
    return apiRequest("/v2/users/me");
  },
  async updateMe(payload) {
    return apiRequest("/v2/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async uploadAvatar(payload) {
    return apiRequest("/v2/users/me/avatar", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async getInsights(userId) {
    if (!userId) {
      throw new Error("User ID required");
    }
    return apiRequest(`/v2/users/${userId}/insights`);
  },
  async searchUsers(query) {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }
    return apiRequest(`/v2/users/search?q=${encodeURIComponent(query.trim())}`);
  },
};

export const notificationsAPI = {
  async getNotifications(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);
    return apiRequest(`/v2/notifications?${params.toString()}`);
  },
  async getUnreadCount() {
    return apiRequest("/v2/notifications/unread-count");
  },
  async markAsRead(notificationId) {
    return apiRequest(`/v2/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },
  async markAllAsRead() {
    return apiRequest("/v2/notifications/read-all", { method: "PUT" });
  },
};

export const invitationsAPI = {
  async getByCode(inviteCode) {
    return apiRequest(`/v2/invitations/code/${inviteCode}`);
  },
  async accept(payload) {
    return apiRequest("/v2/invitations/accept", { method: "POST", body: JSON.stringify(payload) });
  },
  async getPendingInvitations() {
    return apiRequest("/v2/invitations/pending");
  },
  async getPending() {
    return apiRequest("/v2/invitations/pending");
  },
  async acceptInvitation(invitationId) {
    return apiRequest("/v2/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ invitationId }),
    });
  },
  async declineInvitation(invitationId) {
    return apiRequest(`/v2/invitations/${invitationId}/decline`, {
      method: "PUT",
    });
  },
  async revokeInvitation(invitationId) {
    return apiRequest(`/v2/invitations/${invitationId}/revoke`, {
      method: "DELETE",
    });
  },
  async inviteByUsername(payload) {
    return apiRequest("/v2/invitations/by-username", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const notificationPreferencesAPI = {
  async updatePreferences(payload) {
    return apiRequest("/v2/notification-preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export const feedbackAPI = {
  async submitFeedback(payload) {
    return apiRequest("/v2/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const planMemoriesAPI = {
  async getPlanMemories(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);
    const queryString = params.toString();
    return apiRequest(
      `/v2/plan-memories${queryString ? `?${queryString}` : ""}`,
    );
  },
};

export const uploadsAPI = {
  async uploadImage(payload) {
    return apiRequest("/v2/uploads/image", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

/**
 * Community API services (V2)
 */
export const communityAPI = {
  async getGroups(view = "all") {
    const params = view ? `?view=${encodeURIComponent(view)}` : "";
    return apiRequest(`/v2/community/groups${params}`);
  },

  async getGroup(groupId) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}`);
  },

  async createGroup(body) {
    return apiRequest("/v2/community/groups", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateGroup(groupId, body) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteGroup(groupId) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}`, {
      method: "DELETE",
    });
  },

  async getGroupMembers(groupId) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}/members`);
  },

  async addGroupMember(groupId, email) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async removeGroupMember(groupId, memberId) {
    if (!groupId || !memberId) {
      throw new Error("Group ID and member ID required");
    }
    return apiRequest(
      `/v2/community/groups/${groupId}/members/${memberId}`,
      { method: "DELETE" },
    );
  },

  async leaveGroup(groupId) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}/leave`, {
      method: "POST",
    });
  },

  async getInvite(token) {
    if (!token) {
      throw new Error("Invite token required");
    }
    return apiRequest(`/v2/community/invites/${token}`);
  },

  async acceptInvite(token) {
    if (!token) {
      throw new Error("Invite token required");
    }
    return apiRequest(`/v2/community/invites/${token}/accept`, {
      method: "POST",
    });
  },

  async declineInvite(token) {
    if (!token) {
      throw new Error("Invite token required");
    }
    return apiRequest(`/v2/community/invites/${token}/decline`, {
      method: "POST",
    });
  },

  async bootstrapInvites(groupId, members) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest("/v2/community/invites/bootstrap", {
      method: "POST",
      body: JSON.stringify({ groupId, members }),
    });
  },

  async getGroupGoals(groupId) {
    if (!groupId) {
      throw new Error("Group ID required");
    }
    return apiRequest(`/v2/community/groups/${groupId}/goals`);
  },

  async createGoal(body) {
    return apiRequest("/v2/community/goals", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateGoal(goalId, body) {
    if (!goalId) {
      throw new Error("Goal ID required");
    }
    return apiRequest(`/v2/community/goals/${goalId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteGoal(goalId) {
    if (!goalId) {
      throw new Error("Goal ID required");
    }
    return apiRequest(`/v2/community/goals/${goalId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Error handler for API calls in components
 */
export function handleApiError(
  error,
  fallbackMessage = "Something went wrong",
) {
  console.error("API Error:", error);

  if (error instanceof SessionError || /not authenticated/i.test(error?.message || "")) {
    resetSession("signed-out");
    return;
  }

  // Return user-friendly error message
  return error.message || fallbackMessage;
}

/**
 * Journey API — the MVP user-journeys surface.
 *
 * The journeys doc's Firebase appendix describes the frontend writing to
 * Firestore directly. This app has a different (already deployed) contract:
 * Firebase Auth issues the ID token, and every read/write goes through the
 * gc-payments/gateway REST API above. Writing to Firestore from the client
 * as well would fork the write path and race the backend's payment-owned
 * fields, which the appendix itself forbids ("frontend must not overwrite
 * backend-owned transaction result fields").
 *
 * So this module keeps the REST contract and maps the doc's vocabulary onto
 * it: the doc's `plans.currentAmount` / `requiredAmount` / invite states are
 * read through the V2 endpoints and normalized here.
 */
export const journeyAPI = {
  /**
   * Homepage summary — the "light stats" the doc asks for:
   * active plans, pooled progress, pending invites.
   *
   * Uses allSettled so one failing endpoint degrades a single stat instead of
   * blanking the whole dashboard.
   */
  async getHomeSummary({ limit = 24 } = {}) {
    const [plansRes, invitesRes] = await Promise.allSettled([
      plansAPI.getPlans({ limit, page: 1 }),
      invitationsAPI.getPending(),
    ]);

    const plansPayload =
      plansRes.status === "fulfilled" ? plansRes.value?.data ?? plansRes.value : null;
    const plans = Array.isArray(plansPayload)
      ? plansPayload
      : plansPayload?.plans || [];
    const stats = plansPayload?.stats || null;

    const invitesPayload =
      invitesRes.status === "fulfilled"
        ? invitesRes.value?.data ?? invitesRes.value
        : null;
    const pendingInvites = Array.isArray(invitesPayload)
      ? invitesPayload
      : invitesPayload?.invitations || invitesPayload?.invites || [];

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // Pooled progress across every plan the user is part of.
    let pooled = 0;
    let required = 0;
    let activePlans = 0;
    for (const p of plans) {
      const status = p?.status || "active";
      if (status !== "completed" && status !== "archived") activePlans += 1;
      pooled += num(p?.currentAmount ?? p?.pooledAmount ?? p?.totalContributed);
      required += num(p?.requiredAmount ?? p?.targetAmount);
    }

    return {
      plans,
      stats,
      activePlans,
      totalPlans: stats?.totalPlans ?? plans.length,
      completedPlans: stats?.completedPlans ?? 0,
      pooled,
      required,
      pooledPct: required > 0 ? Math.min(100, (pooled / required) * 100) : 0,
      pendingInvites,
      pendingInviteCount: pendingInvites.length,
      // Surface partial failure so the UI can be honest about a missing stat.
      errors: {
        plans: plansRes.status === "rejected" ? plansRes.reason?.message : null,
        invites: invitesRes.status === "rejected" ? invitesRes.reason?.message : null,
      },
    };
  },

  /**
   * Journey 1 — create a self-managed, M-Pesa-pooled plan.
   * Maps the doc's `type: self_managed` onto the backend's free/pool plan.
   */
  async createSelfManagedPlan({ title, category, description, targetAmount, currency = "KES" }) {
    return plansAPI.createPlan({
      name: title,
      category,
      description,
      targetAmount: Number(targetAmount),
      currency,
      planType: "free",
      poolMode: "pool",
    });
  },

  /** Confirm the final required amount once invites have settled (doc step 3). */
  async finalizeRequiredAmount(id, requiredAmount) {
    return plansAPI.updatePlan(id, { targetAmount: Number(requiredAmount) });
  },
};
