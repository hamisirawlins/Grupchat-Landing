"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageFrame, Reveal } from "@/components/app/PageFrame";
import { ListGroup, Row } from "@/components/ui/ListGroup";
import { Segmented } from "@/components/ui/Segmented";
import { Avatar, EmptyState, Skeleton, Tag } from "@/components/ui/Bits";
import { ButtonLink, FormError, OutlineButton } from "@/components/ui/Form";
import { plansAPI } from "@/lib/api";
import { date, fraction, plural } from "@/lib/format";
import { asList, isPooled, planTypeLabel, STATUS_TONE, unwrap } from "@/lib/data/shape";
import { useAsync } from "@/lib/useAsync";

const PAGE = 20;

export default function Plans() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [pages, setPages] = useState(1);
  const { data, loading, error, reload } = useAsync(
    async () => {
      const all = [];
      for (let p = 1; p <= pages; p += 1) {
        const res = await plansAPI.getPlans({ limit: PAGE, page: p });
        const list = asList(unwrap(res), "plans");
        all.push(...list);
        if (list.length < PAGE) break;
      }
      return all;
    },
    [pages],
    { enabled: !!user },
  );

  const plans = useMemo(() => {
    const list = data ?? [];
    if (filter === "mine") return list.filter((p) => p.ownerId === user?.uid);
    if (filter === "joined") return list.filter((p) => p.ownerId !== user?.uid);
    return list;
  }, [data, filter, user?.uid]);

  const canLoadMore = (data?.length ?? 0) >= PAGE * pages;

  return (
    <PageFrame title="Your plans" meta={data ? plural(data.length, "plan") : undefined} onRefresh={reload}>
      <Reveal className="mb-6">
        <Segmented
          name="plans-filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "mine", label: "Mine" },
            { value: "joined", label: "Joined" },
          ]}
        />
      </Reveal>

      <Reveal>
        {error && <FormError>{error.message || "Couldn't load your plans."}</FormError>}
        {loading && !data ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            title={filter === "all" ? "No plans yet" : "Nothing here"}
            text={filter === "all" ? "Start one, or join a curated plan." : undefined}
            action={<ButtonLink href="/plans/new" className="sm:w-48">Create a plan</ButtonLink>}
            secondary={<ButtonLink href="/discover" variant="outline" className="sm:w-48">Discover</ButtonLink>}
          />
        ) : (
          <ListGroup>
            {plans.map((plan) => {
              const pooled = isPooled(plan);
              return (
                <Row
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  leading={<Avatar name={plan.name} size={40} />}
                  title={plan.name}
                  footnote={[planTypeLabel(plan), plural(plan.membersCount ?? 0, "member"), date(plan.targetDate) || "No date"].join(" · ")}
                  trailing={
                    pooled && Number(plan.targetAmount) > 0 ? (
                      `${Math.round(fraction(plan.currentBalance, plan.targetAmount) * 100)}%`
                    ) : (
                      <Tag tone={STATUS_TONE[plan.status] ?? "neutral"}>{plan.status || "active"}</Tag>
                    )
                  }
                />
              );
            })}
          </ListGroup>
        )}
        {canLoadMore && (
          <div className="mt-6">
            <OutlineButton onClick={() => setPages((n) => n + 1)} loading={loading}>
              Show more
            </OutlineButton>
          </div>
        )}
      </Reveal>
    </PageFrame>
  );
}
