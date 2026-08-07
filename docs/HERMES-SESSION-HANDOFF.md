# Hermes session handoff (2026-07-14 — end of Grok session)

> **UPDATE 2026-08-07 (cron job):** Repo transferred `Anshad2u/terminalblog` → **`muzainaanshad/terminalblog`** (origin force-pushed/rewritten; local master reset to `origin/master`). Old local history preserved in branch `backup/old-master-2026-08-07` + `/tmp/wip-2026-08-07.patch`. **Vercel Git auto-deploy is BROKEN after transfer** — pushes do not trigger deploys (`vercel git connect` fails: Vercel GH app lacks access; needs dashboard re-link by operator). Until fixed: deploy manually with `vercel --prod --yes` after pushing.

**Why this file exists:** Operator continues in Hermes. Read this **first** every content/ops job.

## Mission

Grow **long-term SEO traffic** for [terminalblog.com](https://terminalblog.com) with trustworthy AI-coding-agent content. **Quality over volume.**

## Repos / paths

| Path | Role |
|------|------|
| `C:\Users\muzai\terminalblog` | **PRIMARY** workdir — use this |
| `C:\Users\muzai\seo-ai-blog` | Legacy clone — pull/sync before use; may lag |
| Remote | `Anshad2u/terminalblog` → Vercel **`terminalblog`** → https://terminalblog.com |

Push `master` → Vercel auto-deploys. Prefer push over manual `vercel --prod`.

**Git at handoff:** `master` @ `33b703e` (synced origin; includes this handoff + Telegram mute).

## Who does what

| System | Owns |
|--------|------|
| **Hermes crons** | Write/update MDX, quality improve, issues/HN, adoption, pings, outreach. **`deliver: local`** |
| **GitHub Actions** | Health / leaderboard / SEO learn / newsletter / refresh → **Actions logs only** |
| **Telegram** | **ONLY** Ops Digest (Articles Management) via `telegram-ops-digest.cjs` |
| **Vercel** | Build + host |
| **Beehiiv** | Subscribe only (API send = 403 Enterprise) |

## Telegram (HARD POLICY)

Operator rejected PUSH/DEPLOY + HEALTH spam.

**Allowed:**

```bash
cd C:\Users\muzai\terminalblog
node scripts/telegram-ops-digest.cjs --send
```

Format:

```
Articles Management
1- N new articles created
2- N existing articles were updated  (+ ≤7 word notes)
3- N Articles deleted                (omit if 0)
4- N New Interlinks                  (list only if <5)

Others
1- new seo learning                  (omit if none)
2- leaderboard updates               (omit if unchanged)
3- automation errors                 (omit if none)
```

**Forbidden on Telegram:** PUSH/DEPLOY, HEALTH, LEADERBOARD blast, SEO learn dump, newsletter status, freeform Hermes deliver-all.

## New posts on the site

Sparse **new** URLs are **deliberate**. See [new-post-cadence.md](./new-post-cadence.md).

| Source | When | Notes |
|--------|------|--------|
| blog-article-generator | ~15:00 local | ≤1 if gate passes |
| Weekly newsletter GHA | Mon 14:00 UTC | site digest MDX |
| github-issues-watcher | ~16:00 | ≤1 Beware if real |
| Comparison work | anytime | **updates existing URLs** — not homepage firehose |

Paused: commits-watcher, huggingnews-roundup, just-shipped cap **0/day**.

## Content hard rules

1. `node scripts/content-gate.cjs --strict` before write; per-file after draft.
2. Firehose **OFF** — do not re-enable without human OK.
3. Max **1 new article** per generator run; prefer **updating** pillars (`updatedDate`).
4. Floors: ≥600w any; ≥1000w evergreen/comparison; ≥1200w new guides; ≥900w Beware.
5. One story, one URL. No fabricated issue numbers/stats.
6. **No pad spam** — no repeated bank paragraphs; no generator meta (page id, rotation seed, sister URLs).
7. Comparisons = decision memos (verdict, feature matrix, when-to-choose, install).

Policy: [content-policy.md](./content-policy.md) · Autopilot: [AUTOPILOT.md](./AUTOPILOT.md)

## What already shipped (Grok session 2026-07-14) — do not re-break

- **107 comparisons** quality-rewritten; gate 107/0; `comparison-quality.test.cjs` **7/7**
- Pillars scrubbed of bank filler (OSS vs commercial, features matrix, agents vs Copilot, what-devs-say Claude vs Cursor)
- Leaderboard: **no Cost column**; multi-signal OSS v3 + value score; closed-source excluded
- Telegram mute commit `c3c78e7`; quality floor `ab78243` / `496c094` / `b3162d5`

## Hermes jobs (expected)

| Job | Schedule | Behavior |
|-----|----------|----------|
| blog-article-generator | daily 15:00 | 0–1 quality post |
| article-quality-improver | daily 04:00 | ≤2 thin/stale evergreen via `content-refresh` |
| github-issues-watcher | daily 16:00 | ≤1 Beware, evidence-backed |
| hn-discussions-deep-dive | weekly Sun 18:00 | pin model if provider drift skips |
| adoption-tracker-daily | 02:00 | adoption snapshot (no TG spam) |
| ping-search-engines | ~6h | fix encoding if fails |
| backlink-outreach | 10:00 | helpful non-spam |
| commits-watcher / huggingnews | — | **PAUSED** |

## Scripts

```bash
cd C:\Users\muzai\terminalblog
git pull origin master
node scripts/content-gate.cjs --strict
node scripts/content-refresh.cjs --days 45
node scripts/quality-check.cjs
node scripts/comparison-quality.test.cjs
node scripts/site-health.cjs
node scripts/seo-learn.cjs
node scripts/orchestrator.js
node scripts/telegram-ops-digest.cjs --send
```

## After you publish

1. Gate passes  
2. Conventional commit + `git push origin master`  
3. **Only then** (if real content landed): `node scripts/telegram-ops-digest.cjs --send`  
4. Report: title, URL, words, gate result, traffic rationale  

## Do not

- Resume firehose crons  
- Ship thin multi-post news days  
- Assume Beehiiv blast works  
- Telegram deploy/health/leaderboard/SEO pings  
- `deliver: all` on content jobs  
- Force-push  
- Spam HN/Reddit  
- Pad thin posts with repeated filler sentences  

## Suggested next steps in Hermes

1. `cd C:\Users\muzai\terminalblog && git pull`  
2. Confirm gate / thin evergreen queue (`content-refresh --days 45`)  
3. Write **0–1** quality article OR expand 1–2 thin pillars  
4. Fix `ping-search-engines` encoding if still red  
5. Pin HN deep-dive model if skipped  
6. Ops-digest only after real article changes  

## Last verified

- Live: no leaderboard Cost column; kilo-vs-pi clean of generator meta  
- Comparisons: 107/107 gate; quality tests pass  
- Telegram: mute policy on GHA + `telegram-notify` blocklist  
- Site health (when last run): 8/8 endpoints  
