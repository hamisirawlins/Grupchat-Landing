"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  LogOut,
  User,
  Settings,
  Home,
  Inbox,
  BarChart3,
  FolderOpen,
  Users,
  TrendingUp,
  Bell,
  HelpCircle,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Calendar,
  AlertTriangle,
  Maximize2,
  Star,
  UserCheck,
  Clock,
  BarChart,
  Menu,
  X,
  UserCircle,
} from "lucide-react";

// Import our beautiful chart components
import BarChartComponent from "@/components/charts/BarChart";
import DonutChartComponent from "@/components/charts/DonutChart";
import LineChartComponent from "@/components/charts/LineChart";
import CombinedChart from "@/components/charts/CombinedChart";
import RadialProgressChart from "@/components/charts/RadialProgressChart";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
  });

  // Real data state
  const [dashboardData, setDashboardData] = useState(null);
  const [userPools, setUserPools] = useState([]);
  const [chartData, setChartData] = useState({
    poolCompletion: { completed: 0, total: 0 },
    performanceMetrics: { labels: [], data: [] },
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    } else {
      loadDashboardData();
    }
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the global analytics endpoint for comprehensive data
      const globalAnalytics = await dashboardAPI.getGlobalAnalytics();
      const { insights, topContributors, transactionTrends, summary } =
        globalAnalytics.data;

      setDashboardData({
        metrics: {
          activePools: summary.activePools,
          totalMembers:
            summary.totalPools > 0 ? Math.round(summary.totalPools * 2.5) : 0, // Estimate based on pools
          totalTransactions: summary.totalTransactions,
          totalPooled: parseFloat(summary.totalContributed) || 0,
        },
        notifications: {
          unread: summary.unreadNotifications || 0,
        },
      });

      // Get pools data separately for detailed pool information
      const userPoolsData = await dashboardAPI.getUserPools();
      const pools = userPoolsData.data.pools || [];

      // Format pools data
      setUserPools(
        pools.slice(0, 6).map((pool) => ({
          poolId: pool.pool_id,
          name: pool.name,
          description: pool.description,
          status: pool.status,
          targetAmount: parseFloat(pool.target_amount),
          currentBalance: parseFloat(pool.current_balance),
          percentage:
            pool.target_amount > 0
              ? Math.round(
                  (parseFloat(pool.current_balance) /
                    parseFloat(pool.target_amount)) *
                    100
                )
              : 0,
          memberCount: pool.memberships ? pool.memberships.length : 0,
          dueDate: pool.end_date
            ? new Date(pool.end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "No deadline",
          type: pool.type || "general",
          members:
            pool.memberships?.map((m) => ({
              name: m.users?.display_name || "Unknown",
              avatar: null, // Will use icon instead
            })) || [],
        }))
      );

      // Transform analytics data for charts
      const transformedChartData = {
        poolCompletion: {
          completed: summary.completedPools,
          total: summary.totalPools,
        },
        performanceMetrics: {
          labels: transactionTrends.map((t) => t.month),
          totalPooled: transactionTrends.map((t) =>
            parseFloat(t.totalDeposits)
          ),
          transactionCount: transactionTrends.map((t) => t.transactions),
        },
        topPerformers: topContributors.map((contributor, index) => ({
          ...contributor,
          avatar: null, // Will use icon instead
        })),
      };

      setChartData(transformedChartData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(handleApiError(err, "Failed to load dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f6f5ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f5ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-[#7a73ff] text-white px-4 py-2 rounded-xl hover:bg-[#6961ff] hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "homepage", label: "Homepage", icon: Home, active: true },
    { id: "pools", label: "Pools", icon: FolderOpen },
    { id: "transactions", label: "Transactions", icon: BarChart3 },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge:
        dashboardData?.notifications?.unread > 0
          ? Math.min(dashboardData.notifications.unread, 99)
          : undefined,
    },
    { id: "settings", label: "Settings", icon: Settings },
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

  const MetricCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 relative group hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-[#7a73ff]" />
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-50 rounded-lg">
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const TypeIcon = ({ type }) => {
    const config = {
      trip: { emoji: "🌴", color: "bg-[#7a73ff]" },
      business: { emoji: "💼", color: "bg-[#7a73ff]" },
      education: { emoji: "📚", color: "bg-[#7a73ff]" },
      event: { emoji: "🎉", color: "bg-[#7a73ff]" },
      general: { emoji: "💰", color: "bg-[#7a73ff]" },
      other: { emoji: "🔧", color: "bg-[#7a73ff]" },
    };

    const { emoji, color } = config[type] || config.general;

    return (
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0`}
      >
        {emoji}
      </div>
    );
  };

  const PoolCard = ({ pool }) => (
    <div
      onClick={() => router.push(`/pools/${pool.poolId}`)}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <TypeIcon type={pool.type} />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
              {pool.name}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-1">
              {pool.description}
            </p>
          </div>
        </div>
        <div className="flex -space-x-2 ml-3 flex-shrink-0">
          {pool.members.slice(0, 3).map((member, i) => (
            <div
              key={i}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#7a73ff] flex items-center justify-center"
            >
              <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          ))}
          {pool.memberCount > pool.members.length && (
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{pool.memberCount - pool.members.length}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm mb-3 sm:mb-4">
        <div>
          <p className="text-gray-500 mb-1">Target</p>
          <p className="font-medium text-gray-900 text-xs sm:text-sm">
            KSh {pool.targetAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Pooled</p>
          <p className="font-medium text-gray-900 text-xs sm:text-sm">
            KSh {pool.currentBalance.toLocaleString()}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-gray-500 mb-1">Due Date</p>
          <p className="font-medium text-gray-900 text-xs sm:text-sm">
            {pool.dueDate}
          </p>
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {pool.percentage}%
          </span>
        </div>
        <div className="w-full bg-[#e5e3ff] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out bg-[#7a73ff]"
            style={{ width: `${pool.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
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
                  if (item.id === "homepage") {
                    setActiveTab(item.id);
                  } else {
                    router.push(`/${item.id}`);
                  }
                  if (item.expandable) {
                    setProjectsExpanded(!projectsExpanded);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  item.active || activeTab === item.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.expandable && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        item.expanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </button>

              {item.children && item.expanded && (
                <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          child.status === "active"
                            ? "bg-blue-500"
                            : child.status === "done"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section - Sticky to Bottom */}
        <div className="p-4 border-t border-white/20 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 flex-1 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(user.displayName || user.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.displayName || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
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
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                  Hey, {user.displayName || "Markus"}
                </h1>
                <p className="text-sm text-gray-500">{getCurrentDate()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard
              title="Active Pools"
              value={dashboardData.metrics.activePools}
              icon={FolderOpen}
            />
            <MetricCard
              title="Unread Notifications"
              value={dashboardData.notifications?.unread || 0}
              icon={Bell}
            />
            <MetricCard
              title="Total Transactions"
              value={dashboardData.metrics.totalTransactions}
              icon={BarChart}
            />
            <MetricCard
              title="Total Pooled (KSh)"
              value={dashboardData.metrics.totalPooled.toLocaleString()}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Active Pools */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#7a73ff] rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Active Pools
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/create-pool")}
                  className="bg-[#7a73ff] text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#6961ff] hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">Create Pool</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>

              <div className="space-y-4">
                {userPools.length > 0 ? (
                  userPools.map((pool) => (
                    <PoolCard key={pool.poolId} pool={pool} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-[#b8b5ff] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No active pools
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first pool to get started
                    </p>
                    <button
                      onClick={() => router.push("/create-pool")}
                      className="bg-[#7a73ff] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#6961ff] hover:shadow-lg transition-all duration-300"
                    >
                      Create Pool
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics & Charts */}
            <div className="space-y-6 lg:space-y-8">
              {/* Transaction Trends */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#7a73ff] rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Transaction Trends
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500"></span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Monthly pool contributions and transaction activity.
                </p>
                <CombinedChart
                  data={chartData.performanceMetrics}
                  height={200}
                />
              </div>

              {/* Top Contributors */}
              {/* <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Top Contributors
                    </h3>
                  </div>
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>All Time</option>
                  </select>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Most active pool contributors.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {chartData.topPerformers.length > 0 ? (
                    chartData.topPerformers.map((performer) => (
                      <div key={performer.rank} className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-[#7a73ff] flex items-center justify-center border-2 border-[#7a73ff]">
                          <UserCircle className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {performer.position}
                        </p>
                        <p className="text-xs text-gray-500">
                          {performer.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-[#e5e3ff] flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-[#b8b5ff]" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No contributors yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Start creating pools to see contributors
                      </p>
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          </div>
        </main>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      displayName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement profile update logic
                  console.log("Update profile:", profileData);
                  setShowProfileModal(false);
                }}
                className="flex-1 px-4 py-3 bg-[#7a73ff] text-white rounded-xl hover:bg-[#6961ff] hover:shadow-lg transition-all duration-300 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
