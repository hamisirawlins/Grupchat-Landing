"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  AuthShell,
  AuthItem,
  FieldGroup,
  PasswordField,
  PrimaryButton,
  ButtonLink,
  FormError,
  SuccessMark,
} from "@/components/auth/AuthShell";

const BACK_LINK =
  "text-sm font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState("");
  // Don't judge the link until the query string has actually been read —
  // otherwise the "invalid" state flashes on every load.
  const [checked, setChecked] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (code) {
      setOobCode(code);
    } else {
      setError("Invalid or missing reset link. Please request a new password reset.");
    }
    setChecked(true);
  }, [searchParams]);

  const handleSubmit = async (e) => {
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
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/invalid-action-code") {
        setError("Invalid or expired reset link. Please request a new password reset.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!checked) {
    return <div className="min-h-screen bg-white" aria-busy="true" />;
  }

  if (!oobCode) {
    return (
      <AuthShell
        title="This link isn't valid"
        subtitle={error}
        alt={{ href: "/sign-in", label: "Sign in" }}
      >
        <AuthItem>
          <ButtonLink href="/forgot-password">Request a new link</ButtonLink>
        </AuthItem>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell alt={{ href: "/sign-in", label: "Sign in" }}>
        <AuthItem>
          <SuccessMark />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Password updated
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
            You can sign in with your new password now.
          </p>
        </AuthItem>
        <AuthItem className="mt-10">
          <ButtonLink href="/sign-in">Sign in</ButtonLink>
        </AuthItem>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Make it at least 6 characters."
      alt={{ href: "/sign-in", label: "Sign in" }}
    >
      <AuthItem>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <PasswordField
              id="password"
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FieldGroup>

          <FormError>{error}</FormError>

          <PrimaryButton loading={isLoading}>Update password</PrimaryButton>
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
