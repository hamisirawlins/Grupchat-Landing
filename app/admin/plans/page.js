"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { catalogueAPI } from "@/lib/api";
import { Users, CheckCircle, Clock, Lock } from "lucide-react";

export default function AdminPlansPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) { router.replace("/dashboard"); return; }
    load();
  }, [loading, user, isAdmin]);

  const load = async () => {
    try {
      const res = await catalogueAPI.listAdminPlans();
      setPlans(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const statusIcon = (status) => {
    if (status === "locked") return <Lock className="w-4 h-4 text-orange-500" />;
    if (status === "archived") return <CheckCircle className="w-4 h-4 text-gray-400" />;
    return <Clock className="w-4 h-4 text-green-500" />;
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading || !isAdmin) return null;

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Active premium plans</h1>

        {fetching ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" /></div>
        ) : plans.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No premium plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(plan.status)}
                      <h3 className="font-medium text-gray-900 truncate">{plan.name}</h3>
                      <span className="text-xs text-gray-400 capitalize">{plan.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Locks: {formatDate(plan.lockDate)} · Event: {formatDate(plan.targetDate)}</p>
                    <div className="flex items-center gap-5 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4" /> {plan.totalMembers} members
                      </span>
                      <span className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="w-4 h-4" /> {plan.paidMembers} paid
                      </span>
                      {plan.unpaidMembers > 0 && (
                        <span className="flex items-center gap-1.5 text-orange-500">
                          <Clock className="w-4 h-4" /> {plan.unpaidMembers} unpaid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
