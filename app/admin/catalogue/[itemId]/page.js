"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal, Section } from "@/components/app/PageFrame";
import { EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { OutlineButton } from "@/components/ui/Form";
import { CatalogueForm } from "@/components/admin/CatalogueForm";
import { catalogueAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

export default function EditCatalogueItem() {
  const { itemId } = useParams();
  const { isAdmin, profileLoading } = useAuth();
  const { data: item, loading, error, reload } = useAsync(async () => unwrap(await catalogueAPI.getItem(itemId)), [itemId], { enabled: isAdmin });
  const [toggling, setToggling] = useState(false);

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="Experience"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;
  if (error) return <PageFrame eyebrow="Admin" title="Experience"><Reveal><EmptyState title="Not found" text="This experience may have been removed." /></Reveal></PageFrame>;
  if (loading || !item) return <PageFrame><Skeleton className="h-4 w-24" /><Skeleton className="mt-3 h-12 w-2/3" /><Skeleton className="mt-12 h-64 w-full rounded-2xl" /></PageFrame>;

  const live = item.status === "active";

  const save = async (payload) => {
    await catalogueAPI.updateItem(item.id, payload);
    toast.success("Saved");
    reload();
  };

  const toggle = async () => {
    setToggling(true);
    try {
      await catalogueAPI.updateItem(item.id, { status: live ? "inactive" : "active" });
      toast.success(live ? "Paused — hidden from Discover" : "Live again");
      reload();
    } catch (e) {
      toast.error(e.message || "Couldn't update status.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <PageFrame
      onRefresh={reload}
      eyebrow={<span className="inline-flex items-center gap-2"><Link href="/admin/catalogue" className="text-purple-600 hover:text-purple-700">Curated plans</Link><Tag tone={live ? "success" : "neutral"}>{live ? "live" : "paused"}</Tag></span>}
      title={item.title}
      meta={<span className="inline-flex flex-wrap gap-x-3"><Link href={`/discover/${item.id}`} className="text-purple-600 hover:text-purple-700">View as a member →</Link></span>}
    >
      <Reveal className="mb-10 flex flex-col gap-3 sm:flex-row">
        <OutlineButton onClick={toggle} loading={toggling} className="sm:w-56">{live ? "Pause experience" : "Make live"}</OutlineButton>
      </Reveal>
      <Section title="Details">
        <CatalogueForm key={item.updatedAt?._seconds ?? item.id} item={item} submitLabel="Save changes" onSubmit={save} />
      </Section>
    </PageFrame>
  );
}
