"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import SideoverPanel from "@/components/community/SideoverPanel";
import EditGroupForm from "@/components/community/EditGroupForm";
import ManageMembersPanel from "@/components/community/ManageMembersPanel";
import DeleteConfirmationModal from "@/components/community/DeleteConfirmationModal";
import { communityAPI, handleApiError } from "@/lib/api";
import { Edit, Trash2, Users, Target, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ManageGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [editingGroup, setEditingGroup] = useState(null);
  const [managingGroupMembers, setManagingGroupMembers] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadGroups = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const response = await communityAPI.getGroups("all");
      setGroups(response.data || []);
    } catch (error) {
      setPageError(handleApiError(error, "Failed to load groups"));
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleEditGroup = (group) => {
    setEditingGroup(group);
  };

  const handleUpdateGroup = async (data) => {
    setIsLoading(true);
    try {
      const response = await communityAPI.updateGroup(editingGroup.id, data);
      setGroups((prev) =>
        prev.map((g) => (g.id === editingGroup.id ? response.data : g)),
      );
      toast.success(`Group "${data.name}" updated`);
      setEditingGroup(null);
    } catch (error) {
      const message = handleApiError(error, "Failed to update group");
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupMembers = useCallback(async (groupId) => {
    setMembersLoading(true);
    try {
      const response = await communityAPI.getGroupMembers(groupId);
      setGroupMembers(response.data || []);
    } catch (error) {
      const message = handleApiError(error, "Failed to load members");
      if (message) toast.error(message);
      setGroupMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const handleManageMembers = (group) => {
    setManagingGroupMembers(group);
    loadGroupMembers(group.id);
  };

  const handleAddMember = async (groupId, email) => {
    const response = await communityAPI.addGroupMember(groupId, email);
    await loadGroupMembers(groupId);
    await loadGroups();
    if (response.data?.invite?.inviteUrl) {
      toast.success("Invite created", {
        description: "Share the join link with the member.",
      });
    } else {
      toast.success("Member invited");
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    await communityAPI.removeGroupMember(groupId, memberId);
    await loadGroupMembers(groupId);
    await loadGroups();
    toast.success("Member removed");
  };

  const handleDeleteGroup = (group) => {
    setDeleteConfirmation(group);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await communityAPI.deleteGroup(deleteConfirmation.id);
      setGroups((prev) => prev.filter((g) => g.id !== deleteConfirmation.id));
      toast.success(`Group "${deleteConfirmation.name}" removed`);
      setDeleteConfirmation(null);
    } catch (error) {
      const message = handleApiError(error, "Failed to delete group");
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const GroupCard = ({ group }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Members</p>
          <p className="text-xl font-semibold text-gray-900">{group.memberCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Goals</p>
          <p className="text-xl font-semibold text-gray-900">{group.goalCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleManageMembers(group)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#ede9ff] text-[#7a73ff] hover:bg-[#d9d0ff] font-medium text-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          Members
        </button>
        <button
          onClick={() => router.push(`/community/groups/${group.id}`)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#ede9ff] text-[#7a73ff] hover:bg-[#d9d0ff] font-medium text-sm transition-colors"
        >
          <Target className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => handleEditGroup(group)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => handleDeleteGroup(group)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );

  // Insight Card Component
  const InsightCard = ({ label, value, subtext }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <DashboardWrapper>
      <div className="px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 lg:pb-20 space-y-10 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/community")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Community
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
              Manage Groups
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              View and manage all groups, members, and goals within your organization.
            </p>
          </div>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InsightCard
            label="Total Groups"
            value={groups.length}
            subtext="Active groups"
          />
          <InsightCard
            label="Total Members"
            value={groups.reduce((sum, g) => sum + g.memberCount, 0)}
            subtext="Across all groups"
          />
          <InsightCard
            label="Total Goals"
            value={groups.reduce((sum, g) => sum + g.goalCount, 0)}
            subtext="All statuses"
          />
          <InsightCard
            label="Avg Goals/Group"
            value={
              groups.length
                ? (
                    groups.reduce((sum, g) => sum + g.goalCount, 0) / groups.length
                  ).toFixed(1)
                : "0"
            }
            subtext="Per group average"
          />
        </div>

        {/* Groups Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Groups</h2>

          {pageError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {pageError}
            </p>
          )}

          {pageLoading ? (
            <p className="text-sm text-gray-500">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-gray-500">
              No groups yet. Create one from the Community dashboard.
            </p>
          ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Group Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{group.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{group.memberCount}</span>
                          <button
                            onClick={() => handleManageMembers(group)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ede9ff] text-[#7a73ff] hover:bg-[#d9d0ff] text-xs font-medium transition-colors"
                          >
                            <Users className="w-3 h-3" />
                            Manage
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{group.goalCount}</span>
                          <button
                            onClick={() => toast.info("Goals management — coming soon")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ede9ff] text-[#7a73ff] hover:bg-[#d9d0ff] text-xs font-medium transition-colors"
                          >
                            <Target className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit group"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>

        {/* Edit Group Sideover */}
        <SideoverPanel
          isOpen={editingGroup !== null}
          onClose={() => setEditingGroup(null)}
          title="Edit Group"
          subtitle="Update group name and description"
        >
          {editingGroup && (
            <EditGroupForm
              group={editingGroup}
              onSubmit={handleUpdateGroup}
              onCancel={() => setEditingGroup(null)}
            />
          )}
        </SideoverPanel>

        {/* Manage Members Sideover */}
        <SideoverPanel
          isOpen={managingGroupMembers !== null}
          onClose={() => setManagingGroupMembers(null)}
          title="Manage Members"
          subtitle="Add and remove group members"
        >
          {managingGroupMembers && (
            <ManageMembersPanel
              group={managingGroupMembers}
              members={groupMembers}
              loading={membersLoading}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onClose={() => setManagingGroupMembers(null)}
            />
          )}
        </SideoverPanel>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteConfirmation !== null}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={handleConfirmDelete}
          groupName={deleteConfirmation?.name || ""}
          memberCount={deleteConfirmation?.memberCount || 0}
          isLoading={isLoading}
        />
      </div>
    </DashboardWrapper>
  );
}
