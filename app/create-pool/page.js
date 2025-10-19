"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  ArrowLeft,
  FolderOpen,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
} from "lucide-react";

export default function CreatePoolPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    type: "general",
    customType: "",
    endDate: "",
    withdrawalSettings: {
      requires_approval: false,
      auto_withdrawal: true,
      approvers: ["creator", "admins"],
    },
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <DashboardLayout
        title="Create New Pool"
        subtitle="Set up a new pool for you and your team"
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
      const poolData = {
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

      const response = await dashboardAPI.createPool(poolData);

      // Redirect to the newly created pool
      router.push(`/pools/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create pool:", error);
      setErrors({ submit: handleApiError(error, "Failed to create pool") });
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
    <DashboardLayout
      title="Create New Pool"
      subtitle="Set up a new pool for you and your team"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Pool
            </h1>
            <p className="text-gray-600">
              Set up a new pool for you and your team
            </p>
          </div>
        </div>

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
                  Enter all the details for your new pool
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
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7a73ff]" />
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      handleInputChange("targetAmount", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                      errors.targetAmount
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="50000"
                    min="100"
                    max="10000000"
                    step="100"
                  />
                </div>
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
                  End Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7a73ff]" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                      errors.endDate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>
              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Tell your team what this pool is for..."
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>
              {/* Custom Type Input */}
              {formData.type === "other" && (
                <div className="lg:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Pool Type *
                  </label>
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) =>
                      handleInputChange("customType", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent transition-colors placeholder-gray-500 text-gray-900 ${
                      errors.customType
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., House Down Payment, Car Purchase, Wedding"
                    maxLength={50}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.customType && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.customType}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.customType.length}/50
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings removed — withdrawal processing is automatic */}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-[#7a73ff] text-[#7a73ff] rounded-lg bg-white hover:bg-[#f6f5ff] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#7a73ff] text-white rounded-lg hover:bg-[#6961ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Pool...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  Create Pool
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
