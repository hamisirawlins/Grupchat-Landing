"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { plansAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Plus, Sparkles, Users, ChevronRight, Lock } from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/"); return; }
    fetchPlans();
  }, [authLoading, user]);

  const fetchPlans = async () => {
    try {
      const res = await plansAPI.getPlans({ limit: 6, page: 1 });
      setPlans(res?.data?.plans || res?.data || []);
    } catch (e) {
      console.error("Failed to load plans", e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return null;
    const d = value?.toDate ? value.toDate() : value?._seconds ? new Date(value._seconds * 1000) : new Date(value);
    if (!d || isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  const firstName = profile?.displayName?.split(" ")[0] || user?.displayName?.split(" ")[0] || null;

  if (authLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {firstName ? `Hey ${firstName}` : "Dashboard"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">What are you planning next?</p>
          </div>
          <div className="flex gap-2">
            <Link href="/catalogue"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#7a73ff]/40 transition-colors">
              <Sparkles className="w-4 h-4 text-[#7a73ff]" /> Browse experiences
            </Link>
            <Link href="/create-plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#7a73ff] text-white text-sm font-medium hover:bg-[#6a63ef] transition-colors">
              <Plus className="w-4 h-4" /> New plan
            </Link>
          </div>
        </div>

        {/* Plans */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Your plans</h2>
            <Link href="/plans" className="text-sm text-[#7a73ff] hover:underline flex items-center gap-1">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-[#f9f8ff] border border-[#e8e6ff] rounded-2xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-[#7a73ff]/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">No plans yet</p>
              <p className="text-sm text-gray-500 mb-4">Create a DIY plan or browse curated experiences.</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/create-plan"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#7a73ff] text-white text-sm font-medium hover:bg-[#6a63ef] transition-colors">
                  <Plus className="w-4 h-4" /> Create plan
                </Link>
                <Link href="/catalogue"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#7a73ff]/40 transition-colors">
                  Browse experiences
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Link key={plan.id} href={`/plans/${plan.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {plan.planType === "premium" && (
                          <span className="text-[10px] font-semibold text-[#7a73ff] uppercase tracking-wide bg-[#f3f1ff] px-1.5 py-0.5 rounded-md">Premium</span>
                        )}
                        {plan.status === "locked" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{plan.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    {plan.targetDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#7a73ff]" />
                        {formatDate(plan.targetDate) || "TBD"}
                      </div>
                    )}
                    {(plan.membersCount !== undefined || plan.members) && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#7a73ff]" />
                        {plan.membersCount ?? (Array.isArray(plan.members) ? plan.members.length : 0)} member{(plan.membersCount ?? 0) !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${plan.status === "active" ? "text-green-600" : plan.status === "locked" ? "text-orange-500" : "text-gray-400"}`}>
                      {plan.status || "active"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#7a73ff] transition-colors" />
                  </div>
                </Link>
              ))}

              <Link href="/create-plan"
                className="group bg-[#f9f8ff] border border-dashed border-[#c4c0ff] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#7a73ff] transition-colors min-h-[120px]">
                <Plus className="w-6 h-6 text-[#7a73ff]/50 group-hover:text-[#7a73ff] transition-colors" />
                <span className="text-sm font-medium text-[#7a73ff]/60 group-hover:text-[#7a73ff] transition-colors">New plan</span>
              </Link>
            </div>
          )}
        </section>

        {/* Experiences CTA */}
        <section className="bg-gradient-to-br from-[#1b1b3a] to-[#0f0f2e] text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Curated experiences</p>
            <h3 className="text-lg font-semibold">Browse the catalogue</h3>
            <p className="text-sm text-white/60 mt-1 max-w-sm">Venues, activities, outings — one link, everyone pays their share.</p>
          </div>
          <Link href="/catalogue"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1b1b3a] text-sm font-semibold hover:bg-gray-100 transition-colors flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#7a73ff]" /> Explore now
          </Link>
        </section>
      </div>
    </DashboardWrapper>
  );
}
