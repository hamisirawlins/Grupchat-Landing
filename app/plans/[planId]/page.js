"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import { handleApiError, plansAPI, uploadsAPI, dashboardAPI, usersAPI, invitationsAPI } from "@/lib/api";
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
  Lock,
  Mail,
  Menu,
  MoreVertical,
  Settings,
  UserPlus,
  X,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

// Premium memory tier pricing configuration
// Currency: KES (Kenyan Shilling) - ~250 KES ≈ $1.99 USD
// Update these values when switching to USD account
const MEMORY_TIER_PRICING = {
  currency: "KES", // Change to "USD" when USD account is active
  amount: 25000, // Amount in cents (250.00 KES)
  displayAmount: "250 KES", // For UI display
};

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
  const [memoryUpgradeModalOpen, setMemoryUpgradeModalOpen] = useState(false);
  const [memoryUpgradeLoading, setMemoryUpgradeLoading] = useState(false);
  const [memoryUpgradeError, setMemoryUpgradeError] = useState("");
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackScriptReady, setPaystackScriptReady] = useState(false);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const fileInputRef = useRef(null);
  const observerRef = useRef(null);

  // Invitation states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const searchTimeoutRef = useRef(null);

  // Pending invitations state
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [pendingInvitationsLoading, setPendingInvitationsLoading] = useState(false);
  const [pendingInvitationsError, setPendingInvitationsError] = useState("");
  const [revokingInviteId, setRevokingInviteId] = useState(null);

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
    fetchPendingInvitations();
    fetchMilestones();
    fetchPlanImages();
    fetchPaystackPublicKey();
  }, [authLoading, user, planId]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.cardId;
            if (id) {
              setVisibleCards((prev) => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll('[data-card-id]');
    cards.forEach((card) => {
      if (observerRef.current) {
        observerRef.current.observe(card);
      }
    });

    return () => {
      cards.forEach((card) => {
        if (observerRef.current) {
          observerRef.current.unobserve(card);
        }
      });
    };
  }, [planImages, planImagesLoading]);

  const fetchPaystackPublicKey = async () => {
    try {
      const response = await dashboardAPI.getPaystackPublicKey();
      if (response?.data?.publicKey) {
        setPaystackPublicKey(response.data.publicKey);
        
        // Load Paystack script and wait for it to be ready
        if (!window.PaystackPop) {
          const script = document.createElement("script");
          script.src = "https://js.paystack.co/v1/inline.js";
          script.async = true;
          
          script.onload = () => {
            setPaystackScriptReady(true);
          };
          
          script.onerror = () => {
            console.error("Failed to load Paystack script");
            setMemoryUpgradeError("Failed to load payment processor");
          };
          
          document.head.appendChild(script);
        } else {
          // Script already loaded
          setPaystackScriptReady(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Paystack public key:", error);
    }
  };

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

  const resizeImage = async (file, maxWidth = 800) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
          const ratio = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' }));
          }, 'image/webp', 0.85);
        };
      };
      reader.readAsDataURL(file);
    });
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
    setImageUploadStatus("Uploading image...");
    try {
      for (const file of selectedFiles) {
        // Upload original HD version first
        const hdDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Unable to read file"));
          reader.readAsDataURL(file);
        });
        
        const hdUploadResponse = await uploadsAPI.uploadImage({
          dataUrl: hdDataUrl,
          fileName: file.name,
          contentType: file.type,
          folder: `plans/${planId}/memories/hd`,
        });
        const hdUploaded = hdUploadResponse?.data;
        
        // Create and upload thumbnail version
        const thumbnailFile = await resizeImage(file, 800);
        
        const thumbnailDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Unable to read file"));
          reader.readAsDataURL(thumbnailFile);
        });
        
        const thumbnailUploadResponse = await uploadsAPI.uploadImage({
          dataUrl: thumbnailDataUrl,
          fileName: thumbnailFile.name,
          contentType: thumbnailFile.type,
          folder: `plans/${planId}/memories/thumbnails`,
        });
        const thumbnailUploaded = thumbnailUploadResponse?.data;
        
        // Save both URLs to database
        await plansAPI.addPlanImage(planId, {
          url: hdUploaded?.url,
          thumbnailUrl: thumbnailUploaded?.url,
          mimeType: hdUploaded?.contentType || file.type,
          bytes: hdUploaded?.bytes || file.size,
          width: null,
          height: null,
          storagePath: hdUploaded?.storagePath,
          type: "plan-memory",
          caption: null,
          position: 0,
        });
      }
      setImageUploadStatus("Image uploaded");
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

  const fetchPendingInvitations = async () => {
    setPendingInvitationsError("");
    setPendingInvitationsLoading(true);
    try {
      // Get all invitations for this plan that are pending
      const response = await plansAPI.getPlanInvitations?.(planId);
      if (response?.data) {
        const pending = response.data.filter(inv => inv.status === "pending");
        setPendingInvitations(pending);
      }
    } catch (error) {
      // Endpoint may not exist yet, so we'll handle gracefully
      console.log("Could not fetch invitations:", error);
      setPendingInvitations([]);
    } finally {
      setPendingInvitationsLoading(false);
    }
  };

  const handleRevokeInvite = async (invitationId) => {
    setRevokingInviteId(invitationId);
    try {
      await invitationsAPI.revokeInvitation(invitationId);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      setPendingInvitationsError(handleApiError(error, "Failed to revoke invitation"));
    } finally {
      setRevokingInviteId(null);
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

  const handleMemoryUpgradeClick = () => {
    if (plan?.memoryTier) {
      return; // Prevent opening modal if already upgraded
    }
    setMemoryUpgradeModalOpen(true);
    setMemoryUpgradeError("");
  };

  const handleInitiateMemoryUpgrade = async () => {
    if (!profile?.email) {
      setMemoryUpgradeError("Email not found in your profile");
      return;
    }

    if (!paystackScriptReady || !window.PaystackPop) {
      setMemoryUpgradeError("Payment processor not ready. Please try again.");
      return;
    }

    setMemoryUpgradeLoading(true);
    setMemoryUpgradeError("");

    try {
      const response = await plansAPI.initiateMemoryUpgrade(planId, profile.email);
      if (response?.data?.authorizationUrl && response?.data?.reference) {
        // Open Paystack popup with Apple Pay support
        const handler = window.PaystackPop.setup({
          key: paystackPublicKey,
          email: profile.email,
          amount: MEMORY_TIER_PRICING.amount, 
          currency: MEMORY_TIER_PRICING.currency,
          ref: response.data.reference,
          onClose: () => {
            // Start polling for plan update immediately
            let attempts = 0;
            const maxAttempts = 15; // 30 seconds (15 attempts × 2 seconds)
            
            const pollInterval = setInterval(async () => {
              attempts++;
              try {
                const updatedPlan = await plansAPI.getPlan(planId);
                if (updatedPlan?.data?.memoryTier) {
                  clearInterval(pollInterval);
                  setPlan(updatedPlan.data);
                  setMemoryUpgradeModalOpen(false);
                  setMemoryUpgradeLoading(false);
                }
                
                // Stop after max attempts
                if (attempts >= maxAttempts) {
                  clearInterval(pollInterval);
                  setMemoryUpgradeLoading(false);
                  // Fetch once more to ensure we have latest data
                  fetchPlan();
                }
              } catch (error) {
                console.error("Error polling plan update:", error);
                if (attempts >= maxAttempts) {
                  clearInterval(pollInterval);
                  setMemoryUpgradeLoading(false);
                  fetchPlan();
                }
              }
            }, 2000);
          },
          onSuccess: () => {
            // Payment completed - refetch immediately and keep polling
            fetchPlan();
          },
        });
        handler.openIframe();
      } else {
        setMemoryUpgradeError("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      setMemoryUpgradeError(handleApiError(error, "Failed to initiate memory upgrade"));
    } finally {
      setMemoryUpgradeLoading(false);
    }
  };

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

  // Invitation handlers
  const handleSearchUsers = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await usersAPI.searchUsers(query.trim());
      const results = response?.data || [];
      
      // Filter out already selected users and existing members
      const memberUserIds = new Set(members.map(m => m.userId));
      const selectedUserIds = new Set(selectedUsers.map(u => u.id));
      const filtered = results.filter(
        r => !memberUserIds.has(r.id) && !selectedUserIds.has(r.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error("User search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearchUsers(query);
    }, 300);
  };

  const handleAddUser = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.userId !== user.userId));
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false);
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    setInviteStatus("");
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) {
      setInviteStatus("Please select at least one user.");
      return;
    }

    setSendingInvites(true);
    setInviteStatus("Sending invitations...");

    try {
      // Send invites in parallel
      const results = await Promise.allSettled(
        selectedUsers.map(user =>
          invitationsAPI.inviteByUsername({
            planId: planId,
            inviteeUsername: user.username,
          })
        )
      );

      // Count successes and failures
      const successes = results.filter(r => r.status === "fulfilled").length;
      const failures = results.filter(r => r.status === "rejected").length;

      if (successes > 0) {
        setInviteStatus(`✓ ${successes} invitation${successes !== 1 ? "s" : ""} sent!`);
        
        // Close modal after 1.5 seconds on success
        setTimeout(() => {
          handleCloseInviteModal();
          // Refresh members list if needed
          if (typeof fetchMembers === "function") {
            fetchMembers();
          }
        }, 1500);
      }

      if (failures > 0) {
        const failedUsers = selectedUsers.filter((user, index) => {
          return results[index].status === "rejected";
        });
        const failedNames = failedUsers.map(u => u.username).join(", ");
        setInviteStatus(`${successes > 0 ? `Sent ${successes} ` : ""}Failed to invite: ${failedNames}`);
      }
    } catch (error) {
      console.error("Error sending invites:", error);
      setInviteStatus(handleApiError(error, "Failed to send invitations"));
    } finally {
      setSendingInvites(false);
    }
  };

  // Invite Members Modal Component
  const InviteMembersModal = () => {
    if (!inviteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f3f1ff] flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#6b63ff]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Invite Members</h2>
                <p className="text-xs text-gray-500 mt-1">Search and invite people to this plan</p>
              </div>
            </div>
            <button
              onClick={handleCloseInviteModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by username or email..."
                className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff] focus:border-transparent"
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Selected Users Chips */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f3f1ff] border border-purple-100 rounded-full"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#7a73ff] text-white flex items-center justify-center text-xs font-semibold">
                      {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#6b63ff]">
                      {user.username}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-4 h-4 text-[#6b63ff]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {searchLoading && (
              <p className="text-sm text-gray-400 text-center py-4">Searching...</p>
            )}

            {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No users found. Try a different search.
              </p>
            )}

            {!searchLoading && searchQuery.length === 0 && searchResults.length === 0 && selectedUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Search by username or email...
              </p>
            )}

            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => handleAddUser(user)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#7a73ff] text-white flex items-center justify-center text-sm font-semibold">
                  {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                </div>
                <UserPlus className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            {inviteStatus && (
              <p className="text-sm text-center mb-3 text-gray-600">{inviteStatus}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseInviteModal}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={selectedUsers.length === 0 || sendingInvites}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-[#7a73ff] hover:bg-[#6a63ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingInvites ? "Sending..." : `Invite ${selectedUsers.length || ""}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
          {memoryUpgradeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  Unlock Memories
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Upgrade this plan to memory tier to unlock photo memories and archival features.
                </p>
                <p className="mt-3 text-sm font-semibold text-gray-900">
                  Cost: {MEMORY_TIER_PRICING.displayAmount}
                </p>
                {memoryUpgradeError && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {memoryUpgradeError}
                  </p>
                )}
                <p className="mt-4 text-xs text-gray-500">
                  Payment methods: Card, Apple Pay, Mobile Money
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setMemoryUpgradeModalOpen(false)}
                    disabled={memoryUpgradeLoading}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitiateMemoryUpgrade}
                    disabled={memoryUpgradeLoading}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#7a73ff] hover:bg-[#6a63ff] disabled:opacity-60"
                  >
                    {memoryUpgradeLoading ? "Opening..." : "Proceed to Payment"}
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
              <button
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#6b63ff]/40 bg-white text-sm font-semibold text-[#6b63ff] hover:bg-purple-50 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite members
              </button>
              <button
                onClick={handleMemoryUpgradeClick}
                disabled={plan?.memoryTier}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7a73ff] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan?.memoryTier ? "Memory Active" : "Upgrade to Memory"}
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

              {/* Pending Invitations Section */}
              {pendingInvitations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        Sent
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">
                        Pending invitations
                      </h3>
                    </div>
                    <UserPlus className="w-5 h-5 text-gray-300" />
                  </div>
                  {pendingInvitationsError && (
                    <p className="text-sm text-red-500 mb-4">{pendingInvitationsError}</p>
                  )}
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between gap-3 border border-amber-100 bg-amber-50 rounded-2xl p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-sm font-semibold">
                            {(invitation.inviteeName || invitation.inviteeUsername || "I")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {invitation.inviteeName || invitation.inviteeUsername || "Invited User"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {invitation.createdAt 
                                ? new Date(invitation.createdAt).toLocaleDateString() 
                                : "Recently invited"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeInvite(invitation.id)}
                          disabled={revokingInviteId === invitation.id}
                          className="px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-100 rounded-full transition-colors disabled:opacity-50"
                        >
                          {revokingInviteId === invitation.id ? "Revoking..." : "Revoke"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                {!plan?.memoryTier ? (
                  <div className="relative min-h-64 flex flex-col items-center justify-center overflow-hidden">
                    {/* Pinterest-style masonry grid background */}
                    <div className="absolute inset-0 columns-3 gap-3 p-4 md:p-6 opacity-20 space-y-3">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-lg md:rounded-2xl bg-gray-500 animate-pulse break-inside-avoid ${
                            i % 5 === 0 ? "h-40 md:h-56 lg:h-64" : i % 3 === 0 ? "h-32 md:h-44 lg:h-52" : "h-24 md:h-36 lg:h-40"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Padlock button - centered and properly spaced */}
                    <button
                      onClick={handleMemoryUpgradeClick}
                      className="group relative z-10 flex flex-col items-center gap-2 md:gap-3"
                      title="Click to unlock memory tier"
                    >
                      <div className="relative transition-transform duration-300 group-hover:scale-110">
                        <Lock className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-[#7a73ff] transition-colors duration-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm md:text-base font-semibold text-gray-600 group-hover:text-[#7a73ff] transition-colors duration-300">
                          Unlock Memories
                        </p>
                        <p className="text-xs md:text-sm text-gray-400 group-hover:text-gray-600 transition-colors duration-300 mt-1">
                          Upgrade to memory tier
                        </p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <>
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
                      <div className="columns-3 gap-3 space-y-3">
                    {planImagesLoading &&
                      Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={`image-skeleton-${index}`}
                          className="mb-3 break-inside-avoid rounded-2xl border border-gray-100 bg-gray-100/70 overflow-hidden animate-pulse"
                        >
                          <div className={`bg-gray-200/80 ${
                            index % 3 === 0 ? "h-56" : index % 2 === 0 ? "h-44" : "h-36"
                          }`} />
                        </div>
                      ))}
                    {!planImagesLoading &&
                      planImages.map((item, index) => (
                        <div
                          key={item.id}
                          data-card-id={item.id}
                          className={`mb-3 break-inside-avoid relative rounded-2xl border border-gray-100 overflow-visible transition-all duration-500 ease-out ${
                            visibleCards.has(item.id)
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-8'
                          }`}
                          style={{
                            transitionDelay: `${Math.min(index * 80, 800)}ms`,
                            animation: visibleCards.has(item.id)
                              ? `slideUpBounce 0.6s ease-out ${Math.min(index * 80, 800)}ms forwards`
                              : 'none'
                          }}
                        >
                          <div className="rounded-2xl overflow-hidden relative bg-gray-100">
                            {item.image?.url && (
                              <Image
                                src={item.image.thumbnailUrl || item.image.url}
                                alt="Plan memory"
                                width={400}
                                height={400}
                                className="w-full h-auto object-cover cursor-pointer"
                                priority={index < 3}
                                loading={index < 3 ? "eager" : "lazy"}
                                placeholder="blur"
                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                                unoptimized
                                onClick={() => handlePreviewImage(item.image?.url)}
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
                    </>
                )}
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

      {/* Invite Members Modal */}
      <InviteMembersModal />
    </div>
  );
}
