"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Link from "next/link";
import { catalogueAPI } from "@/lib/api";
import { Plus, Pencil, PauseCircle, Archive, CheckCircle2 } from "lucide-react";

const statusBadge = {
  active: { label: "Active", cls: "bg-green-100 text-green-700" },
  paused: { label: "Paused", cls: "bg-yellow-100 text-yellow-700" },
  archived: { label: "Archived", cls: "bg-gray-100 text-gray-500" },
};

export default function AdminCataloguePage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("active");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) { router.replace("/dashboard"); return; }
    fetchItems();
  }, [loading, user, isAdmin, filter]);

  const fetchItems = async () => {
    setFetching(true);
    try {
      const res = await catalogueAPI.list({ status: filter });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleStatusChange = async (itemId, status) => {
    setUpdatingId(itemId);
    try {
      await catalogueAPI.updateItem(itemId, { status });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Catalogue</h1>
          <Link href="/admin/catalogue/new"
            className="flex items-center gap-2 bg-[#7a73ff] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6a63ef] transition-colors">
            <Plus className="w-4 h-4" /> New listing
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {["active", "paused", "archived"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? "bg-[#7a73ff] text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No {filter} listings.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const badge = statusBadge[item.status] || statusBadge.active;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{item.venue?.name} · {item.city} · KES {item.listedPrice?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status !== "active" && (
                      <button onClick={() => handleStatusChange(item.id, "active")} disabled={updatingId === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                    {item.status !== "paused" && item.status !== "archived" && (
                      <button onClick={() => handleStatusChange(item.id, "paused")} disabled={updatingId === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-40 transition-colors">
                        <PauseCircle className="w-3.5 h-3.5" /> Pause
                      </button>
                    )}
                    {item.status !== "archived" && (
                      <button onClick={() => handleStatusChange(item.id, "archived")} disabled={updatingId === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    )}
                    <Link href={`/admin/catalogue/${item.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f3f1ff] text-[#7a73ff] hover:bg-[#ebe8ff] transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
