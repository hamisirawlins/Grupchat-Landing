"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { catalogueAPI, plansAPI } from "@/lib/api";
import { ArrowLeft, MapPin, Calendar, Users, Sparkles, ChevronRight } from "lucide-react";

export default function CatalogueItemPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [groupSizeCap, setGroupSizeCap] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace(`/sign-in?redirect=/catalogue/${itemId}`); return; }
    load();
  }, [authLoading, user, itemId]);

  const load = async () => {
    try {
      const res = await catalogueAPI.getItem(itemId);
      setItem(res.data);
    } catch (e) {
      setError("Experience not found.");
    } finally {
      setFetching(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleStartPlan = async () => {
    if (!selectedDate) { setError("Please select a date."); return; }
    setError("");
    setCreating(true);
    try {
      const res = await plansAPI.createPlan({
        name: item.title,
        category: item.category,
        description: item.description,
        targetDate: selectedDate,
        planType: "premium",
        catalogueItemId: itemId,
        groupSizeCap: groupSizeCap ? Number(groupSizeCap) : null,
      });
      const planId = res.data?.planId;
      // Generate invite link immediately
      const inviteRes = await plansAPI.generateInvite(planId);
      router.push(`/plans/${planId}?inviteUrl=${encodeURIComponent(inviteRes.data?.inviteUrl || "")}`);
    } catch (e) {
      setError(e.message || "Failed to start plan");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || fetching) return (
    <DashboardWrapper>
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardWrapper>
  );

  if (!item) return (
    <DashboardWrapper>
      <div className="p-10 text-gray-500">{error || "Not found."}</div>
    </DashboardWrapper>
  );

  return (
    <DashboardWrapper>
      <div className="max-w-2xl mx-auto p-6 lg:p-10">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.title} className="w-full h-56 object-cover rounded-2xl mb-6" />
        ) : (
          <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#f3f1ff] to-[#e8e6ff] flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-[#7a73ff]/40" />
          </div>
        )}

        <span className="text-xs font-medium text-[#7a73ff] uppercase tracking-wide">{item.category}</span>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1 mb-2">{item.title}</h1>
        <p className="text-gray-600 text-sm mb-5 leading-relaxed">{item.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#7a73ff]" /> {item.venue?.name}, {item.venue?.address}</div>
          {item.maxGroupSize && <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#7a73ff]" /> Up to {item.maxGroupSize} people</div>}
        </div>

        <div className="bg-[#f3f1ff] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price per person</span>
            <span className="text-xl font-semibold text-gray-900">{item.currency} {item.listedPrice?.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Everyone pays their own share. You pick up no one else's tab.</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select a date</label>
            {item.availableDates?.length > 0 ? (
              <div className="space-y-2">
                {item.availableDates.map((d, i) => {
                  const dateStr = d?.toDate ? d.toDate().toISOString() : String(d);
                  return (
                    <button key={i} type="button" onClick={() => setSelectedDate(dateStr)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${selectedDate === dateStr ? "border-[#7a73ff] bg-[#f3f1ff] text-[#7a73ff]" : "border-gray-200 bg-white text-gray-700 hover:border-[#7a73ff]/40"}`}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      {formatDate(d)}
                      {selectedDate === dateStr && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No dates available yet. Check back soon.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group size cap <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="number" min="1" max={item.maxGroupSize || 100}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30"
              placeholder="Leave blank for no limit" value={groupSizeCap} onChange={(e) => setGroupSizeCap(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button onClick={handleStartPlan} disabled={creating || !selectedDate}
          className="w-full bg-[#7a73ff] text-white py-3.5 rounded-full font-semibold hover:bg-[#6a63ef] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {creating ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</>
          ) : (
            <>Start a plan · Share the link</>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">You can pay now or later from within the plan. Everyone else gets their own payment prompt.</p>
      </div>
    </DashboardWrapper>
  );
}
