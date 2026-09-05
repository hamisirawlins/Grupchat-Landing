"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  AuthShell,
  AuthItem,
  FieldGroup,
  Field,
  PasswordField,
  PrimaryButton,
  GoogleButton,
  Divider,
  FormError,
  LegalLine,
} from "@/components/auth/AuthShell";

// Where to land after auth: an in-app path from ?redirect=, else home.
function postAuthDestination() {
  const raw = new URLSearchParams(window.location.search).get("redirect");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/home";
}

// Exchange the Firebase ID token for a backend session.
async function completeSignIn(user) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ idToken }),
  });
  return response.json();
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Arrivals from a session reset carry ?reason=; say why, once, without a hook that needs Suspense.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "expired") setNotice("Your session ended. Sign in to continue.");
    else if (reason === "signed-out") setNotice("You've been signed out. Sign in to continue.");
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const data = await completeSignIn(user);

      if (data.success) {
        window.location.href = postAuthDestination();
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Incorrect credentials. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many unsuccessful login attempts. Please try again later.");
      } else if (error instanceof TypeError && error.message.includes("fetch failed")) {
        setError("Network error. Please check your connection and ensure the backend is running.");
      } else {
        setError(error.message || "Sign in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      const data = await completeSignIn(user);

      if (data.success) {
        window.location.href = postAuthDestination();
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (error) {
      setError(error.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle={notice || "Welcome back. Pick up where your plans left off."}
      alt={{ href: "/sign-up", label: "Create account" }}
    >
      <AuthItem>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <FieldGroup>
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FieldGroup>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="inline-block py-1 text-[13px] font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700"
            >
              Forgot password?
            </Link>
          </div>

          <FormError>{error}</FormError>

          <PrimaryButton loading={isLoading}>Sign in</PrimaryButton>
        </form>
      </AuthItem>

      <AuthItem className="my-6">
        <Divider />
      </AuthItem>

      <AuthItem>
        <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading}>
          Continue with Google
        </GoogleButton>
      </AuthItem>

      <AuthItem className="mt-10 space-y-4 text-center">
        <p className="text-sm text-gray-500">
          New to GrupChat?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-purple-600 transition-colors duration-300 hover:text-purple-700"
          >
            Create an account
          </Link>
        </p>
        <LegalLine action="signing in" />
      </AuthItem>
    </AuthShell>
  );
}
