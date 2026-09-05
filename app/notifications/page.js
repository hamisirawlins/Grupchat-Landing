"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal, Section } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Avatar, EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { FormError } from "@/components/ui/Form";
import { ShowMore } from "@/components/ui/ShowMore";
import { invitationsAPI, notificationsAPI } from "@/lib/api";
import { relative } from "@/lib/format";
import { asList, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

export default function Notifications() {
  const { user } = useAuth();
  const router = useRouter();
  const invites$ = useAsync(async () => asList(unwrap(await invitationsAPI.getPending())), [], { enabled: !!user });
  const PAGE = 20;
  const [pages, setPages] = useState(1);
  const notes$ = useAsync(async () => asList(unwrap(await notificationsAPI.getNotifications({ limit: PAGE * pages }))), [pages], { enabled: !!user });
  const [busy, setBusy] = useState(null);

  const act = async (inv, kind) => {
    setBusy(`${inv.id}:${kind}`);
    try {
      if (kind === "accept") {
        await invitationsAPI.acceptInvitation(inv.id);
        toast.success("You're in");
        if (inv.planId) return router.push(`/plans/${inv.planId}`);
      } else {
        await invitationsAPI.declineInvitation(inv.id);
        toast.message("Invite declined");
      }
      invites$.reload();
    } catch (e) {
      toast.error(e.message || "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  // The backend stores `readAt` (Timestamp | null); tolerate a legacy boolean too.
  const isRead = (n) => Boolean(n.readAt || n.read);

  const markRead = async (n) => {
    if (isRead(n)) return;
    try { await notificationsAPI.markAsRead(n.id); notes$.reload(); } catch { /* non-critical */ }
  };

  const invites = invites$.data ?? [];
  const notes = notes$.data ?? [];

  return (
    <PageFrame title="Invites & alerts" onRefresh={() => Promise.all([invites$.reload(), notes$.reload()])}>
      <Reveal>
        <h2 className="mb-3 text-[17px] font-semibold tracking-tight">Invites</h2>
        {invites$.error && <FormError>{invites$.error.message}</FormError>}
        {invites$.loading && !invites$.data ? <Skeleton className="h-16 w-full rounded-2xl" /> : invites.length === 0 ? (
          <p className="text-sm text-gray-400">No pending invites.</p>
        ) : (
          <ListGroup>
            {invites.map((inv) => (
              <div key={inv.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
                <Avatar name={inv.inviterName || inv.inviter?.displayName || ""} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{inv.planName || inv.plan?.name || "A plan"}</p>
                  <p className="truncate text-[13px] text-gray-500">{inv.inviterName || inv.inviter?.displayName ? `from ${inv.inviterName || inv.inviter.displayName}` : "Invitation"}{inv.createdAt ? ` · ${relative(inv.createdAt)}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => act(inv, "decline")} disabled={!!busy} className="rounded-xl px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-black disabled:opacity-50">Decline</button>
                  <button type="button" onClick={() => act(inv, "accept")} disabled={!!busy} className="rounded-xl bg-purple-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-purple-700 disabled:opacity-50">{busy === `${inv.id}:accept` ? "Joining…" : "Accept"}</button>
                </div>
              </div>
            ))}
          </ListGroup>
        )}
      </Reveal>

      <Section title="Alerts" className="mt-10">
        {notes$.loading && !notes$.data ? <Skeleton className="h-16 w-full rounded-2xl" /> : notes.length === 0 ? (
          <EmptyState title="All quiet" text="Plan updates and payments will show here." />
        ) : (
          <ListGroup>
            {notes.map((n) => (
              <Row
                key={n.id}
                onClick={() => { markRead(n); if (n.planId) router.push(`/plans/${n.planId}`); }}
                leading={<span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isRead(n) ? "bg-gray-100 text-gray-400" : "bg-purple-50 text-purple-600"}`}><Bell className="h-4 w-4" /></span>}
                title={n.title || n.type}
                footnote={n.message}
                trailing={isRead(n) ? relative(n.createdAt) : <Tag tone="accent">New</Tag>}
                chevron={!!n.planId}
              />
            ))}
          </ListGroup>
        )}
        <ShowMore onClick={() => setPages((n) => n + 1)} loading={notes$.loading} hasMore={notes.length >= PAGE * pages} />
      </Section>
    </PageFrame>
  );
}
