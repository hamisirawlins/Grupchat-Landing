/** The small caps tags beside the logo: who this surface is for. */
export function ProviderTag() {
  return <span className="inline-flex h-[22px] items-center rounded-tag bg-ink px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white">Provider</span>;
}

export function AdminTag() {
  return <span className="inline-flex h-[22px] items-center rounded-tag bg-action-tint-dark px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-action-dark">Admin</span>;
}

/** "Water activities" / "Food experiences": why a check applies to this provider. */
export function AppliesTag({ appliesTo }) {
  if (!appliesTo || appliesTo === "all") return null;
  const text = appliesTo === "water" ? "Water activities" : appliesTo === "food" ? "Food experiences" : appliesTo;
  return <span className="inline-flex h-[22px] items-center rounded-tag bg-action-tint px-2 text-[11px] font-bold text-action-strong">{text}</span>;
}
