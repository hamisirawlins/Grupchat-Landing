"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import { handleApiError, plansAPI, uploadsAPI } from "@/lib/api";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  Eye,
  Flag,
  FolderOpen,
  Menu,
  MoreVertical,
  Settings,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function PlanDetailPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const planId = params?.planId;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [membersError, setMembersError] = useState("");
  const [milestonesError, setMilestonesError] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [planImages, setPlanImages] = useState([]);
  const [planImagesLoading, setPlanImagesLoading] = useState(false);
  const [planImagesError, setPlanImagesError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUploadStatus, setImageUploadStatus] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [togglingMilestoneId, setTogglingMilestoneId] = useState(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);
  const [confirmingMilestoneId, setConfirmingMilestoneId] = useState(null);
  const [confirmingImageId, setConfirmingImageId] = useState(null);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [draggedMilestoneIndex, setDraggedMilestoneIndex] = useState(null);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [savingMilestoneOrder, setSavingMilestoneOrder] = useState(false);
  const [openImageMenuId, setOpenImageMenuId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user || !planId) return;
    fetchPlan();
    fetchMembers();
    fetchMilestones();
    fetchPlanImages();
  }, [authLoading, user, planId]);

  const fetchPlan = async () => {
    setPlanLoading(true);
    setPlanError("");
    try {
      const response = await plansAPI.getPlan(planId);
      const planData = response?.data || null;
      setPlan(planData);
      if (planData) {
        setEditName(planData.name || "");
        setEditDescription(planData.description || "");
        const target = planData.targetDate || planData.target_date;
        let targetDateValue = "";
        if (target?.toDate) {
          const dateValue = target.toDate();
          targetDateValue = Number.isNaN(dateValue?.getTime())
            ? ""
            : dateValue.toISOString().slice(0, 10);
        } else if (typeof target?._seconds === "number") {
          const dateValue = new Date(target._seconds * 1000);
          targetDateValue = Number.isNaN(dateValue.getTime())
            ? ""
            : dateValue.toISOString().slice(0, 10);
        } else if (typeof target === "string" || target instanceof Date) {
          const dateValue = new Date(target);
          targetDateValue = Number.isNaN(dateValue.getTime())
            ? ""
            : dateValue.toISOString().slice(0, 10);
        }
        setEditTargetDate(targetDateValue);
      }
    } catch (error) {
      setPlanError(handleApiError(error, "Failed to load this plan"));
    } finally {
      setPlanLoading(false);
    }
  };

  const fetchPlanImages = async () => {
    setPlanImagesLoading(true);
    setPlanImagesError("");
    try {
      const response = await plansAPI.getPlanImages(planId);
      setPlanImages(response?.data || []);
    } catch (error) {
      setPlanImagesError(handleApiError(error, "Failed to load images."));
    } finally {
      setPlanImagesLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    setUpdateStatus("");
    setUpdatingPlan(true);
    try {
      await plansAPI.updatePlan(planId, {
        name: editName,
        description: editDescription,
        targetDate: editTargetDate || null,
      });
      setUpdateStatus("Plan updated.");
      fetchPlan();
    } catch (error) {
      setUpdateStatus(handleApiError(error, "Unable to update plan."));
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleUploadImage = async (files = []) => {
    setImageUploadStatus("");
    const selectedFiles = files.length ? files : imageFile ? [imageFile] : [];
    if (!selectedFiles.length) {
      setImageUploadStatus("Select an image to upload.");
      return;
    }
    setUploadingImage(true);
    try {
      for (const file of selectedFiles) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Unable to read file"));
          reader.readAsDataURL(file);
        });
        const uploadResponse = await uploadsAPI.uploadImage({
          dataUrl,
          fileName: file.name,
          contentType: file.type,
          folder: `plans/${planId}/memories`,
        });
        const uploaded = uploadResponse?.data;
        await plansAPI.addPlanImage(planId, {
          url: uploaded?.url,
          thumbnailUrl: null,
          mimeType: uploaded?.contentType || file.type,
          bytes: uploaded?.bytes || file.size,
          width: null,
          height: null,
          storagePath: uploaded?.storagePath,
          type: "plan-memory",
          caption: null,
          position: 0,
        });
      }
      setImageUploadStatus("Image uploaded.");
      setImageFile(null);
      fetchPlanImages();
    } catch (error) {
      setImageUploadStatus(handleApiError(error, "Unable to upload image."));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    handleUploadImage(files);
    event.target.value = "";
  };

  const handleDeleteImage = async (imageId) => {
    setDeletingImageId(imageId);
    try {
      await plansAPI.deletePlanImage(planId, imageId);
      fetchPlanImages();
    } catch (error) {
      setPlanImagesError(handleApiError(error, "Unable to delete image."));
    } finally {
      setDeletingImageId(null);
    }
  };

  const fetchMembers = async () => {
    setMembersError("");
    try {
      const response = await plansAPI.getPlanMembers(planId);
      setMembers(response?.data || []);
    } catch (error) {
      setMembersError(handleApiError(error, "Failed to load members"));
    }
  };

  const fetchMilestones = async () => {
    setMilestonesError("");
    try {
      const response = await plansAPI.getPlanMilestones(planId);
      setMilestones(response?.data || []);
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to load milestones"));
    }
  };

  const handleMilestoneInputChange = (event) => {
    setMilestoneInput(event.target.value);
  };

  const handleMilestoneKeyDown = async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const trimmed = milestoneInput.trim();
    if (!trimmed) return;
    setAddingMilestone(true);
    setMilestonesError("");
    try {
      await plansAPI.addPlanMilestone(planId, { title: trimmed });
      setMilestoneInput("");
      await fetchMilestones();
      await fetchPlan();
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to add milestone"));
    } finally {
      setAddingMilestone(false);
    }
  };

  const persistMilestoneOrder = async (nextMilestones) => {
    if (!nextMilestones.length) return;
    setSavingMilestoneOrder(true);
    try {
      await plansAPI.updateMilestoneOrder(
        planId,
        nextMilestones.map((item) => item.id),
      );
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to reorder milestones"));
      fetchMilestones();
    } finally {
      setSavingMilestoneOrder(false);
    }
  };

  const reorderMilestones = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setMilestones((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      persistMilestoneOrder(updated);
      return updated;
    });
  };

  const handleMilestoneDragStart = (index) => {
    setDraggedMilestoneIndex(index);
  };

  const handleMilestoneDragOver = (event) => {
    event.preventDefault();
  };

  const handleMilestoneDrop = (index) => {
    if (draggedMilestoneIndex === null) return;
    reorderMilestones(draggedMilestoneIndex, index);
    setDraggedMilestoneIndex(null);
  };

  const handleMilestoneDragEnd = () => {
    setDraggedMilestoneIndex(null);
  };

  const moveMilestone = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= milestones.length) return;
    reorderMilestones(fromIndex, toIndex);
  };

  const handlePreviewImage = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpenImageMenuId(null);
  };

  const handleToggleMilestone = async (milestoneId, nextCompleted) => {
    setTogglingMilestoneId(milestoneId);
    try {
      await plansAPI.updateMilestoneStatus(planId, milestoneId, nextCompleted);
      await fetchMilestones();
      await fetchPlan();
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to update milestone"));
    } finally {
      setTogglingMilestoneId(null);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    setDeletingMilestoneId(milestoneId);
    try {
      await plansAPI.deletePlanMilestone(planId, milestoneId);
      await fetchMilestones();
      await fetchPlan();
    } catch (error) {
      setMilestonesError(handleApiError(error, "Failed to delete milestone"));
    } finally {
      setDeletingMilestoneId(null);
    }
  };

  const handleConfirmDeleteMilestone = async () => {
    if (!confirmingMilestoneId) return;
    const targetId = confirmingMilestoneId;
    setConfirmingMilestoneId(null);
    await handleDeleteMilestone(targetId);
  };

  const handleConfirmDeleteImage = async () => {
    if (!confirmingImageId) return;
    const targetId = confirmingImageId;
    setConfirmingImageId(null);
    await handleDeleteImage(targetId);
  };

  const formatDate = (value) => {
    if (!value) return "TBD";
    let date = null;
    if (value?.toDate) {
      date = value.toDate();
    } else if (typeof value?._seconds === "number") {
      date = new Date(value._seconds * 1000);
    } else if (typeof value === "string" || value instanceof Date) {
      date = new Date(value);
    }
    if (!date || Number.isNaN(date.getTime())) return "TBD";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const completedMilestones = milestones.filter((item) => item?.completed);
  const pendingMilestones = milestones.filter((item) => !item?.completed);

  const primaryNavItems = useMemo(
    () => [
      { id: "homepage", label: "Overview", icon: Flag },
      { id: "plans", label: "Plans", icon: FolderOpen, active: true },
      { id: "plot", label: "Plot", icon: BarChart3 },
      { id: "notifications", label: "Notifications", icon: Sparkles },
    ],
    [],
  );

  const accountNavItems = useMemo(
    () => [{ id: "settings", label: "Settings", icon: Settings }],
    [],
  );

  const handlePrimaryNavClick = (item) => {
    if (item.id === "homepage") {
      setActiveTab(item.id);
      router.push("/dashboard");
      return;
    }
    setActiveTab(item.id);
    router.push(`/${item.id}`);
  };

  const handleAccountNavClick = (item) => {
    setActiveTab(item.id);
    router.push(`/${item.id}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <DashboardLoading
        title="Loading this plan"
        subtitle="Gathering the plan details and milestones."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] flex overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-28 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-50" />
      </div>

      <DashboardSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        primaryNavItems={primaryNavItems}
        accountNavItems={accountNavItems}
        activeTab={activeTab}
        onPrimaryNavClick={handlePrimaryNavClick}
        onAccountNavClick={handleAccountNavClick}
        onLogout={handleLogout}
        user={user}
        profile={profile}
      />

      <div className="flex-1 lg:ml-80 min-w-0 overflow-x-hidden">
        <main className="p-5 sm:p-6 lg:p-10 space-y-8 min-w-0">
          {confirmingMilestoneId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete milestone?
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This removes the milestone from the plan. This cannot be
                  undone.
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setConfirmingMilestoneId(null)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteMilestone}
                    disabled={deletingMilestoneId === confirmingMilestoneId}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
                  >
                    {deletingMilestoneId === confirmingMilestoneId
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {confirmingImageId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete image?
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This removes the image from the plan. This cannot be undone.
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setConfirmingImageId(null)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteImage}
                    disabled={deletingImageId === confirmingImageId}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
                  >
                    {deletingImageId === confirmingImageId
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/plans")}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to plans
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#6b63ff]/40 bg-white text-sm font-semibold text-[#6b63ff] hover:bg-purple-50 transition-colors shadow-sm">
                Invite members
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7a73ff] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                Upgrade to Memory
              </button>
            </div>
          </header>

          <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Plan ID: {planId || "pending"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-3">
                  {plan?.name || "Plan overview"}
                </h1>
                <p className="text-sm text-gray-500 mt-3 max-w-2xl">
                  {plan?.description ||
                    "This single-plan view will show the story, milestones, and memories."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(plan?.targetDate || plan?.target_date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {plan?.membersCount ?? "—"} members
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6b63ff] text-xs font-semibold">
                  {plan?.status || "Active"}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3f1ff] text-[#6b63ff] text-xs font-semibold">
                  {plan?.visibility ? plan.visibility : "Private"}
                </span>
                {plan?.isPermanent && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b3a] text-white text-xs font-semibold">
                    Memories
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Plan name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    className="w-full min-h-[100px] px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Target date
                  </label>
                  <input
                    type="date"
                    value={editTargetDate}
                    onChange={(event) => setEditTargetDate(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7a73ff]"
                  />
                </div>
                <button
                  onClick={handleUpdatePlan}
                  disabled={updatingPlan}
                  className={`w-full px-4 py-3 rounded-full text-white text-sm font-semibold shadow-md transition-shadow ${
                    updatingPlan
                      ? "bg-[#b8b5ff] cursor-not-allowed"
                      : "bg-[#7a73ff] hover:shadow-lg"
                  }`}
                >
                  {updatingPlan ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </button>
                {updateStatus && (
                  <p className="text-sm text-gray-500">{updateStatus}</p>
                )}
              </div>
            </div>
            {planError && (
              <p className="mt-4 text-sm text-red-500">{planError}</p>
            )}
            {planLoading && (
              <p className="mt-4 text-sm text-gray-500">Loading plan...</p>
            )}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Progress
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                      Milestones checklist
                    </h2>
                  </div>
                  <Tag className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-5 space-y-4">
                  {milestonesError && (
                    <p className="text-sm text-red-500">{milestonesError}</p>
                  )}
                  <div>
                    <input
                      type="text"
                      value={milestoneInput}
                      onChange={handleMilestoneInputChange}
                      onKeyDown={handleMilestoneKeyDown}
                      placeholder="Add a milestone for this plan..."
                      disabled={addingMilestone}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Press Enter to add another milestone.
                    </p>
                    {addingMilestone && (
                      <p className="text-xs text-gray-400 mt-2">
                        Adding milestone...
                      </p>
                    )}
                  </div>
                  {milestones.length === 0 && !addingMilestone && (
                    <div className="text-sm text-gray-500">
                      No milestones added yet.
                    </div>
                  )}
                  {milestones.map((item, index) => (
                    <div
                      key={item.id || `${item.text}-${index}`}
                      draggable
                      onDragStart={() => handleMilestoneDragStart(index)}
                      onDragOver={handleMilestoneDragOver}
                      onDrop={() => handleMilestoneDrop(index)}
                      onDragEnd={handleMilestoneDragEnd}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2 text-sm text-gray-700 ${
                        draggedMilestoneIndex === index
                          ? "border-[#7a73ff] shadow-md"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleMilestone(item.id, !item.completed)
                          }
                          disabled={togglingMilestoneId === item.id}
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            item.completed
                              ? "bg-[#7a73ff] border-[#7a73ff]"
                              : "border-gray-300"
                          } ${
                            togglingMilestoneId === item.id
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          aria-pressed={item.completed}
                        >
                          {togglingMilestoneId === item.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                          ) : (
                            item.completed && (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            )
                          )}
                        </button>
                        <span
                          className={
                            item.completed ? "line-through text-gray-400" : ""
                          }
                        >
                          {item.title || item.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 sm:hidden">
                          <button
                            type="button"
                            onClick={() => moveMilestone(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 rounded-full border border-gray-200 text-gray-400 hover:text-[#7a73ff] hover:border-[#7a73ff] disabled:opacity-40 disabled:hover:text-gray-400"
                            aria-label="Move milestone up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMilestone(index, index + 1)}
                            disabled={index === milestones.length - 1}
                            className="p-1 rounded-full border border-gray-200 text-gray-400 hover:text-[#7a73ff] hover:border-[#7a73ff] disabled:opacity-40 disabled:hover:text-gray-400"
                            aria-label="Move milestone down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="hidden sm:inline text-xs text-gray-400 select-none">
                          Drag to reorder
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.completed ? "Completed" : "Pending"}
                        </span>
                        {!item.completed && (
                          <button
                            type="button"
                            onClick={() => setConfirmingMilestoneId(item.id)}
                            disabled={deletingMilestoneId === item.id}
                            className="text-xs font-semibold text-gray-400 hover:text-red-500 disabled:opacity-60"
                          >
                            {deletingMilestoneId === item.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {savingMilestoneOrder && (
                    <p className="text-xs text-gray-400">Saving order...</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Moments
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                      Plan updates
                    </h2>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-5 space-y-4">
                  {completedMilestones.slice(0, 2).map((item, index) => (
                    <div
                      key={item.id || `${item.text}-${index}`}
                      className="flex items-start gap-3 border border-gray-100 rounded-2xl p-4"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center text-sm font-semibold">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.title || item.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Completed milestone
                        </p>
                      </div>
                    </div>
                  ))}
                  {completedMilestones.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No completed milestones yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Members
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      Crew members
                    </h3>
                  </div>
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-5 space-y-3">
                  {membersError && (
                    <p className="text-sm text-red-500">{membersError}</p>
                  )}
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 border border-gray-100 rounded-2xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#7a73ff] text-white flex items-center justify-center text-sm font-semibold">
                          {(member.displayName || member.username || "M")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {member.displayName || member.username || "Member"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {member.role || "Member"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#6b63ff]">
                        Active
                      </span>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-sm text-gray-500">
                      Invite your crew to collaborate on this plan.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Media
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      Plan images
                    </h3>
                  </div>
                  <Tag className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-5 space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={`w-full px-4 py-3 rounded-full text-white text-sm font-semibold transition-shadow ${
                      uploadingImage
                        ? "bg-slate-700/60 cursor-not-allowed"
                        : "bg-[#0b2239] hover:shadow-md"
                    }`}
                  >
                    {uploadingImage ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                        Uploading...
                      </span>
                    ) : (
                      "Add images"
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectImages}
                    className="hidden"
                  />
                  {imageUploadStatus && (
                    <p className="text-sm text-gray-500">{imageUploadStatus}</p>
                  )}
                  {planImagesError && (
                    <p className="text-sm text-red-500">{planImagesError}</p>
                  )}
                  {planImagesLoading && (
                    <p className="text-sm text-gray-500">Loading images...</p>
                  )}
                  <div className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">
                    {planImagesLoading &&
                      Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={`image-skeleton-${index}`}
                          className="mb-3 break-inside-avoid rounded-2xl border border-gray-100 bg-gray-100/70 overflow-hidden animate-pulse"
                        >
                          <div className="h-28 sm:h-32 md:h-36 bg-gray-200/80" />
                        </div>
                      ))}
                    {!planImagesLoading &&
                      planImages.map((item) => (
                        <div
                          key={item.id}
                          className="mb-3 break-inside-avoid relative rounded-2xl border border-gray-100 overflow-visible"
                        >
                          <div className="rounded-2xl overflow-hidden">
                            {item.image?.url && (
                              <img
                                src={item.image.url}
                                alt="Plan media"
                                className="w-full h-auto object-cover"
                              />
                            )}
                          </div>
                          <div className="absolute top-2 right-2 z-20">
                            <button
                              onClick={() =>
                                setOpenImageMenuId((prev) =>
                                  prev === item.imageId ? null : item.imageId,
                                )
                              }
                              className="h-8 w-8 rounded-full bg-white/90 text-gray-600 inline-flex items-center justify-center shadow-sm"
                              aria-label="Image options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openImageMenuId === item.imageId && (
                              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-30">
                                <button
                                  onClick={() =>
                                    handlePreviewImage(item.image?.url)
                                  }
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenImageMenuId(null);
                                    setConfirmingImageId(item.imageId);
                                  }}
                                  disabled={deletingImageId === item.imageId}
                                  className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 inline-flex items-center gap-2 disabled:opacity-60"
                                >
                                  {deletingImageId === item.imageId ? (
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                  {deletingImageId === item.imageId
                                    ? "Removing..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    {planImages.length === 0 && !planImagesLoading && (
                      <p className="text-sm text-gray-500">No images yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {!plan?.memoryTier && !plan?.memoryDate && (
                <div className="bg-[#1b1b3a] text-white rounded-3xl p-6 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Make it a Memory
                  </p>
                  <h3 className="text-lg font-semibold mt-3">
                    Save every moment forever
                  </h3>
                  <p className="text-sm text-white/70 mt-2">
                    Upgrade this plan to a memory and unlock premium features. Duplicate
                    plans, group insights, memorable milestone reminders, and track your group's progress over time.
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Unlock Memories
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
