---
title: KB conventions
status: active
updated: 2026-09-05
read_when: you are adding to or editing any document in docs/kb
---

# KB conventions

The KB is optimised for **being read by someone (or an agent) with limited attention,
repeatedly, as it grows**. Every rule below serves that.

## Shape
- **One topic per file.** If a file needs a second `# H1`, it is two files.
- **≤ 250 lines per file.** Past that, split and cross-link. Long reference tables go in their own file.
- **Numbered prefixes** group by kind: `00` overview · `1x` plans · `2x` specs · `3x` decisions · `4x` runbooks · `9x` legacy/meta.
- **Frontmatter on every file** (INDEX excepted):
  ```
  ---
  title:      short noun phrase
  status:     draft | active | superseded
  updated:    YYYY-MM-DD
  read_when:  one sentence naming the task this helps with
  supersedes: (optional) file(s) this replaces
  ---
  ```
- **`read_when` is the filter.** Write it so a reader can decide in two seconds whether to keep reading.

## Truth
- **Code is authoritative; the KB describes it.** Where a spec proposes something not yet in code, mark the section **Proposed**. Where the KB and code disagree, fix the KB (or the code) the same day and log it in 30.
- **No duplication.** Say a thing once, in the file that owns it, and link. If you're about to copy a paragraph, you're about to create a future contradiction.
- **Status vocabulary:** `draft` = proposal, may be wrong · `active` = describes reality or an agreed plan · `superseded` = kept for history, do not act on. Superseded files keep their frontmatter and gain a pointer to the replacement.

## Update protocol (do all four)
1. Edit the owning document; bump `updated`.
2. If the change is a decision (chose X over Y), append an entry to `30-decisions.md`. Never edit past entries; add a new one that supersedes.
3. If the one-line summary or status changed, update the row in `INDEX.md`.
4. If you retired a document, move it to `superseded`, add it to `90-legacy-docs.md`.

## Reading protocol (for agents)
1. Read `INDEX.md`. 2. Open only documents whose `read_when` matches. 3. Do not read `90-legacy-docs.md` targets unless 90 says they are still relevant.

## Writing style
Plain, specific, present tense. Name files with paths, fields with their exact casing, endpoints with method + path. Prefer a table to prose when there are three or more parallel items. Prefer "Done when…" to "should".
