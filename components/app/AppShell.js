"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { STAGGER, useRevealVariants } from "@/lib/motion";

/** Redirects signed-out visitors; `ready` is true once there is a user. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirect = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/sign-in${redirect}`);
    }
  }, [loading, user, router, pathname]);

  return { user, loading, ready: !loading && !!user };
}

/**
 * Signed-in surface: bare header, content below. Renders nothing until auth
 * resolves, so children never reach the server render (or hydration).
 */
export default function AppShell({ trailing, children }) {
  const { ready } = useRequireAuth();

  if (!ready) return <div className="min-h-screen bg-white" aria-busy="true" />;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold">GrupChat</span>
        </Link>
        {trailing}
      </header>
      {children}
    </main>
  );
}

export function BackToHome() {
  return (
    <Link
      href="/home"
      className="-ml-1 flex items-center gap-0.5 py-2 text-sm font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      Home
    </Link>
  );
}

/** A destination that exists but hasn't been built yet. */
export function ScaffoldPage({ title }) {
  const item = useRevealVariants();
  return (
    <AppShell trailing={<BackToHome />}>
      <motion.section
        className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24"
        variants={STAGGER}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={item} className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </motion.h1>
        <motion.div
          variants={item}
          className="mt-12 rounded-2xl border border-dashed border-black/[0.12] px-6 py-14 text-center"
        >
          <p className="text-sm font-medium">Nothing here yet</p>
        </motion.div>
      </motion.section>
    </AppShell>
  );
}
