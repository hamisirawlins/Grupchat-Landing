"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { catalogueAPI } from "@/lib/api";
import Link from "next/link";
import { Sparkles, MapPin, Calendar } from "lucide-react";

export default function CataloguePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/sign-in"); return; }
    load();
  }, [authLoading, user, category]);

  const load = async () => {
    setFetching(true);
    try {
      const params = { status: "active" };
      if (category) params.category = category;
      const res = await catalogueAPI.list(params);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const CATEGORIES = ["", "experiences", "dining", "adventure", "art", "wellness", "sports"];

  if (authLoading) return null;

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-[#7a73ff]" />
          <h1 className="text-2xl font-semibold text-gray-900">Experiences</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Curated group experiences in Nairobi. Browse, pick, share one link — everyone joins and pays their share.</p>

        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c ? "bg-[#7a73ff] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#7a73ff]/40"}`}>
              {c ? c.charAt(0).toUpperCase() + c.slice(1) : "All"}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No experiences available right now. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link href={`/catalogue/${item.id}`} key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {item.coverUrl ? (
                  <div className="h-44 overflow-hidden">
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-[#f3f1ff] to-[#e8e6ff] flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[#7a73ff]/40" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs text-[#7a73ff] font-medium uppercase tracking-wide">{item.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-1 mb-2 leading-snug">{item.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> {item.venue?.name} · {item.city}
                  </div>
                  {item.availableDates?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3.5 h-3.5" /> {item.availableDates.length} date{item.availableDates.length !== 1 ? "s" : ""} available
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{item.currency} {item.listedPrice?.toLocaleString()} <span className="font-normal text-gray-400 text-xs">/ person</span></span>
                    <span className="text-xs text-[#7a73ff] font-medium group-hover:underline">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
