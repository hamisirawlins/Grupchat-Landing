"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { catalogueAPI } from "@/lib/api";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["experiences", "dining", "adventure", "art", "wellness", "sports", "travel"];

export default function NewCatalogueItemPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "experiences", city: "Nairobi",
    venueName: "", venueAddress: "", basePrice: "", listedPrice: "",
    currency: "KES", coverUrl: "", maxGroupSize: "", availableDates: [""],
  });

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace("/dashboard");
  }, [loading, user, isAdmin]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleDateChange = (i, v) => {
    const dates = [...form.availableDates];
    dates[i] = v;
    set("availableDates", dates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await catalogueAPI.createItem({
        title: form.title, description: form.description, category: form.category,
        city: form.city,
        venue: { name: form.venueName, address: form.venueAddress, city: form.city },
        basePrice: Number(form.basePrice), listedPrice: Number(form.listedPrice),
        currency: form.currency,
        coverUrl: form.coverUrl || null,
        maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : null,
        availableDates: form.availableDates.filter(Boolean),
      });
      router.push("/admin/catalogue");
    } catch (e) {
      setError(e.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAdmin) return null;

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30";

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">New listing</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Museum of Illusions — Saturday 2 PM" />
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Base price (cost)</label>
              <input required type="number" min="0" className={inputCls} value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Listed price (member pays)</label>
              <input required type="number" min="0" className={inputCls} value={form.listedPrice} onChange={(e) => set("listedPrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
              <input className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cover image URL (optional)</label>
              <input className={inputCls} value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max group size (optional)</label>
              <input type="number" min="1" className={inputCls} value={form.maxGroupSize} onChange={(e) => set("maxGroupSize", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Available dates</label>
            <div className="space-y-2">
              {form.availableDates.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input type="datetime-local" className={`${inputCls} flex-1`} value={d} onChange={(e) => handleDateChange(i, e.target.value)} />
                  {form.availableDates.length > 1 && (
                    <button type="button" onClick={() => set("availableDates", form.availableDates.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => set("availableDates", [...form.availableDates, ""])}
                className="flex items-center gap-1 text-sm text-[#7a73ff] hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add date
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-[#7a73ff] text-white py-3 rounded-full font-medium hover:bg-[#6a63ef] disabled:opacity-50 transition-colors">
            {submitting ? "Creating…" : "Create listing"}
          </button>
        </form>
      </div>
    </DashboardWrapper>
  );
}
