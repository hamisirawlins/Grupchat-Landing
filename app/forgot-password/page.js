"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  AuthShell,
  AuthItem,
  FieldGroup,
  Field,
  PrimaryButton,
  FormError,
  SuccessMark,
  OutlineButton,
} from "@/components/auth/AuthShell";

const BACK_LINK =
  "text-sm font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError("Failed to send password reset email. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setEmail("");
    setError("");
  };

  if (success) {
    return (
      <AuthShell alt={{ href: "/sign-in", label: "Sign in" }}>
        <AuthItem>
          <SuccessMark />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Check your inbox
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
            We sent a reset link to <span className="text-black">{email}</span>. It can take a
            minute to arrive.
          </p>
        </AuthItem>
        <AuthItem className="mt-10 space-y-4">
          <OutlineButton onClick={reset}>Send another link</OutlineButton>
          <p className="text-center">
            <Link href="/sign-in" className={BACK_LINK}>
              Back to sign in
            </Link>
          </p>
        </AuthItem>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      alt={{ href: "/sign-in", label: "Sign in" }}
    >
      <AuthItem>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FieldGroup>

          <FormError>{error}</FormError>

          <PrimaryButton loading={isLoading}>Send reset link</PrimaryButton>
        </form>
      </AuthItem>

      <AuthItem className="mt-10 text-center">
        <Link href="/sign-in" className={BACK_LINK}>
          Back to sign in
        </Link>
      </AuthItem>
    </AuthShell>
  );
}
