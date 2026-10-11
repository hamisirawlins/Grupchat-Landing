"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, LayoutGrid, Plus, Ticket, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, PortalShell } from "@/components/kit";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { ProviderTag } from "./Tags";

/**
 * The provider portal (KB D-043): the shell plus the provider's own record,
 * read once and shared by every portal page. Someone who isn't approved yet is
 * sent to their application status instead.
 */
const Ctx = createContext(null);
export const useProvider = () => useContext(Ctx);

export const PROVIDER_NAV = [
  { href: "/provider", label: "Overview", icon: LayoutGrid, match: (p) => p === "/provider" },
  { href: "/provider/experiences", label: "Experiences", icon: Compass },
  { href: "/provider/bookings", label: "Bookings", icon: Ticket },
  { href: "/provider/payouts", label: "Payouts", icon: Wallet },
];

export default function ProviderPortal({ children, nav = PROVIDER_NAV }) {
  const { user } = useAuth();
  const router = useRouter();
  const [me, setMe] = useState(null);

  const reload = useCallback(async () => {
    const data = unwrap(await providersAPI.me());
    setMe(data);
    return data;
  }, []);

  useEffect(() => {
    if (!user) return;
    reload().then((d) => {
      if (!d?.provider?.approvedAt && d?.provider?.status !== "approved") router.replace("/providers/status");
    }).catch(() => setMe({ provider: null }));
  }, [user, reload, router]);

  const p = me?.provider;
  const footer = (
    <Link href="/home" title="Back to GrupChat" className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl px-2 text-ink hover:bg-soft lg:justify-start">
      <Avatar name={p?.business?.name || ""} size={36} />
      <span className="hidden min-w-0 flex-col lg:flex">
        <span className="truncate text-sm font-bold">{p?.business?.name || "Your business"}</span>
        <span className="text-xs text-ink-3">Back to GrupChat</span>
      </span>
    </Link>
  );

  return (
    <Ctx.Provider value={{ me, provider: p, reload }}>
      <PortalShell id="provider" brandHref="/provider" tag={<ProviderTag />} cta={{ href: "/provider/experiences/new", label: "Add experience", icon: Plus }} nav={nav} footer={footer}>
        {children}
      </PortalShell>
    </Ctx.Provider>
  );
}
