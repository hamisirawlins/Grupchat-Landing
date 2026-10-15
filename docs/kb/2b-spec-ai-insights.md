---
title: AI insights — the AI layer, pool insights and admin system insights
status: draft
updated: 2026-10-16
read_when: you touch any AI call, a model or limit setting, pool insights, or the admin insights page
---

# AI insights

The first AI in the product (D-054, D-055). **Proposed** until `feat/quick-pool` merges. Method:
the `business-agent` skill (rawlins repo). Nothing here ships before the admin key is rotated
(KB 10 P0.1).

## The AI layer (gc-payments `services/ai/`)
- **One way to call a model**: Vercel's AI SDK (`ai`, `@ai-sdk/anthropic`) behind
  `services/ai/client.js`. No route calls a provider directly. `ANTHROPIC_API_KEY`; tests point
  `ANTHROPIC_BASE_URL` at a mock.
- **Models by job** (`services/ai/models.js`): `poolInsights` → `claude-haiku-5-5`;
  `adminReview` → `claude-opus-5-5`. A job names its model; changing it is a config change that
  must pass the job's evaluation set.
- **Limits in code, lowered by config** (`services/ai/limits.js`): per-run output tokens; runs per
  pool per day (6); runs per job per day (pool insights 300; admin review 2); a daily spend ceiling
  per job (pool insights USD 0.50; admin review USD 1.00). Config (`AI_LIMIT_*` env) can lower a
  ceiling, never raise it. A limit reached means a deterministic fallback, never an error page.
- **Prices** (`services/ai/prices.js`, from Anthropic's pricing page, read 2026-10-15), USD per million
  tokens: Haiku 5.5 0.10 in / 0.50 out (5x over 100k prompt tokens); Opus 5.5 4 in / 20 out. A pool
  insight costs about USD 0.00007; a review about USD 0.04.
- **Ledger**: limits are counted on `aiDaily/{day}_{job}` (runs, runs per subject, spend), reserved
  before each call. Every run writes `aiJobs/{id}` (job, subject, status `success|partial|failed|refused|skipped`,
  reason); every model call writes `aiUsage/{id}` (job, provider, model, input, output and cached
  tokens, estimated USD from `services/ai/prices.js`, subject, outcome). A model missing from the
  price table is recorded as `costUsd: null` (unreported), never as zero. Limits count from these rows.
- **What a model sees**: totals only. Never a name, phone number, email, pool name or any text a
  member typed. So there is no prompt-injection surface, and nothing personal crosses a border.

## Pool insights (`poolInsights`)
**Numbers are code; words are the model's.** `quickPoolInsights.metrics(plan)` derives, from
`quickPool.stats` alone: collected, % of target, contributors, days left, pace per day, projected
finish (at the current pace, by `endsAt`), the busiest hour and day, amount bands and the last 7
days against the 7 before. The page draws its charts from the same numbers.

**When it runs** (value gate): at least **5 contributors** (so no insight can describe one
person); new money since the last run; and either 6 hours since the last run or a milestone just
crossed (25, 50, 75, 100% of target). The reconciliation loop picks up stale pools, at most 10 per
run. The result is cached on `quickPool.insights` `{ headline, body, signoff, mood, generatedAt,
basis, model, source }`, so a page view never calls a model.

**Checks before showing**: headline ≤ 60 and body ≤ 220 characters; no links, @, or phone-like
numbers; every number in the text must be one of the metrics; nothing that pressures or shames.
One retry with the failure as feedback; then the deterministic template (`source: "template"`).

**Tone by kind** (the theme's `kind`, chosen by code from keywords in the name):
`condolence` and `medical` pools get a quiet register and no proverbs.

**Sign-offs, chosen by code from the pace, never by the model**:

| Pace | Sign-off |
|---|---|
| target reached | "Umoja ni nguvu!" |
| 90% or more | "Bado kidogo!" |
| on track to reach the target by `endsAt` | "Haba na haba hujaza kibaba." |
| behind | "Tujikakamue!" or "Kidole kimoja hakivunji chawa." |
| condolence or medical | "Asanteni kwa moyo wenu." |

## Admin system insights (`adminReview`)
- **Metrics** (`GET /v2/admin/insights/system?days=30`, admin): sign-ups, plans and Quick Pools
  created, money in and out per day, payment success rate, payouts by stage, refunds, over-cap and
  over-limit flags, unmatched paybill payments, and AI spend by job, from bounded date-window reads.
  The admin page charts them.
- **Review**: a premium-model reading of those totals: a summary, highlights, risks and suggested
  actions, cached in `adminInsights/{id}`. It runs **weekly** (Mondays, 07:00 EAT, from the
  reconciliation loop) and on demand with `POST /v2/admin/insights/review`, **at most once a day**.
  Totals only; no member data.

## Ethos check (rawlins KB 70; business-agent step 3)
Real people, together: insights help a group see its own progress · Honest: numbers come from the
ledger-backed stats and are checked in the text · Consented: no member is named or singled out
(5-contributor gate, totals only) · Safe and lawful: no personal data leaves; no pressure or shaming;
quiet tone for loss and illness · A person decides: insights never move money or flag a person.

## Evaluation
`npm run eval:pool-insights` (dry run against a mock; `-- --live` with `ANTHROPIC_API_KEY`) runs 30 metric fixtures (on track, behind, reached, tiny, quiet
kinds) through the job and reports checks passed and cost per case; it gates any model or prompt
change. The misuse set does not apply: the job takes no member text.
