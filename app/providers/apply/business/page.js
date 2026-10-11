"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Chips, FieldRow, Label, RadioCards, SelectField, Switch, TextField } from "@/components/kit";
import { FormError, StepFooter, StepTitle, useApplication } from "@/components/providers/Application";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { CATEGORIES } from "@/lib/providers";

/** Step 1: who you are, where you run, and what. */
export default function Business() {
  const { data, setData } = useApplication();
  const { user } = useAuth();
  const router = useRouter();
  const p = data?.provider;
  const b = p?.business;
  const markets = data?.markets || [];
  const [f, setF] = useState(() => ({
    name: b?.name ?? "",
    type: b?.type ?? "company",
    country: p?.market ?? markets.find((m) => m.open)?.code ?? markets[0]?.code ?? "KE",
    town: b?.town ?? "",
    categories: b?.categories ?? [],
    waterActivities: b?.waterActivities ?? false,
    phone: b?.phone ? b.phone.replace(/^\+\d{3}/, "") : "",
    email: b?.email ?? user?.email ?? "",
    website: b?.website ?? "",
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));
  const market = useMemo(() => markets.find((m) => m.code === f.country), [markets, f.country]);
  const locked = p?.status === "changes-requested";
  useEffect(() => { if (!f.email && user?.email) setF((s) => ({ ...s, email: user.email })); }, [user, f.email]);

  const save = async () => {
    setError("");
    if (f.name.trim().length < 2) return setError("Add your business name.");
    if (!f.categories.length) return setError("Choose what you run.");
    if (f.town.trim().length < 2) return setError("Add your town.");
    setBusy(true);
    try {
      // The server adds the market's prefix: "0712 345 678" and "+254 712 345 678" both work.
      const out = unwrap(await providersAPI.save(f));
      setData(out);
      router.push("/providers/apply/documents");
    } catch (e) {
      setError(e.message || "Couldn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <StepTitle n={1} title="Your business" />
      <TextField label="Business name" value={f.name} onChange={set("name")} autoComplete="organization" placeholder="Mwezi Dhow Trips" />
      <div className="flex flex-col gap-2">
        <Label>Business type</Label>
        <RadioCards label="Business type" value={f.type} onChange={set("type")} options={[{ value: "company", label: "Company" }, { value: "sole-trader", label: "Sole trader" }]} />
      </div>
      <FieldRow>
        <SelectField
          label="Country"
          value={f.country}
          onChange={set("country")}
          disabled={locked}
          options={markets.map((m) => ({ value: m.code, label: m.open ? m.name : `${m.name} (opening soon)` }))}
          helper={market ? (market.open ? `We'll ask for ${market.name}'s documents next.` : `We'll email you when we open in ${market.name}.`) : null}
        />
        <TextField label="Town" value={f.town} onChange={set("town")} placeholder="Shimoni, Kwale" autoComplete="address-level2" />
      </FieldRow>
      <div className="flex flex-col gap-2">
        <Label>What you run</Label>
        <Chips label="What you run" options={CATEGORIES} value={f.categories} onChange={set("categories")} />
      </div>
      <Switch label="Water activities" description="Boats, snorkelling, diving or swimming" checked={f.waterActivities} onChange={set("waterActivities")} />
      <FieldRow>
        <TextField label="Phone" prefix={market?.phonePrefix || "+254"} value={f.phone} onChange={set("phone")} placeholder="7XX XXX XXX" inputMode="tel" autoComplete="tel-national" />
        <TextField label="Email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
      </FieldRow>
      <TextField label="Website or social link" optional value={f.website} onChange={set("website")} placeholder="https://" inputMode="url" />
      <FormError>{error}</FormError>
      <StepFooter onNext={save} loading={busy} />
    </>
  );
}
