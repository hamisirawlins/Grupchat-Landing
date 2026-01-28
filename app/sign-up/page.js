"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with display name
      if (fullName) {
        await updateProfile(user, {
          displayName: fullName,
        });
      }

      // Get ID token for backend authentication
      const idToken = await user.getIdToken();

      // Send token to backend
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (data.success) {
        // The AuthContext will handle the token and user state
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError("Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(error.message || "Sign up failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Get ID token for backend authentication
      const idToken = await user.getIdToken();

      // Send token to backend
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (data.success) {
        // The AuthContext will handle the token and user state
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error("Google sign up error:", error);
      setError(error.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
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

      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-12 sm:pb-16 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-3">
              Create Your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500">
              Start pooling funds with friends and family
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm"
            variants={itemVariants}
          >
            {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

            <form onSubmit={handleEmailSignUp} className="space-y-5">
              <div>
                    <label
                      htmlFor="fullName"
                  className="block text-sm font-semibold text-black mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors text-black placeholder-gray-400"
                      placeholder="Enter your full name"
                      required
                    />
              </div>

              <div>
                    <label
                      htmlFor="email"
                  className="block text-sm font-semibold text-black mb-2"
                    >
                  Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors text-black placeholder-gray-400"
                  placeholder="you@example.com"
                      required
                    />
              </div>

              <div>
                    <label
                      htmlFor="password"
                  className="block text-sm font-semibold text-black mb-2"
                    >
                      Password
                    </label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors text-black placeholder-gray-400 pr-12"
                    placeholder="Create a strong password"
                      required
                    />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L18.71 18.71M6.29 6.29L3 3"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                    <label
                      htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-black mb-2"
                    >
                      Confirm Password
                    </label>
                <div className="relative">
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors text-black placeholder-gray-400 pr-12"
                      placeholder="Confirm your password"
                      required
                    />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L18.71 18.71M6.29 6.29L3 3"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <motion.div className="flex items-center" variants={itemVariants}>
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      required
                    />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                      I agree to the{" "}
                  <Link
                        href="/terms-of-service"
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Terms of Service
                  </Link>{" "}
                      and{" "}
                  <Link
                        href="/privacy-policy"
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Privacy Policy
                  </Link>
                    </label>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                {isLoading ? "Creating Account..." : "Create Account"}
                  </motion.button>
            </form>

            <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 border-gray-300 text-black font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
              <Image
                src="/google.png"
                alt="Google"
                width={20}
                height={20}
                className="w-5 h-5"
                    />
              <span>{isLoading ? "Signing up..." : "Sign up with Google"}</span>
                </motion.button>

            <motion.p
              className="text-center mt-6 text-sm text-gray-500"
              variants={itemVariants}
            >
                  Already have an account?{" "}
              <Link
                    href="/sign-in"
                className="font-semibold text-black hover:text-gray-700 transition-colors"
                  >
                    Sign in
              </Link>
            </motion.p>
          </motion.div>

          <motion.p
            className="text-center mt-6 text-xs text-gray-400"
            variants={itemVariants}
          >
            By signing up, you agree to our{" "}
            <Link
              href="/terms-of-service"
              className="text-gray-600 hover:text-black transition-colors underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-gray-600 hover:text-black transition-colors underline"
            >
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </section>
      </div>
  );
}
