"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
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
  const { user } = useAuth();
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
      } else if (amount < 100) {
        newErrors.targetAmount = "Target amount must be at least KSh 100";
      } else if (amount > 10000000) {
        newErrors.targetAmount = "Target amount cannot exceed KSh 10,000,000";
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
      const updateData = {
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

      const response = await dashboardAPI.updatePool(poolId, updateData);

      // Redirect back to the pool details
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
                  <strong>Current Balance:</strong> KSh{" "}
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
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500">
                  Essential details about your pool
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter pool name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe your pool's purpose and goals"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (KSh) *
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    handleInputChange("targetAmount", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.targetAmount
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0"
                  min="100"
                  step="100"
                />
                {errors.targetAmount && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.targetAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {poolTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.type === "other" && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Type *
                  </label>
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) =>
                      handleInputChange("customType", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.customType
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Specify your custom pool type"
                    maxLength={50}
                  />
                  {errors.customType && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.customType}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.endDate
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Optional: Set a target completion date
                </p>
              </div>
            </div>
          </div>

          {/* Withdrawal Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Withdrawal Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Configure how members can withdraw funds
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Require Approval
                    </p>
                    <p className="text-sm text-gray-600">
                      All withdrawals must be approved by pool admins
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.withdrawalSettings.requires_approval}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      handleInputChange("withdrawalSettings", {
                        ...formData.withdrawalSettings,
                        requires_approval: newValue,
                        // If requiring approval, activate auto withdrawal (opposite)
                        auto_withdrawal: !newValue,
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Auto Withdrawal</p>
                    <p className="text-sm text-gray-600">
                      Allow members to withdraw without approval
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.withdrawalSettings.auto_withdrawal}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      handleInputChange("withdrawalSettings", {
                        ...formData.withdrawalSettings,
                        auto_withdrawal: newValue,
                        // If auto withdrawal is enabled, activate require approval (opposite)
                        requires_approval: !newValue,
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">
                      Withdrawal Settings Note:
                    </p>
                    <ul className="space-y-1">
                      <li>
                        • <strong>Require Approval:</strong> All withdrawals
                        need admin approval
                      </li>
                      <li>
                        • <strong>Auto Withdrawal:</strong> Members can withdraw
                        freely without approval
                      </li>
                      <li>
                        • Pool creators and admins can always approve/deny
                        withdrawals
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push(`/pools/${poolId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Pool
                </>
              )}
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
