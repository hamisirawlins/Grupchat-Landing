"use client";

import React, { useState } from "react";
import ResourceForm from "./ResourceForm";
import { Trash2, ExternalLink, Search } from "lucide-react";

/**
 * @param {Object} props
 * @param {Array} props.resources - Array of resource objects
 * @param {Array} props.availableGroups - Available groups for selection
 * @param {(data: any) => Promise<void>} props.onAddResource
 * @param {(resourceId: string) => Promise<void>} props.onDeleteResource
 */
export default function ManageResourcesPanelContent({ resources = [], availableGroups = [], onAddResource, onDeleteResource }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingResourceId, setDeletingResourceId] = useState(null);

  // Filter resources by search query
  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete with confirmation
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setDeletingResourceId(resourceId);
    try {
      await onDeleteResource(resourceId);
    } finally {
      setDeletingResourceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Resource Form */}
      <div className="space-y-3 p-4 bg-[#f3f1ff] rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900">Add New Resource</h3>
        <ResourceForm
          availableGroups={availableGroups}
          onSubmit={onAddResource}
          onCancel={() => {}}
        />
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Resources ({resources.length})
          </h3>
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

        {/* Resources List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredResources.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                {searchQuery ? "No resources found" : "No resources yet"}
              </p>
            </div>
          ) : (
            filteredResources.map((resource) => {
              const resourceGroups = availableGroups.filter(g =>
                resource.groups?.includes(g.id)
              );

              return (
                <div
                  key={resource.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                      <span className="text-xs font-medium bg-[#ede9ff] text-[#7a73ff] px-2 py-0.5 rounded-full">
                        {resource.type}
                      </span>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#7a73ff] hover:underline flex items-center gap-1 truncate mb-2"
                    >
                      {resource.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <div className="flex flex-wrap gap-1">
                      {resourceGroups.map((group) => (
                        <span
                          key={group.id}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    disabled={deletingResourceId === resource.id}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
