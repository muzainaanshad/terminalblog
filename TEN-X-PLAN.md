# terminalblog 10x Plan — 2026-09-25 night run

## Diagnosis (from recon)

- 484 articles, 107 comparisons, working leaderboard. Build passes on Linux (452+ pages).
- **Monetization is 0%**: affiliate infra exists (/api/go/[slug] redirect with click tracking, affiliates.json, admin stats) but ZERO articles contain affiliate links. aiFiesta (10% lifetime) is active but unwired.
- **Traffic is ~0**: the site publishes news/comparison articles in a saturated niche. The content is commodity — same listicles as vellum.ai, zapier, faros.ai etc., from a site with no authority.
- **Cron engine is dying**: 13 of 31 jobs erroring (OpenRouter 429s, Nvidia overloads, a Windows-path bug). The whole automation runs on the Windows laptop which is fragile.
- **The niche gap found**: nobody owns (a) interactive decision tools ("which agent should I use?" quiz/pickers), (b) cost-calculator content ("what does Claude Code actually cost per month at my usage"), (c) config/recipes content (settings.json, AGENTS.md examples — high intent, low competition), (d) genuinely free-agent guides (free-tier stack guides — huge search demand per research).

## The 10x moves (this run)

1. **"Which Coding Agent Should I Use?" interactive picker** — a /pick page: 6-question quiz → recommendation with affiliate CTA. Linkable, shareable, zero competition. NEW PAGE.
2. **Cost calculator page** — /cost: input tokens/month + model → monthly cost across Claude/Codex/Gemini/Opencode+OpenRouter. Monetizes perfectly (aiFiesta CTA). NEW PAGE.
3. **Wire affiliate CTAs site-wide** — tasteful CTA box component, inserted into top ~40 highest-value articles (comparisons + guides) via script. /api/go/aifiesta links.
4. **AGENTS.md recipes hub** — /agents-md: curated copy-paste AGENTS.md examples per tool. High-intent, low competition, evergreen. NEW PAGE.
5. **Pillar upgrade**: "Best free AI coding agents — no credit card" mega-guide (the single highest-demand query found) — NEW PILLAR with affiliate CTAs.
6. **Automation migration prep**: clone + build verified on Linux; document Vercel deploy path so the site can run from this server, freeing it from the Windows laptop.

## Constraints respected

- No firehose, content-gate respected for MDX changes, max 3 new posts/day (we add 2 pages + 1 pillar).
- Telegram policy untouched (no cron changes tonight — the laptop's Hermes still owns those).
- No secrets touched. Git push via gh (ssh key registered).
- Worker model: opencode/big-pickle (free, no OpenRouter dependency). Hermes orchestrates only.
