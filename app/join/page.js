"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { dashboardAPI, handleApiError } from "@/lib/api";
import {
  CheckCircle,
  Clock,
  Users,
  Target,
  Calendar,
  ArrowRight,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

function JoinPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code");

  const [invitation, setInvitation] = useState(null);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setError("No invitation code provided");
      setLoading(false);
      return;
    }

    loadInvitationDetails();
  }, [inviteCode]);

  const loadInvitationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get invitation details
      const response = await dashboardAPI.getInvitationByCode(inviteCode);

      if (response.success) {
        setInvitation(response.data.invitation);
        setPool(response.data.pool);
      } else {
        setError(response.message || "Failed to load invitation");
      }
    } catch (err) {
      console.error("Error loading invitation:", err);
      setError(handleApiError(err, "Failed to load invitation details"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!user) {
      // Redirect to sign up with invitation code
      router.push(`/sign-up?invite=${inviteCode}`);
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const response = await dashboardAPI.acceptInvitation({
        inviteCode: inviteCode,
      });

      if (response.success) {
        setJoinSuccess(true);
        // Redirect to pool details after a short delay
        setTimeout(() => {
          router.push(`/pools/${pool.id}`);
        }, 2000);
      } else {
        setError(response.message || "Failed to join pool");
      }
    } catch (err) {
      console.error("Error joining pool:", err);
      setError(handleApiError(err, "Failed to join pool"));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invitation Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to the Pool!
          </h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined <strong>{pool?.name}</strong>.
            Redirecting you to the pool details...
          </p>
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="GrupChat Logo"
                  className="w-16 h-16 object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pool Invitation
              </h1>
            </div>
            {!user && (
              <button
                onClick={() => router.push(`/sign-up?invite=${inviteCode}`)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up to Join
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pool Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {pool?.name}
              </h2>
              <p className="text-gray-600">{pool?.description}</p>
            </div>

            {/* Pool Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-600">Target Amount</span>
                </div>
                <span className="font-semibold text-gray-900">
                  KSh {pool?.targetAmount?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Current Members</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {pool?.memberCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">End Date</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {pool?.endDate
                    ? new Date(pool.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Join Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You're Invited!
              </h3>
              <p className="text-gray-600">
                Join this pool and start contributing towards your shared goal
              </p>
            </div>

            {/* Invitation Details */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">
                  Invitation Details
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Invited by:</span>
                  <span className="font-medium text-purple-900">
                    {invitation?.inviterName || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Expires:</span>
                  <span className="font-medium text-purple-900">
                    {invitation?.expiresAt
                      ? new Date(invitation.expiresAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "3 days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Status:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            {user ? (
              <button
                onClick={handleJoinPool}
                disabled={joining}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {joining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining Pool...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Join Pool Now
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/sign-up?invite=${inviteCode}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up & Join Pool
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Already have an account?
                  </p>
                  <button
                    onClick={() => router.push(`/sign-in?invite=${inviteCode}`)}
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Sign In to Join
                  </button>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">
                Why Join This Pool?
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Secure group pools with M-Pesa integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Real-time updates and transparent tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Easy deposits and withdrawals</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Collaborative goals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
