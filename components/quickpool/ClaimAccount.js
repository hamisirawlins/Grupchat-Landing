"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button, TextField, Helper } from "@/components/kit";
import { quickPoolAPI } from "@/lib/quickPool";

export const EMAIL_FOR_SIGN_IN = "gc.emailForSignIn";

const REASON = {
  "too-short": "At least 3 characters",
  invalid: "Letters, numbers and _ only",
  reserved: "That one is reserved",
  taken: "Taken. Try another",
};

/**
 * A username and receipts for a pooler (D-053): checked as they type, and claimed only once
 * the emailed sign-in link creates their account, so nobody can hold a name without one.
 */
export function ClaimAccount({ email: initialEmail = "", next = "/quick-pools", compact = false }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [check, setCheck] = useState(null); // { available, reason, suggestion } | "checking"
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const name = username.trim();
    if (!name) { setCheck(null); return undefined; }
    setCheck("checking");
    let alive = true;
    const t = setTimeout(() => {
      quickPoolAPI.usernameAvailable(name).then((r) => alive && setCheck(r)).catch(() => alive && setCheck(null));
    }, 350); // waits for a pause in typing; one request per pause
    return () => { alive = false; clearTimeout(t); };
  }, [username]);

  const submit = async (e) => {
    e.preventDefault();
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) return setError("Enter your email address.");
    if (username.trim() && check?.available !== true) return setError("Choose an available username, or leave it empty.");
    setError("");
    setBusy(true);
    try {
      const res = await quickPoolAPI.emailLink({ email: address, next, username: username.trim() || undefined });
      try { window.localStorage.setItem(EMAIL_FOR_SIGN_IN, address.toLowerCase()); } catch { /* storage blocked: the link page asks again */ }
      if (res?.tooMany) setError("A link went out moments ago. Check your inbox and spam.");
      else setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[15px] font-bold text-ink">Check your email</p>
        <p className="max-w-xs text-[13px] text-ink-2">Open the link on this device to finish. It signs you in{username ? ` and claims @${username.trim().toLowerCase()}` : ""}.</p>
      </div>
    );
  }

  const status = check === "checking" ? null : check;
  return (
    <form onSubmit={submit} className={`flex w-full flex-col gap-4 text-left ${compact ? "" : "rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line)]"}`} noValidate>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-ink">Get receipts and keep your pools</p>
        <p className="text-[13px] text-ink-2">No password. We email you a link that signs you in.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <TextField id="qp-username" label="Username" optional prefix="@" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value.slice(0, 20))} />
        {status && (
          <span className={`inline-flex items-center gap-1 text-[13px] font-semibold ${status.available ? "text-success" : "text-ink-2"}`} aria-live="polite">
            {status.available ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
            {status.available ? "Available" : REASON[status.reason] || "Not available"}
            {status.suggestion && !status.available && (
              <button type="button" className="ml-1 font-bold text-action-strong underline-offset-2 hover:underline" onClick={() => setUsername(status.suggestion)}>Use @{status.suggestion}</button>
            )}
          </span>
        )}
      </div>
      <TextField id="qp-claim-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Helper error={error} />
      <Button type="submit" variant="secondary" block loading={busy}>Email me a link</Button>
    </form>
  );
}
