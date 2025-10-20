"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Edit,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Smartphone,
  CreditCard,
  Copy,
  Info,
  Activity,
  History,
  Users2,
  Target,
  CalendarDays,
  ArrowUpRight as ArrowUpRightIcon,
  ShieldCheck,
} from "lucide-react";

function PoolDetailPageContent() {
  // Helper to calculate withdrawal transaction fee (matches backend logic)
  const calculateWithdrawalFee = (amount, feeRate = 0.02) => {
    if (!amount || isNaN(amount) || amount < 200) return 0;
    const rawFee = amount * feeRate;
    const roundedFee = Math.round(rawFee / 10) * 10;
    return roundedFee;
  };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const poolId = params.poolId;

  // State
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    inviteeEmail: "",
    inviteePhone: "",
    inviteType: "link", // 'link' or 'in_app'
    message: "",
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Deposit form state
  const [depositForm, setDepositForm] = useState({
    amount: "",
    phone: "",
    description: "",
  });
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stk"); // 'stk' or 'paybill'
  const [useProfilePhone, setUseProfilePhone] = useState(true); // Toggle for using profile phone vs manual input

  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    phone: "",
    type: "mobile", // 'mobile', 'till', 'paybill'
    target: "",
    accountNumber: "",
    notes: "",
  });
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [useWithdrawalProfilePhone, setUseWithdrawalProfilePhone] =
    useState(true);

  // User profile state for phone number access
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add phone modal state
  const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
  const [addPhoneInput, setAddPhoneInput] = useState("");
  const [addPhoneSaving, setAddPhoneSaving] = useState(false);
  const [addPhoneError, setAddPhoneError] = useState("");
  const [addPhoneSuccess, setAddPhoneSuccess] = useState(false);

  // Share link state
  const [linkCopied, setLinkCopied] = useState(false);

  // Load user profile for phone number access
  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await dashboardAPI.getUserProfile();
      if (response.success) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth resolution before redirecting or loading data
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadPoolData();
    loadUserProfile(); // Load user profile for phone number access
  }, [user, authLoading, router, poolId]);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardAPI.getPoolDetails(poolId);
      const { pool, membership, members, transactions, insights } =
        response.data;

      setPoolData({
        poolId: pool.id,
        name: pool.name,
        description: pool.description,
        status: pool.status,
        targetAmount: parseFloat(pool.targetAmount),
        currentBalance: parseFloat(pool.currentBalance),
        percentage: insights?.overview?.progressPercentage
          ? parseFloat(insights.overview.progressPercentage)
          : pool.targetAmount > 0
          ? Math.round(
              (parseFloat(pool.currentBalance) /
                parseFloat(pool.targetAmount)) *
                100
            )
          : 0,
        memberCount: insights?.overview?.totalMembers || 0,
        dueDate: pool.endDate
          ? new Date(pool.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "No deadline",
        type: pool.type || "general",
        endDate: pool.endDate,
        createdAt: pool.createdAt,
        role: membership ? membership.role : "member",
        creator: pool.creatorId || "Unknown",
        paybillIdentifier: pool.paybillIdentifier,
        members,
        transactions,
        insights,
      });
    } catch (err) {
      console.error("Failed to load pool data:", err);
      setError(handleApiError(err, "Failed to load pool details"));
    } finally {
      setLoading(false);
    }
  };

  // Phone number preprocessing function
  const preprocessPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Handle different formats and convert to +254 format
    if (cleaned.startsWith("254")) {
      // Already in international format, add +
      return `+${cleaned}`;
    } else if (cleaned.startsWith("0") && cleaned.length === 10) {
      // Local format like 0715234234
      return `+254${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      // Format like 715234234 (missing leading 0)
      return `+254${cleaned}`;
    } else if (cleaned.startsWith("7") && cleaned.length === 9) {
      // Format like 715234234
      return `+254${cleaned}`;
    }

    // Return as-is if we can't determine format
    return phone;
  };

  // Minimal phone validators/formatters (align with settings/dashboard pages)
  const validatePhone = (phone) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) return "Phone number is required";
    if (digits.length < 9 || digits.length > 12)
      return "Enter a valid phone number";
    if (/^0+$/.test(digits)) return "Phone number cannot be all zeros";
    return "";
  };

  const formatPhoneForAPI = (phone) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.startsWith("254")) return `+${digits}`;
    if (digits.startsWith("0") && digits.length === 10)
      return `+254${digits.substring(1)}`;
    if (digits.length === 9) return `+254${digits}`;
    return `+${digits}`;
  };

  const handleSavePhone = async () => {
    try {
      setAddPhoneSaving(true);
      setAddPhoneError("");

      const err = validatePhone(addPhoneInput);
      if (err) {
        setAddPhoneError(err);
        setAddPhoneSaving(false);
        return;
      }

      const internationalPhone = formatPhoneForAPI(addPhoneInput);
      const response = await dashboardAPI.updateProfile({
        phone: internationalPhone,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to update phone");
      }

      setAddPhoneSuccess(true);
      // Refresh profile so UI reflects new phone
      await loadUserProfile();
      setUseProfilePhone(true);
      setTimeout(() => {
        setAddPhoneSuccess(false);
        setShowAddPhoneModal(false);
      }, 1200);
    } catch (e) {
      console.error("Failed to save phone:", e);
      setAddPhoneError(e.message || "Failed to save phone");
    } finally {
      setAddPhoneSaving(false);
    }
  };

  // Helper function to truncate description
  const truncateDescription = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Helper function to format transaction status
  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { bg: "bg-green-100", text: "text-green-800", label: "Success" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to format relative date
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper function to generate consistent colors from user names
  const getUserColor = (displayName) => {
    if (!displayName) return "bg-gray-500";

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-violet-500",
    ];

    // Generate a consistent index based on the name
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Handle deposit submission
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    setDepositError("");

    try {
      // Validate form
      if (!depositForm.amount) {
        setDepositError("Amount is required");
        return;
      }

      // For STK push, phone is required
      if (paymentMethod === "stk") {
        if (useProfilePhone && !userProfile?.phone) {
          setDepositError(
            "No phone number provided. Please add one to your profile or toggle to manual input."
          );
          return;
        }
        if (!useProfilePhone && !depositForm.phone) {
          setDepositError("Phone number is required for STK push");
          return;
        }
      }

      const amount = parseFloat(depositForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setDepositError("Please enter a valid amount");
        return;
      }

      if (amount < 10) {
        setDepositError("Minimum deposit amount is KSh 10");
        return;
      }

      let processedPhone = null;

      // Only process phone for STK push
      if (paymentMethod === "stk") {
        // Use profile phone if toggle is enabled, otherwise use form input
        const phoneToProcess = useProfilePhone
          ? userProfile.phone
          : depositForm.phone;

        // Preprocess phone number
        processedPhone = preprocessPhoneNumber(phoneToProcess);

        // Validate phone number format (basic validation)
        if (!processedPhone.match(/^\+254[17]\d{8}$/)) {
          setDepositError("Please enter a valid Kenyan phone number");
          return;
        }
      }

      // For paybill, we just show instructions and don't make API call yet
      if (paymentMethod === "paybill") {
        // Show success modal with paybill instructions
        setShowDepositModal(false);
        setDepositForm({ amount: "", phone: "", description: "" });
        setUseProfilePhone(true);

        setSuccessData({
          amount: amount,
          paymentMethod: "paybill",
          paybillNumber: "4141545",
          accountNumber: poolData.poolId,
          poolName: poolData.name,
          transactionId: "Manual Payment",
        });
        setShowSuccessModal(true);
        return;
      }

      // Make API call for STK push
      const response = await dashboardAPI.makeDeposit(poolId, {
        amount: amount,
        phone: processedPhone,
        description: depositForm.description || `Deposit to ${poolData.name}`,
        paymentMethod: "stk",
      });

      // Success - close modal and show success dialog
      setShowDepositModal(false);
      setDepositForm({ amount: "", phone: "", description: "" });
      setUseProfilePhone(true);

      // Show success modal with deposit details
      setSuccessData({
        amount: amount,
        phone: processedPhone,
        poolName: poolData.name,
        transactionId: response.data?.transactionId || "Pending",
      });
      setShowSuccessModal(true);

      // Reload pool data to reflect changes
      loadPoolData();
    } catch (err) {
      console.error("Deposit failed:", err);
      setDepositError(handleApiError(err, "Failed to initiate deposit"));
    } finally {
      setDepositLoading(false);
    }
  };

  // Handle invite members submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!inviteForm.inviteeEmail) {
      setInviteError("Please provide an email address");
      return;
    }

    try {
      setInviteLoading(true);
      setInviteError("");

      const invitationData = {
        inviteeEmail: inviteForm.inviteeEmail || null,
        inviteePhone: inviteForm.inviteePhone
          ? preprocessPhoneNumber(inviteForm.inviteePhone)
          : null,
        inviteType: inviteForm.inviteType,
        message: inviteForm.message || `Join our ${poolData.name} pool!`,
      };

      const response = await dashboardAPI.createInvitation(
        poolData.poolId,
        invitationData
      );

      if (response.success) {
        // Show success message
        setSuccessData({
          type: "invitation",
          inviteType: inviteForm.inviteType,
          inviteCode: response.data?.inviteCode,
          // expiresAt: response.data?.expiresAt,
          inviteeEmail: response.data?.inviteeEmail,
        });
        setShowSuccessModal(true);
        setShowInviteModal(false);
        setInviteForm({
          inviteeEmail: "",
          inviteePhone: "",
          inviteType: "link",
          message: "",
        });
      }
    } catch (err) {
      setInviteError(handleApiError(err, "Failed to send invitation"));
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle withdrawal submission
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalLoading(true);
    setWithdrawalError("");

    try {
      // Validate form
      if (
        !withdrawalForm.amount ||
        !withdrawalForm.phone ||
        !withdrawalForm.type
      ) {
        setWithdrawalError(
          "Amount, phone number, and withdrawal type are required"
        );
        return;
      }

      const amount = parseFloat(withdrawalForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawalError("Please enter a valid amount");
        return;
      }

      if (amount < 10) {
        setWithdrawalError("Minimum withdrawal amount is KSh 10");
        return;
      }

      if (amount > poolData.currentBalance) {
        setWithdrawalError("Withdrawal amount cannot exceed pool balance");
        return;
      }

      // Validate phone number
      const phoneSource = useWithdrawalProfilePhone
        ? userProfile?.phone || ""
        : withdrawalForm.phone;
      const processedPhone = preprocessPhoneNumber(phoneSource);
      if (!processedPhone.match(/^\+254[17]\d{8}$/)) {
        setWithdrawalError("Please enter a valid Kenyan phone number");
        return;
      }

      // Validate type-specific fields
      if (withdrawalForm.type === "till" && !withdrawalForm.target) {
        setWithdrawalError("Till number is required for till withdrawal");
        return;
      }

      if (
        withdrawalForm.type === "paybill" &&
        (!withdrawalForm.target || !withdrawalForm.accountNumber)
      ) {
        setWithdrawalError(
          "Paybill number and account number are required for paybill withdrawal"
        );
        return;
      }

      // Make API call
      const response = await dashboardAPI.initiateWithdrawal(poolId, {
        amount: amount,
        phone: processedPhone,
        type: withdrawalForm.type,
        target: withdrawalForm.target || null,
        accountNumber: withdrawalForm.accountNumber || null,
        notes: withdrawalForm.notes || `Withdrawal from ${poolData.name}`,
      });

      // Success - close modal and show success dialog
      setShowWithdrawModal(false);
      setWithdrawalForm({
        amount: "",
        phone: "",
        type: "mobile",
        target: "",
        accountNumber: "",
        notes: "",
      });

      // Show success modal with withdrawal details
      setSuccessData({
        amount: amount,
        phone: processedPhone,
        poolName: poolData.name,
        transactionId: response.data?.transactionId || "Pending",
        type: "withdrawal",
        withdrawalType: withdrawalForm.type,
      });
      setShowSuccessModal(true);

      // Reload pool data to reflect changes
      loadPoolData();
    } catch (err) {
      setWithdrawalError(handleApiError(err, "Failed to initiate withdrawal"));
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Handle share link - copy current URL to clipboard
  const handleShareLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);

      // Reset the "copied" state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Copy failed:", fallbackErr);
      }
    }
  };

  if (!user) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Loading pool details">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pool details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout title="Error" subtitle="Failed to load pool">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load pool
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadPoolData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!poolData) {
    return null;
  }

  const isCreatorOrAdmin =
    poolData.role === "admin" || poolData.role === "creator";

  const TypeIcon = ({ type }) => {
    const config = {
      trip: { emoji: "🌴", color: "bg-blue-500" },
      business: { emoji: "💼", color: "bg-green-500" },
      education: { emoji: "📚", color: "bg-purple-500" },
      event: { emoji: "🎉", color: "bg-pink-500" },
      general: { emoji: "💰", color: "bg-gray-500" },
      other: { emoji: "🔧", color: "bg-orange-500" },
    };

    const { emoji, color } = config[type] || config.general;

    return (
      <div
        className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300`}
      >
        {emoji}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout title={poolData.name} subtitle="">
      {/* Pool Header with Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pool Header Info - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <TypeIcon type={poolData.type} />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {poolData.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      poolData.status
                    )}`}
                  >
                    {poolData.status.charAt(0).toUpperCase() +
                      poolData.status.slice(1)}
                  </span>
                </div>
                {/* Description with Tooltip */}
                <div className="mb-4">
                  <div className="relative group">
                    <p className="text-gray-600 text-base leading-relaxed cursor-help">
                      {truncateDescription(poolData.description)}
                      {poolData.description &&
                        poolData.description.length > 120 && (
                          <span className="text-blue-600 ml-1">...</span>
                        )}
                    </p>
                    {poolData.description &&
                      poolData.description.length > 120 && (
                        <div className="absolute bottom-full left-0 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-md whitespace-pre-wrap">
                          {poolData.description}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due: {poolData.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poolData.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    {poolData.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareLink}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative group"
                title={linkCopied ? "Link copied!" : "Share pool link"}
              >
                <Share2 className="w-5 h-5" />
                {linkCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
              {isCreatorOrAdmin && (
                <button
                  onClick={() => router.push(`/pools/edit/${poolId}`)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Pool"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Pool Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Target Amount</p>
              <p className="text-lg font-bold text-gray-900">
                KSh {poolData.targetAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Current Balance</p>
              <p className="text-lg font-bold text-gray-900">
                KSh {poolData.currentBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <p className="text-lg font-bold text-gray-900">
                {poolData.percentage}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="text-lg font-bold text-gray-900">
                KSh{" "}
                {(
                  poolData.targetAmount - poolData.currentBalance
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progress to goal</span>
              <span className="font-medium text-gray-900">
                {poolData.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${poolData.percentage}%`,
                  background: `linear-gradient(to right, #b8b5ff, #7a73ff)`,
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowDepositModal(true)}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#7a73ff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#6961ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#7a73ff")
              }
            >
              <ArrowUpRight className="w-4 h-4" />
              Deposit
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="border-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{ borderColor: "#7a73ff", color: "#7a73ff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f4ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ArrowDownLeft className="w-4 h-4" />
              Withdraw
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite Members
            </button>

            {poolData.role === "admin" && (
              <button
                onClick={() => router.push(`/pools/edit/${poolId}`)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Pool
              </button>
            )}
          </div>
        </div>

        {/* Progress Overview Card - Takes 1 column */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(to right, #7a73ff, #6961ff)",
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Progress Overview</h3>
              <p className="text-sm text-gray-500">Goal completion status</p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-24 h-24">
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#7a73ff"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - poolData.percentage / 100)
                  }`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {poolData.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Current</span>
              <span className="font-semibold text-gray-900">
                KSh {poolData.currentBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Target</span>
              <span className="font-semibold text-gray-900">
                KSh {poolData.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Remaining</span>
              <span className="font-semibold" style={{ color: "#7a73ff" }}>
                KSh{" "}
                {(
                  poolData.targetAmount - poolData.currentBalance
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics and Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pool Analytics Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#7a73ff" }}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Target
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    KSh {poolData.targetAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#7a73ff" }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Pooled
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    KSh {poolData.currentBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#7a73ff" }}
                >
                  <Users2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Members
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {poolData.insights?.overview?.totalMembers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#7a73ff" }}
                >
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    {poolData.insights?.trends?.daysRemaining >= 0
                      ? "Days Left"
                      : "Days Passed"}
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {poolData.insights?.trends?.daysRemaining >= 0
                      ? poolData.insights?.trends?.daysRemaining || 0
                      : Math.abs(poolData.insights?.trends?.daysRemaining || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Activity Chart */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Transaction Activity
                  </h3>
                  <p className="text-xs text-gray-500">
                    Recent successful transactions
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {poolData.transactions && poolData.transactions.length > 0 ? (
              <div className="space-y-2">
                {poolData.transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          transaction.type === "deposit"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "deposit" ? (
                          <ArrowUpRightIcon
                            className={`w-4 h-4 ${
                              transaction.type === "deposit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize text-sm">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.user?.displayName || "Unknown user"} •{" "}
                          {formatRelativeDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-sm text-green-600">
                          {transaction.type === "deposit" ? "+" : "-"}KSh{" "}
                          {transaction.amount.toLocaleString()}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                ))}

                {poolData.transactions.length > 5 && (
                  <button className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                    View all {poolData.transactions.length} transactions
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  No transactions yet
                </p>
                <p className="text-xs text-gray-400">
                  Make your first deposit to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pool Statistics (moved to right column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(to right, #7a73ff, #6961ff)",
                }}
              >
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Pool Statistics
                </h3>
                <p className="text-xs text-gray-500">
                  Key metrics and insights
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Transaction Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "#f5f4ff" }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowUpRightIcon
                      className="w-3 h-3"
                      style={{ color: "#7a73ff" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#7a73ff" }}
                    >
                      Total Deposits
                    </span>
                  </div>
                  <p
                    className="text-base font-bold"
                    style={{ color: "#7a73ff" }}
                  >
                    KSh{" "}
                    {poolData.insights?.transactions?.totalDeposits
                      ? parseFloat(
                          poolData.insights.transactions.totalDeposits
                        ).toLocaleString()
                      : "0"}
                  </p>
                  <p className="text-xs" style={{ color: "#7a73ff" }}>
                    {poolData.insights?.transactions?.deposits || 0}{" "}
                    transactions
                  </p>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "#f5f4ff" }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowDownLeft
                      className="w-3 h-3"
                      style={{ color: "#7a73ff" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#7a73ff" }}
                    >
                      Total Withdrawals
                    </span>
                  </div>
                  <p
                    className="text-base font-bold"
                    style={{ color: "#7a73ff" }}
                  >
                    KSh{" "}
                    {poolData.insights?.transactions?.totalWithdrawals
                      ? parseFloat(
                          poolData.insights.transactions.totalWithdrawals
                        ).toLocaleString()
                      : "0"}
                  </p>
                  <p className="text-xs" style={{ color: "#7a73ff" }}>
                    {poolData.insights?.transactions?.withdrawals || 0}{" "}
                    transactions
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Average Deposit</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    KSh{" "}
                    {poolData.insights?.trends?.averageContribution
                      ? parseFloat(
                          poolData.insights.trends.averageContribution
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Pool Created</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {poolData.createdAt
                      ? new Date(poolData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Target Date</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 text-xs">
                      {poolData.endDate
                        ? new Date(poolData.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "No deadline"}
                    </span>
                    {poolData.insights?.trends?.daysRemaining !== null &&
                      poolData.insights?.trends?.daysRemaining !==
                        undefined && (
                        <p className="text-xs text-gray-500">
                          {poolData.insights.trends.daysRemaining >= 0
                            ? `${poolData.insights.trends.daysRemaining} days left`
                            : `${Math.abs(
                                poolData.insights.trends.daysRemaining
                              )} days passed`}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Pool Status</span>
                    <div className="relative group">
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-xs whitespace-normal">
                        <strong>Status Logic:</strong>
                        <br />• <strong>Target Reached:</strong> 100%+ progress
                        <br />• <strong>On Track:</strong> Current rate ≥80% of
                        required rate
                        <br />• <strong>Behind Schedule:</strong> Current rate
                        50-80% of required rate
                        <br />• <strong>Significantly Behind:</strong> Current
                        rate &lt;50% of required rate
                        <br />• <strong>Critical:</strong> ≤7 days remaining
                        <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        poolData.insights?.trends?.statusColor === "success"
                          ? "bg-green-100 text-green-800"
                          : poolData.insights?.trends?.statusColor === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : poolData.insights?.trends?.statusColor === "danger"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {poolData.insights?.trends?.statusText || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Deposit Rate Analysis */}
                {poolData.insights?.trends?.daysRemaining &&
                  poolData.insights.trends.daysRemaining > 0 && (
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1 mb-2">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">
                          Deposit Rate Analysis
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">
                            Required daily deposit rate:
                          </span>
                          <span className="font-medium text-blue-900">
                            KSh {poolData.insights.trends.requiredDailyRate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">
                            Current daily deposit rate (7-day avg):
                          </span>
                          <span className="font-medium text-blue-900">
                            KSh {poolData.insights.trends.currentDailyRate}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Insights Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Pool Members Card with Pie Chart */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(to right, #7a73ff, #6961ff)",
                }}
              >
                <Users2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Pool Members
                </h3>
                <p className="text-xs text-gray-500">
                  {poolData.members?.length || 0} member
                  {poolData.members?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              title="Invite Members"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {poolData.members && poolData.members.length > 0 ? (
            <>
              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                        Member
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">
                        Role
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600">
                        Contributed
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600">
                        Withdrawn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {poolData.members.map((member) => {
                      const contributed = member.totalContributed || 0;
                      const withdrawn = member.totalWithdrawn || 0;

                      return (
                        <tr
                          key={member.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${getUserColor(
                                  member.user?.displayName
                                )}`}
                              >
                                <span className="text-white font-semibold text-xs">
                                  {member.user?.displayName
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                                {member.user?.displayName || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                member.role === "admin" ||
                                member.role === "creator"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {member.role}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span className="text-xs font-medium text-green-600">
                              {contributed > 0
                                ? `KSh ${contributed.toLocaleString()}`
                                : "-"}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span className="text-xs font-medium text-red-600">
                              {withdrawn > 0
                                ? `KSh ${withdrawn.toLocaleString()}`
                                : "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users2 className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No members yet
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                Invite members to start collaborating
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Invite Members
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleDepositSubmit}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7a73ff] rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Make a Deposit
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositForm({ amount: "", phone: "", description: "" });
                    setDepositError("");
                    setPaymentMethod("stk");
                    setUseProfilePhone(true);
                  }}
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

              {/* Pool Info removed as per request */}

              {/* Error Message */}
              {depositError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{depositError}</p>
                </div>
              )}

              {/* Payment Method Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stk")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === "stk"
                        ? "border-[#7a73ff] bg-[#f6f5ff] text-[#7a73ff]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">STK Push</p>
                        <p className="text-xs opacity-70">Instant payment</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paybill")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === "paybill"
                        ? "border-[#7a73ff] bg-[#f6f5ff] text-[#7a73ff]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">Paybill</p>
                        <p className="text-xs opacity-70">Manual payment</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input - Only for STK Push */}
              {paymentMethod === "stk" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KSh) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      KSh
                    </span>
                    <input
                      type="number"
                      value={depositForm.amount}
                      onChange={(e) =>
                        setDepositForm({
                          ...depositForm,
                          amount: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border border-[#b8b5ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-[#7a73ff] transition-all duration-300 placeholder-gray-500 text-gray-900"
                      placeholder="Enter amount"
                      min="10"
                      step="1"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum amount: KSh 10
                  </p>
                </div>
              )}

              {/* Phone Number Input - Only for STK Push */}
              {paymentMethod === "stk" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      M-Pesa Phone Number *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Use profile phone
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseProfilePhone(!useProfilePhone)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          useProfilePhone ? "bg-[#7a73ff]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useProfilePhone ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {useProfilePhone ? (
                    <div className="bg-[#f6f5ff] border border-[#b8b5ff] rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#7a73ff]" />
                          <span className="text-sm font-medium text-[#7a73ff]">
                            {userProfile?.phone || "No phone number in profile"}
                          </span>
                        </div>
                        {!userProfile?.phone && (
                          <button
                            type="button"
                            onClick={() => {
                              setAddPhoneInput("");
                              setAddPhoneError("");
                              setShowAddPhoneModal(true);
                            }}
                            className="text-xs px-3 py-1.5 bg-[#7a73ff] text-white rounded-lg hover:bg-[#6961ff] transition-colors"
                          >
                            Add Phone
                          </button>
                        )}
                      </div>
                      {!userProfile?.phone && (
                        <p className="text-xs text-[#7a73ff] mt-2">
                          Please add a phone number to your profile or toggle to
                          manual input
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type="tel"
                      value={depositForm.phone}
                      onChange={(e) =>
                        setDepositForm({
                          ...depositForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-[#b8b5ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-[#7a73ff] transition-all duration-300 placeholder-gray-500 text-gray-900"
                      placeholder="0715234234 or 254715234234"
                      required
                    />
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {useProfilePhone
                      ? "Using phone number from your profile"
                      : "Enter your phone number in any format (0712..., 712, or 254712...)"}
                  </p>
                </div>
              )}

              {/* Paybill Instructions */}
              {paymentMethod === "paybill" && (
                <div className="mb-6">
                  <div className="bg-[#f6f5ff] rounded-xl p-4 border border-[#b8b5ff]">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#7a73ff] mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-[#7a73ff] text-sm mb-2">
                          Paybill Payment Instructions
                        </h4>
                        <div className="space-y-2 text-xs text-[#7a73ff]">
                          <p>1. Go to M-Pesa on your phone</p>
                          <p>2. Select "Lipa na M-Pesa" → "Pay Bill"</p>
                          <p>3. Enter the following details:</p>
                          <div className="bg-white rounded-lg p-3 mt-2 border border-[#b8b5ff]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-[#7a73ff]">
                                Paybill Number:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#7a73ff]">
                                  4141545
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigator.clipboard.writeText("4141545")
                                  }
                                  className="p-1 text-[#7a73ff] hover:bg-[#b8b5ff] rounded transition-colors"
                                  title="Copy paybill number"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-900">
                                Account Number:
                              </span>
                              <div className="flex items-center gap-2">
                                {poolData.paybillIdentifier ? (
                                  <>
                                    <span className="font-mono text-[#7a73ff] text-sm font-semibold">
                                      {poolData.paybillIdentifier}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          poolData.paybillIdentifier
                                        )
                                      }
                                      className="p-1 text-[#7a73ff] hover:bg-[#b8b5ff] rounded transition-colors"
                                      title="Copy account number"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[#7a73ff] text-sm italic">
                                    Error generating pool identifier...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p>4. Enter the amount you want to deposit</p>
                          <p>5. Enter your M-Pesa PIN to complete</p>

                          {/* Notes section removed as per request */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description input removed as per request */}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositForm({ amount: "", phone: "", description: "" });
                    setDepositError("");
                    setPaymentMethod("stk");
                    setUseProfilePhone(true);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={depositLoading}
                >
                  Cancel
                </button>
                <button
                  type={paymentMethod === "paybill" ? "button" : "submit"}
                  onClick={
                    paymentMethod === "paybill"
                      ? () => setShowDepositModal(false)
                      : undefined
                  }
                  disabled={depositLoading}
                  className="flex-1 px-4 py-3 bg-[#7a73ff] text-white rounded-xl hover:bg-[#6961ff] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {depositLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : paymentMethod === "paybill" ? (
                    "Close"
                  ) : (
                    "Send M-Pesa Request"
                  )}
                </button>
              </div>

              {/* Info Note */}
              {paymentMethod === "stk" && (
                <div className="mt-4 p-3 bg-[#f6f5ff] rounded-lg">
                  <p className="text-xs text-[#7a73ff]">
                    <strong>Note:</strong> You'll receive an M-Pesa STK push
                    notification on your phone to complete the payment.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Add Phone Modal */}
      {showAddPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Phone Number
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPhoneModal(false)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={addPhoneInput}
                  onChange={(e) => setAddPhoneInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                  placeholder="0712345678 or +254712345678"
                />
                {addPhoneError && (
                  <p className="text-xs text-red-600 mt-2">{addPhoneError}</p>
                )}
                {addPhoneSuccess && (
                  <p className="text-xs text-green-600 mt-2">
                    Phone updated successfully
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhoneModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhone}
                  disabled={addPhoneSaving}
                  className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-colors ${
                    addPhoneSaving
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {addPhoneSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Request Withdrawal
              </h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
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
            <div className="text-center py-8">
              <ArrowUpRight className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Withdrawal Form
              </h3>
              <p className="text-gray-500 mb-6">
                Withdrawal functionality will be implemented here...
              </p>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f6f5ff] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#b8b5ff]">
            <form onSubmit={handleInviteSubmit}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7a73ff] rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#7a73ff]">
                    Invite Members
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteForm({
                      inviteeEmail: "",
                      inviteePhone: "",
                      inviteType: "link",
                      message: "",
                    });
                    setInviteError("");
                  }}
                  className="p-2 text-[#7a73ff] hover:text-[#6961ff] rounded-lg hover:bg-[#e5e4ff] transition-colors"
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

              {/* Pool Info - purple theme */}
              <div className="bg-[#f6f5ff] rounded-xl p-4 mb-6 border border-[#7a73ff]">
                <p className="text-sm text-[#7a73ff] mb-1">Inviting to</p>
                <p className="font-semibold ">{poolData.name}</p>
                <p className="text-xs mt-1">
                  Current members: {poolData.memberCount} • Target: KSh{" "}
                  {poolData.targetAmount.toLocaleString()}
                </p>
              </div>

              {/* Invitation Type Toggle */}
              {/* Invitation type toggle removed; default to in-app/email */}

              {/* Invitee Details */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#7a73ff] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.inviteeEmail}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      inviteeEmail: e.target.value,
                      inviteType: "in_app",
                      inviteePhone: "",
                      message: "",
                    })
                  }
                  placeholder="email address"
                  className="w-full px-4 py-3 border border-[#b8b5ff] rounded-lg focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-all duration-200 bg-white text-[#7a73ff] placeholder-[#b8b5ff]"
                  required
                />
                <p className="text-xs text-[#7a73ff] mt-1">
                  An invitation will be sent to this email address.
                </p>
              </div>

              {/* Error Message */}
              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{inviteError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-[#7a73ff] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#6961ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {inviteLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleWithdrawalSubmit}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7a73ff] rounded-xl flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Withdraw Funds
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalForm({
                      amount: "",
                      phone: "",
                      type: "mobile",
                      target: "",
                      accountNumber: "",
                      notes: "",
                    });
                    setWithdrawalError("");
                  }}
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

              {/* Pool Info removed as per request */}

              {/* Error Message */}
              {withdrawalError && (
                <div className="bg-[#f6f5ff] border border-[#b8b5ff] rounded-lg p-3 mb-4">
                  <p className="text-sm text-[#7a73ff]">{withdrawalError}</p>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KSh) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    KSh
                  </span>
                  <input
                    type="number"
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-[#b8b5ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-[#7a73ff] transition-all duration-300 placeholder-gray-500 text-gray-900"
                    placeholder="Enter amount"
                    min="10"
                    max={poolData.currentBalance}
                    step="1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Transaction fee: KSh{" "}
                  {calculateWithdrawalFee(
                    parseFloat(withdrawalForm.amount),
                    poolData?.platform_fee_rate || 0.02
                  ).toLocaleString()}
                </p>
              </div>

              {/* Withdrawal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Type *
                </label>
                <select
                  value={withdrawalForm.type}
                  onChange={(e) =>
                    setWithdrawalForm({
                      ...withdrawalForm,
                      type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-gray-900"
                  required
                >
                  <option value="mobile">Mobile Money (Send to Phone)</option>
                  <option value="till">Send to Till Number</option>
                  <option value="paybill">Send to Paybill</option>
                </select>
              </div>

              {/* Phone Number Input */}
              {withdrawalForm.type === "mobile" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      M-Pesa Phone Number *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Use profile phone
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setUseWithdrawalProfilePhone(
                            !useWithdrawalProfilePhone
                          )
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          useWithdrawalProfilePhone
                            ? "bg-[#7a73ff]"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useWithdrawalProfilePhone
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {useWithdrawalProfilePhone ? (
                    <div className="bg-[#f6f5ff] border border-[#b8b5ff] rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#7a73ff]" />
                          <span className="text-sm font-medium text-[#7a73ff]">
                            {userProfile?.phone || "No phone number in profile"}
                          </span>
                        </div>
                        {!userProfile?.phone && (
                          <button
                            type="button"
                            onClick={() => {
                              setAddPhoneInput("");
                              setAddPhoneError("");
                              setShowAddPhoneModal(true);
                            }}
                            className="text-xs px-3 py-1.5 bg-[#7a73ff] text-white rounded-lg hover:bg-[#6961ff] transition-colors"
                          >
                            Add Phone
                          </button>
                        )}
                      </div>
                      {!userProfile?.phone && (
                        <p className="text-xs text-[#7a73ff] mt-2">
                          Please add a phone number to your profile or toggle to
                          manual input
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type="tel"
                      value={withdrawalForm.phone}
                      onChange={(e) =>
                        setWithdrawalForm({
                          ...withdrawalForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                      placeholder="0715234234 or 254715234234"
                      required
                    />
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {useWithdrawalProfilePhone
                      ? "Using phone number from your profile"
                      : "Enter your phone number in any format (0715234234, 715234234, or 254715234234)"}
                  </p>
                </div>
              )}

              {/* Conditional Fields Based on Type */}
              {withdrawalForm.type === "till" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Till Number *
                  </label>
                  <input
                    type="text"
                    value={withdrawalForm.target}
                    onChange={(e) =>
                      setWithdrawalForm({
                        ...withdrawalForm,
                        target: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                    placeholder="Enter till number"
                    required
                  />
                </div>
              )}

              {withdrawalForm.type === "paybill" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paybill Number *
                    </label>
                    <input
                      type="text"
                      value={withdrawalForm.target}
                      onChange={(e) =>
                        setWithdrawalForm({
                          ...withdrawalForm,
                          target: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                      placeholder="Enter paybill number"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={withdrawalForm.accountNumber}
                      onChange={(e) =>
                        setWithdrawalForm({
                          ...withdrawalForm,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                </>
              )}

              {/* Notes Input (Optional) */}
              {/* Notes input removed as per request */}

              {/* Platform Fee Notice */}
              {/* Platform fee notice removed as per request */}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalForm({
                      amount: "",
                      phone: "",
                      type: "mobile",
                      target: "",
                      accountNumber: "",
                      notes: "",
                    });
                    setWithdrawalError("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={withdrawalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawalLoading}
                  className="flex-1 px-4 py-3 bg-[#7a73ff] text-white rounded-xl hover:bg-[#6961ff] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {withdrawalLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Withdraw"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {/* Success Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {successData.type === "invitation"
                  ? "Invitation Sent Successfully!"
                  : successData.type === "withdrawal"
                  ? "Withdrawal Initiated Successfully!"
                  : successData.paymentMethod === "paybill"
                  ? "Payment Instructions Ready!"
                  : "Deposit Initiated Successfully!"}
              </h3>

              {/* Success Message */}
              <p className="text-gray-600 mb-6">
                {successData.type === "invitation"
                  ? successData.inviteType === "link"
                    ? "Link invitation created successfully. Share the link with potential members."
                    : "Invitation sent successfully. "
                  : successData.type === "withdrawal"
                  ? "Your withdrawal request has been processed and funds will be sent to your specified destination."
                  : successData.paymentMethod === "paybill"
                  ? "Follow the instructions below to complete your paybill payment."
                  : "Your M-Pesa payment request has been sent. Check your phone for the STK push notification."}
              </p>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-3">
                  {successData.type === "invitation"
                    ? "Invitation Details"
                    : "Transaction Details"}
                </h4>
                <div className="space-y-2 text-sm">
                  {successData.type === "invitation" ? (
                    <>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-500">Invitation Type:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {successData.inviteType === "link"
                            ? "Link Invitation"
                            : "In-App Invitation"}
                        </span>
                      </div> */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Invited Email:</span>
                        <span className="font-medium text-gray-900">
                          {successData.inviteeEmail}
                        </span>
                      </div>
                      {successData.inviteCode && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Invite Code:</span>
                          <span className="font-medium text-gray-900 text-xs">
                            {successData.inviteCode}
                          </span>
                        </div>
                      )}
                      {successData.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expires:</span>
                          <span className="font-medium text-gray-900 text-xs">
                            {new Date(successData.expiresAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium text-gray-900">
                          KSh {successData.amount.toLocaleString()}
                        </span>
                      </div>
                      {successData.type === "withdrawal" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phone:</span>
                            <span className="font-medium text-gray-900">
                              +{successData.phone}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Withdrawal Type:
                            </span>
                            <span className="font-medium text-gray-900 capitalize">
                              {successData.withdrawalType}
                            </span>
                          </div>
                        </>
                      ) : successData.paymentMethod === "paybill" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Paybill Number:
                            </span>
                            <span className="font-medium text-gray-900">
                              {successData.paybillNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Account Number:
                            </span>
                            <span className="font-medium text-gray-900 text-xs">
                              {successData.accountNumber}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone:</span>
                          <span className="font-medium text-gray-900">
                            {successData.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pool:</span>
                        <span className="font-medium text-gray-900">
                          {successData.poolName}
                        </span>
                      </div>
                    </>
                  )}
                  {successData.type !== "invitation" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {successData.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div
                className={`${
                  successData.type === "invitation"
                    ? "bg-purple-50"
                    : successData.type === "withdrawal"
                    ? "bg-red-50"
                    : "bg-blue-50"
                } rounded-xl p-4 mb-6`}
              >
                <div className="flex items-start gap-3">
                  {successData.type === "invitation" ? (
                    <UserPlus className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  ) : successData.type === "withdrawal" ? (
                    <ArrowDownLeft
                      className={`w-5 h-5 ${
                        successData.type === "withdrawal"
                          ? "text-red-600"
                          : "text-blue-600"
                      } mt-0.5 flex-shrink-0`}
                    />
                  ) : successData.paymentMethod === "paybill" ? (
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <h5
                      className={`font-medium ${
                        successData.type === "invitation"
                          ? "text-purple-900"
                          : successData.type === "withdrawal"
                          ? "text-red-900"
                          : "text-blue-900"
                      } text-sm mb-1`}
                    >
                      Next Steps:
                    </h5>
                    {successData.type === "invitation" ? (
                      <ol className="text-xs text-purple-700 space-y-1">
                        {successData.inviteType === "link" ? (
                          <>
                            <li>1. Copy the invitation link below</li>
                            <li>
                              2. Share it with potential members via WhatsApp,
                              SMS, or email
                            </li>
                            <li>3. The link expires in 3 days</li>
                            <li>4. Members can join by clicking the link</li>
                            <li>5. You'll be notified when someone joins</li>
                          </>
                        ) : (
                          <>
                            <li>
                              1. The user will receive a pool invite
                              notification
                            </li>
                            <li>2. They can accept or ignore the invitation</li>
                            <li>
                              3. Members will be notified when the new member
                              accepts the invite
                            </li>
                            <li>
                              4. Once accepted, they'll be added to the pool
                            </li>
                          </>
                        )}
                      </ol>
                    ) : successData.type === "withdrawal" ? (
                      <ol
                        className={`text-xs ${
                          successData.type === "withdrawal"
                            ? "text-red-700"
                            : "text-blue-700"
                        } space-y-1`}
                      >
                        <li>1. Your withdrawal is being processed</li>
                        <li>2. Funds will be sent to {successData.phone}</li>
                        <li>3. You'll receive an M-Pesa confirmation SMS</li>
                        <li>4. Processing may take a few minutes</li>
                      </ol>
                    ) : successData.paymentMethod === "paybill" ? (
                      <ol className="text-xs text-blue-700 space-y-1">
                        <li>1. Go to M-Pesa on your phone</li>
                        <li>2. Select "Lipa na M-Pesa" → "Pay Bill"</li>
                        <li>
                          3. Enter Paybill Number:{" "}
                          <strong>{successData.paybillNumber}</strong>
                        </li>
                        <li>
                          4. Enter Account Number:{" "}
                          <strong>{successData.accountNumber}</strong>
                        </li>
                        <li>
                          5. Enter Amount:{" "}
                          <strong>
                            KSh {successData.amount.toLocaleString()}
                          </strong>
                        </li>
                        <li>6. Enter your M-Pesa PIN to complete</li>
                        <li>
                          7. Your pool balance will update after confirmation
                        </li>
                      </ol>
                    ) : (
                      <ol className="text-xs text-blue-700 space-y-1">
                        <li>1. Check your phone for M-Pesa notification</li>
                        <li>2. Enter your M-Pesa PIN to complete payment</li>
                        <li>3. You'll receive a confirmation SMS</li>
                        <li>4. Your pool balance will update automatically</li>
                      </ol>
                    )}
                  </div>
                </div>
              </div>

              {/* Copy Link Section for Link Invitations */}
              {successData.type === "invitation" &&
                successData.inviteType === "link" &&
                successData.inviteCode && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 text-sm">
                        Invitation Link
                      </h5>
                      <button
                        onClick={async () => {
                          try {
                            const inviteLink = `${window.location.origin}/join/${successData.inviteCode}`;
                            await navigator.clipboard.writeText(inviteLink);
                            // Change button text temporarily to show success
                            const button = event.target;
                            const originalText = button.innerHTML;
                            button.innerHTML =
                              '<CheckCircle className="w-4 h-4" /> Copied!';
                            button.className =
                              "flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg transition-colors";
                            setTimeout(() => {
                              button.innerHTML = originalText;
                              button.className =
                                "flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors";
                            }, 2000);
                          } catch (err) {
                            console.error("Failed to copy link:", err);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 break-all">
                        {`${window.location.origin}/join/${successData.inviteCode}`}
                      </p>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessData(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                {successData.type === "invitation" ? (
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccessData(null);
                      setShowInviteModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Invite More Members
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccessData(null);
                      setShowDepositModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Make Another Deposit
                  </button>
                )}
              </div>

              {/* Footer Note */}
              {successData.type === "invitation" ? (
                <p className="text-xs text-gray-500 mt-4">
                  The invitation expires after 3 days. Share widely to maximize
                  member engagement.
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-4">
                  Having trouble? The M-Pesa prompt may take up to 30 seconds to
                  appear.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function PoolDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pool details...</p>
          </div>
        </div>
      }
    >
      <PoolDetailPageContent />
    </Suspense>
  );
}

// Add Phone Modal
// Render modal near the root of the component tree (after main return)
// Note: Positioned before default export to keep inside module scope
// The modal relies on state defined in PoolDetailPageContent
// We'll append JSX inside the component's JSX before </DashboardLayout>
