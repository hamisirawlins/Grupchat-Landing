"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import { handleApiError, plansAPI, usersAPI } from "@/lib/api";
import {
  Settings,
  Home,
  BarChart3,
  FolderOpen,
  Bell,
  Calendar,
  Star,
  Search,
  Plus,
  Menu,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentPlans, setRecentPlans] = useState([]);
  const [recentPlansLoading, setRecentPlansLoading] = useState(false);
  const [recentPlansError, setRecentPlansError] = useState("");
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [plansSearch, setPlansSearch] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000) + 1;
  const totalDays = Math.round((startOfNextYear - startOfYear) / 86400000);
  const yearProgress = Math.round((dayOfYear / totalDays) * 100);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchRecentPlans();
    fetchInsights();
  }, [authLoading, user]);

  const fetchRecentPlans = async () => {
    setRecentPlansLoading(true);
    setRecentPlansError("");
    try {
      const response = await plansAPI.getPlans({ page: 1, limit: 10 });
      const plans = response?.data?.plans || [];
      setRecentPlans(plans.slice(0, 5));
    } catch (error) {
      setRecentPlansError(
        handleApiError(error, "Unable to load recent plans."),
      );
    } finally {
      setRecentPlansLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const response = await usersAPI.getInsights(user.uid);
      setInsights(response?.data || null);
    } catch (error) {
      setInsightsError(
        handleApiError(error, "Unable to load dashboard insights."),
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "TBD";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPlanProgress = (plan) => {
    if (typeof plan?.progress === "number") {
      return Math.min(Math.max(plan.progress, 0), 100);
    }
    const milestones = Array.isArray(plan?.milestones) ? plan.milestones : [];
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((item) => item?.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const insightsTopPlans = Array.isArray(insights?.topPlans)
    ? insights.topPlans
    : [];
  const isNewUser = recentPlans.length === 0;
  const insightsActiveUsers = Array.isArray(insights?.recentActiveUsers)
    ? insights.recentActiveUsers
    : [];
  const milestoneCount =
    typeof insights?.yearlyMilestoneCount === "number"
      ? insights.yearlyMilestoneCount
      : null;

  const progressColors = [
    "bg-[#fde7cf]",
    "bg-[#d8fbfb]",
    "bg-[#dff7c4]",
    "bg-[#e7d7ff]",
  ];
  const goalProgressCards = insightsTopPlans.length
    ? insightsTopPlans.slice(0, 4).map((plan, index) => ({
        label: plan.name || "Untitled plan",
        value: `${Math.round(plan.progress || 0)}%`,
        color: progressColors[index % progressColors.length],
      }))
    : [
        { label: "Group Trip", value: "68%", color: "bg-[#fde7cf]" },
        { label: "Meetup Series", value: "41%", color: "bg-[#d8fbfb]" },
        { label: "Festival Crew", value: "83%", color: "bg-[#dff7c4]" },
        { label: "Study Squad", value: "55%", color: "bg-[#e7d7ff]" },
      ];

  const getInitials = (value) => {
    if (!value) return ";)";
    return value
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredRecentPlans = useMemo(() => {
    if (!plansSearch.trim()) return recentPlans;
    const searchValue = plansSearch.trim().toLowerCase();
    return recentPlans.filter((plan) =>
      [plan.name, plan.description, plan.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }, [plansSearch, recentPlans]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <DashboardLoading
        title="Preparing your dashboard"
        subtitle="Signing you in and fetching your data."
      />
    );
  }

  if (!user) {
    return null;
  }

  const primaryNavItems = [
    { id: "homepage", label: "Overview", icon: Home, active: true },
    { id: "plans", label: "Plans", icon: FolderOpen },
    { id: "plot", label: "Plot", icon: BarChart3 },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-x-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

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

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dashboard Content */}
        <main className="pt-20 sm:pt-24 p-5 sm:p-6 lg:p-10 space-y-8 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Welcome back, {user?.displayName || "Friend"}!
                </h1>
                <p className="text-sm text-gray-500">
                  Turn group plans into shared memories.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/settings")}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/create-plan")}
                className="h-10 w-10 rounded-full bg-[#7a73ff] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                aria-label="Create a plan"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.6fr] gap-6">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Group Momentum
                    </h2>
                    <p className="text-xs text-gray-500">
                      Track goal activity across your groups.
                    </p>
                  </div>
                  <button className="text-xs text-[#7a73ff] font-semibold flex items-center gap-1">
                    See more <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-6 bg-[#f5f6ff] rounded-2xl p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 items-center">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                      <div className="flex items-center justify-between text-xs text-gray-500 w-full">
                        <span className="font-semibold text-gray-700">
                          GOAL ACTIVITY
                        </span>
                      </div>
                      <div className="mt-4 flex items-end gap-3 justify-center lg:justify-start w-full">
                        {[18, 10, 24, 32, 14, 26].map((height, idx) => (
                          <div
                            key={idx}
                            className="w-3 rounded-full bg-[#6b63ff]"
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                      <div className="mt-5 text-2xl font-semibold text-gray-900">
                        {milestoneCount ?? 0} Milestones
                      </div>
                      {insightsError && (
                        <p className="mt-2 text-xs text-red-500">
                          {insightsError}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        PROGRESS
                      </p>
                      <div className="relative h-28 w-28 sm:h-32 sm:w-32 lg:h-24 lg:w-24 shrink-0">
                        <svg
                          viewBox="0 0 120 120"
                          className="h-full w-full"
                          aria-hidden="true"
                        >
                          <defs>
                            <clipPath id="progressClip">
                              <circle cx="60" cy="60" r="54" />
                            </clipPath>
                          </defs>
                          <circle cx="60" cy="60" r="54" fill="#6a4bdc" />
                          <g clipPath="url(#progressClip)">
                            <path
                              d={`M0 ${120 - yearProgress * 1.2} C 25 ${
                                112 - yearProgress * 1.1
                              }, 45 ${120 - yearProgress * 1.05}, 70 ${
                                114 - yearProgress * 1.1
                              } C 90 ${112 - yearProgress * 1.08}, 104 ${
                                118 - yearProgress * 1.06
                              }, 120 ${116 - yearProgress * 1.1} L120 120 L0 120 Z`}
                              fill="#9b7bff"
                              opacity="0.9"
                            />
                          </g>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[11px] font-semibold text-white">
                          <span className="text-sm">{yearProgress}%</span>
                          <span className="mt-1 text-[8px] text-white/80">
                            {dayOfYear} / {totalDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[{ label: "Upcoming Plans", icon: Calendar }].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => router.push("/plans")}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                          <item.icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Goal Progress
                    </h2>
                    <p className="text-xs text-gray-500">
                      See how each plan is moving forward.
                    </p>
                  </div>
                  {isNewUser ? (
                    <div className="mt-6 bg-[#f5f6ff] rounded-2xl p-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        Catch your next milestones here.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => router.push("/create-plan")}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#7a73ff] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                        >
                          Create your first plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {goalProgressCards.map((card) => (
                        <div
                          key={card.label}
                          className={`${card.color} rounded-2xl p-4`}
                        >
                          <p className="text-sm text-gray-700">{card.label}</p>
                          <p className="text-2xl font-semibold text-gray-900 mt-3">
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Quick update
                    </h2>
                    <p className="text-xs text-gray-500">
                      Share a progress update with your group.
                    </p>
                  </div>
                  {isNewUser ? (
                    <div className="mt-5 space-y-4">
                      <div className="bg-[#f5f6ff] rounded-2xl p-4">
                        <p className="text-sm text-gray-700">
                          Create your first plan to start sharing updates.
                        </p>
                      </div>
                      <button
                        onClick={() => router.push("/create-plan")}
                        className="w-full bg-[#7a73ff] text-white py-3 rounded-full font-semibold shadow-sm hover:shadow-md transition-shadow"
                      >
                        Create your first plan
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 flex items-center gap-2">
                        {(insightsActiveUsers.length
                          ? insightsActiveUsers
                          : Array.from({ length: 6 }, (_, idx) => ({
                              id: `placeholder-${idx}`,
                              displayName: "",
                            }))
                        ).map((member, idx) => {
                          const initials = getInitials(
                            member.displayName || member.username,
                          );
                          return (
                            <div
                              key={member.id || idx}
                              className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white -ml-2 first:ml-0 flex items-center justify-center text-xs font-semibold text-gray-600 overflow-hidden"
                              style={
                                member.avatarUrl
                                  ? {
                                      backgroundImage: `url(${member.avatarUrl})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                      color: "transparent",
                                    }
                                  : undefined
                              }
                            >
                              {!member.avatarUrl && initials}
                            </div>
                          );
                        })}
                        <button className="ml-2 w-8 h-8 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-6 bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">WHAT'S NEW</p>
                          <div className="text-2xl font-semibold text-gray-900">
                            Added venue shortlist
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Next milestone:{" "}
                            <span className="text-[#7a73ff]">Book flights</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push("/plans")}
                        className="mt-6 w-full bg-[#0b2239] text-white py-3 rounded-full font-semibold"
                      >
                        Post update
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="group bg-gradient-to-br from-[#0b2239] to-[#0f2f4f] text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -bottom-16 w-44 h-44 bg-white/5 rounded-full" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-stretch justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold">Create a plan</h3>
                    <p className="text-sm text-white/70 mt-2 max-w-sm">
                      Invite friends, align on plans, and create memories
                      together.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/create-plan")}
                    className="w-full sm:w-auto sm:self-stretch bg-white text-[#0b2239] px-6 py-3 rounded-full text-lg font-semibold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    Create plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Recent activity
                </h2>
                <p className="text-xs text-gray-500">
                  Latest updates across your group plans.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-xs text-gray-500 w-full sm:w-auto">
                <Search className="w-3 h-3" />
                <input
                  type="text"
                  value={plansSearch}
                  onChange={(event) => setPlansSearch(event.target.value)}
                  placeholder="Search plans"
                  className="w-full bg-transparent focus:outline-none text-xs text-gray-600 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 min-w-[720px]">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                    <th className="py-3 font-semibold">Plan</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold hidden md:table-cell">
                      Target
                    </th>
                    <th className="py-3 font-semibold hidden md:table-cell">
                      Members
                    </th>
                    <th className="py-3 font-semibold">Progress</th>
                    <th className="py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {plan.name || "Untitled plan"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {plan.category || "General"} ·{" "}
                            {plan.description || "No description yet."}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#6b63ff] border border-purple-100">
                          {plan.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 hidden md:table-cell">
                        {formatDate(plan.targetDate || plan.target_date)}
                      </td>
                      <td className="py-4 text-sm text-gray-600 hidden md:table-cell">
                        {typeof plan.membersCount === "number"
                          ? plan.membersCount
                          : "—"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-purple-50 rounded-full">
                            <div
                              className="h-2 rounded-full bg-[#7a73ff]"
                              style={{ width: `${getPlanProgress(plan)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {getPlanProgress(plan)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => router.push(`/plans/${plan.id}`)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a73ff]"
                        >
                          Open
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!recentPlansLoading && filteredRecentPlans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <div className="bg-[#f5f6ff] border border-purple-100 rounded-3xl p-6 text-center space-y-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                              Welcome
                            </p>
                            <h3 className="text-lg font-semibold text-gray-900 mt-2">
                              Start your journey
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                              Set your username and create your first plan to
                              begin.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                              onClick={() => router.push("/create-plan")}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7a73ff] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                            >
                              Create your first plan
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {recentPlansError && (
              <p className="mt-4 text-sm text-red-500">{recentPlansError}</p>
            )}
            {recentPlansLoading && (
              <p className="mt-4 text-sm text-gray-500">
                Loading recent plans...
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
