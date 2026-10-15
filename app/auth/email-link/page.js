"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usersAPI } from "@/lib/api";
import { AuthShell, AuthItem } from "@/components/auth/AuthShell";
import { Button, TextField, Helper, DoneMark } from "@/components/kit";
import { EMAIL_FOR_SIGN_IN } from "@/components/quickpool/ClaimAccount";

const safeNext = (raw) => (raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/quick-pools");

/**
 * The return from an emailed sign-in link (D-053): signs in (Firebase creates the account
 * the first time), creates the profile, claims the username the person chose if it is still
 * free, and goes back to where they started.
 */
export default function EmailLinkPage() {
  const [phase, setPhase] = useState("checking"); // checking | ask | working | done | invalid
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const finish = async (address) => {
    setPhase("working");
    setError("");
    const params = new URLSearchParams(window.location.search);
    const next = safeNext(params.get("next"));
    const username = params.get("username");
    try {
      const { user } = await signInWithEmailLink(auth, address, window.location.href);
      try { window.localStorage.removeItem(EMAIL_FOR_SIGN_IN); } catch { /* storage blocked */ }
      // The backend session, as the password sign-in does; the app still works on the ID token if it fails.
      fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify({ idToken: await user.getIdToken() }) }).catch(() => {});
      await usersAPI.getMe().catch(() => null);
      if (username) {
        try {
          await usersAPI.updateMe({ username });
        } catch (e) {
          setNote(e.status === 409 ? `@${username} was taken in the meantime. Pick another in your profile.` : `We couldn't claim @${username}. Try again from your profile.`);
        }
      }
      setPhase("done");
      setTimeout(() => window.location.replace(next), username ? 1400 : 600);
    } catch (e) {
      const expired = /expired|invalid-action-code/.test(e.code || e.message || "");
      setError(expired ? "This link has expired or was already used. Ask for a new one." : e.code === "auth/invalid-email" ? "That email doesn't match the link. Use the address the link was sent to." : e.message || "Couldn't sign you in.");
      setPhase(expired ? "invalid" : "ask");
    }
  };

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return setPhase("invalid");
    let saved = "";
    try { saved = window.localStorage.getItem(EMAIL_FOR_SIGN_IN) || ""; } catch { /* storage blocked */ }
    if (saved) finish(saved);
    else setPhase("ask");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell title={phase === "done" ? "You're in" : "Signing you in"} subtitle={phase === "ask" ? "Confirm the email the link was sent to." : phase === "invalid" ? "This isn't a working sign-in link." : ""}>
      <AuthItem>
        {phase === "ask" && (
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); finish(email.trim().toLowerCase()); }}>
            <TextField id="el-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Helper error={error} />
            <Button type="submit" size="lg" block>Continue</Button>
          </form>
        )}
        {(phase === "checking" || phase === "working") && <div className="flex justify-center py-8" aria-busy="true"><span className="h-6 w-6 animate-spin rounded-full border-2 border-action border-r-transparent" /></div>}
        {phase === "done" && <div className="flex flex-col items-center gap-3 py-4 text-center"><DoneMark /><p className="text-[15px] text-ink-2">{note || "Taking you back…"}</p></div>}
        {phase === "invalid" && (
          <div className="flex flex-col gap-3">
            <Helper error={error || "Open the newest link from your email, on this device."} />
            <Button size="lg" block variant="secondary" onClick={() => window.location.replace("/sign-in")}>Go to sign in</Button>
          </div>
        )}
      </AuthItem>
    </AuthShell>
  );
}
