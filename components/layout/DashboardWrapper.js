"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import {
  Settings,
  Home,
  BarChart3,
  FolderOpen,
  Bell,
  Users,
  Menu,
} from "lucide-react";

// Centralized navigation items
const getPrimaryNavItems = () => [
  { id: "homepage", label: "Overview", icon: Home },
  { id: "plans", label: "Plans", icon: FolderOpen },
  { id: "plot", label: "Plot", icon: BarChart3 },
  { id: "community", label: "Community", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const getAccountNavItems = () => [
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * DashboardWrapper: Reusable layout component for all logged-in dashboard pages
 * Provides consistent sidebar navigation across all pages
 *
 * Usage:
 * <DashboardWrapper>
 *   <YourPageContent />
 * </DashboardWrapper>
 */
export default function DashboardWrapper({ children }) {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Determine active tab from current path
  const getActiveTab = () => {
    if (pathname === "/dashboard" || pathname === "/") return "homepage";
    if (pathname.startsWith("/plans")) return "plans";
    if (pathname.startsWith("/plot")) return "plot";
    if (pathname.startsWith("/community")) return "community";
    if (pathname.startsWith("/notifications")) return "notifications";
    if (pathname.startsWith("/settings")) return "settings";
    return null;
  };

  const handlePrimaryNavClick = (item) => {
    if (item.id === "homepage") {
      router.push("/dashboard");
      setMobileMenuOpen(false);
      return;
    }
    router.push(`/${item.id}`);
    setMobileMenuOpen(false);
  };

  const handleAccountNavClick = (item) => {
    router.push(`/${item.id}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      <DashboardSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        primaryNavItems={getPrimaryNavItems()}
        accountNavItems={getAccountNavItems()}
        activeTab={getActiveTab()}
        onPrimaryNavClick={handlePrimaryNavClick}
        onAccountNavClick={handleAccountNavClick}
        onLogout={handleLogout}
        user={user}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
