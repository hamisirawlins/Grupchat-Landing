"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import {
  Avatar, BackLink, Button, ButtonLink, Card, Chips, CompactStepper, DoneMark, EmptyState, FieldRow, Kicker, Meter, MoneyLines,
  OkLine, PageTitle, ProgressBar, RadioCards, ReviewToggle, SelectField, StatTile, StatusTag, Switch, TextArea, TextField,
  VerticalStepper, WeekdayPicker,
} from "@/components/kit";

/**
 * The scheme, live (KB 25 §Scheme, D-045): every kit component on one page,
 * with the springs running, so a change can be checked on a phone and a desk
 * before it reaches a screen. Not linked from the app and kept out of indexes.
 */
const SWATCHES = [
  ["Action", "bg-action", "#9333EA"], ["Action strong", "bg-action-strong", "#7E22CE"], ["Action tint", "bg-action-tint", "#F3E8FF"],
  ["Memory", "bg-memory", "#B5975A"], ["Memory ink", "bg-memory-ink", "#7C6534"], ["Memory tint", "bg-memory-tint", "#F4EDDF"],
  ["Ink", "bg-ink", "#171717"], ["Sheet", "bg-sheet", "#FAF7F2"], ["Soft", "bg-soft", "#F3F4F6"],
  ["Success", "bg-success", "#15803D"], ["Warning", "bg-warning", "#B45309"], ["Critical", "bg-critical", "#B91C1C"],
];
const DARK = [["Ground", "bg-ground-dark", "#0F0E13"], ["Surface", "bg-surface-dark", "#18171E"], ["Raised", "bg-raised-dark", "#222129"], ["Action text", "bg-action-dark", "#C084FC"], ["Memory", "bg-memory-dark", "#CDB27A"]];
const STEPS = [{ label: "Your business" }, { label: "Documents" }, { label: "Payouts" }, { label: "Submit" }];

export default function Scheme() {
  const item = useRevealVariants();
  const [chips, setChips] = useState(["outdoors"]);
  const [radio, setRadio] = useState("company");
  const [water, setWater] = useState(true);
  const [verdict, setVerdict] = useState("fix");
  const [days, setDays] = useState([5, 6]);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);

  return (
    <main className="min-h-screen bg-white text-ink">
      <motion.div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 pb-24 pt-10 sm:px-8" variants={STAGGER} initial="hidden" animate="show">
        <motion.header variants={item} className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
            <span className="text-lg font-extrabold tracking-[-0.01em]">GrupChat</span>
          </div>
          <Kicker>Plans to memories</Kicker>
          <PageTitle sub="Purple is for doing. Gold is for remembering.">The scheme</PageTitle>
        </motion.header>

        <motion.section variants={item} className="flex flex-col gap-4" aria-label="Colour">
          <h2 className="text-lg font-extrabold">Colour</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SWATCHES.map(([name, cls, hex]) => (
              <div key={name} className="flex flex-col gap-2">
                <span className={`h-16 rounded-2xl ${cls} shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]`} />
                <span className="text-[13px] font-semibold">{name}</span>
                <span className="tabular text-xs text-ink-3">{hex}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-card bg-ground-dark p-4 sm:grid-cols-5">
            {DARK.map(([name, cls, hex]) => (
              <div key={name} className="flex flex-col gap-2">
                <span className={`h-12 rounded-xl ${cls} shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)]`} />
                <span className="text-[13px] font-semibold text-ink-dark">{name}</span>
                <span className="tabular text-xs text-ink-2-dark">{hex}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="flex flex-col gap-4" aria-label="Buttons">
          <h2 className="text-lg font-extrabold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1400); }}>Publish</Button>
            <Button variant="secondary" size="lg">Save draft</Button>
            <Button variant="quiet" size="lg"><Upload className="h-[18px] w-[18px]" />Upload</Button>
            <Button variant="text"><Plus className="h-[18px] w-[18px]" />Add a one-off date</Button>
            <Button variant="gold">Share the recap</Button>
            <Button variant="danger">Decline</Button>
            <Button disabled>Approve provider</Button>
            <ButtonLink href="/scheme" variant="secondary" size="sm">A link</ButtonLink>
          </div>
        </motion.section>

        <motion.section variants={item} className="grid gap-6 lg:grid-cols-2" aria-label="Fields and choices">
          <Card title="Fields">
            <TextField label="Business name" defaultValue="Mwezi Dhow Trips" />
            <FieldRow>
              <SelectField label="Country" defaultValue="KE" options={[{ value: "KE", label: "Kenya" }, { value: "TZ", label: "Tanzania", disabled: true }]} helper="We'll ask for Kenya's documents next." />
              <TextField label="Phone" prefix="+254" placeholder="7XX XXX XXX" inputMode="tel" />
            </FieldRow>
            <TextField label="Account number" defaultValue="12AB" error="Check the account number." />
            <TextArea label="Description" rows={3} defaultValue="Sail the Shimoni channel on a traditional dhow as the sun goes down." />
          </Card>
          <Card title="Choices">
            <Chips label="What you run" options={[{ value: "trips", label: "Trips" }, { value: "outdoors", label: "Outdoors" }, { value: "food", label: "Food" }, { value: "events", label: "Events" }]} value={chips} onChange={setChips} />
            <RadioCards label="Business type" options={[{ value: "company", label: "Company" }, { value: "sole-trader", label: "Sole trader" }]} value={radio} onChange={setRadio} />
            <Switch label="Water activities" description="Boats, snorkelling, diving or swimming" checked={water} onChange={setWater} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[15px] font-bold">Public liability insurance</span>
              <ReviewToggle label="Public liability insurance" value={verdict} onChange={setVerdict} />
            </div>
            <WeekdayPicker value={days} onChange={setDays} />
          </Card>
        </motion.section>

        <motion.section variants={item} className="grid gap-6 lg:grid-cols-2" aria-label="Progress">
          <Card title="Progress" action={<Button size="sm" variant="quiet" onClick={() => setStep((s) => (s + 1) % 4)}>Next step</Button>}>
            <div className="hidden sm:block"><VerticalStepper steps={STEPS} current={step} /></div>
            <CompactStepper steps={STEPS} current={step} />
            <ProgressBar value={(step + 1) / 4} label="Application" thick />
            <Meter value={7} total={8} />
            <Meter value={9} total={12} />
          </Card>
          <Card title="Status and money">
            <div className="flex flex-wrap gap-2">
              {["live", "review", "draft", "changes-requested", "ready", "waiting", "approved", "declined", "paused"].map((s) => <StatusTag key={s} status={s} />)}
            </div>
            <MoneyLines title="For a KES 3,000 ticket" rows={[["Guest pays", "KES 3,000"], ["Provider charges", "− KES 300"], ["You receive", "KES 2,700", true]]} />
            <OkLine>Matches your business name</OkLine>
            <div className="flex items-center gap-2">
              <Avatar name="Salim Bakari" /><Avatar name="Aisha K" /><Avatar name="Rawlins" dark />
            </div>
          </Card>
        </motion.section>

        <motion.section variants={item} className="grid gap-3 sm:grid-cols-3" aria-label="Tiles">
          <StatTile label="Upcoming guests" value="15" />
          <StatTile label="Tickets sold in Nov" value="15" />
          <StatTile label="Paid to you in Nov" value="KES 40,500" sub="After KES 4,500 provider charges" />
        </motion.section>

        <motion.section variants={item} className="grid gap-6 sm:grid-cols-2" aria-label="Moments">
          <Card title="Done" action={<Button size="sm" variant="quiet" onClick={() => setDone((d) => d + 1)}>Replay</Button>}>
            <div className="flex items-center gap-4"><DoneMark key={done} /><span className="text-[15px] font-semibold">Application sent</span></div>
          </Card>
          <EmptyState title="No experiences yet" text="Add your first and publish it when it's ready." action={<Button variant="secondary" size="sm"><Plus className="h-4 w-4" />Add experience</Button>} />
        </motion.section>

        <motion.div variants={item}><BackLink href="/">Home</BackLink></motion.div>
      </motion.div>
    </main>
  );
}
