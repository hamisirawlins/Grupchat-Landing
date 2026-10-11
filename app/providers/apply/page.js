"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/Application";
import { nextStepFor } from "@/lib/providers";

/** /providers/apply sends you to the first step you haven't finished. */
export default function Apply() {
  const app = useApplication();
  const router = useRouter();
  useEffect(() => {
    if (app?.data) router.replace(nextStepFor(app.data));
  }, [app?.data, router]);
  return <div className="min-h-40" aria-busy="true" />;
}
