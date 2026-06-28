"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { catalogueAPI } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import DateInputSection from "@/components/admin/DateInputSection";

const STATUSES = ["active", "paused", "archived"];
const CATEGORIES = ["experiences", "dining", "adventure", "art", "wellness", "sports", "travel"];

export default function EditCatalogueItemPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { itemId } = useParams();
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) { router.replace("/dashboard"); return; }
    load();
  }, [loading, user, isAdmin, itemId]);

  const load = async () => {
    try {
      const res = await catalogueAPI.getItem(itemId);
      const item = res.data;
      const parsedDates = item.availableDates?.map((d) => {
        const date = d?.toDate
          ? d.toDate()
          : d?._seconds
          ? new Date(d._seconds * 1000)
          : new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
      }) || [""];
      setForm({
        title: item.title || "", description: item.description || "",
        category: item.category || "experiences", city: item.city || "",
        venueName: item.venue?.name || "", venueAddress: item.venue?.address || "",
        basePrice: item.basePrice || "", listedPrice: item.listedPrice || "",
        currency: item.currency || "KES", coverUrl: item.coverUrl || "",
        maxGroupSize: item.maxGroupSize || "", status: item.status || "active",
        availableDates: parsedDates,
      });
    } catch (e) {
      setError("Failed to load item");
    } finally {
      setFetching(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await catalogueAPI.updateItem(itemId, {
        title: form.title, description: form.description, category: form.category,
        city: form.city, venue: { name: form.venueName, address: form.venueAddress, city: form.city },
        basePrice: Number(form.basePrice), listedPrice: Number(form.listedPrice),
        currency: form.currency, coverUrl: form.coverUrl || null,
        maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : null,
        availableDates: form.availableDates.filter(Boolean), status: form.status,
      });
      router.push("/admin/catalogue");
    } catch (e) {
      setError(e.message || "Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAdmin || fetching) return (
    <DashboardWrapper>
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardWrapper>
  );

  if (!form) return <DashboardWrapper><p className="p-10 text-gray-500">{error}</p></DashboardWrapper>;

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30";

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit listing</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button type="button" key={s} onClick={() => set("status", s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${form.status === s ? "bg-[#7a73ff] text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea required rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
              <input required className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Venue name</label>
              <input required className={inputCls} value={form.venueName} onChange={(e) => set("venueName", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Venue address</label>
              <input required className={inputCls} value={form.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Base price</label>
              <input required type="number" min="0" className={inputCls} value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Listed price</label>
              <input required type="number" min="0" className={inputCls} value={form.listedPrice} onChange={(e) => set("listedPrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
              <input className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cover image URL</label>
              <input className={inputCls} value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max group size</label>
              <input type="number" min="1" className={inputCls} value={form.maxGroupSize} onChange={(e) => set("maxGroupSize", e.target.value)} />
            </div>
          </div>

          <DateInputSection
            dates={form.availableDates}
            onChange={(dates) => set("availableDates", dates)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-[#7a73ff] text-white py-3 rounded-full font-medium hover:bg-[#6a63ef] disabled:opacity-50 transition-colors">
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardWrapper>
  );
}
