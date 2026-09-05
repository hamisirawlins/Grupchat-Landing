"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Link2, X } from "lucide-react";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Field, FieldGroup, FormError, OutlineButton, PrimaryButton, SelectField, TextAreaField } from "@/components/ui/Form";
import { uploadsAPI } from "@/lib/api";
import { date, toDate } from "@/lib/format";
import { unwrap } from "@/lib/data/shape";

export const CATEGORIES = ["experiences", "dining", "adventure", "art", "wellness", "sports"].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));
const CURRENCIES = [{ value: "KES", label: "KES — Kenyan shilling" }, { value: "USD", label: "USD — US dollar" }];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const isoDay = (v) => {
  const d = toDate(v);
  return d ? d.toISOString().slice(0, 10) : null;
};

function fromItem(item) {
  return {
    title: item?.title ?? "",
    category: item?.category ?? "experiences",
    city: item?.city ?? "",
    description: item?.description ?? "",
    venueName: item?.venue?.name ?? "",
    venueAddress: item?.venue?.address ?? "",
    listedPrice: item?.listedPrice ?? "",
    basePrice: item?.basePrice ?? "",
    currency: item?.currency ?? "KES",
    maxGroupSize: item?.maxGroupSize ?? "",
    coverUrl: item?.coverUrl ?? "",
    availableDates: (item?.availableDates ?? []).map(isoDay).filter(Boolean),
    resourceLinks: item?.resourceLinks ?? [],
  };
}

/** Create/edit form for a curated experience. `onSubmit(payload)` receives the API body. */
export function CatalogueForm({ item, submitLabel, onSubmit }) {
  const [f, setF] = useState(() => fromItem(item));
  const [newDate, setNewDate] = useState("");
  const [newLink, setNewLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const addDate = () => {
    if (!newDate || f.availableDates.includes(newDate)) return;
    setF((s) => ({ ...s, availableDates: [...s.availableDates, newDate].sort() }));
    setNewDate("");
  };
  const addLink = () => {
    let href = newLink.trim();
    if (!href) return;
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
    try { new URL(href); } catch { return setError("Enter a valid link."); }
    if (!f.resourceLinks.includes(href)) setF((s) => ({ ...s, resourceLinks: [...s.resourceLinks, href] }));
    setNewLink("");
    setError("");
  };

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > MAX_IMAGE_BYTES) return setError("Images must be under 5 MB.");
    setUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
      const out = unwrap(await uploadsAPI.uploadImage({ dataUrl, fileName: file.name, folder: "catalogue" }));
      const url = out?.url || out?.publicUrl;
      if (!url) throw new Error("Upload finished but no URL came back.");
      setF((s) => ({ ...s, coverUrl: url }));
      toast.success("Cover uploaded");
    } catch (e) {
      setError(e.message || "Couldn't upload the image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const listed = Number(f.listedPrice), base = Number(f.basePrice);
    if (!f.title.trim() || !f.description.trim() || !f.city.trim()) return setError("Title, description and city are required.");
    if (!f.venueName.trim() || !f.venueAddress.trim()) return setError("Venue name and address are required.");
    if (!(listed > 0)) return setError("Listed price must be greater than zero.");
    if (!(base >= 0)) return setError("Base price must be zero or more.");
    const size = f.maxGroupSize === "" ? null : Number(f.maxGroupSize);
    if (size !== null && !(size >= 1)) return setError("Group size must be at least 1.");
    setBusy(true);
    try {
      await onSubmit({
        title: f.title.trim(),
        description: f.description.trim(),
        category: f.category,
        city: f.city.trim(),
        venue: { name: f.venueName.trim(), address: f.venueAddress.trim(), city: f.city.trim() },
        basePrice: base,
        listedPrice: listed,
        currency: f.currency,
        coverUrl: f.coverUrl.trim() || null,
        resourceLinks: f.resourceLinks,
        availableDates: f.availableDates,
        maxGroupSize: size,
      });
    } catch (err) {
      setError(err.message || "Couldn't save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Basics</h2>
        <FieldGroup>
          <Field id="title" label="Title" value={f.title} onChange={set("title")} autoComplete="off" />
          <SelectField id="category" label="Category" value={f.category} onChange={set("category")} options={CATEGORIES} />
          <Field id="city" label="City" value={f.city} onChange={set("city")} autoComplete="off" />
          <TextAreaField id="description" label="Description" value={f.description} onChange={set("description")} rows={4} required />
        </FieldGroup>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Venue</h2>
        <FieldGroup>
          <Field id="venueName" label="Venue name" value={f.venueName} onChange={set("venueName")} autoComplete="off" />
          <Field id="venueAddress" label="Address" value={f.venueAddress} onChange={set("venueAddress")} autoComplete="off" />
        </FieldGroup>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Pricing</h2>
        <FieldGroup>
          <Field id="listedPrice" label="Listed price per person" type="number" inputMode="decimal" min={1} step="1" prefix={f.currency} value={f.listedPrice} onChange={set("listedPrice")} autoComplete="off" />
          <Field id="basePrice" label="Base price (provider cost)" type="number" inputMode="decimal" min={0} step="1" prefix={f.currency} value={f.basePrice} onChange={set("basePrice")} autoComplete="off" />
          <SelectField id="currency" label="Currency" value={f.currency} onChange={set("currency")} options={CURRENCIES} />
          <Field id="maxGroupSize" label="Max group size (optional)" type="number" inputMode="numeric" min={1} step="1" value={f.maxGroupSize} onChange={set("maxGroupSize")} required={false} autoComplete="off" />
        </FieldGroup>
        <p className="px-1 text-xs text-gray-400">Members see the listed price. Base price is for your margin and never shown.</p>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Dates</h2>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1"><FieldGroup><Field id="newDate" label="Add a date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required={false} /></FieldGroup></div>
          <OutlineButton onClick={addDate} className="h-14 w-28 shrink-0">Add</OutlineButton>
        </div>
        {f.availableDates.length > 0 && (
          <ListGroup>
            {f.availableDates.map((d) => (
              <Row key={d} title={date(d, { weekday: "short" })} chevron={false}
                trailing={<button type="button" aria-label={`Remove ${d}`} onClick={() => setF((s) => ({ ...s, availableDates: s.availableDates.filter((x) => x !== d) }))} className="rounded-md p-2 text-gray-400 hover:text-red-600"><X className="h-4 w-4" /></button>} />
            ))}
          </ListGroup>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Cover</h2>
        <div className="flex items-start gap-4">
          <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {f.coverUrl ? <img src={f.coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><ImagePlus className="h-6 w-6" /></div>}
          </div>
          <div className="flex-1 space-y-2">
            <FieldGroup><Field id="coverUrl" label="Image URL (or upload)" type="url" value={f.coverUrl} onChange={set("coverUrl")} required={false} autoComplete="off" /></FieldGroup>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <OutlineButton onClick={() => fileRef.current?.click()} loading={uploading} className="sm:w-48">Upload image</OutlineButton>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-gray-400">Links</h2>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1"><FieldGroup><Field id="newLink" label="Add a link" type="url" inputMode="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} required={false} autoComplete="off" /></FieldGroup></div>
          <OutlineButton onClick={addLink} className="h-14 w-28 shrink-0">Add</OutlineButton>
        </div>
        {f.resourceLinks.length > 0 && (
          <ListGroup>
            {f.resourceLinks.map((u) => (
              <Row key={u} leading={<Link2 className="h-4 w-4 text-gray-400" />} title={u.replace(/^https?:\/\//, "")} chevron={false}
                trailing={<button type="button" aria-label="Remove link" onClick={() => setF((s) => ({ ...s, resourceLinks: s.resourceLinks.filter((x) => x !== u) }))} className="rounded-md p-2 text-gray-400 hover:text-red-600"><X className="h-4 w-4" /></button>} />
            ))}
          </ListGroup>
        )}
      </section>

      <FormError>{error}</FormError>
      <PrimaryButton loading={busy}>{submitLabel}</PrimaryButton>
    </form>
  );
}
