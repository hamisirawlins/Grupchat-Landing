"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import SideoverPanel from "@/components/community/SideoverPanel";
import CreateGroupForm from "@/components/community/CreateGroupForm";
import AddGoalForm from "@/components/community/AddGoalForm";
import { communityAPI, handleApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  LinkIcon,
  Calendar,
  FolderOpen,
  Users,
  BarChart3,
} from "lucide-react";

export default function CommunityPage() {
  // Role toggle for development
  const [userRole, setUserRole] = useState("pm"); // or "member"
  const [dateRange, setDateRange] = React.useState("12weeks");
  const router = useRouter();

  // Slideover state
  const [showCreateGroupPanel, setShowCreateGroupPanel] = useState(false);
  const [showAddGoalPanel, setShowAddGoalPanel] = useState(false);

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const response = await communityAPI.getGroups("all");
      setGroups(
        (response.data || []).map((g) => ({ id: g.id, name: g.name })),
      );
    } catch (error) {
      setGroupsError(handleApiError(error, "Failed to load groups"));
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Mock insights data (from CommunityRequirements.md)
  const mockInsights = {
    weekNewGoals: 24,
    weekCompletedGoals: 18,
    weekIncompleteGoals: 12,
    trendPercentage: 15,
    trendDirection: "up",
  };

  const handleCreateGroup = async (data) => {
    try {
      await communityAPI.createGroup(data);
      await loadGroups();
      toast.success(`Group "${data.name}" created`);
      setShowCreateGroupPanel(false);
    } catch (error) {
      const message = handleApiError(error, "Failed to create group");
      if (message) toast.error(message);
      throw error;
    }
  };

  const handleAddGoal = async (data) => {
    try {
      // For dashboard context, members must specify groupIds
      // PMs can use applyToAll to apply to all groups
      const payload = {
        title: data.title,
        complexity: data.complexity || "medium",
        status: "todo",
        ...(data.applyToAll ? { applyToAll: true } : { groupIds: data.groupIds || [] }),
      };

      if (!payload.groupIds?.length && !payload.applyToAll) {
        toast.error("Please select at least one group or apply to all groups");
        return;
      }

      await communityAPI.createGoal(payload);
      toast.success(`Goal "${data.title}" created`);
      setShowAddGoalPanel(false);
      // Reload insights and heatmap
      await Promise.all([loadInsights(), loadHeatmap()]);
    } catch (error) {
      const message = handleApiError(error, "Failed to create goal");
      if (message) toast.error(message);
      throw error;
    }
  };

  // Generate mock heatmap data (12 weeks)
  const [mockHeatmapData, setMockHeatmapData] = React.useState([]);

  React.useEffect(() => {
    const generateHeatmapData = () => {
      const weeks = [];
      for (let w = 0; w < 12; w++) {
        const days = [];
        for (let d = 0; d < 7; d++) {
          const count = Math.floor(Math.random() * 8);
          days.push({
            day: d,
            count,
            complexity: {
              simple: Math.floor(count * 0.5),
              medium: Math.floor(count * 0.3),
              complex: Math.floor(count * 0.2),
            },
          });
        }
        weeks.push({ week: w, days });
      }
      return weeks;
    };
    setMockHeatmapData(generateHeatmapData());
  }, []);

  // Helper to get intensity color for heatmap cell
  const getHeatmapColor = (count) => {
    if (count === 0) return "bg-gray-100 text-gray-900";
    if (count <= 2) return "bg-[#ede9ff] text-gray-900";
    if (count <= 4) return "bg-[#c5bcff] text-gray-900";
    if (count <= 6) return "bg-[#9b92f7] text-white";
    return "bg-[#8b83ff] text-white";
  };

  // Insight Card Component
  const InsightCard = ({ icon: Icon, title, value, subtitle, trend, trendDirection }) => (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend}%</span>
            {trendDirection === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mb-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );

  // Action Button Component
  const ActionButton = ({ icon: Icon, label, onClick, isPrimary = false }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
        isPrimary
          ? "bg-[#7a73ff] text-white hover:bg-[#6b63ff]"
          : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
        isPrimary
          ? "bg-white/20 text-white"
          : "bg-[#f3f1ff] text-[#6b63ff]"
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );

  return (
    <DashboardWrapper>
      {/* Page Content */}
      <div className="px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 lg:pb-20 space-y-10 w-full min-w-0">
        {/* Header with Role Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Community
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
              Goals & Progress
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Track your goal completion, manage groups, and view team-wide insights.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setUserRole("pm")}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                userRole === "pm"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              PM View
            </button>
            <button
              onClick={() => setUserRole("member")}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                userRole === "member"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Member View
            </button>
          </div>
        </div>

        {/* SECTION 1: Insights Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">This Week's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightCard
              icon={Plus}
              title="New Goals"
              value={mockInsights.weekNewGoals}
              subtitle="Created this week"
            />
            <InsightCard
              icon={Calendar}
              title="Completed Goals"
              value={mockInsights.weekCompletedGoals}
              subtitle="Marked as done"
            />
            <InsightCard
              icon={Users}
              title="Incomplete Goals"
              value={mockInsights.weekIncompleteGoals}
              subtitle="Still in progress"
            />
            <InsightCard
              icon={BarChart3}
              title="Goal Trend"
              value={`+${mockInsights.trendPercentage}%`}
              trend={mockInsights.trendPercentage}
              trendDirection={mockInsights.trendDirection}
              subtitle="vs. last week"
            />
          </div>
        </div>

        {/* SECTION 2: Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userRole === "pm" ? (
              <>
                <ActionButton
                  icon={FolderOpen}
                  label="Create Group"
                  onClick={() => setShowCreateGroupPanel(true)}
                  isPrimary
                />
                <ActionButton
                  icon={Users}
                  label="Manage Groups"
                  onClick={() => router.push("/community/groups")}
                />
                <ActionButton
                  icon={Plus}
                  label="Add Goal"
                  onClick={() => setShowAddGoalPanel(true)}
                  isPrimary
                />
                <ActionButton
                  icon={LinkIcon}
                  label="Manage Resources"
                  onClick={() => router.push("/community/resources?role=pm")}
                />
              </>
            ) : (
              <>
                <ActionButton
                  icon={Plus}
                  label="Add Goal"
                  onClick={() => setShowAddGoalPanel(true)}
                  isPrimary
                />
                <ActionButton
                  icon={LinkIcon}
                  label="View Resources"
                  onClick={() => router.push("/community/resources?role=member")}
                />
              </>
            )}
          </div>
        </div>

        {/* SECTION 3: Goals Completion Heatmap */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Goal Completion Activity</h2>
              <p className="text-sm text-gray-500 mt-1">12-week overview • Purple intensity = Goal volume</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            {/* Heatmap Legend and Date Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-semibold">Less</span>
                {[
                  "bg-gray-100",
                  "bg-[#ede9ff]",
                  "bg-[#c5bcff]",
                  "bg-[#9b92f7]",
                  "bg-[#8b83ff]",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded ${color}`}
                  />
                ))}
                <span className="text-xs text-gray-500 font-semibold">More</span>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="4weeks">Last 4 weeks</option>
                <option value="12weeks">Last 12 weeks</option>
                <option value="26weeks">Last 6 months</option>
                <option value="52weeks">Last year</option>
              </select>
            </div>

            {/* Heatmap Grid */}
            <div className="w-full overflow-x-auto">
              <div className="w-full min-w-0">
                {/* Week labels */}
                <div className="flex gap-1 mb-2">
                  <div className="w-8 flex-shrink-0" /> {/* Spacer for day labels */}
                  {mockHeatmapData.map((week) => (
                    <div key={week.week} className="flex-1 min-w-12 text-center">
                      <p className="text-xs text-gray-400">W{week.week + 1}</p>
                    </div>
                  ))}
                </div>

                {/* Day rows */}
                {[
                  { label: "Mon", index: 0 },
                  { label: "Tue", index: 1 },
                  { label: "Wed", index: 2 },
                  { label: "Thu", index: 3 },
                  { label: "Fri", index: 4 },
                  { label: "Sat", index: 5 },
                  { label: "Sun", index: 6 },
                ].map((dayInfo) => (
                  <div key={dayInfo.label} className="flex gap-1 items-center mb-1">
                    <div className="w-8 flex-shrink-0 text-right">
                      <p className="text-xs text-gray-400">{dayInfo.label}</p>
                    </div>
                    {mockHeatmapData.map((week) => {
                      const dayData = week.days[dayInfo.index];
                      return (
                        <div
                          key={`${week.week}-${dayInfo.index}`}
                          className={`flex-1 min-w-12 h-10 rounded-lg ${getHeatmapColor(dayData.count)} hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer flex items-center justify-center text-xs font-semibold hover:bg-purple-500 hover:text-white`}
                          title={`${dayData.count} goals • ${dayData.complexity.simple} simple, ${dayData.complexity.medium} medium, ${dayData.complexity.complex} complex`}
                        >
                          {dayData.count > 0 ? dayData.count : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Hover over cells to see goal breakdown by complexity (Simple • Medium • Complex)
              </p>
            </div>
          </div>
        </div>

        {/* SLIDEOVER PANELS */}
        <SideoverPanel
          isOpen={showCreateGroupPanel}
          onClose={() => setShowCreateGroupPanel(false)}
          title="Create Group"
          subtitle="Start a new group to collaborate with your team"
        >
          <CreateGroupForm
            onSubmit={handleCreateGroup}
            onCancel={() => setShowCreateGroupPanel(false)}
          />
        </SideoverPanel>

        <SideoverPanel
          isOpen={showAddGoalPanel}
          onClose={() => setShowAddGoalPanel(false)}
          title="Add Goal"
          subtitle="Create a new goal for your team"
        >
          <AddGoalForm
            userRole={userRole}
            availableGroups={groups}
            onSubmit={handleAddGoal}
            onCancel={() => setShowAddGoalPanel(false)}
          />
          {groupsLoading && (
            <p className="text-sm text-gray-500 mt-2">Loading groups...</p>
          )}
          {groupsError && (
            <p className="text-sm text-red-600 mt-2">{groupsError}</p>
          )}
        </SideoverPanel>
      </div>
    </DashboardWrapper>
  );
}
