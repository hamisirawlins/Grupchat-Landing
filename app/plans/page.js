"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import { handleApiError, plansAPI } from "@/lib/api";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  FolderOpen,
  Menu,
  Plus,
  Settings,
  Sparkles,
  Tag,
  Users,
  ArrowUpRight,
} from "lucide-react";

const buildPlanSignals = (stats) => [
  {
    id: "total",
    label: "Total plans",
    value: `${stats?.totalPlans ?? 0}`,
    icon: Tag,
    accent: "text-[#6b63ff]",
    bg: "bg-[#f3f1ff]",
  },
  {
    id: "completed",
    label: "Completed plans",
    value: `${stats?.completedPlans ?? 0}`,
    icon: CheckCircle2,
    accent: "text-[#6b63ff]",
    bg: "bg-[#f3f1ff]",
  },
  {
    id: "milestones",
    label: "Pending milestones",
    value: `${stats?.pendingMilestones ?? 0}`,
    icon: Clock,
    accent: "text-[#6b63ff]",
    bg: "bg-[#f3f1ff]",
  },
];

const fallbackMilestones = [
  {
    id: "milestone-1",
    title: "Finalize group Bnb shortlist",
    plan: "Morocco 2026 Trip",
    due: "In 2 days",
  },
  {
    id: "milestone-2",
    title: "Sip n Paint session",
    plan: "Group Art Night",
    due: "In 24 days",
  },
  {
    id: "milestone-3",
    title: "Share recap and upcoming plans",
    plan: "AGM retreat",
    due: "Next week",
  },
];

export default function PlansPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [nextMilestones, setNextMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [milestonesError, setMilestonesError] = useState("");
  const [planStats, setPlanStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    pendingMilestones: 0,
  });
  const planSignals = useMemo(() => buildPlanSignals(planStats), [planStats]);
  const isNewUser = planStats.totalPlans === 0;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchPlans(1, false);
  }, [authLoading, user]);

  const fetchPlans = async (nextPage = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setPlansLoading(true);
    }
    setPlansError("");
    try {
      const response = await plansAPI.getPlans({
        limit: 10,
        page: nextPage,
      });
      const fetchedPlans = response?.data?.plans ?? [];
      const stats = response?.data?.stats;
      setPlans((prev) => (append ? [...prev, ...fetchedPlans] : fetchedPlans));
      setPage(nextPage);
      setHasMore(fetchedPlans.length === 10);
      if (stats) {
        setPlanStats({
          totalPlans: stats.totalPlans ?? 0,
          completedPlans: stats.completedPlans ?? 0,
          pendingMilestones: stats.pendingMilestones ?? 0,
        });
      }
      if (!append) {
        fetchNextMilestones(fetchedPlans);
      }
    } catch (error) {
      setPlansError(handleApiError(error, "Failed to load plans"));
    } finally {
      setPlansLoading(false);
      setIsLoadingMore(false);
    }
  };

  const toDateValue = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    if (typeof value?._seconds === "number")
      return new Date(value._seconds * 1000);
    if (typeof value === "string") return new Date(value);
    return null;
  };

  const fetchNextMilestones = async (plansList) => {
    setMilestonesLoading(true);
    setMilestonesError("");
    try {
      const targetPlans = plansList.slice(0, 10);
      const milestoneSnaps = await Promise.all(
        targetPlans.map((plan) =>
          plansAPI.getPlanMilestones(plan.id).then((response) => ({
            plan,
            milestones: response?.data || [],
          })),
        ),
      );
      const pending = milestoneSnaps.flatMap(({ plan, milestones }) =>
        milestones
          .filter((item) => !item.completed)
          .map((item) => {
            const dueDate = toDateValue(item.dueDate);
            const createdAt = toDateValue(item.createdAt);
            return {
              id: item.id,
              title: item.title || item.text || "Untitled milestone",
              plan: plan.name || "Untitled plan",
              dueDate,
              createdAt,
            };
          }),
      );
      const sorted = pending.sort((a, b) => {
        const aTime = (a.dueDate || a.createdAt || new Date(0)).getTime();
        const bTime = (b.dueDate || b.createdAt || new Date(0)).getTime();
        return bTime - aTime;
      });
      setNextMilestones(sorted.slice(0, 3));
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to load milestones"));
    } finally {
      setMilestonesLoading(false);
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

  const primaryNavItems = useMemo(
    () => [
      { id: "homepage", label: "Overview", icon: Flag },
      { id: "plans", label: "Plans", icon: FolderOpen, active: true },
      { id: "plot", label: "Plot", icon: BarChart3 },
      { id: "notifications", label: "Notifications", icon: Sparkles },
    ],
    [],
  );

  const accountNavItems = useMemo(
    () => [{ id: "settings", label: "Settings", icon: Settings }],
    [],
  );

  const handlePrimaryNavClick = (item) => {
    if (item.id === "homepage") {
      setActiveTab(item.id);
      router.push("/dashboard");
      return;
    }
    setActiveTab(item.id);
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
        title="Preparing your plans"
        subtitle="Syncing your latest plan momentum."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] flex overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
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

      <div className="flex-1 lg:ml-80 min-w-0 relative">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <main className="pt-20 sm:pt-24 p-5 sm:p-6 lg:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Your plans
                </h1>
                <p className="text-sm text-gray-500">
                  Track every plan beyond the chat, all in one space.
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

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {planSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${signal.bg}`}
                    >
                      <signal.icon className={`w-5 h-5 ${signal.accent}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
                        {signal.label}
                      </p>
                      <p className="text-xl font-semibold text-gray-900 mt-1">
                        {signal.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                      Plans
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                      Your active plans
                    </h2>
                  </div>
                  <button
                    onClick={() => fetchPlans(1, false)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a73ff]"
                  >
                    Refresh
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 min-w-[720px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                        <th className="py-3 font-semibold">Plan</th>
                        <th className="py-3 font-semibold">Status</th>
                        <th className="py-3 font-semibold">Target</th>
                        <th className="py-3 font-semibold hidden md:table-cell">
                          Members
                        </th>
                        <th className="py-3 font-semibold">Progress</th>
                        <th className="py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan) => (
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
                          <td className="py-4 text-sm text-gray-600">
                            {formatDate(plan.targetDate)}
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
                                  style={{
                                    width: `${Math.min(
                                      Math.max(plan.progress || 0, 0),
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {plan.progress || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => router.push(`/plans/${plan.id}`)}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a73ff]"
                            >
                              Open
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!plansLoading && plans.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-sm text-gray-500"
                          >
                            No plans yet. Create your first plan to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {plansError && (
                  <p className="mt-4 text-sm text-red-500">{plansError}</p>
                )}
                {plansLoading && (
                  <p className="mt-4 text-sm text-gray-500">Loading plans...</p>
                )}
                {hasMore && plans.length > 0 && !plansLoading && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => fetchPlans(page + 1, true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-100 text-sm font-semibold text-[#6b63ff] hover:bg-purple-50 transition-colors"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
                      Upcoming
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      {isNewUser ? "Need Milestone ideas?" : "Next milestones"}
                    </h3>
                  </div>
                  <Tag className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-5 space-y-4">
                  {milestonesError && (
                    <p className="text-sm text-red-500">{milestonesError}</p>
                  )}
                  {milestonesLoading && (
                    <p className="text-sm text-gray-500">
                      Loading milestones...
                    </p>
                  )}
                  {(isNewUser ? fallbackMilestones : nextMilestones).map(
                    (milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-start gap-3 border border-gray-100 rounded-2xl p-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-semibold">
                          ✓
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {milestone.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {milestone.plan}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {milestone.dueDate
                              ? formatDate(milestone.dueDate)
                              : milestone.due || "Pending"}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                  {!isNewUser &&
                    !milestonesLoading &&
                    nextMilestones.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No upcoming milestones yet.
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
