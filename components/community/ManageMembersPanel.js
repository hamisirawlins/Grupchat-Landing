"use client";

import React, { useState } from "react";
import { X, Plus, Search, Trash2 } from "lucide-react";

/**
 * @param {Object} props
 * @param {Object} props.group - Group data
 * @param {Array} props.members - Array of member objects {userId, name, email, role, joinedAt}
 * @param {(groupId: string, email: string) => Promise<void>} props.onAddMember
 * @param {(groupId: string, memberId: string) => Promise<void>} props.onRemoveMember
 * @param {boolean} [props.loading]
 * @param {() => void} props.onClose
 */
export default function ManageMembersPanel({
  group,
  members = [],
  loading = false,
  onAddMember,
  onRemoveMember,
  onClose,
}) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Filter members by search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add member
  const handleAddMember = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!newMemberEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!isValidEmail(newMemberEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsAddingMember(true);
    try {
      await onAddMember(group.id, newMemberEmail);
      setSuccessMessage(`${newMemberEmail} added successfully`);
      setNewMemberEmail("");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the group?")) {
      return;
    }

    setRemovingMemberId(memberId);
    try {
      await onRemoveMember(group.id, memberId);
      setSuccessMessage("Member removed successfully");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
        <p className="text-sm text-gray-500 mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} in this group
        </p>
      </div>

      {/* Add Member Section */}
      <div className="space-y-3 p-4 bg-[#f3f1ff] rounded-xl">
        <label className="block text-sm font-medium text-gray-900">Add New Member</label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter member email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            disabled={isAddingMember}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] text-sm disabled:bg-gray-50"
            onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            disabled={isAddingMember}
            className="px-4 py-2 rounded-lg bg-[#7a73ff] text-white font-medium hover:bg-[#6b63ff] disabled:bg-[#b5aff7] transition-colors flex items-center gap-2 text-sm"
          >
            {isAddingMember ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">{successMessage}</p>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] text-sm"
          />
        </div>

        {/* Members */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                {searchQuery ? "No members found" : "No members yet"}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-medium bg-[#ede9ff] text-[#7a73ff] px-2 py-0.5 rounded-full">
                      {member.role.toUpperCase()}
                    </span>
                    {member.status === "invited" && (
                      <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        INVITED
                      </span>
                    )}
                    {member.joinedAt && (
                      <span className="text-xs text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
