"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, BookOpen, Inbox, LayoutGrid, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, EmptyState, PortalShell } from "@/components/kit";
import { adminProvidersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { AdminTag } from "./Tags";

/**
 * The admin console's shell (KB 25 §Scheme): the dark sidebar from the design,
 * around every /admin page. The server guards every admin route; this only
 * decides what to show. Someone who isn't an admin sees no navigation at all.
 */
const Ctx = createContext({ refreshCounts: () => {} });
export const useAdminConsole = () => useContext(Ctx);

export default function AdminConsole({ children }) {
  const { isAdmin, profile, profileLoading } = useAuth();
  const [open, setOpen] = useState(0);

  const refreshCounts = useCallback(() => {
    adminProvidersAPI.queue({ status: "open" })
      .then((r) => setOpen((unwrap(r)?.providers || []).filter((p) => ["submitted", "in-review", "recheck"].includes(p.status)).length))
      .catch(() => {});
  }, []);
  useEffect(() => { if (isAdmin) refreshCounts(); }, [isAdmin, refreshCounts]);

  const nav = [
    { href: "/admin/providers", label: "Review", icon: Inbox, count: open },
    { href: "/admin/payouts", label: "Withdrawals", icon: ArrowUpRight },
    { href: "/admin/checklists", label: "Checklists", icon: ListChecks },
    { href: "/admin", label: "Console", icon: LayoutGrid, match: (p) => p === "/admin" },
    { href: "/admin/insights", label: "Insights", icon: BarChart3 },
    { href: "/admin/audit", label: "Audit", icon: ShieldCheck },
    { href: "/admin/ledger", label: "Ledger", icon: BookOpen },
    { href: "/admin/catalogue", label: "Curated", icon: Sparkles },
  ];
  const name = profile?.displayName || profile?.username || "Admin";
  const footer = (
    <Link href="/home" title="Back to GrupChat" className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl px-2 text-ink-dark hover:bg-surface-dark lg:justify-start">
      <Avatar name={name} size={36} dark />
      <span className="hidden min-w-0 flex-col lg:flex">
        <span className="truncate text-sm font-bold">{name}</span>
        <span className="text-xs text-ink-2-dark">Back to GrupChat</span>
      </span>
    </Link>
  );
  const gate = !isAdmin ? (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <EmptyState className="w-full" title={profileLoading || !profile ? "Checking access…" : "Nothing here"} text={profileLoading || !profile ? null : "This area is for the GrupChat team."} />
    </main>
  ) : null;

  return (
    <Ctx.Provider value={{ refreshCounts }}>
      <PortalShell id="admin" theme="dark" brandHref="/admin/providers" tag={<AdminTag />} nav={nav} footer={footer} maxWidth="max-w-[1240px]" gate={gate}>
        {children}
      </PortalShell>
    </Ctx.Provider>
  );
}
