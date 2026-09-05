"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Calendar, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Tag } from "@/components/ui/Bits";
import { ButtonLink, OutlineButton, PrimaryButton } from "@/components/ui/Form";
import { auditAPI, invitationsAPI, invitesAPI } from "@/lib/api";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { date, plural, relative } from "@/lib/format";
import { planTypeLabel, unwrap } from "@/lib/data/shape";

/**
 * Invite landing. Signed-out: public projection + sign in. Signed-in: full
 * invitation with accept/decline. Redirect back here after auth.
 */
export default function InvitePage() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const item = useRevealVariants();
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [busy, setBusy] = useState(null); // "accept" | "decline"
  const back = `/invite/${code}`;

  useEffect(() => {
    if (authLoading) return;
    let alive = true;
    setState({ loading: true, data: null, error: "" });
    const load = user ? invitationsAPI.getByCode(code) : invitesAPI.preview(code);
    load
      .then((res) => {
        if (!alive) return;
        setState({ loading: false, data: unwrap(res), error: "" });
        if (user) auditAPI.emit({ action: "ui.invite_previewed", entity: "invitation", meta: { code } });
      })
      .catch((e) => alive && setState({ loading: false, data: null, error: e.message || "This invite link isn't valid." }));
    return () => { alive = false; };
  }, [code, user, authLoading]);

  const inv = state.data;
  const plan = inv?.plan;
  const host = inv?.host;
  const active = inv?.status === "pending";

  const accept = async () => {
    setBusy("accept");
    try {
      const invitationId = inv.invitationId || inv.id;
      if (!invitationId) throw new Error("This invite can't be accepted right now.");
      await invitationsAPI.acceptInvitation(invitationId);
      toast.success("You're in");
      router.replace(plan?.id ? `/plans/${plan.id}` : "/plans");
    } catch (e) {
      const msg = e.message || "Couldn't accept the invite.";
      if (/already/i.test(msg) && plan?.id) return router.replace(`/plans/${plan.id}`);
      toast.error(msg);
      setBusy(null);
    }
  };

  const decline = async () => {
    setBusy("decline");
    try {
      await invitationsAPI.declineInvitation(inv.invitationId || inv.id);
      toast.message("Invite declined");
      router.replace("/home");
    } catch (e) {
      toast.error(e.message || "Couldn't decline the invite.");
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold">GrupChat</span>
        </Link>
        {user && <Link href="/home" className="py-2 text-sm text-gray-500 hover:text-black">Home</Link>}
      </header>

      <motion.section className="mx-auto w-full max-w-[440px] px-6 pb-24 pt-10 sm:pt-16" variants={STAGGER} initial="hidden" animate="show">
        {state.loading || authLoading ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-100" />
            <div className="h-10 w-3/4 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        ) : state.error || !plan ? (
          <motion.div variants={item}>
            <h1 className="text-3xl font-semibold tracking-tight">This invite isn't valid</h1>
            <p className="mt-3 text-[15px] text-gray-500">{state.error || "The link may have expired or been revoked."}</p>
            <div className="mt-8"><ButtonLink href={user ? "/home" : "/"} variant="outline">Go home</ButtonLink></div>
          </motion.div>
        ) : (
          <>
            <motion.div variants={item} className="flex items-center gap-3">
              <Avatar name={host?.displayName || ""} src={host?.avatarUrl} size={44} />
              <p className="text-sm text-gray-500"><span className="font-medium text-black">{host?.displayName || "Someone"}</span> invited you to</p>
            </motion.div>
            <motion.h1 variants={item} className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{plan.name}</motion.h1>
            <motion.div variants={item} className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-gray-500">
              <Tag tone="accent">{planTypeLabel(plan)}</Tag>
              {plan.targetDate && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" aria-hidden="true" />{date(plan.targetDate)} · {relative(plan.targetDate)}</span>}
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" aria-hidden="true" />{plural(plan.membersCount ?? 0, "member")}</span>
            </motion.div>

            <motion.div variants={item} className="mt-10 space-y-3">
              {!active ? (
                <>
                  <p className="text-sm text-gray-500">This invite is no longer active.</p>
                  <ButtonLink href={user ? "/home" : "/"} variant="outline">Go home</ButtonLink>
                </>
              ) : user ? (
                <>
                  <PrimaryButton type="button" onClick={accept} loading={busy === "accept"} disabled={busy === "decline"}>Join plan</PrimaryButton>
                  <OutlineButton onClick={decline} loading={busy === "decline"} disabled={busy === "accept"}>Not this time</OutlineButton>
                </>
              ) : (
                <>
                  <ButtonLink href={`/sign-in?redirect=${encodeURIComponent(back)}`}>Sign in to join</ButtonLink>
                  <p className="text-center text-sm text-gray-500">
                    New here?{" "}
                    <Link href={`/sign-up?redirect=${encodeURIComponent(back)}`} className="font-medium text-purple-600 hover:text-purple-700">Create an account</Link>
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </motion.section>
    </main>
  );
}
