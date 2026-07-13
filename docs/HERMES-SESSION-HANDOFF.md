# Hermes session handoff (2026-07-14)

**Why this file exists:** A Grok/agent session wired full autopilot for terminalblog.com. Hermes gateway crons do not share that chat. Read this at the start of every content job.

## Mission

Grow **long-term SEO traffic** for [terminalblog.com](https://terminalblog.com) with trustworthy AI-coding-agent content. **Quality over volume.**

## Repos / paths

| Path | Role |
|------|------|
| `C:\Users\muzai\seo-ai-blog` | Hermes workdir (content factory) |
| `C:\Users\muzai\terminalblog` | Same remote; ops docs often edited here |
| Remote | `Anshad2u/terminalblog` → Vercel project **`seo-ai-blog`** |

Push `master` → Vercel auto-deploys. No manual `vercel --prod` needed.

## Who does what

| System | Owns |
|--------|------|
| **Hermes crons** | Write/update MDX, quality improve, issues/HN deep dives, adoption data, pings, outreach |
| **GitHub Actions** | Site Health (6h), Leaderboard (daily), SEO Learn (Mon), Weekly Newsletter (Mon), Content Refresh Queue (Wed), Deploy Notify (push) → **Telegram** |
| **Vercel** | Build + host terminalblog.com |
| **Beehiiv** | Collect subscribers only (API *send* is Enterprise-blocked) |

## Content hard rules

1. Run `node scripts/content-gate.cjs --strict` before writing; per-file after draft.
2. **just-shipped firehose OFF** — `github-commits-watcher` and `huggingnews-roundup` are **paused**. Do not re-enable without human OK.
3. Max **1 new article** per article-generator run; prefer **updating** existing pillars (`updatedDate`).
4. Floors: ≥600w any; ≥1000w evergreen; ≥1200w new guides; ≥900w Beware.
5. One story, one URL. No fabricated issue numbers/stats/versions.
6. Priority: Beware/security → evergreen guides → data comparisons → workflow/MCP → weekly digest only.

Full policy: [content-policy.md](./content-policy.md) · Autopilot map: [AUTOPILOT.md](./AUTOPILOT.md)

## Hermes jobs (expected)

| Job | Schedule | Expected behavior |
|-----|----------|-------------------|
| blog-article-generator | daily 15:00 | 0–1 quality post |
| article-quality-improver | daily 04:00 | Expand ≤2 thin/stale evergreen via `content-refresh` |
| github-issues-watcher | daily | ≤1 Beware, evidence-backed |
| hn-discussions-deep-dive | weekly | Deep analysis; pin model if provider drift skips job |
| adoption-tracker-daily | 02:00 | Snapshot adoption data |
| ping-search-engines | ~6h | Sitemap ping after deploys |
| backlink-outreach | 10:00 | Helpful non-spam only |
| commits-watcher / huggingnews | — | **PAUSED** |

## Email / social reality

- Beehiiv subscribe works; Create Post API → **403** on non-Enterprise (expected).
- Free email: Beehiiv RSS → `https://terminalblog.com/rss.xml` (one-time human setup).
- Weekly digest = site MDX + RSS first; API send is optional bonus.
- X: 3–5×/week; HN rare; dev.to for pillars with `canonical_url`.

## Scripts to know

```bash
node scripts/content-gate.cjs --strict
node scripts/content-refresh.cjs --days 45
node scripts/quality-check.cjs
node scripts/site-health.cjs
node scripts/seo-learn.cjs
node scripts/telegram-notify.cjs --title "..." "HTML body"
node scripts/orchestrator.js   # prefer issues/discussions over commits
```

## After you publish

1. Gate passes  
2. Conventional commit + push `master`  
3. Optional: Telegram summary if env has bot token  
4. Report: title, URL, word count, gate result, why it helps long-term traffic  

## Do not

- Resume firehose crons  
- Ship thin multi-post news days  
- Assume Beehiiv blast works  
- Force-push  
- Spam HN/Reddit  

## Last verified (on-demand demo)

Site Health **8/8**, GHA SEO Learn / Leaderboard / Content Refresh **success**, ~171 thin evergreen in refresh queue, Telegram ops live.
