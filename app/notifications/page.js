"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  FolderOpen,
  Home,
  Menu,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  handleApiError,
  invitationsAPI,
  notificationsAPI,
  plansAPI,
} from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";

export default function NotificationsPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [invitesError, setInvitesError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [invitePlanId, setInvitePlanId] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [planOptions, setPlanOptions] = useState([]);
  const [planSearch, setPlanSearch] = useState("");
  const [planSearchLoading, setPlanSearchLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState(null);
  const [decliningInviteId, setDecliningInviteId] = useState(null);
  const [revokingInviteId, setRevokingInviteId] = useState(null);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchNotifications();
    fetchInvitations();
    fetchUnreadCount();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    const timeoutId = setTimeout(() => {
      fetchPlanOptions(planSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [planSearch, authLoading, user]);

  const toDateValue = (value) => {
    if (!value) return null;
    if (typeof value === "string") return new Date(value);
    if (typeof value?.seconds === "number")
      return new Date(value.seconds * 1000);
    if (typeof value?._seconds === "number")
      return new Date(value._seconds * 1000);
    return null;
  };

  const formatTime = (value) => {
    const date = toDateValue(value);
    if (!date || Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setNotificationsError("");
    try {
      const response = await notificationsAPI.getNotifications({
        limit: 50,
        offset: 0,
      });
      setNotifications(response?.data ?? []);
    } catch (error) {
      setNotificationsError(
        handleApiError(error, "Unable to load notifications."),
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response?.data?.count ?? 0);
    } catch (error) {
      setNotificationsError(
        handleApiError(error, "Unable to load unread count."),
      );
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    setInvitesError("");
    try {
      const response = await invitationsAPI.getPendingInvitations();
      setInvitations(response?.data ?? []);
    } catch (error) {
      setInvitesError(handleApiError(error, "Unable to load invitations."));
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchPlanOptions = async (searchValue) => {
    setPlanSearchLoading(true);
    try {
      const response = await plansAPI.getPlans({
        limit: 10,
        page: 1,
        search: searchValue || undefined,
      });
      const plans = response?.data?.plans ?? [];
      setPlanOptions(
        plans.map((plan) => ({
          name: plan.name || "Untitled plan",
          code: plan.id,
        })),
      );
    } catch (error) {
      setInviteStatus(handleApiError(error, "Unable to load plans."));
    } finally {
      setPlanSearchLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      setNotificationsError(
        handleApiError(error, "Unable to mark notifications as read."),
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      setNotificationsError(
        handleApiError(error, "Unable to mark notification as read."),
      );
    }
  };

  const handleAcceptInvite = async (invitationId, planId) => {
    setAcceptingInviteId(invitationId);
    setInviteSuccessMessage("");
    setInvitesError("");
    try {
      const response = await invitationsAPI.acceptInvitation(invitationId);
      
      // Show success message
      setInviteSuccessMessage("✓ Invitation accepted! You're now a member of this plan.");
      
      // Remove accepted invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Optional: Navigate to the plan after 2 seconds
      if (planId) {
        setTimeout(() => {
          router.push(`/plans/${planId}`);
        }, 2000);
      }
    } catch (error) {
      setInvitesError(handleApiError(error, "Unable to accept invitation."));
    } finally {
      setAcceptingInviteId(null);
    }
  };

  const handleDeclineInvite = async (invitationId) => {
    setDecliningInviteId(invitationId);
    setInviteSuccessMessage("");
    setInvitesError("");
    try {
      await invitationsAPI.declineInvitation(invitationId);
      
      // Show success message
      setInviteSuccessMessage("Invitation declined.");
      
      // Remove declined invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      setInvitesError(handleApiError(error, "Unable to decline invitation."));
    } finally {
      setDecliningInviteId(null);
    }
  };

  const handleRevokeInvite = async (invitationId) => {
    setRevokingInviteId(invitationId);
    try {
      await invitationsAPI.revokeInvitation(invitationId);
      fetchInvitations();
    } catch (error) {
      setInvitesError(handleApiError(error, "Unable to revoke invitation."));
    } finally {
      setRevokingInviteId(null);
    }
  };

  const handleInviteByUsername = async () => {
    setInviteStatus("");
    if (!invitePlanId.trim() || !inviteUsername.trim()) {
      setInviteStatus("Plan and username are required.");
      return;
    }
    setSendingInvite(true);
    try {
      await invitationsAPI.inviteByUsername({
        planId: invitePlanId.trim(),
        inviteeUsername: inviteUsername.trim(),
      });
      setInvitePlanId("");
      setInviteUsername("");
      setInviteStatus("Invite sent.");
      fetchInvitations();
    } catch (error) {
      setInviteStatus(handleApiError(error, "Unable to send invite."));
    } finally {
      setSendingInvite(false);
    }
  };

  const notificationGroups = useMemo(() => {
    const updates = [];
    const reminders = [];
    notifications.forEach((item) => {
      if (item.type === "reminder") {
        reminders.push(item);
      } else {
        updates.push(item);
      }
    });
    return { updates, reminders };
  }, [notifications]);

  const primaryNavItems = [
    { id: "homepage", label: "Overview", icon: Home },
    { id: "plans", label: "Plans", icon: FolderOpen },
    { id: "plot", label: "Plot", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell, active: true },
  ];

  const accountNavItems = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handlePrimaryNavClick = (item) => {
    if (item.id === "homepage") {
      setActiveTab(item.id);
      router.push("/dashboard");
      return;
    }
    router.push(`/${item.id}`);
  };

  const handleAccountNavClick = (item) => {
    setActiveTab(item.id);
    router.push(`/${item.id}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <DashboardLoading
        title="Loading notifications"
        subtitle="Gathering the latest updates."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f4ff] via-white to-[#eef2ff] flex overflow-hidden relative">
      <DashboardSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        primaryNavItems={primaryNavItems}
        accountNavItems={accountNavItems}
        activeTab={activeTab}
        onPrimaryNavClick={handlePrimaryNavClick}
        onAccountNavClick={handleAccountNavClick}
        onLogout={handleLogout}
        user={user}
        profile={profile}
      />

      <main className="flex-1 lg:ml-80 min-w-0 relative">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 lg:pb-20 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Notifications
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
                Stay in sync with your plans
              </h1>
              <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                Invitations, plan updates, and reminders live here so your crew
                stays aligned.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {unreadCount} unread notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold shadow-sm transition-shadow ${
                  markingAllRead
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:shadow-md"
                }`}
              >
                {markingAllRead ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400/70 border-t-transparent" />
                    Marking...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#6b63ff]" />
                    Mark all read
                  </>
                )}
              </button>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Invitations
              </h2>
              <span className="text-xs font-semibold text-[#6b63ff]">
                {invitations.length} new
              </span>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Invite by username
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[240px]">
                  <SearchableSelect
                    options={planOptions}
                    value={invitePlanId}
                    onChange={(value) => setInvitePlanId(value)}
                    onQueryChange={(value) => setPlanSearch(value)}
                    placeholder={
                      planSearchLoading ? "Searching plans..." : "Search plans"
                    }
                    className="w-full"
                  />
                </div>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(event) => setInviteUsername(event.target.value)}
                  placeholder="Username"
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                />
                <button
                  onClick={handleInviteByUsername}
                  disabled={sendingInvite}
                  className={`px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm transition-shadow ${
                    sendingInvite
                      ? "bg-[#b8b5ff] cursor-not-allowed"
                      : "bg-[#7a73ff] hover:shadow-md"
                  }`}
                >
                  {sendingInvite ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    "Send invite"
                  )}
                </button>
              </div>
              {inviteStatus && (
                <p className="text-sm text-gray-500">{inviteStatus}</p>
              )}
            </div>
            {inviteSuccessMessage && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-green-700">{inviteSuccessMessage}</p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        {formatTime(invite.createdAt)}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mt-1">
                        {invite.title || "Plan invitation"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {invite.message || "You were invited to join a plan."}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Invited by {invite.inviterName || "a teammate"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id, invite.planId)}
                      disabled={acceptingInviteId === invite.id}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-shadow ${
                        acceptingInviteId === invite.id
                          ? "bg-[#b8b5ff] text-white cursor-not-allowed"
                          : "bg-[#7a73ff] text-white hover:shadow-md"
                      }`}
                    >
                      {acceptingInviteId === invite.id ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                          Accepting...
                        </>
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      disabled={decliningInviteId === invite.id}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-shadow ${
                        decliningInviteId === invite.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {decliningInviteId === invite.id ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400/70 border-t-transparent" />
                          Declining...
                        </>
                      ) : (
                        "Decline"
                      )}
                    </button>
                    {invite.inviterId === user?.uid && (
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={revokingInviteId === invite.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                          revokingInviteId === invite.id
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:text-red-600"
                        }`}
                      >
                        {revokingInviteId === invite.id ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Revoking...
                          </>
                        ) : (
                          "Revoke"
                        )}
                      </button>
                    )}
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600">
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
              {!loadingInvitations && invitations.length === 0 && (
                <p className="text-sm text-gray-500">
                  No invitations right now.
                </p>
              )}
              {invitesError && (
                <p className="text-sm text-red-500">{invitesError}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Plan updates
              </h2>
              <span className="text-xs font-semibold text-gray-400">
                Latest activity
              </span>
            </div>
            <div className="space-y-4">
              {notificationGroups.updates.map((update) => (
                <div
                  key={update.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#e9f7f3] text-[#22c55e] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">
                        {formatTime(update.createdAt)}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mt-1">
                        {update.title || "Plan update"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {update.message || "A plan was updated."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      update.planId
                        ? router.push(`/plans/${update.planId}`)
                        : null
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f3f1ff] text-[#6b63ff] text-xs font-semibold hover:bg-[#e6e4ff]"
                  >
                    View plan
                  </button>
                  <button
                    onClick={() => handleMarkRead(update.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    Mark read
                  </button>
                </div>
              ))}
              {!loadingNotifications &&
                notificationGroups.updates.length === 0 && (
                  <p className="text-sm text-gray-500">No updates yet.</p>
                )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
              <span className="text-xs font-semibold text-gray-400">
                Keep momentum
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {notificationGroups.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#fff4e6] text-[#f97316] flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">
                        {formatTime(reminder.createdAt)}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mt-1">
                        {reminder.title || "Reminder"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {reminder.message || "Stay on track with your plan."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b2239] text-white text-xs font-semibold hover:shadow-md transition-shadow">
                      Take action
                    </button>
                    <button
                      onClick={() => handleMarkRead(reminder.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600"
                    >
                      Mark read
                    </button>
                    <button className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
              {!loadingNotifications &&
                notificationGroups.reminders.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No reminders right now.
                  </p>
                )}
              {notificationsError && (
                <p className="text-sm text-red-500">{notificationsError}</p>
              )}
            </div>
          </section>

          <section className="bg-[#0b2239] text-white rounded-[32px] p-6 sm:p-8 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Plan Updates
              </p>
              <h3 className="text-xl font-semibold mt-3">
                Keep every plan moving
              </h3>
              <p className="text-sm text-white/70 mt-2 max-w-xl">
                Invite your crew, log progress, and save every completed plan as
                a Memory.
              </p>
            </div>
            <button
              onClick={() => router.push("/plans")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0b2239] text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              <Bell className="w-4 h-4" />
              Post an update
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
