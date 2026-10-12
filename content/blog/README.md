# The blog: how an article gets written and published

AI drafts; a person approves. Nothing reaches grupchat.net without a named person's approval,
and the build enforces it (KB D-047, `lib/blog.js`).

## 1. Brief
Pick the pillar and the reader's question. One article answers one question a real person asks.

| Pillar (`pillar`) | Covers |
| --- | --- |
| `tech-and-ai` | News and analysis on technology and AI, and what it changes for people |
| `planning-together` | Guides for trips, events and plans made with other people |
| `money-together` | Pooling, contributions, fairness when a group pays |
| `experiences` | Places and things to do in Kenya as a group |

## 2. Draft (AI)
Ask Claude for a draft from the brief. It opens and reads its sources first, writes
`content/blog/<slug>.md` with `status: draft`, and lists every source it relied on.
A news or analysis piece (`tech-and-ai`) cannot be published without sources.

## 3. Review on the preview
Open the pull request's Vercel preview at `/blog/<slug>`. Drafts show there (with a banner),
never on production. Check every fact against its source, cut what doesn't help the reader,
and make it sound like us.

## 4. Approve
Set, in the file's front matter:

```yaml
status: published
date: 2026-10-14        # the day it goes live
approvedBy: Rawlins     # the person who read and approved it
approvedAt: 2026-10-14
```

Merge. The article, its topic page, the sitemap and the RSS feed update on deploy.

## Front matter

```yaml
title: "Under 70 characters, says what the reader gets"
description: "Under 165 characters. Shown in search results and share cards."
pillar: planning-together
tags: [group trips, kenya]
author: GrupChat Editorial      # or a person's name
status: draft                   # draft | published
date:                           # YYYY-MM-DD, required when published
updated:                        # YYYY-MM-DD when a published article changes materially
aiAssisted: true                # false only when a person wrote it without AI
approvedBy:                     # required when published
approvedAt:                     # YYYY-MM-DD, required when published
cover:                          # optional: a Pexels photo URL, or /blog/<file> in public/ (16:9)
coverAlt:                       # what the image shows (required with a cover)
coverCredit:                    # the photographer's name as Pexels shows it
coverCreditUrl:                 # their Pexels profile
coverSource:                    # the photo's Pexels page
sources:
  - title: "Page title"
    publisher: "Who published it"
    url: https://example.com/page
```

## House rules
- One article, one question. No pages written only to rank.
- Facts come from sources we opened; numbers that change (prices, fees, rates) are avoided or dated.
- No invented people, quotes or numbers. AI-made images are labelled.
- Covers: real photos from Pexels (free licence; we credit the photographer anyway). Copy the image
  address from the photo page (`https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg`, no
  query string); the site asks Pexels' CDN for the right size and crop. Landscape photos crop best.
  Pick people who could be the reader, don't imply anyone pictured endorses GrupChat, and avoid
  photos of identifiable people for sensitive topics.
- Update the article and `updated` when a fact changes; don't publish a second version.
