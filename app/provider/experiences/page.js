"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ButtonLink, EmptyState, PageTitle, Skeleton } from "@/components/kit";
import { ExperienceCard } from "@/components/providers/ExperienceCard";
import { providersAPI } from "@/lib/api";
import { unwrap } from "@/lib/data/shape";
import { STAGGER, useRevealVariants } from "@/lib/motion";
import { useAsync } from "@/lib/useAsync";

const ORDER = { live: 0, draft: 1, paused: 2 };

export default function Experiences() {
  const item = useRevealVariants();
  const { data, loading } = useAsync(async () => unwrap(await providersAPI.experiences()), [], {});
  const list = [...(data?.experiences || [])].sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3));
  return (
    <motion.div variants={STAGGER} initial="hidden" animate="show" className="flex flex-col gap-7">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle>Experiences</PageTitle>
        <ButtonLink href="/provider/experiences/new" size="md" className="hidden sm:inline-flex"><Plus className="h-[18px] w-[18px]" />Add experience</ButtonLink>
      </motion.div>
      {loading && !data ? (
        <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[100px] rounded-tile" />)}</div>
      ) : list.length === 0 ? (
        <motion.div variants={item}><EmptyState title="No experiences yet" text="Add your first and publish it when it's ready." action={<ButtonLink href="/provider/experiences/new" variant="secondary"><Plus className="h-4 w-4" />Add experience</ButtonLink>} /></motion.div>
      ) : (
        <motion.div variants={item} className="flex flex-col gap-3">
          <AnimatePresence initial={false}>{list.map((e) => <ExperienceCard key={e.id} e={e} />)}</AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
