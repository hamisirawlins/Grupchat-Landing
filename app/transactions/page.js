"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Real data state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    loadTransactions();
  }, [user, router]);

  const loadTransactions = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const options = {
        page,
        limit: 20,
        ...(filterType !== "all" && { type: filterType }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange !== "all" && { dateRange }),
        ...(dateRange === "custom" &&
          startDate &&
          endDate && {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        ...(minAmount && { minAmount: parseFloat(minAmount) }),
        ...(maxAmount && { maxAmount: parseFloat(maxAmount) }),
      };

      const response = await dashboardAPI.getUserTransactions(options);

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to load transactions");
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError(handleApiError(err, "Failed to load transactions"));
    } finally {
      setLoading(false);
      setFilterLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilterLoading(true);
    loadTransactions(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value === "custom") {
      // Don't auto-reload for custom date range
      return;
    }
    handleFilterChange();
  };

  // Pull to refresh: clear filters and reload list only
  const handlePullToRefresh = async () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setDateRange("all");
    setStartDate(null);
    setEndDate(null);
    setMinAmount("");
    setMaxAmount("");
    setIsRefreshing(true);
    await loadTransactions(1);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      handleFilterChange();
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setDateRange("all");
    setStartDate(null);
    setEndDate(null);
    setMinAmount("");
    setMaxAmount("");
    setShowAdvancedFilters(false);
    handleFilterChange();
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage);
  };

  if (authLoading) {
    return (
      <DashboardLayout
        title="Transactions"
        subtitle="View your transaction history and activity"
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

  // Since filtering is now handled by the backend, we use the transactions directly
  const filteredTransactions = transactions;

  const StatusBadge = ({ status }) => {
    const styles = {
      success: {
        icon: CheckCircle,
        bg: "bg-green-100",
        text: "text-green-800",
      },
      failed: { icon: XCircle, bg: "bg-red-100", text: "text-red-800" },
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const styles = {
      deposit: {
        icon: ArrowDownLeft,
        bg: "bg-blue-100",
        text: "text-blue-800",
      },
      withdrawal: {
        icon: ArrowUpRight,
        bg: "bg-purple-100",
        text: "text-purple-800",
      },
      fee: { icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-800" },
    };

    const style = styles[type];
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getPoolTypeIcon = (type) => {
    const poolTypes = {
      general: { emoji: "💰", bg: "bg-blue-100", text: "text-blue-600" },
      trip: { emoji: "🌴", bg: "bg-green-100", text: "text-green-600" },
      business: { emoji: "💼", bg: "bg-purple-100", text: "text-purple-600" },
      education: { emoji: "📚", bg: "bg-orange-100", text: "text-orange-600" },
      event: { emoji: "🎉", bg: "bg-pink-100", text: "text-pink-600" },
      goody: { emoji: "🎁", bg: "bg-yellow-100", text: "text-yellow-600" },
    };

    return (
      poolTypes[type] || {
        emoji: "🔧",
        bg: "bg-gray-100",
        text: "text-gray-600",
      }
    );
  };

  const TransactionCard = ({ transaction }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              {transaction.pools?.type && (
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm ${
                    getPoolTypeIcon(transaction.pools.type).bg
                  }`}
                >
                  <span
                    className={getPoolTypeIcon(transaction.pools.type).text}
                  >
                    {getPoolTypeIcon(transaction.pools.type).emoji}
                  </span>
                </div>
              )}
              <div>
                <h3
                  className="font-semibold text-gray-900 truncate hover:text-purple-600 cursor-pointer transition-colors"
                  onClick={() => router.push(`/pools/${transaction.pool_id}`)}
                  title="Click to view pool details"
                >
                  {transaction.pools?.name || "Unknown Pool"}
                </h3>
                {transaction.pools?.type && (
                  <span className="text-xs text-gray-500 capitalize">
                    {transaction.pools.type} Pool
                  </span>
                )}
              </div>
            </div>
            <TypeBadge type={transaction.type} />
            <StatusBadge status={transaction.status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {transaction.description || "No description"}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
            {transaction.reference_id && (
              <span>Ref: {transaction.reference_id}</span>
            )}
            {transaction.pools?.type && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {transaction.pools.type}
              </span>
            )}
            {transaction.mpesa_phone && (
              <span>Phone: {transaction.mpesa_phone}</span>
            )}
          </div>
        </div>
        <div className="text-right sm:ml-4 mt-2 sm:mt-0 w-full sm:w-auto">
          <p className="text-lg font-bold text-green-600">
            {transaction.type === "withdrawal" ? "-" : "+"}KSh{" "}
            {parseFloat(transaction.amount).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {transaction.processed_at && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Processed:{" "}
            {new Date(transaction.processed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );

  // Only include successful transactions in financial calculations
  // Failed transactions don't represent actual money movement
  const successfulTransactions = filteredTransactions.filter(
    (t) => t.status === "success"
  );

  const totalAmount = successfulTransactions.reduce((sum, t) => {
    if (t.type === "deposit") return sum + parseFloat(t.amount);
    if (t.type === "withdrawal") return sum - parseFloat(t.amount);
    return sum;
  }, 0);

  const depositTotal = successfulTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const withdrawalTotal = successfulTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="View your transaction history and activity"
    >
      {/* Header Spacer */}
      <div className="mb-2" />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 text-red-400 hover:text-red-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7a73ff] rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-xl font-bold text-[#7a73ff]">
                KSh {depositTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7a73ff] rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Withdrawals</p>
              <p className="text-xl font-bold text-[#7a73ff]">
                KSh {withdrawalTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7a73ff] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Amount</p>
              <p className="text-xl font-bold text-[#7a73ff]">
                KSh {Math.abs(totalAmount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh below filters */}
      {/* <div className="flex items-center justify-end mb-4">
        <button
          onClick={handlePullToRefresh}
          className="px-3 py-2 text-sm rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
          disabled={isRefreshing}
          title="Refresh list"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div> */}

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pool name, description, or reference..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="fee">Fees</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-purple-500 bg-white"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Advanced Filters Toggle removed */}

        {/* Advanced filters section removed */}
      </div>

      {/* Filter Summary */}
      {!filterLoading &&
        (searchTerm ||
          filterType !== "all" ||
          filterStatus !== "all" ||
          dateRange !== "all" ||
          minAmount ||
          maxAmount) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-purple-800">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Active Filters:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {filterType !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    {filterType}
                  </span>
                )}
                {filterStatus !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    {filterStatus}
                  </span>
                )}
                {dateRange !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    {dateRange === "custom"
                      ? "Custom Date"
                      : `${dateRange} ago`}
                  </span>
                )}
                {minAmount && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    Min: KSh {minAmount}
                  </span>
                )}
                {maxAmount && (
                  <span className="px-2 py-1 bg-purple-100 rounded text-xs">
                    Max: KSh {maxAmount}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

      {/* Filter Loading Indicator */}
      {filterLoading && !loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Applying filters...</p>
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : (
        !filterLoading && (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.transaction_id}
                transaction={transaction}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {!loading && !filterLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !filterLoading && filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-500 mb-6">
            {transactions.length === 0
              ? "You haven't made any transactions yet. Start by joining a pool and making your first deposit!"
              : "No transactions match your current filters. Try adjusting your search or filter criteria."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/pools")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              View Pools
            </button>
            {(searchTerm ||
              filterType !== "all" ||
              filterStatus !== "all" ||
              dateRange !== "all" ||
              minAmount ||
              maxAmount) && (
              <button
                onClick={clearAllFilters}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
