"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RotatingText from "@/components/RotatingText";

export default function Home() {
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showComingSoonPopup) {
        setShowComingSoonPopup(false);
      }
    };

    if (showComingSoonPopup) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset"; // Restore scrolling
    };
  }, [showComingSoonPopup]);

  // Redirect based on authentication state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Coming Soon Popup */}
      {showComingSoonPopup && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowComingSoonPopup(false)}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>

              <motion.h3
                className="text-2xl font-bold text-gray-900 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Coming Soon!
              </motion.h3>

              <motion.p
                className="text-gray-600 mb-6 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Our mobile apps are currently in development. For now, you can
                access GrupChat through our web app and start tracking progress
                with friends.
              </motion.p>

              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.a
                  href="/sign-in"
                  className="block w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Launch Web App
                </motion.a>

                <motion.button
                  onClick={() => setShowComingSoonPopup(false)}
                  className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex h-12 sm:h-14 items-center justify-between rounded-full bg-gray-100/80 backdrop-blur-xl px-3 sm:px-6 border border-gray-200/50 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0"
            >
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
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/sign-in"
                className="text-xs sm:text-sm font-semibold text-black transition-colors hover:text-gray-700 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-black px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800 whitespace-nowrap"
              >
                Join for free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight mb-6 sm:mb-8"
            variants={itemVariants}
          >
            Powering Plans
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Beyond The Chat
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
            variants={itemVariants}
          >
            Turn group chat plans into group chat memories. Track progress,
            celebrate milestones, and create lasting experiences with friends.
          </motion.p>

          <motion.div
            className="flex justify-center mb-6"
            variants={itemVariants}
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-2 sm:py-2 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Started
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-600"
          >
            <RotatingText
              baseText="Track progress for:"
              words={[
                "travel plans",
                "meetups",
                "events",
                "many more group projects",
              ]}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 rounded-full"
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "5%", left: "8%" }}
          />
          <motion.div
            className="absolute w-14 h-14 sm:w-18 sm:h-18 bg-blue-500 rounded-full"
            animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "15%", right: "12%" }}
          />
          <motion.div
            className="absolute w-18 h-18 sm:w-22 sm:h-22 bg-pink-500 rounded-full"
            animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "20%", left: "15%" }}
          />
          <motion.div
            className="absolute w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500 rounded-full"
            animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "30%", right: "8%" }}
          />
          <motion.div
            className="absolute w-20 h-20 sm:w-24 sm:h-24 bg-cyan-500 rounded-full"
            animate={{ x: [0, 30, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "45%", left: "5%" }}
          />
          <motion.div
            className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full"
            animate={{ x: [0, -35, 0], y: [0, 45, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "60%", right: "18%" }}
          />
          <motion.div
            className="absolute w-14 h-14 sm:w-18 sm:h-18 bg-green-500 rounded-full"
            animate={{ x: [0, 55, 0], y: [0, -25, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "25%", left: "25%" }}
          />
          <motion.div
            className="absolute w-18 h-18 sm:w-22 sm:h-22 bg-yellow-500 rounded-full"
            animate={{ x: [0, -45, 0], y: [0, 35, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "15%", left: "30%" }}
          />
          <motion.div
            className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full"
            animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "70%", left: "20%" }}
          />
          <motion.div
            className="absolute w-12 h-12 sm:w-16 sm:h-16 bg-teal-500 rounded-full"
            animate={{ x: [0, -30, 0], y: [0, 55, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "10%", right: "25%" }}
          />
          <motion.div
            className="absolute w-20 h-20 sm:w-24 sm:h-24 bg-violet-500 rounded-full"
            animate={{ x: [0, 45, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "35%", right: "5%" }}
          />
          <motion.div
            className="absolute w-14 h-14 sm:w-18 sm:h-18 bg-emerald-500 rounded-full"
            animate={{ x: [0, -55, 0], y: [0, -35, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "40%", left: "10%" }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A rich history of
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                150+
              </div>
              <div className="text-base sm:text-lg text-gray-700 font-medium">
                Goals Completed Together
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                2,000+
              </div>
              <div className="text-base sm:text-lg text-gray-700 font-medium">
                Memories Created
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                120+
              </div>
              <div className="text-base sm:text-lg text-gray-700 font-medium">
                Countries Access
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 lg:pb-16 min-h-screen flex items-center bg-white">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-8 lg:mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How GrupChat
              <br />
              Works
            </motion.h2>

            <motion.p
              className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed lg:pt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Three simple steps to turn your plans into memories
            </motion.p>
          </div>

          <div className="space-y-0">
            <motion.div
              className="py-8 sm:py-12 border-b border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-300 leading-none">
                    01
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4">
                    Create Your Goal
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                    Set up a new goal or challenge — whether it's a trip, event,
                    or activity. Add details, set a target date, and invite your
                    friends.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="py-8 sm:py-12 border-b border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-300 leading-none">
                    02
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4">
                    Invite Your Friends
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                    Add friends to your goal. Everyone stays in the loop with
                    real-time updates and can contribute progress, photos, and
                    milestones.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="py-8 sm:py-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-300 leading-none">
                    03
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4">
                    Track & Celebrate
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                    Share progress updates, upload photos, and celebrate
                    milestones together. Watch your plans transform into
                    memories you'll cherish forever.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 min-h-screen flex items-center bg-white"
      >
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            className="text-center mb-16 lg:mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "Do I need to pay to use GrupChat?",
                answer:
                  "GrupChat is completely free! Create goals, track progress, and build memories with friends at no cost. You can upgrade a successfully completed plan into a memory with a one-time fee to access all the premium features available.",
              },
              // {
              //   question: "Can I track payments/progress manually?",
              //   answer:
              //     "Yes! You can manually log contributions and track progress toward financial goals. Payment integrations are provided, but manual tracking is provided for free to all our users. Feel free to share a coffee ☕, it helps us provide better value.",
              // },
              {
                question: "What if we don't complete our goal?",
                answer:
                  "That's okay! GrupChat is about the journey, not just the destination. You can keep updating progress, extend deadlines, or archive plans to revisit later. The memories you create along the way matter most.",
              },
              {
                question: "Can I create multiple goals?",
                answer:
                  "Absolutely! Create as many goals as you want—travel plans, event coordination, fitness challenges, or any shared activity. Each goal has its own timeline and memory gallery.",
              },
              {
                question: "Do all friends need the app?",
                answer:
                  "Not necessarily! Friends can access goals via web and participate through the web app. However, the mobile apps provide the best experience for real-time updates and notifications.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border-b border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <details className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg sm:text-xl font-semibold text-black group-open:text-purple-600 transition-colors duration-300 pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-open:text-purple-600 group-open:rotate-180 transition-all duration-300 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="pt-4 pb-2">
                    <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto w-full text-center">
          <motion.div
            className="mb-4 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Ready to Create{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Memories Together?
              </span>
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Start tracking your group goals today and turn plans into lasting
              memories
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={() => setShowComingSoonPopup(true)}
              className="relative flex items-center px-6 py-3 bg-black rounded-xl text-white hover:bg-gray-800 transition-all duration-300 shadow-lg group border-2 border-transparent hover:border-purple-300"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Coming Soon
              </motion.div>
              <svg
                className="w-8 h-8 mr-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-300 group-hover:text-gray-200">
                  Get it on
                </div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setShowComingSoonPopup(true)}
              className="relative flex items-center px-6 py-3 bg-black rounded-xl text-white hover:bg-gray-800 transition-all duration-300 shadow-lg group border-2 border-transparent hover:border-purple-300"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Coming Soon
              </motion.div>
              <svg
                className="w-8 h-8 mr-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.18 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-300 group-hover:text-gray-200">
                  Download on the
                </div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </motion.button>
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-500 mb-4">Or access via web</p>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Open Web App
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="col-span-1 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="GrupChat Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  GrupChat
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Powering plans beyond the chat. Track progress, celebrate
                milestones, and create lasting memories with friends.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: "twitter", href: "#" },
                  { icon: "facebook", href: "#" },
                  { icon: "instagram", href: "#" },
                  { icon: "linkedin", href: "#" },
                ].map((social, index) => (
                  <motion.a
                    key={social.icon}
                    href={social.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                    whileHover={{ scale: 1.2, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {social.icon === "twitter" && (
                        <path d="M8.29 20c7.547 0 11.675-6.155 11.675-11.495 0-.175 0-.349-.012-.522A8.18 8.18 0 0022 5.92a8.19 8.19 0 01-2.357.637A4.077 4.077 0 0021.448 4.1a8.224 8.224 0 01-2.605.981A4.108 4.108 0 0015.448 4c-2.266 0-4.104 1.822-4.104 4.07 0 .32.036.634.106.934C7.728 8.87 4.1 7.13 1.671 4.149a4.025 4.025 0 00-.555 2.048c0 1.413.725 2.662 1.825 3.393A4.093 4.093 0 01.8 8.575v.051c0 1.974 1.417 3.627 3.292 4.004a4.1 4.1 0 01-1.853.07c.522 1.614 2.037 2.792 3.833 2.825A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      )}
                      {social.icon === "facebook" && (
                        <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                      )}
                      {social.icon === "instagram" && (
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.678 1.315c-.98.98-1.187 2.092-1.245 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.612.058 1.281.265 2.393 1.245 3.373.98.98 2.092 1.187 3.373 1.245C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.265 3.373-1.245.98-.98 1.187-2.092 1.245-3.373.058-1.28.07-1.689.07-7.612 0-5.923-.012-6.332-.07-7.612-.058-1.281-.265-2.393-1.245-3.373-.98-.98-2.092-1.187-3.373-1.245C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                      )}
                      {social.icon === "linkedin" && (
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.532-2.513-1.532 0-1.768 1.197-1.768 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v4.731z" />
                      )}
                    </svg>
                  </motion.a>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href="https://buymeacoffee.com/grupchat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-200"
                >
                  <span className="mr-2">☕️</span>
                  Buy Us a Coffee
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {[
                  { name: "Privacy Policy", href: "/privacy-policy" },
                  { name: "Terms of Service", href: "/terms-of-service" },
                  { name: "Report A Bug", href: "/report-bug" },
                  { name: "Rate The App", href: "/rate-app" },
                ].map((link, index) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 block"
                      whileHover={{ x: 4 }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 pt-8 border-t border-gray-800 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} GrupChat. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
