"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import { PageFrame, Reveal, Section } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState, Skeleton, StickyAction, Tag } from "@/components/ui/Bits";
import { Field, FieldGroup, FormError, PrimaryButton } from "@/components/ui/Form";
import { catalogueAPI, plansAPI } from "@/lib/api";
import { date, money, relative, toDate } from "@/lib/format";
import { unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

export default function DiscoverItem() {
  const { itemId } = useParams();
  const router = useRouter();
  const { data: item, loading, error, reload } = useAsync(async () => unwrap(await catalogueAPI.getItem(itemId)), [itemId]);
  const [open, setOpen] = useState(false);
  const [dateIdx, setDateIdx] = useState(0);
  const [people, setPeople] = useState("2");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const dates = useMemo(() => (item?.availableDates ?? []).map(toDate).filter(Boolean).filter((d) => d >= new Date(Date.now() - 86400000)), [item]);
  const price = Number(item?.listedPrice) || 0;
  const currency = item?.currency || "KES";
  const total = price * (Number(people) || 1);

  const start = async () => {
    setFormError("");
    const n = Number(people);
    if (!(n >= 1)) return setFormError("How many people are coming?");
    if (item.maxGroupSize && n > item.maxGroupSize) return setFormError(`This experience takes up to ${item.maxGroupSize} people.`);
    setBusy(true);
    try {
      const res = await plansAPI.createPlan({
        name: item.title,
        category: item.category,
        description: item.description,
        planType: "premium",
        catalogueItemId: item.id,
        targetDate: dates[dateIdx] ? dates[dateIdx].toISOString() : null,
        // Curated plans are admin-generated inventory; members split the total with custom amounts (decision 1).
        poolMode: "pool",
        targetAmount: total,
        currency,
        groupSizeCap: item.maxGroupSize || null,
      });
      const created = unwrap(res);
      const id = created?.planId || created?.id;
      if (!id) throw new Error("The plan was created but no id came back.");
      toast.success("Plan started");
      router.push(`/plans/${id}`);
    } catch (err) {
      setFormError(err.message || "Couldn't start the plan.");
      setBusy(false);
    }
  };

  if (error) return <PageFrame title="Experience"><Reveal><EmptyState title="This experience isn't available" text="It may have been removed or paused." /></Reveal></PageFrame>;
  if (!item) return <PageFrame><Skeleton className="aspect-[16/9] w-full rounded-2xl" /><Skeleton className="mt-8 h-12 w-2/3" /><Skeleton className="mt-4 h-4 w-1/2" /></PageFrame>;

  return (
    <PageFrame
      onRefresh={reload}
      eyebrow={<span className="inline-flex items-center gap-2"><Tag tone="accent">{item.category}</Tag>{item.status !== "active" && <Tag tone="warning">{item.status}</Tag>}</span>}
      title={item.title}
      meta={<span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1"><span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{[item.venue?.name, item.city].filter(Boolean).join(", ")}</span>{item.maxGroupSize && <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" aria-hidden="true" />up to {item.maxGroupSize}</span>}</span>}
    >
      {item.coverUrl && <Reveal className="-mt-2 mb-10 overflow-hidden rounded-2xl"><img src={item.coverUrl} alt="" className="aspect-[16/9] w-full object-cover" /></Reveal>}

      <Reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{money(price, currency)} <span className="text-base font-normal text-gray-500">per person</span></p>
          <p className="mt-1 text-sm text-gray-500">{dates.length ? `${dates.length} upcoming ${dates.length === 1 ? "date" : "dates"}` : "Dates on request"}</p>
        </div>
        <div className="sm:w-56"><StickyAction><PrimaryButton type="button" onClick={() => setOpen(true)} disabled={item.status !== "active"}>Start a plan</PrimaryButton></StickyAction></div>
      </Reveal>

      {item.description && <Section title="About"><p className="text-[15px] leading-relaxed text-gray-600">{item.description}</p></Section>}

      {item.venue && (
        <Section title="Where" className="mt-10">
          <ListGroup>
            <Row leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><MapPin className="h-4 w-4" /></span>} title={item.venue.name} footnote={[item.venue.address, item.venue.city || item.city].filter(Boolean).join(", ")} chevron={false} />
          </ListGroup>
        </Section>
      )}

      {dates.length > 0 && (
        <Section title="When" className="mt-10">
          <ListGroup>
            {dates.slice(0, 8).map((d) => <Row key={d.toISOString()} leading={<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Calendar className="h-4 w-4" /></span>} title={date(d, { weekday: "short" })} footnote={relative(d)} chevron={false} />)}
          </ListGroup>
        </Section>
      )}

      {item.resourceLinks?.length > 0 && (
        <Section title="Links" className="mt-10">
          <ListGroup>{item.resourceLinks.map((u) => <Row key={u} href={u} leading={<ExternalLink className="h-4 w-4 text-gray-400" />} title={u.replace(/^https?:\/\//, "")} />)}</ListGroup>
        </Section>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Start a plan">
        <form onSubmit={(e) => { e.preventDefault(); start(); }} className="space-y-4">
          {dates.length > 0 && (
            <ListGroup label="Date">
              {dates.slice(0, 6).map((d, i) => (
                <Row key={d.toISOString()} onClick={() => setDateIdx(i)} title={date(d, { weekday: "short" })} footnote={relative(d)} trailing={i === dateIdx ? <Tag tone="accent">Chosen</Tag> : undefined} chevron={false} />
              ))}
            </ListGroup>
          )}
          <FieldGroup>
            <Field id="people" label="How many people?" type="number" inputMode="numeric" min={1} max={item.maxGroupSize || undefined} step="1" value={people} onChange={(e) => setPeople(e.target.value)} autoComplete="off" />
            <div className="flex h-14 items-center justify-between px-4">
              <span className="text-[15px] text-gray-500">Group total</span>
              <span className="text-[15px] font-semibold tabular-nums">{money(total, currency)}</span>
            </div>
          </FieldGroup>
          <p className="text-xs text-gray-400">Everyone contributes by card toward the total. You can adjust it later.</p>
          <FormError>{formError}</FormError>
          <PrimaryButton loading={busy}>Start plan</PrimaryButton>
        </form>
      </Sheet>
    </PageFrame>
  );
}
