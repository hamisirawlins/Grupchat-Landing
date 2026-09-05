"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Segmented } from "@/components/ui/Segmented";
import { StickyAction, Stepper } from "@/components/ui/Bits";
import { Field, FieldGroup, FormError, OutlineButton, PrimaryButton, SelectField, TextAreaField } from "@/components/ui/Form";
import { plansAPI } from "@/lib/api";
import { money } from "@/lib/format";
import { unwrap } from "@/lib/data/shape";

const CATEGORIES = ["Trip", "Dinner", "Event", "Gift", "Outing", "Other"].map((c) => ({ value: c.toLowerCase(), label: c }));
const STEPS = ["Basics", "Money", "Review"];
const POOL_MODES = [
  { value: "coordinate", label: "Coordinate only" },
  { value: "pool", label: "Pool money" },
  { value: "both", label: "Both" },
];

export default function NewPlan() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("trip");
  const [description, setDescription] = useState("");
  const [poolMode, setPoolMode] = useState("pool");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pooled = poolMode !== "coordinate";

  const next = () => {
    setError("");
    if (step === 0 && !name.trim()) return setError("Give your plan a name.");
    if (step === 1 && pooled && !(Number(target) > 0)) return setError("Set a target amount, or choose Coordinate only.");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await plansAPI.createPlan({
        name: name.trim(),
        category,
        description: description.trim(),
        planType: "free",
        poolMode,
        targetAmount: pooled ? Number(target) : null,
        currency: pooled ? currency : null,
      });
      const created = unwrap(res);
      const id = created?.planId || created?.id;
      if (!id) throw new Error("The plan was created but no id came back.");
      toast.success("Plan created");
      router.push(`/plans/${id}`);
    } catch (err) {
      setError(err.message || "Couldn't create the plan.");
      setBusy(false);
    }
  };

  return (
    <PageFrame eyebrow={<Stepper steps={STEPS} current={step} />} title={STEPS[step] === "Review" ? "Looks right?" : STEPS[step] === "Money" ? "Collecting money?" : "Create a plan"}>
      <Reveal>
        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
            <FieldGroup>
              <Field id="name" label="Plan name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
              <SelectField id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
              <TextAreaField id="description" label="What's the plan? (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
            </FieldGroup>
            <FormError>{error}</FormError>
            <StickyAction><PrimaryButton>Continue</PrimaryButton></StickyAction>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6">
            <Segmented name="pool-mode" value={poolMode} onChange={setPoolMode} options={POOL_MODES} />
            <p className="text-sm text-gray-500">
              {poolMode === "coordinate" ? "Plan together without collecting money." : "Members contribute what they can toward a shared target, by M-Pesa."}
            </p>
            {pooled && (
              <FieldGroup>
                <Field id="target" label="Target amount" type="number" inputMode="decimal" min={1} step="1" prefix={currency} value={target} onChange={(e) => setTarget(e.target.value)} autoComplete="off" />
                <SelectField id="currency" label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={[{ value: "KES", label: "KES — Kenyan shilling" }, { value: "USD", label: "USD — US dollar" }]} />
              </FieldGroup>
            )}
            <FormError>{error}</FormError>
            <div className="flex gap-3">
              <OutlineButton onClick={() => setStep(0)} className="sm:w-32">Back</OutlineButton>
              <StickyAction><PrimaryButton>Continue</PrimaryButton></StickyAction>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <ListGroup>
              <Row title="Name" trailing={name} chevron={false} />
              <Row title="Category" trailing={CATEGORIES.find((c) => c.value === category)?.label} chevron={false} />
              <Row title="Money" trailing={pooled ? `${POOL_MODES.find((m) => m.value === poolMode)?.label} · ${money(target, currency)}` : "Coordinate only"} chevron={false} />
              {description && <Row title="About" footnote={description} chevron={false} />}
            </ListGroup>
            <p className="text-sm text-gray-500">Next you'll invite your group and add links from the plan page.</p>
            <FormError>{error}</FormError>
            <div className="flex gap-3">
              <OutlineButton onClick={() => setStep(1)} className="sm:w-32">Back</OutlineButton>
              <StickyAction><PrimaryButton type="button" onClick={create} loading={busy}>Create plan</PrimaryButton></StickyAction>
            </div>
          </div>
        )}
      </Reveal>
    </PageFrame>
  );
}
