# Agent Adoption Tracker — Implementation Plan

## What This Is

A live, auto-updating **open-source** leaderboard that tracks multi-signal adoption:

- Package usage: **npm + PyPI** (pypistats → pepy.tech fallback)
- GitHub: stars, forks, **commits (30d)**, **issues opened (30d)**, open issues
- Social (optional): **Reddit subscribers**, **X followers** (syndication; best-effort)
- **Value score** = adoption ÷ price_index (free/BYO scores higher for same adoption)

Closed-source tools (Cursor, Claude Code product, Amp, Copilot, etc.) are **excluded** from the main board when public signals are unfair or missing. Sparse-data repos are dropped until they have ≥2 strong signals.

---

## Part 1: What We Found (Data Source Audit)

### npm Registry (free, no auth, 60 req/hr)
| Agent | Package | Weekly Downloads |
|-------|---------|-----------------|
| Claude Code | @anthropic-ai/claude-code | **9,075,756** |
| OpenCode | @opencode-ai/sdk | **6,638,229** |
| OpenClaw | openclaw | **2,154,828** |
| Codex CLI | @openai/codex-sdk | **925,881** |
| Mimo Code | @mimo-ai/cli | **33,921** |
| AmpCode | @sourcegraph/amp | **17,682** |
| Codebuff | codebuff | **1,546** |
| Goose | goose | **33** |
| Hermes | (not on npm) | — |
| Kilo Code | (not on npm) | — |

### GitHub Stars (free, no auth, 60 req/hr with token → 5000/hr)
| Agent | Repo | Stars | Forks |
|-------|------|-------|-------|
| OpenClaw | openclaw/openclaw | **382,666** | 80,309 |
| Hermes | NousResearch/hermes-agent | **213,492** | — |
| Claude Code | anthropics/claude-code | **137,527** | 22,208 |
| Codex CLI | openai/codex | **97,307** | 14,485 |
| Cline | cline/cline | **64,558** | 6,895 |
| Goose | aaif-goose/goose | **51,104** | 5,683 |
| Kilo Code | Kilo-Org/kilocode | **26,060** | — |
| Oh My Pi | can1357/oh-my-pi | **17,369** | — |
| OpenCode | opencode-ai/opencode | **13,429** | 1,723 |
| Mimo Code | XiaomiMiMo/MiMo-Code | **11,831** | 1,172 |
| Cursor | getcursor/cursor | **private/not found** | — |
| AmpCode | (not found) | — | — |
| pi.dev | (not found) | — | — |
| Gitlawb Zero | (not found) | — | — |

### PyPI (free, no auth)
| Agent | Package | Weekly Downloads |
|-------|---------|-----------------|
| Hermes | hermes-agent | **91,900** |
| Others | (minimal or not on PyPI) | — |

### Homebrew (exists for claude-code, codex, openclaw)
- Cask JSON endpoint: `https://formulae.brew.sh/api/cask/{name}.json`
- Analytics: needs different approach (HTML endpoint, not JSON)
- **Decision: Skip Homebrew for MVP.** npm + GitHub + PyPI is enough signal.

### modelgrep.com (free, no auth)
- 300+ LLM benchmarks, pricing, speed
- **Use for:** Model recommendation widget, NOT for agent adoption
- **Separate feature:** "Best model for your budget" widget using this API

---

## Part 2: Architecture

### Data Flow
```
Daily Cron (2 AM IST)
    │
    ├── Fetch npm downloads (15 packages, ~15 API calls)
    ├── Fetch GitHub stars (15 repos, ~15 API calls)
    ├── Fetch PyPI downloads (5 packages, ~5 API calls)
    │
    └── Write snapshot to src/data/adoption/snapshots/YYYY-MM-DD.json
        │
        └── Git commit + push
            │
            └── Vercel auto-builds
                │
                └── /leaderboard/ page shows latest data
```

### Storage
```
src/data/adoption/
├── config.json          # Agent → package/repo mappings (manual config)
├── snapshots/
│   ├── 2026-07-12.json  # First snapshot (today)
│   ├── 2026-07-13.json  # Day 2
│   └── ...              # Keeps last 90 days (13 weeks)
```

### Snapshot Format
```json
{
  "date": "2026-07-12",
  "fetched_at": "2026-07-12T02:00:00Z",
  "agents": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "npm": { "package": "@anthropic-ai/claude-code", "weekly_downloads": 9075756 },
      "github": { "repo": "anthropics/claude-code", "stars": 137527, "forks": 22208 },
      "pypi": null,
      "computed": {
        "download_rank": 1,
        "star_rank": 3,
        "growth_score": 87.2,
        "star_download_ratio": 0.015
      }
    }
  ]
}
```

### Key Metric: Growth Score
A composite score (0-100) weighing:
- **npm downloads** (40% weight) — actual usage
- **GitHub stars** (30% weight) — community interest
- **Star/download ratio** (20% weight) — hype vs reality gap
- **Week-over-week change** (10% weight) — momentum

The **star/download ratio** is the unique story: "OpenClaw has 383K stars but only 2.2M npm downloads. Claude Code has 137K stars but 9M downloads. Which one are people actually USING?"

---

## Part 3: Pages to Build

### 1. `/leaderboard/` — Main Page
- Sortable table: Agent | npm Downloads | GitHub Stars | Growth Score | Trend
- Default sort: Growth Score (descending)
- Click column headers to re-sort
- Sparkline trend charts (last 12 weeks)
- "Hype vs Reality" section highlighting star/download divergence
- Updated daily, shows last snapshot date

### 2. `/leaderboard/[agent]/` — Agent Deep Dive
- Full history: downloads over time, stars over time
- Comparison vs average
- Related articles from terminalblog
- Data source links

### 3. Homepage Widget (sidebar)
- "Top 3 by Usage" — small card showing top 3 npm download leaders
- Links to /leaderboard/

### 4. Weekly Auto-Article (Monday mornings)
- Title: "Who's Actually Growing? AI Coding Agent Adoption Report — Week of [date]"
- Content: Biggest movers, star/download divergence stories, new entries
- Auto-generated from snapshot data
- This is the backlink magnet — unique quotable data

---

## Part 4: Implementation Steps

### Step 1: Config + Data Fetcher (1 hour)
- Create `src/data/adoption/config.json` with all agent mappings
- Create `scripts/fetch-adoption-data.cjs` — fetches all APIs, computes scores
- Test locally with real data

### Step 2: Snapshot Storage (30 min)
- Create snapshot directory structure
- Write JSON snapshot with metadata
- Git commit integration in the fetch script

### Step 3: Leaderboard Page (1.5 hours)
- `/leaderboard/index.astro` — main sortable table
- Client-side sorting (no framework needed, vanilla JS)
- Sparkline mini-charts using simple SVG
- "Hype vs Reality" section

### Step 4: Agent Detail Page (1 hour)
- `/leaderboard/[agent]/[agent].astro` — individual pages
- Historical charts
- Related articles from content collection

### Step 5: Homepage Widget (30 min)
- Add "Top by Usage" card to existing homepage
- Small, non-intrusive, links to full leaderboard

### Step 6: Daily Cron Job (30 min)
- Hermes cron job: runs `scripts/fetch-adoption-data.cjs`
- Commits + pushes snapshots
- Auto-deploys via Vercel

### Step 7: Weekly Article Cron (1 hour)
- Hermes cron job: Monday mornings
- Reads last 7 snapshots, generates article
- Highlights movers, divergence stories
- Publishes like other cron articles

### Step 8: Launch Article (1 hour)
- "We tracked every AI coding agent's real usage for a week. Here's what we found."
- First set of data, surprising findings
- This is the PR seed — submit to HN, Reddit, Dev.to

**Total: ~7 hours of work**

---

## Part 5: What I Need From You

### 1. GitHub Token
Your existing `gh auth token` works. It has 5000 req/hr authenticated vs 60 unauthenticated. Enough for 15 repos × daily = 450 calls/day.

**No separate account needed.** The fetch script uses the same token already in your environment.

### 2. Decisions to Make

| Question | Options | My Recommendation |
|----------|---------|-------------------|
| Weekly article auto-publish? | Auto / Review first | **Auto** — speed matters more than polish at this stage |
| Leaderboard default sort? | Growth Score / Downloads / Stars | **Growth Score** — most interesting, shows momentum |
| Show all 15 agents or only those with data? | All / Only with data | **Only with data** — 10 agents have real data, 5 don't |
| Include Cursor? | Yes (estimate) / No | **No** — private repo, can't track stars. Mention in articles but not leaderboard |

### 3. No Other Accounts Needed
- npm: free, no auth
- GitHub: use your existing token
- PyPI: free, no auth
- No Homebrew for MVP

---

## Part 6: Timeline

| Phase | What | When |
|-------|------|------|
| **Today** | Write plan (done), create config, build fetcher | Now |
| **Today** | Build leaderboard page, test locally | Next 3 hours |
| **Today** | Set up daily cron, first snapshot | After build |
| **Tomorrow** | Homepage widget, weekly article cron | Day 2 |
| **Day 3** | Launch article, submit to HN/Reddit | Day 3 |
| **Week 2** | First weekly article auto-publishes | Day 8 |

---

## Part 7: Why This Beats More Articles

| Approach | Backlinks Generated | DR Impact | Effort |
|----------|-------------------|-----------|--------|
| 10 more comparison articles | ~0 | None | 10 hours |
| Agent Adoption Tracker | 5-20 from newsletters/Reddit | DR 5-10 in 2 months | 7 hours |

The tracker produces **unique, quotable data**. Articles are commodity. Data is scarcity.

"OpenClaw has 383K GitHub stars but Claude Code has 4x the npm downloads" — that's a tweet that gets 500 impressions. Your comparison articles get 0.
