"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Bits";
import { PartnersEmpty } from "@/components/discover/PartnersEmpty";
import { FormError } from "@/components/ui/Form";
import { catalogueAPI } from "@/lib/api";
import { money, plural } from "@/lib/format";
import { asList, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

const CATEGORIES = ["", "experiences", "dining", "adventure", "art", "wellness", "sports"];
const label = (c) => (c ? c[0].toUpperCase() + c.slice(1) : "All");

export default function Discover() {
  const [category, setCategory] = useState("");
  const { data, loading, error, reload } = useAsync(async () => {
    const params = { status: "active" };
    if (category) params.category = category;
    return asList(unwrap(await catalogueAPI.list(params)), "items");
  }, [category]);

  return (
    <PageFrame title="Discover" meta="Curated plans from providers. Pick one, invite your group, split it." wide onRefresh={reload}>
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
              <Link
                key={item.id}
                href={`/discover/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-black/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-600 active:scale-[0.98]"
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
            ))}
          </div>
        )}
      </Reveal>
    </PageFrame>
  );
}
