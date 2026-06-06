"use client";

import React from "react";
import { AlertTriangle, Loader } from "lucide-react";

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Callback when modal closes
 * @param {() => Promise<void>} props.onConfirm - Callback when delete is confirmed
 * @param {string} props.groupName - Name of the group to delete
 * @param {number} props.memberCount - Number of members in the group
 * @param {boolean} props.isLoading - Whether delete is in progress
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  memberCount,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Invisible but clickable */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Group?</h2>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-900">
              You are about to delete <span className="font-semibold">{groupName}</span>
            </p>
            <p className="text-sm text-gray-600">
              This group has <span className="font-semibold">{memberCount}</span> member{memberCount !== 1 ? "s" : ""}.
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Deleting..." : "Delete Group"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
