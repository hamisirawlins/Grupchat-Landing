"use client";

import React, { useState } from "react";
import { ExternalLink, Search } from "lucide-react";

/**
 * @param {Object} props
 * @param {Array} props.resources - Array of resource objects (read-only)
 * @param {Array} props.availableGroups - Available groups for display
 */
export default function ViewResourcesPanel({ resources = [], availableGroups = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(
    availableGroups.reduce((acc, g) => ({ ...acc, [g.id]: true }), {})
  );

  // Filter resources by search query
  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group resources by their assigned groups
  const resourcesByGroup = availableGroups.map((group) => ({
    group,
    resources: filteredResources.filter(r => r.groups?.includes(group.id)),
  })).filter(item => item.resources.length > 0);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Group Resources</h3>
        <p className="text-sm text-gray-500 mt-1">
          Shared resources available across your groups
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a73ff] text-sm"
        />
      </div>

      {/* Resources by Group */}
      <div className="space-y-3">
        {resourcesByGroup.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              {searchQuery ? "No resources found" : "No resources available"}
            </p>
          </div>
        ) : (
          resourcesByGroup.map(({ group, resources: groupResources }) => (
            <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500">{groupResources.length} resource{groupResources.length !== 1 ? "s" : ""}</p>
                </div>
                <div className={`transform transition-transform ${expandedGroups[group.id] ? "rotate-180" : ""}`}>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {/* Resources List */}
              {expandedGroups[group.id] && (
                <div className="divide-y divide-gray-200">
                  {groupResources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[#7a73ff] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{resource.url}</p>
                        <span className="inline-block text-xs font-medium bg-[#ede9ff] text-[#7a73ff] px-2 py-0.5 rounded-full mt-2">
                          {resource.type}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 Click on any resource to open it in a new tab
        </p>
      </div>
    </div>
  );
}
