"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").min(3, "Group name must be at least 3 characters"),
  description: z.string().optional(),
});

/**
 * @param {Object} props
 * @param {(data: any) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function CreateGroupForm({ onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Group Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
          Group Name *
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter group name"
          disabled={isSubmitting}
          {...register("name")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-2">{errors.name.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Describe the purpose of this group (optional)"
          rows={4}
          disabled={isSubmitting}
          {...register("description")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
        />
      </div>

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
          {isSubmitting ? "Creating..." : "Create Group"}
        </button>
      </div>
    </form>
  );
}
