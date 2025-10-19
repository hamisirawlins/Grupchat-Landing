"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Clock,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw,
} from "lucide-react";

export default function PoolsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSortDialog, setShowSortDialog] = useState(false);

  // Data state
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    // Wait for auth state to resolve before deciding
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadPoolsData();
  }, [user, authLoading, router]);

  const loadPoolsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getUserPools();
      const poolsData = response.data.pools || [];

      // Transform API data to frontend format
      const transformedPools = poolsData.map((pool) => ({
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
        createdAt: pool.created_at,
        role:
          pool.memberships && pool.memberships.length > 0
            ? pool.memberships[0].role
            : "member",
        platformFeeRate: pool.platform_fee_rate || 0.02,
      }));

      setPools(transformedPools);

      // Calculate stats
      const activeCount = transformedPools.filter(
        (p) => p.status === "active"
      ).length;
      const completedCount = transformedPools.filter(
        (p) => p.status === "completed"
      ).length;
      const totalAmount = transformedPools.reduce(
        (sum, pool) => sum + pool.currentBalance,
        0
      );

      setStats({
        total: transformedPools.length,
        active: activeCount,
        completed: completedCount,
        totalAmount: totalAmount,
      });
    } catch (err) {
      console.error("Failed to load pools:", err);
      setError(handleApiError(err, "Failed to load pools"));
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh: clear filters and reload list only
  const handlePullToRefresh = async () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setSortBy("created_at");
    setSortOrder("desc");
    await loadPoolsData();
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Loading your pools">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  if (!user) {
    return null;
  }

  // Sort options configuration
  const sortOptions = [
    { value: "created_at", label: "Date Created", icon: Calendar },
    { value: "name", label: "Name", icon: Target },
    { value: "target_amount", label: "Target Amount", icon: DollarSign },
    { value: "current_balance", label: "Current Balance", icon: TrendingUp },
    { value: "progress", label: "Progress", icon: Target },
    { value: "members", label: "Members", icon: Users },
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return option ? option.label : "Date Created";
  };

  const handleSortSelect = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc for most fields, asc for name
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
    setShowSortDialog(false);
  };

  // Filter and sort pools
  const filteredPools = pools
    .filter((pool) => {
      const matchesSearch =
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || pool.status === filterStatus;
      const matchesType = filterType === "all" || pool.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "target_amount":
          aValue = a.targetAmount;
          bValue = b.targetAmount;
          break;
        case "current_balance":
          aValue = a.currentBalance;
          bValue = b.currentBalance;
          break;
        case "progress":
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        case "members":
          aValue = a.memberCount;
          bValue = b.memberCount;
          break;
        case "created_at":
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      archived: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${colors[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const TypeIcon = ({ type }) => {
    const config = {
      trip: { emoji: "🌴", color: "bg-blue-500" },
      business: { emoji: "💼", color: "bg-green-500" },
      education: { emoji: "📚", color: "bg-purple-500" },
      event: { emoji: "🎉", color: "bg-pink-500" },
      general: { emoji: "💰", color: "bg-gray-500" },
    };

    const { emoji, color } = config[type] || config.general;

    return (
      <div
        className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
      >
        {emoji}
      </div>
    );
  };

  const PoolCard = ({ pool }) => (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg hover:border-white/30 transition-all duration-300 cursor-pointer group transform hover:-translate-y-0.5"
      onClick={() => router.push(`/pools/${pool.poolId}`)}
    >
      {/* Header with pool name and status */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <TypeIcon type={pool.type} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-purple-600 transition-colors mb-1">
              {pool.name}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-1">
              {pool.description}
            </p>
          </div>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      {/* Key metrics in clean layout */}
      <div className="space-y-4 mb-6">
        {/* Progress percentage - large and prominent */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm font-medium">Progress</span>
          <span className="text-2xl font-bold text-gray-900">
            {pool.percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-emerald-500"
            style={{ width: `${Math.min(pool.percentage, 100)}%` }}
          />
        </div>

        {/* Amount pooled vs target */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            KSh {pool.currentBalance.toLocaleString()}
          </span>
          <span className="text-gray-400">
            of KSh {pool.targetAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {pool.memberCount}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {pool.dueDate}
          </span>
        </div>
        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">
          {pool.role}
        </span>
      </div>
    </div>
  );

  const PoolTableRow = ({ pool }) => (
    <tr
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      onClick={() => router.push(`/pools/${pool.poolId}`)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <TypeIcon type={pool.type} />
          <div>
            <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
              {pool.name}
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {pool.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={pool.status} />
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        KSh {pool.targetAmount.toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        KSh {pool.currentBalance.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20 shadow-inner">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-emerald-500 shadow-sm"
              style={{ width: `${Math.min(pool.percentage, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-600 min-w-12">
            {pool.percentage}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {pool.memberCount}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{pool.dueDate}</td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
          {pool.role}
        </span>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <DashboardLayout
        title="Pools"
        subtitle="Manage your pools and contributions"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pools...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Pools"
        subtitle="Manage your pools and contributions"
      >
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadPoolsData}
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
      title="Pools"
      subtitle="Manage your pools and contributions"
    >
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm p-6 mb-6 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center shadow-inner">
              <FolderOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Pool Management
              </h1>
              <p className="text-sm text-gray-500">
                Track and manage all your pools
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/create-pool")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 w-fit shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create Pool
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-sm transition-all duration-300">
              <FolderOpen className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pools</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-sm transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Pools</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-sm transition-all duration-300">
              <Target className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner group-hover:shadow-sm transition-all duration-300">
              <DollarSign className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pooled</p>
              <p className="text-2xl font-bold text-gray-900">
                KSh {stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh above combined card */}
      <div className="flex items-center justify-start mb-4">
        <button
          onClick={handlePullToRefresh}
          className="p-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
          title="Refresh list"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Refresh</span>
        </button>
      </div>

      {/* Combined: Filters/Search + Results */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm p-6 mb-6 hover:shadow-lg transition-all duration-300">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full min-w-[240px] sm:min-w-[280px] lg:min-w-[360px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pools by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 text-gray-900 shadow-sm focus:shadow-md"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 shadow-sm focus:shadow-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 shadow-sm focus:shadow-md"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="trip">Trip</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="event">Event</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Button */}
            <div className="relative z-[60] w-full sm:w-auto">
              <button
                onClick={() => setShowSortDialog(!showSortDialog)}
                className="w-full sm:w-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-gray-50 shadow-sm hover:shadow-md"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {getCurrentSortLabel()}
                </span>
                {sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4 text-purple-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-purple-600" />
                )}
              </button>

              {/* Sort Dialog */}
              {showSortDialog && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-[65]"
                    onClick={() => setShowSortDialog(false)}
                  />

                  {/* Dialog */}
                  <div className="fixed inset-x-4 top-28 sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full mt-2 sm:mt-2 w-auto sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">
                          Sort pools by
                        </h3>
                        <button
                          onClick={() => setShowSortDialog(false)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        {sortOptions.map((option) => {
                          const IconComponent = option.icon;
                          const isSelected = sortBy === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() => handleSortSelect(option.value)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                isSelected
                                  ? "bg-blue-50 border border-blue-200 text-blue-900"
                                  : "hover:bg-gray-50 border border-transparent text-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent
                                  className={`w-4 h-4 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                />
                                <span className="text-sm font-medium">
                                  {option.label}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-2">
                                  {sortOrder === "asc" ? (
                                    <ArrowUp className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <ArrowDown className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span className="text-xs text-blue-600 font-medium">
                                    {sortOrder === "asc"
                                      ? "Ascending"
                                      : "Descending"}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          Click the same field again to toggle between ascending
                          and descending order.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section inside card */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          {filteredPools.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pools found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Create your first pool to start managing group funds and reach your goals together."}
              </p>
              <button
                onClick={() => router.push("/create-pool")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Create Your First Pool
              </button>
            </div>
          ) : (
            <>
              {/* Grid View - mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:hidden">
                {filteredPools.map((pool) => (
                  <PoolCard key={pool.poolId} pool={pool} />
                ))}
              </div>

              {/* Table View - desktop */}
              <div className="hidden md:block overflow-hidden">
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pool
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pooled
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Members
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPools.map((pool) => (
                        <PoolTableRow key={pool.poolId} pool={pool} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Count below table */}
              <div className="flex items-center justify-end mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPools.length} of {pools.length} pools
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
