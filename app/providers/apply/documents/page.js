"use client";

import { ProgressBar } from "@/components/kit";
import { StepFooter, StepTitle, useApplication } from "@/components/providers/Application";
import { DocumentRow } from "@/components/providers/DocumentRow";
import { uploadChecks } from "@/lib/providers";

/** Step 2: the documents your market's checklist asks for, given what you run. */
export default function Documents() {
  const { data, setData } = useApplication();
  const checks = uploadChecks(data?.checklist);
  const added = checks.filter((c) => c.files.length > 0).length;
  const market = data?.market;

  if (!data?.checklist) {
    return (
      <>
        <StepTitle n={2} title="Documents" />
        <div className="flex flex-col gap-2 rounded-card bg-sheet p-6">
          <p className="text-[17px] font-bold">We're not open in {market?.name || "your country"} yet</p>
          <p className="text-[15px] leading-6 text-ink-2">Add your payout account and send your application. We'll email you when we open there, and ask for documents then.</p>
        </div>
        <StepFooter back="/providers/apply/business" next="/providers/apply/payouts" />
      </>
    );
  }

  return (
    <>
      <StepTitle n={2} title="Documents" sub="Based on your country and what you run." />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-bold">{added} of {checks.length} added</span>
          <span className="text-ink-3">PDF, JPG or PNG, up to 10 MB each</span>
        </div>
        <ProgressBar value={checks.length ? added / checks.length : 0} label="Documents added" thick />
      </div>
      <div className="-mt-3">
        {checks.map((item) => (
          <DocumentRow key={item.id} item={item} onChange={setData} />
        ))}
      </div>
      <StepFooter back="/providers/apply/business" next="/providers/apply/payouts" />
    </>
  );
}
