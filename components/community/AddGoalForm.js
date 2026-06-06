"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader, X, ChevronDown } from "lucide-react";

const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required").min(3, "Title must be at least 3 characters"),
  complexity: z.enum(["simple", "medium", "complex"], {
    errorMap: () => ({ message: "Please select a complexity level" }),
  }),
  status: z.enum(["todo", "in-progress", "done"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  groups: z.array(z.string()).min(1, "Please select at least one group").optional(),
  selectAll: z.boolean().optional(),
});

/**
 * @param {Object} props
 * @param {"pm" | "member"} props.userRole
 * @param {Array<{id: string, name: string}>} props.availableGroups
 * @param {(data: any) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 * @param {boolean} [props.isGroupContext] - Whether called from a group view page
 * @param {string} [props.groupId] - Pre-selected group ID if in group context
 */
export default function AddGoalForm({ 
  userRole, 
  availableGroups = [], 
  onSubmit, 
  onCancel,
  isGroupContext = false,
  groupId = null,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      complexity: "simple",
      status: "todo",
      groups: [],
      selectAll: false,
    },
  });

  const selectedGroups = watch("groups");

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setValue("groups", availableGroups.map(g => g.id));
    } else {
      setValue("groups", []);
    }
  };

  const handleGroupChange = (groupId) => {
    const current = selectedGroups || [];
    if (current.includes(groupId)) {
      setValue("groups", current.filter(id => id !== groupId));
    } else {
      setValue("groups", [...current, groupId]);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
      reset();
      setSelectAll(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Goal Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
          Goal Title *
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter goal title"
          disabled={isSubmitting}
          {...register("title")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
        )}
      </div>

      {/* Complexity Field */}
      <div>
        <label htmlFor="complexity" className="block text-sm font-medium text-gray-900 mb-2">
          Complexity *
        </label>
        <select
          id="complexity"
          disabled={isSubmitting}
          {...register("complexity")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="simple">Simple</option>
          <option value="medium">Medium</option>
          <option value="complex">Complex</option>
        </select>
        {errors.complexity && (
          <p className="text-sm text-red-600 mt-2">{errors.complexity.message}</p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
          Status *
        </label>
        <select
          id="status"
          disabled={isSubmitting}
          {...register("status")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {errors.status && (
          <p className="text-sm text-red-600 mt-2">{errors.status.message}</p>
        )}
      </div>

      {/* Group Selection Field */}
      {!isGroupContext && userRole === "pm" ? (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Target Groups *
          </label>

          {/* PM: Searchable Dropdown with Chips */}
          <div className="relative">
            {/* Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-left bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <span className="text-sm text-gray-600">
                {selectedGroups?.length > 0 ? `${selectedGroups.length} selected` : "Select groups..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {/* Search Input */}
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] text-sm"
                  />
                </div>

                {/* Select All Option */}
                {availableGroups.length > 1 && (
                  <div className="p-3 border-b border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        disabled={isSubmitting}
                        className="w-4 h-4 rounded border-gray-300 text-[#7a73ff] cursor-pointer accent-[#7a73ff]"
                      />
                      <span className="text-sm font-medium text-gray-700">Select all groups</span>
                    </label>
                  </div>
                )}

                {/* Group Options */}
                <div className="max-h-48 overflow-y-auto">
                  {availableGroups
                    .filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups?.includes(group.id) || false}
                          onChange={() => handleGroupChange(group.id)}
                          disabled={isSubmitting}
                          className="w-4 h-4 rounded border-gray-300 text-[#7a73ff] cursor-pointer accent-[#7a73ff]"
                        />
                        <span className="text-sm text-gray-700">{group.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Chips */}
          {selectedGroups && selectedGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedGroups.map((groupId) => {
                const group = availableGroups.find((g) => g.id === groupId);
                return group ? (
                  <div
                    key={groupId}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#ede9ff] text-[#7a73ff] rounded-full text-sm font-medium"
                  >
                    {group.name}
                    <button
                      type="button"
                      onClick={() => handleGroupChange(groupId)}
                      className="hover:text-[#6b63ff]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {errors.groups && (
            <p className="text-sm text-red-600 mt-2">{errors.groups.message}</p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            {isGroupContext 
              ? "This goal will be added to this group."
              : "You can update the goal status and details after creation."}
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 rounded-xl bg-[#7a73ff] text-white font-medium hover:bg-[#6b63ff] disabled:bg-[#b5aff7] transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Adding..." : "Add Goal"}
        </button>
      </div>
    </form>
  );
}
