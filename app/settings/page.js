"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import {
  BarChart3,
  Bell,
  FolderOpen,
  Home,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  feedbackAPI,
  handleApiError,
  notificationPreferencesAPI,
  uploadsAPI,
  usersAPI,
} from "@/lib/api";

export default function SettingsPage() {
  const {
    user,
    profile,
    refreshProfile,
    logout,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [notifyApp, setNotifyApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [preferencesError, setPreferencesError] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!profile) return;
    if (typeof profile.displayName === "string") {
      setDisplayName(profile.displayName);
    }
    if (profile.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    if (!profileImage) {
      setProfilePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(profileImage);
    setProfilePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImage]);

  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const response = await usersAPI.updateMe({ username, displayName });
      if (response?.data?.username) {
        setUsername(response.data.username);
      }
      if (typeof response?.data?.displayName === "string") {
        setDisplayName(response.data.displayName);
      }
      await refreshProfile();
      setProfileSuccess("Profile updated.");
    } catch (error) {
      setProfileError(handleApiError(error, "Unable to update profile."));
    } finally {
      setProfileLoading(false);
    }
  };

  const getImageDimensions = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: null, height: null });
      img.src = URL.createObjectURL(file);
    });

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });

  const uploadAvatarImage = async (file) => {
    setAvatarUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const uploadResponse = await uploadsAPI.uploadImage({
        dataUrl,
        fileName: file.name,
        contentType: file.type,
        folder: "users/profile",
      });
      const uploaded = uploadResponse?.data;
      const { width, height } = await getImageDimensions(file);

      await usersAPI.uploadAvatar({
        url: uploaded?.url,
        thumbnailUrl: null,
        mimeType: uploaded?.contentType || file.type,
        bytes: uploaded?.bytes || file.size,
        width,
        height,
        storagePath: uploaded?.storagePath,
      });
      await refreshProfile();
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileImageSelect = async (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setProfileImage(file);
    setProfileSuccess("");
    try {
      await uploadAvatarImage(file);
    } catch (error) {
      setProfileError(handleApiError(error, "Unable to upload profile image."));
    }
  };

  const handlePreferenceUpdate = async (payload) => {
    setPreferencesError("");
    try {
      await notificationPreferencesAPI.updatePreferences(payload);
    } catch (error) {
      setPreferencesError(
        handleApiError(error, "Unable to update preferences."),
      );
    }
  };

  const handleSubmitFeedback = async () => {
    setFeedbackStatus("");
    setFeedbackLoading(true);
    try {
      await feedbackAPI.submitFeedback({ message: feedback });
      setFeedback("");
      setFeedbackStatus("Feedback sent. Thank you!");
    } catch (error) {
      setFeedbackStatus(handleApiError(error, "Unable to send feedback."));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const initials = useMemo(() => {
    const source =
      displayName ||
      username ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      ";)";
    return source
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, username, user]);

  const avatarUrl = profilePreview || profile?.avatarUrl || "";
  const hasAvatar = Boolean(avatarUrl);

  const primaryNavItems = [
    { id: "homepage", label: "Overview", icon: Home },
    { id: "plans", label: "Plans", icon: FolderOpen },
    { id: "plot", label: "Plot", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell },
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
        title="Loading settings"
        subtitle="Preparing your preferences."
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
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Settings
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
              Personalize your experience
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Update your profile, manage notifications, and stay connected with
              your crew.
            </p>
          </div>

          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`h-16 w-16 rounded-2xl text-white flex items-center justify-center text-lg font-semibold overflow-hidden ${
                      hasAvatar ? "bg-transparent" : "bg-[#7a73ff]"
                    }`}
                  >
                    {hasAvatar ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <label
                    className={`absolute -bottom-2 -right-2 bg-white border border-gray-200 rounded-full p-2 shadow-sm cursor-pointer ${
                      avatarUploading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-[#6b63ff]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      disabled={avatarUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your username and profile image.
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={profileLoading || avatarUploading}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-md transition-shadow ${
                  profileLoading || avatarUploading
                    ? "bg-[#b8b5ff] cursor-not-allowed"
                    : "bg-[#7a73ff] hover:shadow-lg"
                }`}
              >
                {avatarUploading || profileLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    Updating...
                  </span>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Update profile
                  </>
                )}
              </button>
            </div>
            {avatarUploading && (
              <p className="mt-4 text-sm text-gray-500">
                Uploading profile image...
              </p>
            )}
            {profileError && (
              <p className="mt-4 text-sm text-red-500">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="mt-4 text-sm text-green-600">{profileSuccess}</p>
            )}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification preferences
                </h2>
                <p className="text-sm text-gray-500">
                  Choose how you want to be notified.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-[#f6f5ff]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#7a73ff]" />
                  <div>
                    <p className="font-medium text-gray-900">App alerts</p>
                    <p className="text-sm text-gray-500">
                      Get real-time notifications inside GrupChat.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyApp}
                    onChange={(event) => {
                      const nextValue = event.target.checked;
                      setNotifyApp(nextValue);
                      handlePreferenceUpdate({ appEnabled: nextValue });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#b8b5ff] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a73ff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#b8b5ff] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a73ff]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-[#f6f5ff]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#7a73ff]" />
                  <div>
                    <p className="font-medium text-gray-900">Email updates</p>
                    <p className="text-sm text-gray-500">
                      Receive summaries and invites via email.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(event) => {
                      const nextValue = event.target.checked;
                      setNotifyEmail(nextValue);
                      handlePreferenceUpdate({ emailEnabled: nextValue });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#b8b5ff] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a73ff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#b8b5ff] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a73ff]"></div>
                </label>
              </div>
            </div>
            {preferencesError && (
              <p className="mt-4 text-sm text-red-500">{preferencesError}</p>
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Feedback
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tell us what would make GrupChat better.
                  </p>
                </div>
              </div>
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[140px] w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={feedbackLoading}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold transition-shadow ${
                  feedbackLoading
                    ? "bg-slate-700/60 cursor-not-allowed"
                    : "bg-[#0b2239] hover:shadow-md"
                }`}
              >
                {feedbackLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  "Send feedback"
                )}
              </button>
              {feedbackStatus && (
                <p className="text-sm text-gray-500">{feedbackStatus}</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fff4e6] text-[#f97316] flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Support
                  </h2>
                  <p className="text-sm text-gray-500">
                    Need help? We are ready when you are.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300">
                  Help center
                  <span className="text-gray-400">→</span>
                </button>
                <button className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300">
                  Contact support
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
