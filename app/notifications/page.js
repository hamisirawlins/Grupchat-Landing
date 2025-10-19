"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  ArrowLeft,
  Users,
  FolderOpen,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    in_app: true,
    fcm: true,
    email: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadNotifications();
    loadNotificationSettings();
  }, [user, authLoading, router]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await dashboardAPI.getNotifications({ limit: 100 });

      if (response.success) {
        // Transform backend data to frontend format
        // Handle nested data structure: response.data.data contains the actual notifications
        const notificationsData = response.data.data || response.data || [];

        // Ensure notificationsData is an array
        if (!Array.isArray(notificationsData)) {
          console.error(
            "Notifications data is not an array:",
            notificationsData
          );
          setError("Invalid notifications data format");
          return;
        }

        const transformedNotifications = notificationsData.map(
          (notification) => ({
            id: notification.id,
            type: notification.type || "general",
            title: notification.title || "Notification",
            message:
              notification.message ||
              notification.description ||
              "You have a new notification",
            data: notification.data || {},
            readAt: notification.read_at,
            createdAt: notification.created_at,
          })
        );

        setNotifications(transformedNotifications);
      } else {
        setError(response.message || "Failed to load notifications");
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setError(handleApiError(error, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await dashboardAPI.getNotificationSettings();
      if (response.success) {
        setNotificationSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
      // Don't show error for settings, use defaults
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.readAt;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = async (notificationId) => {
    try {
      setMarkingAsRead((prev) => new Set(prev).add(notificationId));
      setError(null);
      setSuccessMessage(null);

      const response = await dashboardAPI.markNotificationAsRead(
        notificationId
      );

      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, readAt: new Date().toISOString() }
              : notif
          )
        );
        setSuccessMessage("Notification marked as read");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setError(handleApiError(error, "Failed to mark notification as read"));
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      setError(null);
      setSuccessMessage(null);

      const response = await dashboardAPI.markAllNotificationsAsRead();

      if (response.success) {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((notif) =>
            !notif.readAt ? { ...notif, readAt: now } : notif
          )
        );
        setSuccessMessage(
          `Marked ${response.data?.updatedCount || "all"} notifications as read`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(
          response.message || "Failed to mark all notifications as read"
        );
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setError(
        handleApiError(error, "Failed to mark all notifications as read")
      );
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await dashboardAPI.updateNotificationSettings(
        newSettings
      );

      if (response.success) {
        setNotificationSettings(newSettings);
        setShowSettings(false);
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      // Show error toast or handle gracefully
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      pool_invite: Users,
      deposit: ArrowDownLeft,
      withdrawal: ArrowUpRight,
      approval_request: AlertCircle,
      pool_milestone: CheckCircle,
      payment_failed: AlertCircle,
      pool_complete: CheckCircle,
      invitation: Users,
      transaction: ArrowDownLeft,
      membership: Users,
      general: Bell,
      // New backend notification types
      deposit_success: ArrowDownLeft,
      deposit_failed: AlertCircle,
      withdrawal_success: ArrowUpRight,
      withdrawal_failed: AlertCircle,
      payment_success: CheckCircle,
      payment_failed: AlertCircle,
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      pool_invite: "bg-blue-100 text-blue-600",
      deposit: "bg-green-100 text-green-600",
      withdrawal: "bg-purple-100 text-purple-600",
      approval_request: "bg-orange-100 text-orange-600",
      pool_milestone: "bg-emerald-100 text-emerald-600",
      payment_failed: "bg-red-100 text-red-600",
      pool_complete: "bg-green-100 text-green-600",
      invitation: "bg-blue-100 text-blue-600",
      transaction: "bg-green-100 text-green-600",
      membership: "bg-purple-100 text-purple-600",
      general: "bg-gray-100 text-gray-600",
      // New backend notification types
      deposit_success: "bg-green-100 text-green-600",
      deposit_failed: "bg-red-100 text-red-600",
      withdrawal_success: "bg-purple-100 text-purple-600",
      withdrawal_failed: "bg-red-100 text-red-600",
      payment_success: "bg-green-100 text-green-600",
      payment_failed: "bg-red-100 text-red-600",
    };
    return colorMap[type] || "bg-gray-100 text-gray-600";
  };

  const NotificationCard = ({ notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <div
        className={`bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 border transition-all duration-300 hover:shadow-lg ${
          notification.readAt
            ? "border-white/20"
            : "border-purple-200/50 bg-purple-50/30"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3
                className={`font-semibold ${
                  notification.readAt ? "text-gray-900" : "text-gray-900"
                }`}
              >
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                {!notification.readAt && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    disabled={markingAsRead.has(notification.id)}
                    className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mark as read"
                  >
                    {markingAsRead.has(notification.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <p
              className={`text-sm mb-3 ${
                notification.readAt ? "text-gray-600" : "text-gray-700"
              }`}
            >
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* Transaction-specific actions */}
              {notification.type === "deposit_failed" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/pools/${notification.data.poolId}`)
                    }
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-xl text-xs font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {notification.type === "deposit_success" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/pools/${notification.data.poolId}`)
                    }
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-xl text-xs font-medium hover:shadow-lg transition-all duration-300"
                  >
                    View Pool
                  </button>
                </div>
              )}

              {notification.type === "withdrawal_success" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/pools/${notification.data.poolId}`)
                    }
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-xl text-xs font-medium hover:shadow-lg transition-all duration-300"
                  >
                    View Pool
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Stay updated with your pool activities"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Stay updated with your pool activities"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Stay updated with your pool activities"
      >
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load notifications
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={loadNotifications}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay updated with your pool activities"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAllAsRead}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {markingAllAsRead ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark All Read"
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Message Display */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  In-App Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Receive notifications within the app
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.in_app}
                  onChange={(e) =>
                    updateSettings({
                      ...notificationSettings,
                      in_app: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive push notifications on your device
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.fcm}
                  onChange={(e) =>
                    updateSettings({
                      ...notificationSettings,
                      fcm: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) =>
                    updateSettings({
                      ...notificationSettings,
                      email: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-xl font-bold text-orange-600">{unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            filter === "all"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
              : "bg-white/80 backdrop-blur-xl text-gray-700 border border-white/20 hover:bg-white/90"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            filter === "unread"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
              : "bg-white/80 backdrop-blur-xl text-gray-700 border border-white/20 hover:bg-white/90"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notifications found
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "unread"
              ? "All notifications have been read"
              : "Your notifications will appear here"}
          </p>
          <button
            onClick={() => router.push("/pools")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            View Pool
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
