"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import SideoverPanel from "@/components/community/SideoverPanel";
import ResourceForm from "@/components/community/ResourceForm";
import { Plus, ExternalLink, Trash2, ArrowLeft, ChevronDown } from "lucide-react";

export default function ResourcesPage() {
  return (
    <Suspense>
      <ResourcesPageContent />
    </Suspense>
  );
}

function ResourcesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role") || "pm";
  const isPM = userRole === "pm";

  const [showAddResourcePanel, setShowAddResourcePanel] = useState(false);
  const [selectedGroupForAdd, setSelectedGroupForAdd] = useState(null);
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Mock groups for reference
  const mockGroups = [
    { id: "1", name: "Frontend Team" },
    { id: "2", name: "Backend Team" },
    { id: "3", name: "Product Team" },
    { id: "4", name: "Design Team" },
  ];

  // Mock user's group (for members)
  const userGroupId = "1"; // Assume member is in Frontend Team

  // Mock resources data
  const [resources, setResources] = useState([
    {
      id: "r1",
      title: "Frontend Docs",
      type: "link",
      url: "https://docs.example.com/frontend",
      groupId: "1",
      createdAt: "2024-01-15",
      createdBy: "user1",
    },
    {
      id: "r2",
      title: "Storybook",
      type: "link",
      url: "https://storybook.example.com",
      groupId: "1",
      createdAt: "2024-01-18",
      createdBy: "user2",
    },
    {
      id: "r3",
      title: "Design System",
      type: "link",
      url: "https://design.example.com",
      groupId: "4",
      createdAt: "2024-01-20",
      createdBy: "user3",
    },
    {
      id: "r4",
      title: "API Documentation",
      type: "link",
      url: "https://api.example.com/docs",
      groupId: "2",
      createdAt: "2024-01-10",
      createdBy: "user4",
    },
  ]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleAddResource = async (data) => {
    const newResource = {
      id: `r${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "currentUser",
    };
    setResources([...resources, newResource]);
    setShowAddResourcePanel(false);
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }
    setDeletingResourceId(resourceId);
    try {
      setResources(resources.filter((r) => r.id !== resourceId));
    } finally {
      setDeletingResourceId(null);
    }
  };

  // Get resources for a group
  const getGroupResources = (groupId) => {
    return resources.filter((r) => r.groupId === groupId);
  };

  // Determine which groups to show
  const visibleGroups = isPM ? mockGroups : mockGroups.filter((g) => g.id === userGroupId);

  return (
    <DashboardWrapper>
      <div className="px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 lg:pb-20 space-y-10 w-full min-w-0">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Resources
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
              Group Resources
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isPM ? "Manage resources across all groups" : "View and manage resources in your group"}
            </p>
          </div>
        </div>

        {/* Groups Table */}
        <div className="space-y-3">
          {visibleGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No groups available.</p>
            </div>
          ) : (
            visibleGroups.map((group) => {
              const groupResources = getGroupResources(group.id);
              const isExpanded = expandedGroups[group.id];

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Group Row Header */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {groupResources.length} resource{groupResources.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3">
                      {isPM && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroupForAdd(group.id);
                            setShowAddResourcePanel(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7a73ff] text-white hover:bg-[#6b63ff] transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      )}

                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Resources List (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 divide-y divide-gray-200">
                      {groupResources.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                          <p className="text-sm text-gray-500">No resources in this group yet.</p>
                          {!isPM && (
                            <button
                              onClick={() => {
                                setSelectedGroupForAdd(group.id);
                                setShowAddResourcePanel(true);
                              }}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7a73ff] text-white hover:bg-[#6b63ff] transition-colors font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Add Resource
                            </button>
                          )}
                        </div>
                      ) : (
                        groupResources.map((resource) => (
                          <div
                            key={resource.id}
                            className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                                <span className="inline-block text-xs font-medium bg-[#ede9ff] text-[#7a73ff] px-2 py-0.5 rounded-full">
                                  {resource.type}
                                </span>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#7a73ff] hover:underline flex items-center gap-1 break-all"
                              >
                                {resource.url}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                              <p className="text-xs text-gray-400 mt-2">Added {resource.createdAt}</p>
                            </div>

                            {(isPM || userRole === "member") && (
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                disabled={deletingResourceId === resource.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Delete resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Resource Panel */}
      {selectedGroupForAdd && (
        <SideoverPanel
          isOpen={showAddResourcePanel}
          onClose={() => {
            setShowAddResourcePanel(false);
            setSelectedGroupForAdd(null);
          }}
          title="Add Resource"
          subtitle={`Add a resource to ${mockGroups.find((g) => g.id === selectedGroupForAdd)?.name}`}
        >
          <ResourceForm
            availableGroups={mockGroups.filter((g) => g.id === selectedGroupForAdd)}
            onSubmit={(data) => {
              handleAddResource({ ...data, groupId: selectedGroupForAdd });
              setSelectedGroupForAdd(null);
            }}
            onCancel={() => {
              setShowAddResourcePanel(false);
              setSelectedGroupForAdd(null);
            }}
          />
        </SideoverPanel>
      )}
    </DashboardWrapper>
  );
}
