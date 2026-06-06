"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import SideoverPanel from "@/components/community/SideoverPanel";
import AddGoalForm from "@/components/community/AddGoalForm";
import { communityAPI, handleApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Users,
  Loader2,
  MoreVertical,
  LogOut,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

export default function ViewGroupPage() {
  const { groupId } = useParams();
  const router = useRouter();

  // Group data
  const [group, setGroup] = useState(null);
  const [goals, setGoals] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [showAddGoalPanel, setShowAddGoalPanel] = useState(false);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  const loadGroupData = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const [groupRes, goalsRes, membersRes] = await Promise.all([
        communityAPI.getGroup(groupId),
        communityAPI.getGroupGoals(groupId),
        communityAPI.getGroupMembers(groupId),
      ]);

      setGroup(groupRes.data);
      setGoals(goalsRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError(handleApiError(err, "Failed to load group"));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const handleAddGoal = async (goalData) => {
    try {
      const response = await communityAPI.createGoal({
        ...goalData,
        groupIds: [groupId],
      });

      toast.success("Goal created successfully");
      setShowAddGoalPanel(false);
      await loadGroupData();
    } catch (err) {
      const message = handleApiError(err, "Failed to create goal");
      if (message) toast.error(message);
    }
  };

  const handleUpdateGoalStatus = async (goal, newStatus) => {
    if (newStatus === goal.status) return;

    setUpdatingGoalId(goal.id);
    try {
      await communityAPI.updateGoal(goal.id, {
        status: newStatus,
      });

      toast.success(`Goal marked as ${newStatus}`);
      await loadGroupData();
    } catch (err) {
      const message = handleApiError(err, "Failed to update goal");
      if (message) toast.error(message);
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleLeaveGroup = async () => {
    setLeavingGroup(true);
    try {
      await communityAPI.leaveGroup(groupId);
      toast.success("You have left the group");
      router.push("/community/groups");
    } catch (err) {
      const message = handleApiError(err, "Failed to leave group");
      if (message) toast.error(message);
    } finally {
      setLeavingGroup(false);
      setShowLeaveConfirm(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        );
      case "in-progress":
        return (
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        );
      case "todo":
      default:
        return (
          <Circle className="w-5 h-5 text-gray-400" />
        );
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "simple":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-purple-100 text-purple-800";
      case "complex":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "todo":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (!group) {
    return (
      <DashboardWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-center text-gray-500">Group not found</div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-gray-600 mt-1">{group.description}</p>
              )}
            </div>
          </div>
          {group.canEdit && (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          )}
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-gray-600 text-sm">Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-gray-600 text-sm">Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
          {members.length === 0 ? (
            <p className="text-gray-500">No members in this group yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        member.role === "pm"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.role === "pm" ? "PM" : "Member"}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Goals</h2>
            <button
              onClick={() => setShowAddGoalPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <p className="text-gray-500">No goals created yet</p>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(goal.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {goal.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Created {new Date(goal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getComplexityColor(
                        goal.complexity,
                      )}`}
                    >
                      {goal.complexity}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={goal.status}
                      onChange={(e) =>
                        handleUpdateGoalStatus(goal, e.target.value)
                      }
                      disabled={updatingGoalId === goal.id}
                      className={`text-xs px-3 py-1 rounded-full font-medium border-none cursor-pointer appearance-none ${getStatusColor(
                        goal.status,
                      )} ${updatingGoalId === goal.id ? "opacity-50" : ""}`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    {updatingGoalId === goal.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Leave Group?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave "{group.name}"? You will lose access to all group goals and data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leavingGroup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {leavingGroup ? "Leaving..." : "Leave Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Panel */}
      <SideoverPanel
        isOpen={showAddGoalPanel}
        onClose={() => setShowAddGoalPanel(false)}
        title="Add Goal"
      >
        <AddGoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setShowAddGoalPanel(false)}
          groupId={groupId}
          isGroupContext={true}
        />
      </SideoverPanel>
    </DashboardWrapper>
  );
}
