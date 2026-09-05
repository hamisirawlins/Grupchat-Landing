"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { ButtonLink, FormError } from "@/components/ui/Form";
import { catalogueAPI } from "@/lib/api";
import { money, plural } from "@/lib/format";
import { asList, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

function Thumb({ item }) {
  return (
    <span className="block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
      {item.coverUrl ? <img src={item.coverUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-sm font-semibold text-purple-200">{item.title?.[0]}</span>}
    </span>
  );
}

export default function AdminCatalogue() {
  const { isAdmin, profileLoading } = useAuth();
  const [status, setStatus] = useState("active");
  const { data, loading, error, reload } = useAsync(async () => asList(unwrap(await catalogueAPI.list({ status })), "items"), [status], { enabled: isAdmin });

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="Curated plans"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;

  const items = data ?? [];
  return (
    <PageFrame eyebrow={<Link href="/admin" className="text-purple-600 hover:text-purple-700">Admin</Link>} title="Curated plans" meta={data ? plural(items.length, `${status} experience`) : undefined} onRefresh={reload}>
      <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Segmented name="cat-status" value={status} onChange={setStatus} options={[{ value: "active", label: "Live" }, { value: "inactive", label: "Paused" }]} />
        <ButtonLink href="/admin/catalogue/new" className="sm:w-56">New experience</ButtonLink>
      </Reveal>
      <Reveal>
        {error && <FormError>{error.message || "Couldn't load the catalogue."}</FormError>}
        {loading && !data ? <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div> : items.length === 0 ? (
          <EmptyState title={status === "active" ? "No live experiences" : "Nothing paused"} text={status === "active" ? "Add your first curated plan." : undefined} action={status === "active" ? <ButtonLink href="/admin/catalogue/new" className="sm:w-56">New experience</ButtonLink> : null} />
        ) : (
          <ListGroup>
            {items.map((item) => (
              <Row key={item.id} href={`/admin/catalogue/${item.id}`} leading={<Thumb item={item} />} title={item.title}
                footnote={[item.category, item.city, `${money(item.listedPrice, item.currency)} / person`, item.availableDates?.length ? plural(item.availableDates.length, "date") : "no dates"].filter(Boolean).join(" · ")}
                trailing={<Tag tone={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "live" : "paused"}</Tag>} />
            ))}
          </ListGroup>
        )}
      </Reveal>
    </PageFrame>
  );
}
