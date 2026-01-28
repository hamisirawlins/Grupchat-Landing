"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import { plansAPI } from "@/lib/api";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Flag,
  Globe,
  Lock,
  Menu,
  Sparkles,
  Settings,
  Tag,
  Users,
} from "lucide-react";

export default function CreatePlanPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    category: "trip",
    description: "",
    targetDate: "",
    invitees: [],
    milestones: [],
    visibility: "private",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [draggedMilestoneIndex, setDraggedMilestoneIndex] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const primaryNavItems = useMemo(
    () => [
      { id: "homepage", label: "Overview", icon: Flag, active: false },
      { id: "plans", label: "Plans", icon: Tag },
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const isValidEmail = (value) => /.+@.+\..+/.test(value);

  const handleInviteInputChange = (event) => {
    setInviteEmail(event.target.value);
    if (errors.invitees) {
      setErrors((prev) => ({ ...prev, invitees: undefined }));
    }
  };

  const addInvitee = (rawValue) => {
    const trimmed = rawValue.trim().replace(/,$/, "");
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        invitees: "Enter a valid email address.",
      }));
      return;
    }
    setFormData((prev) => {
      if (prev.invitees.includes(trimmed)) {
        return prev;
      }
      return { ...prev, invitees: [...prev.invitees, trimmed] };
    });
    setInviteEmail("");
  };

  const handleInviteKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addInvitee(inviteEmail);
    }
  };

  const removeInvitee = (email) => {
    setFormData((prev) => ({
      ...prev,
      invitees: prev.invitees.filter((item) => item !== email),
    }));
  };

  const handleMilestoneInputChange = (event) => {
    setMilestoneInput(event.target.value);
    if (errors.milestones) {
      setErrors((prev) => ({ ...prev, milestones: undefined }));
    }
  };

  const addMilestone = (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: trimmed,
          completed: false,
        },
      ],
    }));
    setMilestoneInput("");
  };

  const handleMilestoneKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addMilestone(milestoneInput);
    }
  };

  const removeMilestone = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, index) => index !== indexToRemove),
    }));
  };

  const toggleMilestone = (indexToToggle) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((item, index) =>
        index === indexToToggle
          ? { ...item, completed: !item.completed }
          : item,
      ),
    }));
  };

  const moveMilestone = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= formData.milestones.length) return;
    setFormData((prev) => {
      const updated = [...prev.milestones];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, milestones: updated };
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
    if (draggedMilestoneIndex !== index) {
      moveMilestone(draggedMilestoneIndex, index);
    }
    setDraggedMilestoneIndex(null);
  };

  const handleMilestoneDragEnd = () => {
    setDraggedMilestoneIndex(null);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = "Plan name is required.";
    }
    if (!formData.category) {
      nextErrors.category = "Pick a category for the plan.";
    }
    if (!formData.targetDate) {
      nextErrors.targetDate = "Choose a target date.";
    }
    if (formData.description.length > 500) {
      nextErrors.description = "Description must be under 500 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        targetDate: formData.targetDate,
        visibility: formData.visibility,
        invitees: formData.invitees,
        milestones: formData.milestones.map((milestone, index) => ({
          id: milestone.id,
          text: milestone.text,
          completed: milestone.completed,
          order: index,
        })),
      };

      await plansAPI.createPlan(payload);
      router.push("/plans");
    } catch (error) {
      setSubmitError(
        error?.message || "Something went wrong while creating your plan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLoading
        title="Getting your plan ready"
        subtitle="Setting up the workspace for your new plan."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-28 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
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

      <div className="flex-1 lg:ml-80 relative">
        <main className="p-5 sm:p-6 lg:p-10 space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </button>
            </div>
          </header>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Create a plan
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">
              Give your crew a clear destination, track milestones, and keep the
              momentum moving.
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6"
          >
            <section className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] flex items-center justify-center">
                    <Flag className="w-5 h-5 text-[#7a73ff]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Plan basics
                    </h2>
                    <p className="text-xs text-gray-500">
                      Give the plan a clear title and purpose.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Plan name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Weekend getaway to Watamu"
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-900">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                      >
                        <option value="trip">Travel</option>
                        <option value="fitness">Event</option>
                        <option value="project">Project</option>
                        <option value="study">Business</option>
                        <option value="event">Other</option>
                      </select>
                      {errors.category && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">
                        Target date
                      </label>
                      <input
                        type="date"
                        name="targetDate"
                        value={formData.targetDate}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                      />
                      {errors.targetDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.targetDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Share the intent, expectations, and vibe."
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span>{errors.description}</span>
                      <span>{formData.description.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#7a73ff]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Invite the crew
                    </h2>
                    <p className="text-xs text-gray-500">
                      Add emails now or share the invite link later.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Invite emails
                    </label>
                    <input
                      type="email"
                      name="invitees"
                      value={inviteEmail}
                      onChange={handleInviteInputChange}
                      onKeyDown={handleInviteKeyDown}
                      placeholder="alex@email.com"
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Press Enter to add another email.
                    </p>
                    {errors.invitees && (
                      <p className="text-xs text-red-500 mt-2">
                        {errors.invitees}
                      </p>
                    )}
                    {formData.invitees.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.invitees.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ff] border border-purple-100 px-3 py-1 text-xs font-semibold text-[#574ff2]"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => removeInvitee(email)}
                              className="text-[#6b63ff] hover:text-[#4f46ff]"
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 bg-[#f9f8ff] border border-purple-100 rounded-2xl px-4 py-3 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === "private"}
                        onChange={handleChange}
                        className="text-[#7a73ff]"
                      />
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#7a73ff]" />
                        Private plan
                      </span>
                    </label>
                    <label className="flex items-center gap-3 bg-[#f9f8ff] border border-purple-100 rounded-2xl px-4 py-3 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === "public"}
                        onChange={handleChange}
                        className="text-[#7a73ff]"
                      />
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#7a73ff]" />
                        Shareable link
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#7a73ff]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Milestones
                    </h2>
                    <p className="text-xs text-gray-500">
                      Outline the next steps so everyone knows the path.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    name="milestones"
                    value={milestoneInput}
                    onChange={handleMilestoneInputChange}
                    onKeyDown={handleMilestoneKeyDown}
                    placeholder="Clean cameras, book stays, setup transport ..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30 focus:border-[#7a73ff]"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Press Enter to add another milestone.
                  </p>
                  {errors.milestones && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.milestones}
                    </p>
                  )}
                  {formData.milestones.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          draggable
                          onDragStart={() => handleMilestoneDragStart(index)}
                          onDragOver={handleMilestoneDragOver}
                          onDrop={() => handleMilestoneDrop(index)}
                          onDragEnd={handleMilestoneDragEnd}
                          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2 text-sm text-gray-700 ${
                            draggedMilestoneIndex === index
                              ? "border-[#7a73ff] shadow-md"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleMilestone(index)}
                              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                milestone.completed
                                  ? "bg-[#7a73ff] border-[#7a73ff]"
                                  : "border-gray-300"
                              }`}
                              aria-pressed={milestone.completed}
                            >
                              {milestone.completed && (
                                <span className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </button>
                            <span
                              className={
                                milestone.completed
                                  ? "line-through text-gray-400"
                                  : ""
                              }
                            >
                              {milestone.text}
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
                                disabled={
                                  index === formData.milestones.length - 1
                                }
                                className="p-1 rounded-full border border-gray-200 text-gray-400 hover:text-[#7a73ff] hover:border-[#7a73ff] disabled:opacity-40 disabled:hover:text-gray-400"
                                aria-label="Move milestone down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="hidden sm:inline text-xs text-gray-400 select-none">
                              Drag to reorder
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMilestone(index)}
                              className="text-xs font-semibold text-gray-400 hover:text-[#7a73ff]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#7a73ff]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Plan preview
                    </h3>
                    <p className="text-xs text-gray-500">
                      Quick snapshot before launch.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Title</span>
                    <span className="font-semibold text-gray-900">
                      {formData.name || "Untitled plan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {formData.category || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Target date</span>
                    <span className="font-semibold text-gray-900">
                      {formData.targetDate || "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Visibility</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {formData.visibility}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0b2239] to-[#0f2f4f] text-white rounded-3xl p-6 shadow-lg space-y-4">
                <h3 className="text-lg font-semibold">What happens next</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
                    Friends join the plan.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
                    You can all track milestones and post updates.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-white/70" />
                    Progress stays visible for the entire group.
                  </li>
                </ul>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-[#0b2239] py-3 rounded-2xl text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-60"
                >
                  {isSubmitting ? "Creating plan..." : "Create plan"}
                </button>
              </div>
            </aside>
          </form>
        </main>
      </div>
    </div>
  );
}
