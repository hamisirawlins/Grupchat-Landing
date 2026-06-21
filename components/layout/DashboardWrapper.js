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
  Sparkles,
  ShieldCheck,
  Menu,
} from "lucide-react";

const getPrimaryNavItems = (isAdmin) => [
  { id: "homepage", label: "Overview", icon: Home },
  { id: "plans", label: "Plans", icon: FolderOpen },
  { id: "catalogue", label: "Experiences", icon: Sparkles },
  { id: "plot", label: "Plot", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  ...(isAdmin ? [{ id: "admin", label: "Admin", icon: ShieldCheck }] : []),
];

const getAccountNavItems = () => [
  { id: "settings", label: "Settings", icon: Settings },
];

export default function DashboardWrapper({ children }) {
  const { user, profile, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getActiveTab = () => {
    if (pathname === "/dashboard" || pathname === "/") return "homepage";
    if (pathname.startsWith("/plans")) return "plans";
    if (pathname.startsWith("/catalogue")) return "catalogue";
    if (pathname.startsWith("/plot")) return "plot";
    if (pathname.startsWith("/community")) return "community";
    if (pathname.startsWith("/notifications")) return "notifications";
    if (pathname.startsWith("/settings")) return "settings";
    if (pathname.startsWith("/admin")) return "admin";
    return null;
  };

  const handlePrimaryNavClick = (item) => {
    if (item.id === "homepage") {
      router.push("/dashboard");
    } else {
      router.push(`/${item.id}`);
    }
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
        primaryNavItems={getPrimaryNavItems(isAdmin)}
        accountNavItems={getAccountNavItems()}
        activeTab={getActiveTab()}
        onPrimaryNavClick={handlePrimaryNavClick}
        onAccountNavClick={handleAccountNavClick}
        onLogout={handleLogout}
        user={user}
        profile={profile}
      />

      <div className="flex-1 lg:ml-80">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
