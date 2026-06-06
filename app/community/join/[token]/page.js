"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { communityAPI, handleApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

export default function JoinGroupPage() {
  const { token } = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadInvite = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await communityAPI.getInvite(token);
        setInvite(response.data);
      } catch (err) {
        setError(handleApiError(err, "Invalid or expired invite"));
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const response = await communityAPI.acceptInvite(token);
      toast.success(response.message || "You have joined the group");
      router.push("/community/groups");
    } catch (err) {
      const message = handleApiError(err, "Failed to accept invite");
      if (message) toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      await communityAPI.declineInvite(token);
      toast.success("Invite declined");
      router.push("/community");
    } catch (err) {
      const message = handleApiError(err, "Failed to decline invite");
      if (message) toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardWrapper>
      <div className="px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 lg:pb-20 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="w-12 h-12 rounded-2xl bg-[#f3f1ff] text-[#6b63ff] flex items-center justify-center mb-6">
            <Users className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">Join Group</h1>
          <p className="text-sm text-gray-500 mt-2">
            Accept this invite to collaborate on goals with your team.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 mt-8 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading invite...</span>
            </div>
          ) : error ? (
            <p className="mt-8 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          ) : invite ? (
            <div className="mt-8 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-sm text-gray-500">Group</p>
                <p className="text-lg font-semibold text-gray-900">{invite.groupName}</p>
                <p className="text-sm text-gray-500 mt-4">Invited as</p>
                <p className="text-sm font-medium text-gray-900">{invite.email}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#7a73ff] text-white font-medium hover:bg-[#6b63ff] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Accept invite
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardWrapper>
  );
}
