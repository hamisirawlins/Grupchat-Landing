"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
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
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const gradientVariants = {
    animate: {
      background: [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
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
                access GrupChat through our web app and start pooling funds with
                your friends and family!
              </motion.p>

              <motion.div
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.a
                  href="https://app.grupchat.info"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
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

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-purple-200/30 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img
                src="/logo.png"
                alt="GrupChat Logo"
                className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <motion.a
                href="#features"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                whileHover={{ y: -2 }}
              >
                Features
              </motion.a>
              <motion.a
                href="#how-it-works"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                whileHover={{ y: -2 }}
              >
                How it Works
              </motion.a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <motion.a
                href="/sign-in"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.a>
              <motion.a
                href="/sign-up"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-block text-sm font-medium"
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.a>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex sm:hidden items-center space-x-2">
              <motion.a
                href="/sign-in"
                className="px-3 py-1.5 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.a>
              <motion.a
                href="/sign-up"
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-block text-sm font-medium"
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Hero Section */}
        <motion.div
          className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-32"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 sm:mb-8"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powering Plans
              </span>
              <br />
              <span className="text-gray-900">Beyond The Chat</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
              variants={itemVariants}
            >
              Transform your group chats into group activities. Pool funds with
              friends and family seamlessly, turning dreams into reality.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="flex justify-center mb-12 sm:mb-16"
              variants={itemVariants}
            >
              <motion.a
                href="/sign-up"
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden inline-block"
                whileHover={{
                  scale: 1.05,
                  y: -5,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start Your First Pool</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.a>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <motion.div
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  10+
                </div>
                <div className="text-gray-600">Active Users</div>
              </motion.div>

              <motion.div
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Ksh 250k+
                </div>
                <div className="text-gray-600">Pooled Successfully</div>
              </motion.div>

              <motion.div
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  20+
                </div>
                <div className="text-gray-600">Dreams Realized</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
            style={{ animationDelay: "1s" }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20"
            variants={floatingVariants}
            animate="float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-gray-900 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Simple, Secure, and{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Transparent
              </span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Everything you need to manage group activities, all in one place
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
            {/* Feature 1: Easy Pool Creation */}
            <motion.div
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              viewport={{ once: true }}
            >
              <div className="absolute top-2 left-8">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-10V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0H7m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8"
                    />
                  </svg>
                </motion.div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                  Create Pools Instantly
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Set up a new pool in seconds. Define your goal, set the target
                  amount, and invite your group members.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: M-Pesa Integration */}
            <motion.div
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              viewport={{ once: true }}
            >
              <div className="absolute top-2 left-8">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </motion.div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 mb-2">
                  Seamless M-Pesa Integration
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Direct M-Pesa integration for instant deposits and
                  withdrawals. No need to switch apps.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Real-time Tracking */}
            <motion.div
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              viewport={{ once: true }}
            >
              <div className="absolute top-2 left-8">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </motion.div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                  Real-time Progress Tracking
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Monitor contributions, track progress, and get instant
                  notifications and pool updates.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Mobile App Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-700/50 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-white lg:text-3xl mb-6">
                    Manage Your Pools{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      On The Go
                    </span>
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Instant notifications for all transactions",
                      "Easy tracking and reminders",
                      "Secure fund management with transparency",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start group"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <motion.div
                            className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600"
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        </div>
                        <p className="ml-3 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          {item}
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  {/* Mobile Frame */}
                  <div className="relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-blue-600/20 rounded-[2.5rem]"></div>
                    <div className="relative h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] overflow-hidden">
                      {/* Mock App Interface */}
                      <div className="h-full p-4 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pt-4">
                          <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                          <div className="text-white text-sm font-semibold">
                            GrupChat
                          </div>
                          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                        </div>

                        {/* Pool Cards */}
                        <div className="space-y-4 flex-1">
                          <motion.div
                            className="bg-gray-700/50 rounded-xl p-4"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-white text-sm font-medium">
                                Trip to Mombasa
                              </div>
                              <div className="text-green-400 text-xs">75%</div>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 2, delay: 1 }}
                              />
                            </div>
                            <div className="text-gray-300 text-xs mt-2">
                              KSh 15,000 / KSh 20,000
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gray-700/50 rounded-xl p-4"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 0.5,
                            }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-white text-sm font-medium">
                                Shaniqwa's Gift
                              </div>
                              <div className="text-yellow-400 text-xs">45%</div>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "45%" }}
                                transition={{ duration: 2, delay: 1.5 }}
                              />
                            </div>
                            <div className="text-gray-300 text-xs mt-2">
                              KSh 2,250 / KSh 5,000
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Floating elements around phone */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500/30 rounded-full blur-lg"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-500/30 rounded-full blur-lg"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Light Theme */}
      <section
        id="benefits"
        className="py-24 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Why Choose{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat?
              </span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              The smart way to achieve your group goals
            </motion.p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
            {/* Benefit 1: Trust & Transparency */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 group-hover:shadow-purple-500/25 transition-all duration-300">
                  <motion.svg
                    className="h-7 w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </motion.svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300 mb-2">
                  Complete Transparency
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Every transaction is recorded and visible to all group
                  members. Free your designated treasurer from the burden!
                </p>
              </div>
            </motion.div>

            {/* Benefit 2: Easy M-Pesa Integration */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 mb-6 group-hover:shadow-blue-500/25 transition-all duration-300">
                  <motion.svg
                    className="h-7 w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </motion.svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 mb-2">
                  Seamless M-Pesa
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Direct integration with M-Pesa means instant deposits and
                  withdrawals. No manual tracking needed.
                </p>
              </div>
            </motion.div>

            {/* Benefit 3: Goal Achievement */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 group-hover:shadow-purple-500/25 transition-all duration-300">
                  <motion.svg
                    className="h-7 w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </motion.svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300 mb-2">
                  Achieve Goals Together
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Turn group plans into reality. Whether it's a trip, gift, or
                  investment, reach your goals faster together.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Testimonial */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-transparent to-blue-200/20 rounded-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-purple-200/50 shadow-xl">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  className="relative mb-6"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <svg
                    className="h-12 w-12 text-purple-400 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                </motion.div>

                <motion.blockquote
                  className="text-xl font-medium text-gray-800 leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  "GrupChat has made it so easy to organize girl trips. No more
                  chasing people for contributions or wondering where the money
                  went!"
                </motion.blockquote>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <p className="text-base font-semibold text-purple-600 mb-1">
                    Sarah N.
                  </p>
                  <p className="text-base text-gray-500">Travel Enthusiast</p>
                </motion.div>

                {/* Star Rating */}
                <motion.div
                  className="flex justify-center mt-4 space-x-1"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, rotate: 0 }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                      viewport={{ once: true }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </motion.div>
              </div>

              {/* Floating elements around testimonial */}
              <motion.div
                className="absolute -top-4 -left-4 w-8 h-8 bg-purple-300/50 rounded-full blur-lg"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-blue-300/50 rounded-full blur-lg"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Dark Theme */}
      <section
        id="how-it-works"
        className="py-24 bg-gray-900 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -60, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              How{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                GrupChat
              </span>{" "}
              Works
            </motion.h2>
            <motion.p
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Three simple steps to start pooling funds with your friends
            </motion.p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 -translate-y-1/2 rounded-full shadow-lg">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-blue-400/50 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Step 1: Create Pool */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <motion.div
                      className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      1
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                  </div>
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 text-center shadow-xl"
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 mx-auto mb-6">
                      <svg
                        className="h-7 w-7 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                      Create Your Pool
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Set up a new pool, name it, and set your target amount.
                      Invite your crew to join it.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2: Connect M-Pesa */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <motion.div
                      className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      2
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                  </div>
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 text-center shadow-xl"
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 mx-auto mb-6">
                      <svg
                        className="h-7 w-7 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 mb-2">
                      Use your M-Pesa Phone Number
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Use your existing M-Pesa Phone Number to transact.Enjoy
                      instant deposits and withdrawals.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3: Start Pooling */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <motion.div
                      className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      3
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                  </div>
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 text-center shadow-xl"
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 mx-auto mb-6">
                      <svg
                        className="h-7 w-7 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 mb-2">
                      Start Pooling
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Make contributions anytime. Track progress and get
                      notified with pool updates.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="mt-24 text-center relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started Now</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                initial={false}
              />
              <motion.svg
                className="ml-2 -mr-1 w-5 h-5 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </motion.svg>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Light Theme */}
      <section
        id="faq"
        className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Everything you need to know about GrupChat
            </motion.p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-6">
            {[
              //  {
              //    question: "How secure is my money with GrupChat?",
              //    answer: "Your funds are completely secure. We use bank-level encryption and partner with trusted payment providers. Your money is held in secure escrow accounts until your group goals are met."
              //  },
              {
                question: "What happens if we don't reach our goal?",
                answer:
                  "You can keep depositing to the pool until the goal is reached. No restrictions. You can also withdraw depending on the pool settings and your role in the pool.",
              },
              {
                question:
                  "Can I withdraw my contribution before the goal is reached?",
                answer:
                  "Yes, you can withdraw your contribution at any time before the goal is reached. Simply request a withdrawal through the app and receive your money back via M-Pesa instantly.",
              },
              {
                question: "How much does GrupChat cost?",
                answer:
                  "GrupChat is free to use! We only charge a small transaction fee (less than 2%) when money is withdrawn from pools.",
              },
              {
                question: "Can I create multiple pools?",
                answer:
                  "Absolutely! You can create as many pools as you want and participate in multiple pools created by your friends and family.",
              },
              {
                question: "Do all group members need to have the app?",
                answer:
                  "No, not all group members need to download the GrupChat apps to participate in pools. They can easily access the web app free of charge and still participate in pools. This ensures transparency and security within the pool and group.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.details className="group">
                  <motion.summary
                    className="flex items-center justify-between p-6 cursor-pointer list-none"
                    whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.05)" }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 group-open:text-purple-700 transition-colors duration-300">
                      {faq.question}
                    </h3>
                    <motion.svg
                      className="w-6 h-6 text-purple-600 group-open:rotate-180 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.summary>
                  <motion.div
                    className="px-6 pb-6"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section - Dark Theme */}
      <section
        id="download"
        className="py-24 bg-gray-900 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Section Header */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Ready to Start{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Pooling?
                </span>
              </motion.h2>
              <motion.p
                className="text-lg text-gray-300 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Download GrupChat today and start achieving your group goals
                with friends and family
              </motion.p>
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => setShowComingSoonPopup(true)}
                className="relative flex items-center px-6 py-3 bg-white rounded-xl text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg group cursor-pointer border-2 border-transparent hover:border-purple-300"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Coming Soon Chip */}
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
                  <div className="text-xs text-gray-600 group-hover:text-gray-700">
                    Get it on
                  </div>
                  <div className="text-xl font-semibold">Google Play</div>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setShowComingSoonPopup(true)}
                className="relative flex items-center px-6 py-3 bg-white rounded-xl text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg group cursor-pointer border-2 border-transparent hover:border-purple-300"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Coming Soon Chip */}
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
                  <div className="text-xs text-gray-600 group-hover:text-gray-700">
                    Download on the
                  </div>
                  <div className="text-xl font-semibold">App Store</div>
                </div>
              </motion.button>
            </motion.div>

            {/* Web Access */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-400 mb-4">Or access via web</p>
              <motion.a
                href="https://app.grupchat.info"
                className="inline-flex items-center px-6 py-3 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                  />
                </svg>
                Launch Web App
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - Dark Theme */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <motion.div
              className="col-span-1 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/logo.png"
                  alt="GrupChat Logo"
                  className="w-16 h-16 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  GrupChat
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Powering plans beyond the chat. Pool funds with friends and
                family to achieve your group goals with ease.
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
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: "Home", href: "/" },
                  { name: "Features", href: "/#features" },
                  { name: "How It Works", href: "/#how-it-works" },
                  { name: "FAQ", href: "/#faq" },
                  { name: "Download", href: "/#download" },
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

            {/* Legal */}
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

          {/* Bottom Bar */}
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
    </>
  );
}
