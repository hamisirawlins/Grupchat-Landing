---
title: Design system — Apple-centric, and the "Plans to memories" scheme
status: active
updated: 2026-10-11
read_when: you are building or reviewing any screen or component in the web app
---

# Design system

The brief: the app as an Apple designer would ship it. HIG's three words — **clarity, deference,
depth** — applied to a Next.js/Tailwind codebase. Reference implementations:
`components/app/AppShell.js`, `components/auth/AuthShell.js`, `components/home/Charts.js`.

## Principles → rules
| Principle | Rule in this codebase |
|---|---|
| Content first | Chrome is a 24px logo and one text link. No sidebars, no card-in-card. |
| Hierarchy by type and space, not boxes | Sections separate with `border-t border-black/[0.08]` and vertical rhythm, not tinted panels. |
| One primary action per screen | Exactly one solid `purple-600` button visible at a time. Alternatives are outlines or text. |
| Motion explains | Things enter with fade-and-rise; state changes ease; nothing bounces. |
| Say less | Titles are nouns or short verbs. No sub-explanations under headings unless the user needs a decision. |

## Type (Figtree, `font-sans`)
| Role | Classes | Use |
|---|---|---|
| Large title | `text-4xl sm:text-5xl font-semibold tracking-tight` | one per screen (greeting, page title) |
| Title | `text-2xl font-semibold tracking-tight` | section or card headline number |
| Headline | `text-[17px] font-semibold tracking-tight` | card titles, row titles |
| Body | `text-[15px]` (`text-base` = 16px for inputs) | paragraphs, field text |
| Footnote | `text-[13px] text-gray-500` | helper text, inline links |
| Caption | `text-xs text-gray-400` / `text-[11px]` | labels, floating labels, legal |
Numbers: `tabular-nums`. Headings: `text-wrap: balance` (global).

## Color
| Token | Value | Use |
|---|---|---|
| ground | `bg-white` | everything |
| ink | `text-black` / `#171717` | primary text |
| secondary / tertiary | `text-gray-500` / `text-gray-400` | supporting text, disabled |
| hairline / hairline-strong | `border-black/[0.08]` / `border-black/[0.12]` | separators, card edges, dashed empties |
| fill | `bg-gray-100` | tags, tracks |
| **accent** | `purple-600` `#9333ea` (landing "Open Web App") | primary buttons, action links, active data |
| accent hover | `purple-700` | |
| accent tint / muted | `purple-50` / `purple-200` | icon chips / inactive chart series |
| success · critical · warning | `green-600` · `red-600` · `amber-600` | status text only, never as fills |
Contrast: white on `purple-600` 5.38:1, `purple-600` on white 5.38:1 — AA for all sizes.

## Geometry & touch
- Radii: `rounded-xl` (12) controls · `rounded-2xl` (16) cards, sheets · `rounded-full` only avatars, rings, pills.
- Outline alternative: `border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white`.
- Spacing scale: 4·8·12·16·24·32·48·64. Screen gutter `px-6`; column `max-w-3xl` (app) / `max-w-[400px]` (auth).
- Touch targets ≥ 44pt: text buttons get `py-2`; icon buttons `p-2.5` with 18px glyphs.
- Inputs are **16px** (iOS zoom), grouped in `FieldGroup` with floating labels.
- No `-webkit-tap-highlight`; we draw our own pressed state (`active:scale-[0.98]`).

## Elevation
Hairlines, not shadows. Shadow only on layers that float over content (sheets, menus): `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`.

## Motion
- Ease `[0.32, 0.72, 0, 1]` (`lib/motion.js` `EASE`). Durations: 200ms micro · 300ms state · 600ms reveal. Stagger 70ms.
- Reveal = `opacity 0→1, y 12→0`. Press = `scale 0.98`. Charts start at +600ms so they animate after their card lands.
- `useReducedMotion` → fades only; charts render final state.
- Never animate text that is being read; never animate on data refresh, only on mount.

## Components
| Have | File |
|---|---|
| `AppShell`, `BackToHome`, `ScaffoldPage`, `useRequireAuth` | `components/app/AppShell.js` |
| `AuthShell`, `FieldGroup`, `Field`, `PasswordField`, `PrimaryButton`, `OutlineButton`, `ButtonLink`, `GoogleButton`, `Divider`, `FormError`, `SuccessMark`, `LegalLine` | `components/auth/AuthShell.js` |
| `Ring`, `Bars`, `Sparkline`, `StatCard`, `useCountUp` | `components/home/Charts.js` |
| Scheme kit (D-045) | `components/kit/` — see §Scheme |
| **To build** (checklist A) | `components/ui/`: `ListGroup`/`Row` (Settings-style), `Sheet` (bottom on mobile, centred ≥640), `Segmented`, `EmptyState`, `Tag`, `Avatar`, `ProgressBar`, `Stepper`; move form primitives from `AuthShell` to `components/ui/Form.js` |

## Navigation
- **Header** (`AppShell`): sticky, translucent (`bg-white/85 backdrop-blur`), hairline below; logo left, one contextual link right.
- **Tab bar** (`components/app/TabBar.js`), phones only (<640px): fixed bottom, four tabs — Home · Plans · Discover · Alerts — 22px glyph + 11px label, active `purple-600` with a heavier stroke, safe-area padded. Desktop navigates from the header and content. Sticky actions rest above the tab bar (`bottom-[calc(4rem+env(safe-area-inset-bottom))]`); pages reserve `pb-32` on phones.

## Page patterns
- **Refresh**: on touch devices every data screen supports pull-to-refresh (`components/ui/PullToRefresh.js` via `PageFrame onRefresh`): rubber-band resistance, arrow rotates to armed at 72px, spinner while loaders re-run, content settles back on the standard ease. Refresh never replays the entrance animation. Desktop shows nothing.
- **Home**: greeting · 3 action cards · at-a-glance stats.
- **List**: large title · optional segmented filter · `ListGroup` of rows (title, footnote, trailing value/chevron) · empty state dashed.
- **Detail**: large title · one meta line (`Footnote`) · progress (ring or bar) · sections split by hairlines · **one** primary action, sticky bottom bar under 640px · "Home" back link always present (journeys rule).
- **Form / Flow**: `Stepper` dots · one `FieldGroup` per step · one primary button · skip as text link when optional.
- **Checklist rows**: a 24px circle/check toggle in purple, title strikes through when the item is complete, footnote carries `n of m done` for everyone-items; remove is a quiet text action (soft delete).
- **Admin**: same shell; data-dense tables allowed but still hairlines, tabular numbers, no colour fills. Long forms are sectioned `FieldGroup`s with a caps label per section; destructive-ish actions (pause) are outline buttons, never red, because they're reversible.

## Copy
Sentence case. Verbs on buttons ("Create plan", not "Submit"). No provider jargon ("Check your phone for the M-Pesa prompt"). Errors say what to do next. Empty states: two lines max.

## Scheme — "Plans to memories" (D-045)
The design canvas's scheme, in code. **Purple acts, gold remembers**: purple for anything a
person does (buttons, links, the active item), gold only for remembering (recaps, funded
moments), never as text on white (2.8:1). New working surfaces use it: the provider portal,
the provider application and the admin console. Screens built before it keep the rules above
until they are restyled to the web boards.

| Token (Tailwind utility) | Value | Use |
|---|---|---|
| `ink` · `ink-2` · `ink-3` | #171717 · #4B5563 · #6B7280 | text, supporting text, quiet labels |
| `action` · `action-strong` · `action-tint` | #9333EA · #7E22CE · #F3E8FF | primary fill · text on tint and hover · selected fills |
| `memory` · `memory-ink` · `memory-tint` | #B5975A · #7C6534 · #F4EDDF | gold fills · gold text · gold grounds |
| `sheet` · `soft` · `line` · `line-strong` | #FAF7F2 · #F3F4F6 · 8% · 12% black | warm ground · quiet fills · hairlines |
| `success` · `warning` · `critical` (+ `-tint`) | #15803D · #B45309 · #B91C1C | status text and its tinted pill |
| `ground-dark` · `surface-dark` · `raised-dark` · `ink-dark` · `ink-2-dark` · `action-dark` · `action-tint-dark` · `memory-dark` | #0F0E13 · #18171E · #222129 · #F6F3EE · #A8A6B0 · #C084FC · #261538 · #CDB27A | dark surfaces (the admin sidebar today; a dark theme later) |
| radius `tag` · `input` · `button` · `tile` · `card` · `sheet` | 6 · 12 · 16 · 20 · 24 · 28 | |
| `ease-gc`, `shadow-float`, `shadow-lift` | `cubic-bezier(.32,.72,0,1)` | |

Type on scheme surfaces: page titles 32–36px weight 900, tracking −0.03em; card titles 18px
800; field labels 13px 600 above the field; kickers 12px 600 caps +0.14em. Inputs are 52px
tall with an inset ring, 16px text. Primary buttons 52px (`lg`) or 44px (`md`).

**Motion.** Springs shared with the films (`lib/motion.js` `SPRING`): `soft` 120·22 for
arrivals, `ui` 260·28 for toggles, tabs and presses, `heavy` 90·20 for large surfaces,
`playful` 260·14 for one moment of delight (an application sent, a ticket issued). Steps
slide in the direction of travel (`useStepVariants`); list items grow in and fold away
(`useListItemVariants`); the active nav highlight slides between items (framer `layoutId`).
Reduced motion keeps fades only.

**Kit.** `components/kit/` (index re-exports): `Button`/`ButtonLink`/`IconButton`,
`TextField`/`TextArea`/`SelectField`/`FieldRow`, `Chips`, `RadioCards`, `Switch`,
`ReviewToggle` (pass · needs fix · fail), `WeekdayPicker`, `StatusTag`, `PageTitle`, `Card`,
`StatTile`, `MoneyLines`, `ProgressBar`, `Meter`, `VerticalStepper`/`CompactStepper`,
`FilePickButton`, `ResponsiveTable` (a table from 768px, cards below), `EmptyState`,
`DoneMark`, and `PortalShell`: a 248px sidebar from 960px, a 76px icon rail from 640px, a top
bar and bottom tabs on phones, light for providers and dark for admins. `/scheme` renders all
of it live (not linked, not indexed).

## Accessibility checklist (per screen)
`<label>` on every input · `role="alert"` on errors · `aria-busy` on loading frames · focus-visible ring (`ring-4 ring-purple-600/10`) · icon-only buttons have `aria-label` · decorative SVG `aria-hidden`.
