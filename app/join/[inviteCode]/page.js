"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { invitationsAPI, premiumAPI, plansAPI } from "@/lib/api";
import { CheckCircle, AlertTriangle, Calendar, MapPin, Users, CreditCard, Smartphone, UserCheck } from "lucide-react";

const COMMITMENT_OPTIONS = [
  { value: "in", label: "I'm in", desc: "Count me in — I'll pay soon." },
  { value: "tentative", label: "Tentative", desc: "Probably, but not confirmed yet." },
  { value: "watching", label: "Watching", desc: "Just keeping an eye on this one." },
];

export default function JoinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { inviteCode } = useParams();

  const [invite, setInvite] = useState(null);
  const [plan, setPlan] = useState(null);
  const [catalogue, setCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState("preview"); // preview | commit | pay
  const [commitment, setCommitment] = useState("in");
  const [payMethod, setPayMethod] = useState("paystack"); // paystack | mpesa
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/sign-in?redirect=/join/${inviteCode}`);
      return;
    }
    load();
  }, [authLoading, user, inviteCode]);

  const load = async () => {
    try {
      const res = await invitationsAPI.getByCode(inviteCode);
      setInvite(res.data?.invitation || res.data);
      setPlan(res.data?.plan || null);
      setCatalogue(res.data?.catalogueItem || null);
    } catch (e) {
      setError("This invite link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitOnly = async () => {
    setSubmitting(true);
    setError("");
    try {
      await invitationsAPI.accept({ inviteCode, commitmentStatus: commitment });
      setDoneMessage(`You're ${commitment === "in" ? "in" : commitment}! You can pay anytime from the plan.`);
      setDone(true);
      setTimeout(() => router.push(`/plans/${plan?.id || ""}`), 2500);
    } catch (e) {
      setError(e.message || "Failed to join plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayPaystack = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Accept invite first
      await invitationsAPI.accept({ inviteCode, commitmentStatus: "in" });
      // Initiate Paystack
      const res = await premiumAPI.joinPaystack(plan.id);
      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (e) {
      setError(e.message || "Failed to initiate payment");
      setSubmitting(false);
    }
  };

  const handlePayMpesa = async () => {
    if (!mpesaPhone.trim()) { setError("Enter your M-Pesa number"); return; }
    setSubmitting(true);
    setError("");
    try {
      await invitationsAPI.accept({ inviteCode, commitmentStatus: "in" });
      await premiumAPI.joinMpesa(plan.id, mpesaPhone.trim());
      setDoneMessage("M-Pesa prompt sent! Enter your PIN to complete payment.");
      setDone(true);
      setTimeout(() => router.push(`/plans/${plan?.id || ""}`), 3000);
    } catch (e) {
      setError(e.message || "Failed to send M-Pesa prompt");
      setSubmitting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading || authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#7a73ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !invite) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h1 className="font-semibold text-gray-900 mb-2">Invalid invite</h1>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="font-semibold text-gray-900 mb-2">You&apos;re in!</h1>
        <p className="text-sm text-gray-500">{doneMessage}</p>
        <div className="w-6 h-6 border-2 border-[#7a73ff] border-t-transparent rounded-full animate-spin mx-auto mt-6" />
      </div>
    </div>
  );

  const isPremium = plan?.planType === "premium";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Image src="/logo.png" alt="GrupChat" width={28} height={28} />
          <span className="font-semibold text-gray-900">GrupChat</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 py-8">
        {/* Plan card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {catalogue?.coverUrl && (
            <img src={catalogue.coverUrl} alt={plan?.name} className="w-full h-40 object-cover" />
          )}
          <div className="p-5">
            <span className="text-xs font-medium text-[#7a73ff] uppercase tracking-wide">
              {isPremium ? "Premium experience" : "Plan invitation"}
            </span>
            <h1 className="text-xl font-semibold text-gray-900 mt-1 mb-3">{plan?.name}</h1>

            <div className="space-y-2 text-sm text-gray-600">
              {plan?.targetDate && (
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#7a73ff]" />{formatDate(plan.targetDate)}</div>
              )}
              {catalogue?.venue && (
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#7a73ff]" />{catalogue.venue.name}, {catalogue.venue.address}</div>
              )}
              {plan?.membersCount !== undefined && (
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#7a73ff]" />{plan.membersCount} member{plan.membersCount !== 1 ? "s" : ""} so far</div>
              )}
            </div>

            {isPremium && catalogue?.listedPrice && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Your price</span>
                <span className="text-lg font-semibold text-gray-900">{catalogue.currency} {catalogue.listedPrice?.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step: preview → choose action */}
        {step === "preview" && (
          <div className="space-y-3">
            {isPremium ? (
              <>
                <button onClick={() => setStep("pay")}
                  className="w-full bg-[#7a73ff] text-white py-3.5 rounded-full font-semibold hover:bg-[#6a63ef] transition-colors">
                  Pay now
                </button>
                <button onClick={() => setStep("commit")}
                  className="w-full bg-white text-gray-700 py-3.5 rounded-full font-medium border border-gray-200 hover:border-[#7a73ff]/40 transition-colors">
                  Join now, pay later
                </button>
              </>
            ) : (
              <button onClick={() => setStep("commit")}
                className="w-full bg-[#7a73ff] text-white py-3.5 rounded-full font-semibold hover:bg-[#6a63ef] transition-colors">
                Join plan
              </button>
            )}
          </div>
        )}

        {/* Step: commit status */}
        {step === "commit" && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">How committed are you?</h2>
            <div className="space-y-2 mb-5">
              {COMMITMENT_OPTIONS.map((o) => (
                <button key={o.value} type="button" onClick={() => setCommitment(o.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${commitment === o.value ? "border-[#7a73ff] bg-[#f3f1ff]" : "border-gray-200 hover:border-[#7a73ff]/30"}`}>
                  <div className="font-medium text-sm text-gray-900">{o.label}</div>
                  <div className="text-xs text-gray-500">{o.desc}</div>
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button onClick={handleCommitOnly} disabled={submitting}
              className="w-full bg-[#7a73ff] text-white py-3 rounded-full font-medium disabled:opacity-50 hover:bg-[#6a63ef] transition-colors">
              {submitting ? "Joining…" : "Join"}
            </button>
          </div>
        )}

        {/* Step: pay */}
        {step === "pay" && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Pay now</h2>

            <div className="flex gap-2 mb-5">
              <button onClick={() => setPayMethod("paystack")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${payMethod === "paystack" ? "border-[#7a73ff] bg-[#f3f1ff] text-[#7a73ff]" : "border-gray-200 text-gray-600"}`}>
                <CreditCard className="w-4 h-4" /> Card / Bank
              </button>
              <button onClick={() => setPayMethod("mpesa")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${payMethod === "mpesa" ? "border-[#7a73ff] bg-[#f3f1ff] text-[#7a73ff]" : "border-gray-200 text-gray-600"}`}>
                <Smartphone className="w-4 h-4" /> M-Pesa
              </button>
            </div>

            {payMethod === "mpesa" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">M-Pesa number</label>
                <input type="tel" placeholder="07XXXXXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30"
                  value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} />
              </div>
            )}

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              onClick={payMethod === "mpesa" ? handlePayMpesa : handlePayPaystack}
              disabled={submitting}
              className="w-full bg-[#7a73ff] text-white py-3 rounded-full font-medium disabled:opacity-50 hover:bg-[#6a63ef] transition-colors flex items-center justify-center gap-2">
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</> : `Pay ${catalogue?.currency} ${catalogue?.listedPrice?.toLocaleString()}`}
            </button>

            <button onClick={() => setStep("preview")} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 py-2">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
