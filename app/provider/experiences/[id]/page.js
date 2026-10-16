"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageIcon, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  BackLink, Button, Card, Chips, FieldRow, FilePickButton, Kicker, Label, MAX_PHOTO_MB, MoneyLines, PHOTO_ACCEPT, RadioCards,
  Skeleton, StatusTag, TextArea, TextField, WeekdayPicker,
} from "@/components/kit";
import { Sheet } from "@/components/ui/Sheet";
import { useProvider } from "@/components/providers/ProviderPortal";
import { providersAPI, uploadType } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { SPRING, STAGGER, useListItemVariants, useRevealVariants } from "@/lib/motion";
import { CANCELLATION, CATEGORIES, chargesFor, fmtMoney, readiness, scheduleLine } from "@/lib/providers";

const FIELDS = ["title", "category", "meetingPoint", "town", "description", "duration", "included", "price", "cancellation", "schedule"];
const fromExperience = (e) => ({
  title: e.title || "",
  category: e.category || "",
  meetingPoint: e.meetingPoint || "",
  town: e.town || "",
  description: e.description || "",
  duration: e.duration || "",
  included: e.included || "",
  price: e.price ? String(e.price) : "",
  cancellation: e.cancellation || "48h",
  schedule: { days: e.schedule?.days || [], startTime: e.schedule?.startTime || "", dates: e.schedule?.dates || [], spaces: e.schedule?.spaces ?? "" },
});
const toBody = (f) => ({
  ...f,
  price: f.price === "" ? undefined : f.price,
  schedule: { ...f.schedule, startTime: f.schedule.startTime || "", spaces: f.schedule.spaces === "" ? null : Number(f.schedule.spaces) },
});

/** Write, preview and publish one experience (KB D-043). Approved providers publish directly. */
export default function ExperienceEditor({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { provider } = useProvider() || {};
  const item = useRevealVariants();
  const photoVariants = useListItemVariants();
  const [e, setE] = useState(null);
  const [f, setF] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(""); // "save" | "publish" | "pause" | "photo" | "remove"
  const [newDate, setNewDate] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    providersAPI.experience(id)
      .then((r) => { const x = unwrap(r).experience; setE(x); setF(fromExperience(x)); })
      .catch((err) => setError(err.message || "Couldn't load this experience."));
  }, [id]);

  const dirty = useMemo(() => e && f && JSON.stringify(fromExperience(e)) !== JSON.stringify(f), [e, f]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (ev) => { ev.preventDefault(); ev.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (error && !e) return <p role="alert" className="font-semibold text-critical">{error}</p>;
  if (!e || !f) return <div className="flex flex-col gap-5" aria-busy="true"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-72 w-full rounded-card" /></div>;

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));
  const setSched = (k) => (v) => setF((s) => ({ ...s, schedule: { ...s.schedule, [k]: v?.target ? v.target.value : v } }));
  const currency = e.currency || "KES";
  const charges = chargesFor(f.price, e.charges?.rate ?? 0.1);
  const preview = { ...e, ...f, price: charges.price, photos: e.photos };
  const ready = readiness(preview);
  const allReady = ready.every((r) => r.ok);
  const categories = CATEGORIES.filter((c) => (provider?.business?.categories || [c.value]).includes(c.value));

  const save = async ({ quiet = false } = {}) => {
    setError("");
    const body = {};
    for (const k of FIELDS) body[k] = toBody(f)[k];
    const out = unwrap(await providersAPI.updateExperience(e.id, body)).experience;
    setE(out);
    setF(fromExperience(out));
    if (!quiet) toast.success(e.status === "live" ? "Changes are live" : "Draft saved");
    return out;
  };
  const run = (name, fn) => async () => {
    setBusy(name);
    try { await fn(); } catch (err) { setError(err.message || "Something went wrong."); } finally { setBusy(""); }
  };
  const publish = run("publish", async () => {
    if (dirty) await save({ quiet: true });
    const out = unwrap(await providersAPI.publish(e.id)).experience;
    setE(out); setF(fromExperience(out));
    toast.success("Published. It's live in Discover.");
  });
  const pause = run("pause", async () => {
    const out = unwrap(await providersAPI.pause(e.id)).experience;
    setE(out); setF(fromExperience(out));
    toast("Paused. It's hidden from Discover.");
  });
  const addPhotos = async (files) => {
    setError("");
    const notPhoto = files.find((x) => !PHOTO_ACCEPT.split(",").includes(uploadType(x)));
    if (notPhoto) return setError(`${notPhoto.name} isn't a JPG, PNG or WebP photo.`);
    const big = files.find((x) => x.size > MAX_PHOTO_MB * 1024 * 1024);
    if (big) return setError(`${big.name} is over ${MAX_PHOTO_MB} MB. Try a smaller copy of the photo.`);
    setBusy("photo");
    let sent = 0;
    try {
      // Each photo shows as soon as it's saved, so a later failure never hides the earlier ones.
      for (const file of files) {
        const out = unwrap(await providersAPI.uploadPhoto(e.id, file)).experience;
        setE((cur) => ({ ...cur, photos: out.photos, readiness: out.readiness }));
        sent += 1;
      }
    } catch (err) {
      const left = files.length - sent;
      setError(`${err.message || "That photo didn't upload. Try again."}${left > 1 ? ` ${left} photos weren't sent.` : ""}${err.ref ? ` (Reference ${err.ref})` : ""}`);
    } finally { setBusy(""); }
  };
  const removePhoto = async (photoId) => {
    setError("");
    try { const out = unwrap(await providersAPI.removePhoto(e.id, photoId)).experience; setE((cur) => ({ ...cur, photos: out.photos })); }
    catch (err) { setError(err.message || "Couldn't remove it."); }
  };
  const makeCover = async (photoId) => {
    const ids = [photoId, ...e.photos.map((p) => p.id).filter((x) => x !== photoId)];
    setE((cur) => ({ ...cur, photos: ids.map((x) => cur.photos.find((p) => p.id === x)) }));
    try { await providersAPI.orderPhotos(e.id, ids); } catch (err) { setError(err.message || "Couldn't reorder."); }
  };
  const remove = run("remove", async () => {
    await providersAPI.archive(e.id);
    toast("Experience removed");
    router.replace("/provider/experiences");
  });
  const addDate = () => {
    if (!newDate || f.schedule.dates.includes(newDate)) return;
    setSched("dates")([...f.schedule.dates, newDate].sort());
    setNewDate("");
  };

  const primary = e.status === "live"
    ? <Button size="md" className="px-5" onClick={run("save", () => save())} loading={busy === "save"} disabled={!dirty}>Save changes</Button>
    : <Button size="md" className="px-5" onClick={publish} loading={busy === "publish"} disabled={!allReady || e.pausedReason === "admin"}>{e.status === "paused" ? "Publish again" : "Publish"}</Button>;
  const secondary = e.status === "live"
    ? <Button variant="secondary" size="md" onClick={pause} loading={busy === "pause"}>Pause</Button>
    : <Button variant="secondary" size="md" onClick={run("save", () => save())} loading={busy === "save"} disabled={!dirty}>Save draft</Button>;

  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item}><BackLink href="/provider/experiences">Experiences</BackLink></motion.div>
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-2">
          <StatusTag status={e.status} />
          <h1 className="text-[28px] font-black leading-[34px] tracking-[-0.03em] sm:text-4xl sm:leading-[42px]">{f.title || "New experience"}</h1>
          {e.pausedReason === "admin" && <p className="text-sm font-semibold text-warning">Our team paused this experience. Reply to our email to talk it through.</p>}
        </div>
        <div className="hidden flex-wrap gap-2.5 sm:flex">{secondary}{primary}</div>
      </motion.div>
      {error && <p role="alert" className="rounded-xl bg-critical-tint px-4 py-3 text-[15px] font-semibold text-critical">{error}</p>}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <motion.div variants={item} className="flex min-w-0 flex-[1.6] flex-col gap-5">
          <Card title="Basics">
            <TextField label="Title" value={f.title} onChange={set("title")} maxLength={80} placeholder="Sunset dhow, Shimoni" />
            {categories.length > 1 && (
              <div className="flex flex-col gap-2"><Label>Category</Label><Chips label="Category" multiple={false} options={categories} value={f.category} onChange={set("category")} /></div>
            )}
            <FieldRow>
              <TextField label="Meeting point" value={f.meetingPoint} onChange={set("meetingPoint")} placeholder="Shimoni jetty, Kwale" />
              <TextField label="Town" value={f.town} onChange={set("town")} />
            </FieldRow>
          </Card>

          <Card title="Photos" sub="At least 3. Use your own photos. The first is the cover.">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
              <AnimatePresence initial={false}>
                {e.photos.map((p, i) => (
                  <motion.li key={p.id} layout variants={photoVariants} initial="initial" animate="animate" exit="exit" className="group relative h-[120px] overflow-hidden rounded-[14px] bg-soft">
                    <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    {i === 0 ? (
                      <span className="absolute left-2 top-2 rounded-tag bg-white/95 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]">Cover</span>
                    ) : (
                      <button type="button" onClick={() => makeCover(p.id)} aria-label={`Make photo ${i + 1} the cover`} className="absolute left-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => removePhoto(p.id)} aria-label={`Remove photo ${i + 1}`} className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              <li>
                <FilePickButton accept={PHOTO_ACCEPT} multiple onPick={addPhotos} loading={busy === "photo"} variant="text" className="h-[120px] w-full flex-col gap-1.5 rounded-[14px] border-2 border-dashed border-black/20 bg-white text-sm" label="Add photo">
                  <Plus className="h-5 w-5" aria-hidden="true" />Add photo
                </FilePickButton>
              </li>
            </ul>
          </Card>

          <Card title="About">
            <TextArea label="Description" rows={4} value={f.description} onChange={set("description")} maxLength={2000} placeholder="What guests do, see and get." />
            <FieldRow>
              <TextField label="Duration" value={f.duration} onChange={set("duration")} placeholder="2.5 hours" />
              <TextField label="What's included" optional value={f.included} onChange={set("included")} placeholder="Dhow ride, soft drinks, life jackets" />
            </FieldRow>
          </Card>

          <Card title="Dates and spaces">
            <div className="flex flex-col gap-2"><Label>Repeats every</Label><WeekdayPicker value={f.schedule.days} onChange={setSched("days")} /></div>
            <FieldRow>
              <TextField label="Start time" type="time" value={f.schedule.startTime} onChange={setSched("startTime")} />
              <TextField label="Spaces per trip" inputMode="numeric" value={f.schedule.spaces} onChange={(ev) => setSched("spaces")(ev.target.value.replace(/\D/g, ""))} placeholder="14" />
            </FieldRow>
            <div className="flex flex-col gap-2">
              <Label htmlFor="one-off">One-off dates</Label>
              <div className="flex gap-2">
                <input id="one-off" type="date" value={newDate} min={new Date().toISOString().slice(0, 10)} onChange={(ev) => setNewDate(ev.target.value)} className="h-11 min-w-0 flex-1 rounded-input bg-white px-3 text-base shadow-[inset_0_0_0_1px_var(--color-line-strong)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-action)]" />
                <Button variant="quiet" onClick={addDate} disabled={!newDate}><Plus className="h-4 w-4" />Add</Button>
              </div>
              {f.schedule.dates.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {f.schedule.dates.map((d) => (
                    <li key={d} className="inline-flex h-9 items-center gap-1 rounded-full bg-soft pl-3 text-sm font-semibold">
                      {new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}
                      <button type="button" aria-label={`Remove ${d}`} onClick={() => setSched("dates")(f.schedule.dates.filter((x) => x !== d))} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:text-ink"><X className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card title="Price">
            <TextField label="Price per person" prefix={currency} inputMode="numeric" value={f.price} onChange={(ev) => set("price")(ev.target.value.replace(/[^\d]/g, ""))} placeholder="2500" />
            {charges.price > 0 && <MoneyLines rows={[["Provider charges", `− ${fmtMoney(charges.charges, currency)}`], ["You receive per ticket", fmtMoney(charges.receives, currency), true]]} />}
          </Card>

          <Card title="Cancellation">
            <RadioCards label="Cancellation" options={CANCELLATION} value={f.cancellation} onChange={set("cancellation")} />
          </Card>

          {e.status !== "live" && (
            <button type="button" onClick={() => setConfirmRemove(true)} className="self-start rounded-xl px-2 py-2 text-sm font-semibold text-critical hover:bg-critical-tint">Remove this experience</button>
          )}
        </motion.div>

        <motion.aside variants={item} aria-label="Preview" className="flex min-w-0 flex-1 flex-col gap-4 lg:sticky lg:top-10 lg:max-w-[380px]">
          <Kicker>How guests see it</Kicker>
          <div className="flex flex-col overflow-hidden rounded-card shadow-lift">
            <div className="flex h-[190px] items-center justify-center bg-memory-tint text-memory-ink">
              {e.photos[0] ? <img src={e.photos[0].url} alt="" className="h-full w-full object-cover" /> : <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold"><ImageIcon className="h-[18px] w-[18px]" />Cover photo</span>}
            </div>
            <div className="flex flex-col gap-1.5 px-[18px] pb-[18px] pt-4">
              <span className="text-lg font-bold leading-6">{f.title || "Your title"}</span>
              <span className="text-sm leading-5 text-ink-2">{[f.town, scheduleLine({ ...f.schedule }), f.duration].filter(Boolean).join(" · ") || "Town · days and time · duration"}</span>
              <span className="tabular text-[17px] font-extrabold">{charges.price ? fmtMoney(charges.price, currency) : `${currency} —`} <span className="text-[13px] font-medium text-ink-3">per person</span></span>
            </div>
          </div>
          <section aria-label="Ready to publish" className="flex flex-col gap-2.5 rounded-tile bg-soft px-5 py-[18px]">
            <span className="text-[15px] font-extrabold">{allReady ? "Ready to publish" : "To publish"}</span>
            <ul className="flex flex-col gap-2">
              {ready.map((r) => (
                <li key={r.id} className={`flex items-center gap-2 text-[13px] font-semibold leading-[18px] ${r.ok ? "text-success" : "text-ink-2"}`}>
                  <motion.span initial={false} animate={{ scale: r.ok ? 1 : 0.85 }} transition={SPRING.playful} className={`flex h-[18px] w-[18px] items-center justify-center rounded-full ${r.ok ? "bg-success text-white" : "shadow-[inset_0_0_0_1.5px_rgb(0_0_0/0.25)]"}`}>
                    {r.ok && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                  </motion.span>
                  {r.label}
                </li>
              ))}
            </ul>
          </section>
        </motion.aside>
      </div>

      {/* Phones: the actions stay under the thumb, above the tab bar */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 flex gap-2.5 border-t border-line bg-white/95 px-5 py-3 backdrop-blur sm:hidden">
        <div className="flex-1 [&>button]:w-full">{secondary}</div>
        <div className="flex-1 [&>button]:w-full">{primary}</div>
      </div>

      <Sheet open={confirmRemove} onClose={() => setConfirmRemove(false)} title="Remove this experience?" footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => setConfirmRemove(false)}>Keep it</Button>
          <Button variant="danger" className="bg-critical-tint" onClick={remove} loading={busy === "remove"}>Remove</Button>
        </div>
      }>
        <p className="text-[15px] leading-[22px] text-ink-2">It disappears from your portal. Anything already booked stays booked.</p>
      </Sheet>
    </motion.div>
  );
}
