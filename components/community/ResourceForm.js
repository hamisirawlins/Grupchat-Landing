"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";

const resourceSchema = z.object({
  title: z.string()
    .min(1, "Resource title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  type: z.enum(["link", "document"], {
    errorMap: () => ({ message: "Please select a resource type" }),
  }),
  url: z.string()
    .min(1, "URL is required")
    .url("Please enter a valid URL"),
  groupId: z.string().min(1, "Please select a group"),
});

/**
 * @param {Object} props
 * @param {(data: any) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 * @param {Array} props.availableGroups
 */
export default function ResourceForm({ onSubmit, onCancel, availableGroups = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      type: "link",
      url: "",
      groupId: "",
    },
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
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
          Resource Title *
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter resource title"
          disabled={isSubmitting}
          {...register("title")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
        )}
      </div>

      {/* Type Field */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
          Resource Type *
        </label>
        <select
          id="type"
          disabled={isSubmitting}
          {...register("type")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="link">Link</option>
          <option value="document">Document</option>
        </select>
        {errors.type && (
          <p className="text-sm text-red-600 mt-2">{errors.type.message}</p>
        )}
      </div>

      {/* URL Field */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-900 mb-2">
          URL *
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://example.com/resource"
          disabled={isSubmitting}
          {...register("url")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.url && (
          <p className="text-sm text-red-600 mt-2">{errors.url.message}</p>
        )}
      </div>

      {/* Group Field */}
      <div>
        <label htmlFor="groupId" className="block text-sm font-medium text-gray-900 mb-2">
          Group *
        </label>
        <select
          id="groupId"
          disabled={isSubmitting}
          {...register("groupId")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Select a group...</option>
          {availableGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {errors.groupId && (
          <p className="text-sm text-red-600 mt-2">{errors.groupId.message}</p>
        )}
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
          {isSubmitting ? "Adding..." : "Add Resource"}
        </button>
      </div>
    </form>
  );
}
