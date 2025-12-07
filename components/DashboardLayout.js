"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";
import {
  LogOut,
  User,
  Settings,
  Home,
  BarChart3,
  FolderOpen,
  Bell,
  Menu,
  X,
} from "lucide-react";

function DashboardLayoutContent({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileDataLoading, setProfileDataLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const loadProfileData = async () => {
    try {
      setProfileDataLoading(true);
      setProfileError(null);
      const response = await dashboardAPI.getUserProfile();
      if (response.success) {
        const userData = response.data.user;
        setProfileData({
          displayName: userData.displayName || "",
          phone: formatPhoneForDisplay(userData.phone || ""),
        });
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
      setProfileError("Failed to load profile data");
    } finally {
      setProfileDataLoading(false);
    }
  };

  // Phone number formatting functions (same as settings page)
  const formatPhoneForAPI = (localPhone) => {
    if (!localPhone) return "";

    // Convert local format to international
    let internationalPhone = localPhone;

    // Handle Kenya numbers (0 -> +254)
    if (localPhone.startsWith("0")) {
      internationalPhone = "+254" + localPhone.substring(1);
    } else if (localPhone.startsWith("254")) {
      internationalPhone = "+" + localPhone;
    } else if (!localPhone.startsWith("+")) {
      // Assume it's a local number, add +254 for Kenya
      internationalPhone = "+254" + localPhone;
    }

    return internationalPhone;
  };

  const formatPhoneForDisplay = (internationalPhone) => {
    if (!internationalPhone) return "";

    // Remove + and convert to local format
    const cleanPhone = internationalPhone.replace("+", "");

    // Handle Kenya numbers (254)
    if (cleanPhone.startsWith("254")) {
      return "0" + cleanPhone.substring(3);
    }

    // Handle other countries (add more as needed)
    if (cleanPhone.startsWith("1")) {
      // US/Canada
      return cleanPhone;
    }

    return cleanPhone;
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";

    const digits = phone.replace(/\D/g, "");

    // Kenya mobile number validation
    if (digits.startsWith("254")) {
      // International format: +254712345678
      if (digits.length !== 12) {
        return "Kenya international number must be 12 digits (254 + 9 digits)";
      }
      // Validate that the part after 254 is a valid mobile prefix
      const mobilePart = digits.substring(3);
      if (!/^[17]\d{8}$/.test(mobilePart)) {
        return "Invalid Kenya mobile number format after 254";
      }
    } else if (digits.startsWith("07") || digits.startsWith("01")) {
      // Local format: 0712345678 or 0112345678
      if (digits.length !== 10) {
        return "Kenya local number must be 10 digits (07XX XXX XXX)";
      }
      // Validate mobile prefixes (07) and landline prefixes (01)
      if (digits.startsWith("07")) {
        // Mobile: 07XX XXX XXX
        if (!/^07[17]\d{7}$/.test(digits)) {
          return "Invalid Kenya mobile number format (07XX XXX XXX)";
        }
      } else if (digits.startsWith("01")) {
        // Landline: 01XX XXX XXX
        if (!/^01\d{8}$/.test(digits)) {
          return "Invalid Kenya landline number format (01XX XXX XXX)";
        }
      }
    } else {
      return "Please enter a valid Kenya phone number starting with 07, 01, or +254";
    }

    // Additional validation: check for suspicious patterns
    if (/(\d)\1{5,}/.test(digits)) {
      return "Phone number contains too many repeated digits";
    }

    if (/^0+$/.test(digits)) {
      return "Phone number cannot be all zeros";
    }

    return "";
  };

  const handleProfileUpdate = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      // Validate phone number
      const phoneError = validatePhone(profileData.phone);
      if (phoneError) {
        setProfileError(phoneError);
        setProfileLoading(false);
        return;
      }

      // Format phone for API
      const internationalPhone = formatPhoneForAPI(profileData.phone);

      const response = await dashboardAPI.updateProfile({
        displayName: profileData.displayName,
        phone: internationalPhone,
      });

      if (response.success) {
        // Reload profile data from Supabase to update client-side state
        await loadProfileData();

        setProfileSuccess(true);
        setTimeout(() => {
          setProfileSuccess(false);
          setShowProfileModal(false);
        }, 1500);
      } else {
        setProfileError(response.message || "Failed to update profile");
      }
    } catch (error) {
      setProfileError(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Homepage", icon: Home, path: "/dashboard" },
    { id: "pools", label: "Pools", icon: FolderOpen, path: "/pools" },
    {
      id: "transactions",
      label: "Transactions",
      icon: BarChart3,
      path: "/transactions",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isActivePage = (path) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 fixed h-full z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="GrupChat Logo"
                  className="w-16 h-16 object-cover"
                />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat
              </span>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Label */}
        <div className="px-6 pb-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Dashboard
          </h2>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActivePage(item.path)
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </button>
            </div>
          ))}
        </nav>

        {/* User Profile Section - Sticky to Bottom */}
        <div className="p-4 border-t border-white/20 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setShowProfileModal(true);
                loadProfileData();
              }}
              className="flex items-center gap-3 flex-1 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.displayName || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="GrupChat Logo"
                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {title || `Hey, ${user?.displayName || "User"}`}
                </h1>
                <p className="text-sm text-gray-500">
                  {subtitle || getCurrentDate()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white backdrop-blur-xl rounded-2xl p-4 sm:p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileError(null);
                  setProfileSuccess(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {profileDataLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile data...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileError(null);
                  setProfileSuccess(false);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 bg-[#7a73ff] text-white rounded-xl hover:shadow-lg transition-all duration-300"
                disabled={profileLoading || profileDataLoading}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
            {profileSuccess && (
              <div className="mt-4 text-green-600 text-center">
                Profile updated successfully!
              </div>
            )}
            {profileError && (
              <div className="mt-4 text-red-600 text-center">
                {profileError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardLayoutContent
        children={children}
        title={title}
        subtitle={subtitle}
      />
    </Suspense>
  );
}
