"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import { loadCurrencyMap, getCurrencySymbolFromMap } from "@/lib/currency";
import {
  ArrowLeft,
  FolderOpen,
  Calendar,
  DollarSign,
  Target,
  Users,
  Settings,
  Info,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";

function EditPoolPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const poolId = params.poolId;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    type: "general",
    customType: "",
    endDate: "",
    withdrawalSettings: {
      requires_approval: true,
      auto_withdrawal: false,
      approvers: ["creator", "admins"],
    },
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pool, setPool] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    if (poolId) {
      loadPoolData();
    }
  }, [user, router, poolId]);

  const loadPoolData = async () => {
    try {
      setInitialLoading(true);
      const response = await dashboardAPI.getPoolDetails(poolId);

      if (response.success) {
        const poolData = response.data.pool;
        setPool(poolData);

        // Prefill form with existing data
        setFormData({
          name: poolData.name || "",
          description: poolData.description || "",
          targetAmount: poolData.targetAmount?.toString() || "",
          type:
            poolData.type === "general" ||
            poolData.type === "trip" ||
            poolData.type === "business" ||
            poolData.type === "education" ||
            poolData.type === "event"
              ? poolData.type
              : "other",
          customType:
            poolData.type === "general" ||
            poolData.type === "trip" ||
            poolData.type === "business" ||
            poolData.type === "education" ||
            poolData.type === "event"
              ? ""
              : poolData.type,
          endDate: poolData.endDate
            ? new Date(poolData.endDate).toISOString().split("T")[0]
            : "",
          withdrawalSettings: {
            requires_approval:
              poolData.withdrawalSettings?.requires_approval ?? true,
            auto_withdrawal:
              poolData.withdrawalSettings?.auto_withdrawal ?? false,
            approvers: poolData.withdrawalSettings?.approvers || [
              "creator",
              "admins",
            ],
          },
        });
      } else {
        setErrors({ submit: "Failed to load pool data" });
      }
    } catch (error) {
      console.error("Failed to load pool data:", error);
      setErrors({ submit: handleApiError(error, "Failed to load pool data") });
    } finally {
      setInitialLoading(false);
    }
  };

  // Currency map (shared helper)
  const [currencyMap, setCurrencyMap] = useState({});

  useEffect(() => {
    let mounted = true;
    loadCurrencyMap()
      .then((map) => {
        if (mounted) setCurrencyMap(map);
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  const getCurrencySymbol = (paymentMethod) =>
    getCurrencySymbolFromMap(currencyMap, pool?.currency, paymentMethod);

  if (authLoading) {
    return (
      <DashboardLayout title="Edit Pool" subtitle="Update your pool settings">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (initialLoading) {
    return (
      <DashboardLayout title="Edit Pool" subtitle="Update your pool settings">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pool data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Pool name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Pool name must be at least 3 characters";
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Pool name must be less than 255 characters";
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = "Target amount is required";
    } else {
      const amount = parseFloat(formData.targetAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.targetAmount = "Target amount must be greater than 0";
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (endDate <= today) {
        newErrors.endDate = "End date must be in the future";
      }
    }

    if (formData.type === "other" && !formData.customType.trim()) {
      newErrors.customType = "Please specify the pool type";
    } else if (
      formData.type === "other" &&
      formData.customType.trim().length > 50
    ) {
      newErrors.customType = "Custom type must be less than 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedPoolData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        type:
          formData.type === "other"
            ? formData.customType.trim()
            : formData.type,
        endDate: formData.endDate || null,
        withdrawalSettings: formData.withdrawalSettings,
      };

      await dashboardAPI.updatePool(poolId, updatedPoolData);
      router.push(`/pools/${poolId}`);
    } catch (error) {
      console.error("Failed to update pool:", error);
      setErrors({ submit: handleApiError(error, "Failed to update pool") });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const poolTypes = [
    {
      value: "general",
      label: "General",
      description: "General pool",
      emoji: "💰",
    },
    { value: "trip", label: "Trip", description: "Travel pool", emoji: "🌴" },
    {
      value: "business",
      label: "Business",
      description: "Business pool",
      emoji: "💼",
    },
    {
      value: "education",
      label: "Education",
      description: "Education pool",
      emoji: "📚",
    },
    { value: "event", label: "Event", description: "Events pool", emoji: "🎉" },
    { value: "other", label: "Other", description: "Custom pool", emoji: "🔧" },
  ];

  return (
    <DashboardLayout title="Edit Pool" subtitle="Update your pool settings">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/pools/${poolId}`)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Pool</h1>
            <p className="text-gray-600">
              Update your pool settings and information
            </p>
          </div>
        </div>

        {/* Pool Info Banner */}
        {pool && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Current Balance:</strong>{" "}
                  {getCurrencySymbol(
                    pool?.payment_method || pool?.paymentMethod
                  )}{" "}
                  {pool.currentBalance?.toLocaleString() || "0"} •
                  <strong>Members:</strong> {pool.memberCount || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Note: Some changes may affect ongoing transactions
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Unified Card: Basic Info + Pool Type */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#b8b5ff] rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[#7a73ff]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pool Details
                </h2>
                <p className="text-sm text-gray-500">
                  Update the details for your pool
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pool Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g., Team Vacation Fund, Office Equipment"
                  maxLength={255}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>
              {/* Pool Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-[#7a73ff] transition-all duration-300 text-gray-900 shadow-sm"
                  >
                    {poolTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount *
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    handleInputChange("targetAmount", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                    errors.targetAmount
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter target amount"
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.targetAmount}
                  </p>
                )}
              </div>
              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                    errors.endDate
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#7a73ff] text-white rounded-lg hover:bg-[#6a63e0] transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function EditPoolPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPoolPageContent />
    </Suspense>
  );
}
