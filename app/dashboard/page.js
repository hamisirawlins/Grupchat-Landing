"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName?.split(" ")[0] || null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex h-12 sm:h-14 items-center justify-between rounded-full bg-gray-100/80 backdrop-blur-xl px-3 sm:px-6 border border-gray-200/50 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="GrupChat"
                width={28}
                height={28}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <span className="text-sm sm:text-base font-semibold text-black whitespace-nowrap">
                GrupChat
              </span>
            </Link>
            <button
              onClick={logout}
              className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-black transition-colors whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Update screen */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <svg
              className="w-7 h-7 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </motion.div>

          <motion.p
            className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            We'll be right back
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-5 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {firstName ? `Hey ${firstName} —` : "Hey —"} something
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              big is coming.
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-gray-500 leading-relaxed mb-10 max-w-md mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            We're rebuilding GrupChat around curated plans — browse an
            experience, join with your people, and show up. Transport,
            venue, and payments all sorted. No group chat chaos.
          </motion.p>

          <motion.div
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              What's launching
            </p>
            <ul className="space-y-3">
              {[
                "Curated plan catalogue — venues, activities, outings",
                "Shared group pickup, fixed per-person price",
                "One payment per person — activity + transport bundled",
                "Name on the list. Ride sorted. Phone in pocket.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 block" />
                  </span>
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <a
              href="mailto:hamisirawlins@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Get in touch
            </a>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
