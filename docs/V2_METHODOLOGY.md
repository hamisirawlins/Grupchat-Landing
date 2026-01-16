# V2 Methodology

This guide describes a repeatable way to version pages and safely roll out the
next major design and UX iteration (V2) while keeping V1 stable.

## Goals
- Ship V2 pages incrementally without breaking V1.
- Keep routing clear and reversible.
- Make design and copy changes traceable per page.
- Enable quick A/B or staged rollouts if needed.

## Foldering Strategy
Use a parallel app tree for V2 pages and components.

Recommended structure:
- `app/` (V1 routes)
- `app/v2/` (V2 routes)
- `components/` (shared components)
- `components/v2/` (V2-only components)
- `styles/` or `app/globals.css` (shared tokens)

Example:
- V1: `app/report-bug/page.js`
- V2: `app/v2/report-bug/page.js`

## Routing Strategy
Decide one of the following rollout modes per page:

1. **Dual Routes (safe default)**
   - V1 at `/report-bug`
   - V2 at `/v2/report-bug`
   - Manual QA and internal review before switching.

2. **Soft Switch (controlled rollout)**
   - Keep V1 and V2 routes.
   - Add a simple runtime switch to send traffic to V2.
   - Use a feature flag, query param, or environment variable.

3. **Hard Switch**
   - Replace V1 page with V2 (only when stable).
   - Keep V1 version as a backup under `/v1/` or git tag.

## Feature Flag Pattern
Create a small helper to route to V2 based on an env flag.

Pseudo-code:
```
const useV2 = process.env.NEXT_PUBLIC_V2_ROLLOUT === "true";
return useV2 ? <V2Page /> : <V1Page />;
```

## Design Token Rules
Use shared tokens to avoid rework and drift:
- Primary purple: `purple-600` (hover `purple-700`)
- Focus ring: `focus:ring-purple-500/30`
- Card borders: `border-gray-200`
- Text hierarchy: `text-black`, `text-gray-600`, `text-gray-500`

Document any new tokens in a shared place (README or a `design-tokens.md`).

## Page Migration Checklist
For every page:
1. **Snapshot V1**: confirm route, layout, and functionality.
2. **Create V2 page**: copy V1 into `app/v2/<page>/page.js`.
3. **Update layout**: apply V2 spacing, typography, and components.
4. **Map copy**: confirm content changes and callouts.
5. **Preserve logic**: ensure all handlers and API calls stay intact.
6. **QA**: validate forms, links, and redirects.
7. **Promote**: decide soft or hard switch.
8. **Log**: update the rollout tracker.

## Rollout Tracker (Template)
Create a tracker in `docs/ROLLING_V2.md` and update per page:

```
| Page | V1 Route | V2 Route | Status | Notes |
|------|----------|----------|--------|-------|
| Report Bug | /report-bug | /v2/report-bug | In QA | Form + copy validated |
```

## Testing Rules
- Test V2 pages in isolation on `/v2/*`.
- Verify auth gates and API calls still work.
- Check mobile layouts and form states.
- Validate focus states and keyboard navigation.

## When to Delete V1
Only after:
- V2 is stable in production for at least 2 weeks.
- No open bugs on that page.
- Metrics match or exceed V1.

