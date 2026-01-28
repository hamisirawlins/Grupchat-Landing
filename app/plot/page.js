"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import {
  BarChart3,
  Bell,
  FolderOpen,
  Home,
  Menu,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { handleApiError, planMemoriesAPI } from "@/lib/api";

const fallbackPlotPlans = [
  {
    id: "plot-01",
    title: "Studio Sprint",
    description: "Track the build week wins and lessons learned.",
    milestone: "Record the highlight reel",
    status: "Memory",
    premium: true,
    level: "L-12",
    date: "Mar 2025",
  },
  {
    id: "plot-02",
    title: "Weekend Retreat",
    description: "Finalize the guest list and the shared itinerary.",
    milestone: "Lock the villa booking",
    status: "Active",
    premium: false,
    level: "L-11",
    date: "Feb 2025",
  },
  {
    id: "plot-03",
    title: "Study Squad",
    description: "Hold each other accountable for every milestone.",
    milestone: "Publish the recap notes",
    status: "Active",
    premium: false,
    level: "L-10",
    date: "Jan 2025",
  },
  {
    id: "plot-04",
    title: "Morocco Roadtrip",
    description: "Capture every stop and surprise along the way.",
    milestone: "Confirm the route checkpoints",
    status: "Memory",
    premium: true,
    level: "L-09",
    date: "Dec 2024",
  },
  {
    id: "plot-05",
    title: "Creative Residency",
    description: "Sync on tasks and celebrate weekly wins.",
    milestone: "Publish the shared moodboard",
    status: "Active",
    premium: false,
    level: "L-08",
    date: "Nov 2024",
  },
  {
    id: "plot-06",
    title: "Festival Crew",
    description: "Secure passes, travel, and group logistics.",
    milestone: "Confirm the line-up day picks",
    status: "Active",
    premium: false,
    level: "L-07",
    date: "Oct 2024",
  },
  {
    id: "plot-07",
    title: "City Marathon",
    description: "Keep the team motivated through training phases.",
    milestone: "Finish the long run challenge",
    status: "Active",
    premium: false,
    level: "L-06",
    date: "Sep 2024",
  },
];

export default function PlotPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plot");
  const newestPlanRef = useRef(null);
  const [plotPlans, setPlotPlans] = useState(fallbackPlotPlans);
  const [plotLoading, setPlotLoading] = useState(false);
  const [plotError, setPlotError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchPlotMemories();
  }, [authLoading, user]);

  const fetchPlotMemories = async () => {
    setPlotLoading(true);
    setPlotError("");
    try {
      const response = await planMemoriesAPI.getPlanMemories({
        limit: 20,
        page: 1,
      });
      const memories = Array.isArray(response?.data) ? response.data : [];
      if (memories.length) {
        const mapped = memories.map((memory, index) => {
          const memoryDate = memory.memoryDate
            ? new Date(memory.memoryDate)
            : null;
          return {
            id: memory.id || `memory-${index}`,
            title: memory.title || "Untitled memory",
            description: memory.summary || "",
            milestone: memory.highlight || "Shared memory",
            status: memory.tier === "premium" ? "Memory" : "Active",
            premium: memory.tier === "premium",
            level: `L-${String(index + 1).padStart(2, "0")}`,
            date: memoryDate
              ? memoryDate.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "TBD",
          };
        });
        setPlotPlans(mapped);
      }
    } catch (error) {
      setPlotError(handleApiError(error, "Unable to load plot memories."));
    } finally {
      setPlotLoading(false);
    }
  };

  useEffect(() => {
    if (!newestPlanRef.current) return;
    newestPlanRef.current.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  const primaryNavItems = [
    { id: "homepage", label: "Overview", icon: Home },
    { id: "plans", label: "Plans", icon: FolderOpen },
    { id: "plot", label: "Plot", icon: BarChart3, active: true },
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

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <DashboardLoading
        title="Preparing your plot"
        subtitle="Loading your journey timeline."
      />
    );
  }

  if (!user) {
    return null;
  }

  const newestPlanId = plotPlans[plotPlans.length - 1]?.id;

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

        <div className="h-screen overflow-y-auto overscroll-contain px-6 sm:px-10 lg:px-16 py-20 lg:py-24">
          <div className="relative max-w-5xl mx-auto min-h-full">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c7c3ff] to-transparent" />

            <div className="flex flex-col-reverse gap-12 lg:gap-16">
              {plotPlans.map((plan, index) => {
                const isLeft = index % 2 === 0;
                const isNewest = plan.id === newestPlanId;
                return (
                  <div
                    key={plan.id}
                    ref={isNewest ? newestPlanRef : null}
                    className="relative flex w-full items-center"
                  >
                    <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7a73ff] bg-white shadow-sm" />
                    <span
                      className={`hidden lg:inline-flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold ${
                        plan.premium ? "text-[#9aa4ff]" : "text-gray-400"
                      } ${isLeft ? "ml-24" : "-ml-24"}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#7a73ff]" />
                      {plan.date}
                    </span>
                    <span
                      className={`absolute top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-r ${
                        isLeft
                          ? "left-1/2 from-[#7a73ff] to-transparent"
                          : "right-1/2 from-transparent to-[#7a73ff]"
                      }`}
                    />

                    <div
                      className={`w-full flex ${
                        isLeft ? "justify-start pr-12" : "justify-end pl-12"
                      }`}
                    >
                      <div
                        className={`relative w-full sm:w-[22rem] ${
                          plan.premium
                            ? "bg-gradient-to-br from-[#1c1432] via-[#2b1b4a] to-[#0f1128] text-white shadow-[0_20px_60px_rgba(64,39,120,0.35)] memory-pulse"
                            : "bg-white text-gray-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                        } rounded-[28px] px-6 py-5`}
                      >
                        {plan.premium && (
                          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-[#825bff]/15 via-transparent to-[#50d9ff]/15 pointer-events-none" />
                        )}

                        <div className="relative z-10 flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold tracking-[0.3em] ${
                              plan.premium ? "text-[#cbb7ff]" : "text-gray-400"
                            }`}
                          >
                            {plan.level}
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                              plan.premium
                                ? "bg-white/10 text-white"
                                : "bg-[#f3f1ff] text-[#6b63ff]"
                            }`}
                          >
                            {plan.premium ? (
                              <Sparkles className="w-3 h-3" />
                            ) : (
                              <Star className="w-3 h-3" />
                            )}
                            {plan.status}
                          </span>
                        </div>
                        <h3 className="relative z-10 text-lg font-semibold mt-4">
                          {plan.title}
                        </h3>
                        <p
                          className={`relative z-10 text-sm mt-2 ${
                            plan.premium ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {plan.description}
                        </p>
                        {plotError && (
                          <p className="relative z-10 text-xs text-red-200 mt-3">
                            {plotError}
                          </p>
                        )}
                        <div className="relative z-10 mt-4 flex items-center gap-2">
                          {["N", "A", "K", "L"].map((initial, idx) => (
                            <div
                              key={`${plan.id}-member-${idx}`}
                              className={`h-8 w-8 rounded-full border-2 ${
                                plan.premium
                                  ? "border-white/30 bg-white/10 text-white"
                                  : "border-white bg-[#f3f1ff] text-[#6b63ff]"
                              } -ml-2 first:ml-0 flex items-center justify-center text-xs font-semibold`}
                            >
                              {initial}
                            </div>
                          ))}
                          <span
                            className={`text-xs font-semibold ${
                              plan.premium ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            +3 members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        @keyframes memory-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .memory-pulse {
          animation: memory-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
