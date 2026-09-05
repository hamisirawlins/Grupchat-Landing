"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { EmptyState } from "@/components/ui/Bits";
import { CatalogueForm } from "@/components/admin/CatalogueForm";
import { catalogueAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";

export default function NewCatalogueItem() {
  const { isAdmin, profileLoading } = useAuth();
  const router = useRouter();

  if (!isAdmin) return <PageFrame eyebrow="Admin" title="New experience"><Reveal><EmptyState title={profileLoading ? "Checking access…" : "Nothing here"} /></Reveal></PageFrame>;

  const create = async (payload) => {
    const out = unwrap(await catalogueAPI.createItem(payload));
    const id = out?.itemId || out?.id;
    toast.success("Experience created");
    router.push(id ? `/admin/catalogue/${id}` : "/admin/catalogue");
  };

  return (
    <PageFrame eyebrow={<Link href="/admin/catalogue" className="text-purple-600 hover:text-purple-700">Curated plans</Link>} title="New experience" meta="Live as soon as it's saved. You can pause it any time.">
      <Reveal><CatalogueForm submitLabel="Create experience" onSubmit={create} /></Reveal>
    </PageFrame>
  );
}
