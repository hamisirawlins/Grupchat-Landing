"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink, Skeleton } from "@/components/kit";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";

/** "Add experience" starts a draft straight away and opens it, so nothing typed is ever lost. */
export default function NewExperience() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    providersAPI.createExperience({})
      .then((r) => router.replace(`/provider/experiences/${unwrap(r).experience.id}`))
      .catch((e) => setError(e.message || "Couldn't start a new experience."));
  }, [router]);
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p className="text-[15px] font-semibold text-critical">{error}</p>
        <ButtonLink href="/provider/experiences" variant="quiet">Back to experiences</ButtonLink>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
