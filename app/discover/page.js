"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Bits";
import { SpotlightCard } from "@/components/bits";
import { PartnersEmpty } from "@/components/discover/PartnersEmpty";
import { FormError } from "@/components/ui/Form";
import { catalogueAPI, experiencesAPI } from "@/lib/api";
import { Chips } from "@/components/kit";
import { ListingCard } from "@/components/tickets/ListingCard";
import { CATEGORIES as PROVIDER_CATEGORIES } from "@/lib/providers";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { motion } from "framer-motion";
import { money, plural } from "@/lib/format";
import { asList, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

const CATEGORIES = ["", "experiences", "dining", "adventure", "art", "wellness", "sports"];
const label = (c) => (c ? c[0].toUpperCase() + c.slice(1) : "All");

export default function Discover() {
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState("");
  const { data, loading, error, reload } = useAsync(async () => {
    const params = { status: "active" };
    if (category) params.category = category;
    return asList(unwrap(await catalogueAPI.list(params)), "items");
  }, [category]);

  const tickets = useAsync(async () => asList(unwrap(await experiencesAPI.list({ category: kind })), "experiences"), [kind]);
  const refresh = () => Promise.all([reload(), tickets.reload()]);

  return (
    <PageFrame title="Discover" meta="Book tickets with local providers, or pick a curated plan for your group." wide onRefresh={refresh}>
      <Tickets state={tickets} kind={kind} setKind={setKind} />
      <Reveal className="mb-5">
        <h2 className="text-xl font-extrabold tracking-[-0.01em]">Curated plans</h2>
      </Reveal>
      <Reveal className="mb-8">
        <Segmented name="discover-cat" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: label(c) }))} />
      </Reveal>
      <Reveal>
        {error && <FormError>{error.message || "Couldn't load experiences."}</FormError>}
        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : (data ?? []).length === 0 ? (
          <PartnersEmpty />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <SpotlightCard key={item.id} className="rounded-2xl" radius={280}>
              <Link
                href={`/discover/${item.id}`}
                className="group block overflow-hidden rounded-2xl border border-black/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-600 active:scale-[0.98]"
              >
                <div className="aspect-[4/3] bg-gray-100">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-semibold text-purple-200">{item.title?.[0]}</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">{item.category}</p>
                  <h3 className="mt-1 text-[17px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-500"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{[item.venue?.name, item.city].filter(Boolean).join(" · ")}</p>
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-black tabular-nums">{money(item.listedPrice, item.currency)} <span className="font-normal text-gray-400">/ person</span></span>
                    {item.availableDates?.length > 0 && <span className="flex items-center gap-1 text-gray-500"><Calendar className="h-3.5 w-3.5" aria-hidden="true" />{plural(item.availableDates.length, "date")}</span>}
                  </div>
                </div>
              </Link>
              </SpotlightCard>
            ))}
          </div>
        )}
      </Reveal>
    </PageFrame>
  );
}

/** Provider listings with tickets (KB D-044). Hidden until there is at least one. */
function Tickets({ state, kind, setKind }) {
  const { data, loading, error } = state;
  const card = useRevealVariants();
  if (!kind && !loading && !error && (data ?? []).length === 0) return null;
  return (
    <Reveal className="mb-14">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold tracking-[-0.01em]">Book tickets</h2>
          <p className="text-sm text-ink-2">Trips, food and events run by registered businesses.</p>
        </div>
        <Chips label="Kind of experience" multiple={false} value={kind || "all"} onChange={(v) => setKind(v === "all" ? "" : v)} options={[{ value: "all", label: "All" }, ...PROVIDER_CATEGORIES]} />
      </div>
      {error && <FormError>{error.message || "Couldn't load experiences."}</FormError>}
      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <p className="rounded-2xl bg-soft px-5 py-4 text-[15px] text-ink-2">Nothing in this kind yet. <button type="button" onClick={() => setKind("")} className="font-bold text-action-strong">Show all</button></p>
      ) : (
        <motion.div key={kind} variants={STAGGER} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((e, i) => <ListingCard key={e.id} e={e} priority={i < 3} variants={card} />)}
        </motion.div>
      )}
    </Reveal>
  );
}
