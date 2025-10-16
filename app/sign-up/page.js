"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <>
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
            <motion.a
              href="/"
              className="flex items-center space-x-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img
                src="/logo.png"
                alt="GrupChat Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <motion.a
                href="/#features"
                className="text-gray-700 hover:text-purple-600 transition-colors"
                whileHover={{ y: -2 }}
              >
                Features
              </motion.a>
              <motion.a
                href="/#how-it-works"
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
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
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
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
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

      {/* Sign Up Page */}
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

        {/* Sign Up Form */}
        <motion.div
          className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full max-w-md mx-auto"
            variants={itemVariants}
          >
            {/* Form Card */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8"
              whileHover={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                scale: 1.02,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div
                className="text-center mb-6 sm:mb-8"
                variants={itemVariants}
              >
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                  Join GrupChat
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Create your account to start pooling with friends
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  variants={itemVariants}
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <motion.form onSubmit={handleEmailSignUp} variants={itemVariants}>
                <div className="space-y-6">
                  {/* Full Name Field */}
                  <motion.div
                    variants={itemVariants}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    variants={itemVariants}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email"
                      required
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    variants={itemVariants}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Create a password"
                      required
                    />
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    variants={itemVariants}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Confirm your password"
                      required
                    />
                  </motion.div>

                  {/* Terms and Conditions */}
                  <motion.div
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 text-sm text-gray-600"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms-of-service"
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy-policy"
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </motion.div>

                  {/* Sign Up Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{
                      scale: isLoading ? 1 : 1.02,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span className="ml-2">Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </div>
              </motion.form>

              {/* Divider */}
              <motion.div className="my-8" variants={itemVariants}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500">
                      Or sign up with
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Social Sign Up */}
              <motion.div className="w-full" variants={itemVariants}>
                <motion.button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-800">
                    {isLoading ? "Signing up..." : "Continue with Google"}
                  </span>
                </motion.button>
              </motion.div>

              {/* Sign In Link */}
              <motion.div className="text-center mt-8" variants={itemVariants}>
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <motion.a
                    href="/sign-in"
                    className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in
                  </motion.a>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
