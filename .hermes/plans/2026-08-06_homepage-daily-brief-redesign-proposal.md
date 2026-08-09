# TerminalBlog Homepage Redesign Proposal — "The Daily Brief"

> **Status:** Proposal — no implementation yet.
> **Date:** 2026-08-06
> **Vision:** TerminalBlog becomes the fastest way for developers to stay up to date with AI coding — in under five minutes a day. The homepage stops being a blog index and becomes a daily dashboard/briefing.

---

## 1. Current State Review

### 1.1 Homepage inventory (in render order)

| # | Section | What it does today | Verdict |
|---|---------|-------------------|---------|
| 1 | Header + stats bar | Brand h1, `19 agents · 359 articles` | **Static** — counts barely change daily, gives no freshness signal |
| 2 | Status panel ("live feed") | Terminal panel with rotating **hardcoded** status lines + infinite ticker of fake personas (`kira_bug_hunter`, `dev_explorer`…) | **Fake** — claims "LIVE FEED" but nothing is live. Biggest credibility gap |
| 3 | Tag nav (12 pills) | Topic filter row | **Keep** — good scanner |
| 4 | Hero | Latest post with "LATEST" badge + desc + tags | **Weak** — latest ≠ most important. No "why it matters" framing |
| 5 | Inline newsletter bar | Kit capture | **Keep**, reframe copy |
| 6 | Start here (pillars, 4) | Evergreen SEO money pages | **Keep**, move down |
| 7 | Latest feed (8) | Chronological date·tags·title list | **Flat** — no today/yesterday grouping |
| 8 | Spotlight grid (3) | Next 3 posts as cards | **Duplicative** — same posts as Latest/Trending |
| 9 | Industry (4) | Off-niche noise, gated | **Keep** but compress |
| 10 | Comparisons (4) | Evergreen "X vs Y" | **Keep**, compress |
| 11 | Opinion (4) + Trending (5) | Two-col lists | **"Trending" is mislabeled** — it's just recent non-hero posts, no engagement data |
| 12 | Newsletter block | Weekly digest capture ("Coding Agent Weekly") | **Keep**, align copy with daily brief |
| 13 | Agents table (collapsed) | 19-agent comparison matrix | **Keep** — destination value |
| 14 | Top by Usage (3 cards) | Real adoption data (npm/stars/growth score from daily snapshots) | **Best section on the page** — the only genuinely live element. Build on this |
| 15 | CLI box + badges | `npx terminalblog` + directory badges | **Keep** |

**Content inventory available (359 posts):** guide 122 · comparison 118 · claude-code 81 · security 58 · opinion 56 · beware 37 · news 24 · pillar 18 · pricing 10 · mcp 12 · roundup/weekly 4. Tools: claude-code 67, industry 56, hermes 41, codex 22, cursor 14, opencode 14, goose 8… Cadence: ~31 posts/30d (~1/day), plus daily adoption snapshots (`src/data/adoption/snapshots/*.json`).

### 1.2 What already works (do not break)

- **Terminal identity** — the brand itself matches the "fast, dense, scannable" promise. Keep the aesthetic.
- **Top by Usage** — real, daily-updated data. This is the seed of the daily-return habit.
- **Agents table / leaderboard** — destination value that keeps the site an authority hub.
- **Tag taxonomy + tool pages** — the SEO engine. Untouched.
- **Newsletter capture (Kit)** — working infra; re-point the copy.
- **Content pipeline** — 5-source orchestrator already produces fresh posts + weekly roundups + adoption snapshots. The homepage redesign consumes this; the pipeline doesn't change.
- **Coding Agent Weekly roundup format** — a proven digest post type already exists; the daily brief extends the same idea.

### 1.3 What works against the new positioning

1. **The "live feed" is fake.** Hardcoded rotating lines and canned persona ticker claim liveness the site doesn't have. A daily-briefing product dies on fake freshness — visitors check once, notice nothing changes, never return.
2. **No time hierarchy.** "Latest" mixes posts from today, yesterday, and 5 days ago without grouping. A returning user can't answer "what's new since yesterday?" in one glance.
3. **Hero = latest, not biggest.** The most important story of the day gets the same visual weight as any release note.
4. **"Trending" is mislabeled.** It's `homepagePosts` minus hero — recency, not popularity. Same for Spotlight: it shows posts 2–4, which also appear in Latest and Trending. The same 5 posts surface 2–3 times.
5. **Seven content sections below the fold** (pillars, latest, spotlight, industry, comparisons, opinion, trending) → scanning fatigue, no clear read order. The 5-minute brief is buried.
6. **Stats bar is static** (`19 agents · 359 articles`) — no freshness proof, no "today" signal.
7. **No brief format.** Everything is a full-article title. The promise "under 5 minutes" has no visible fulfillment mechanism.
8. **Welcome modal + exit popup + sticky bar** compete with the brief. Capture is fine, but they must not sit on top of the daily scan.

---

## 2. Proposed Structure — "The Daily Brief" Dashboard

One rule drives everything: **above the fold = today's briefing (5 minutes). Below the fold = depth (evergreen + authority).** Every above-the-fold section must change daily or honestly state when it last changed.

### 2.1 New homepage order (top → bottom)

```
┌──────────────────────────────────────────────────────────┐
│ terminalblog ▊     19 agents · 359 articles · updated 2h ago │  ← freshness line (was static stats)
├──────────────────────────────────────────────────────────┤
│ ⚡ REAL SIGNAL TICKER (was fake status panel)               │
│ Claude Code v2.1.220 · 2h ago │ Cline v4.1.0 · 1d ago │…   │
│ (from adoption snapshots + recent posts; honest if quiet)  │
├──────────────────────────────────────────────────────────┤
│ [guide] [comparison] [security] [beware] [news] [all →]     │  ← tag nav (kept)
├──────────────────────────────────────────────────────────┤
│ ┌─ TODAY'S BIGGEST UPDATE ──────────────────────────────┐ │
│ │ LATEST · Aug 4 16:00                      [security]  │ │
│ │ Title: Model Musical Chairs: …                       │ │
│ │ 60-word why-it-matters brief. (desc reused)          │ │
│ │ read the breakdown →                                 │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌─ QUICK BRIEFS  (3–5 cards, one tap each) ────────────┐ │
│ │ ▸ Qwen3.8-Max ships 2.4T params, open weights…  12:00 │ │
│ │ ▸ Beware: OAuth grant survives global logout…   12:00 │ │
│ │ ▸ Aider v0.86 adds GPT-5, Grok-4…               10:00 │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌─ THE DAILY BRIEF, IN YOUR INBOX ──────────────────────┐ │  ← newsletter (reframed copy)
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ THIS WEEK  (Today · Yesterday · Earlier)                  │  ← grouped latest (replaces flat Latest)
├──────────────────────────────────────────────────────────┤
│ SECURITY WATCH  (beware/security, newest first)           │  ← new, from existing tags
├──────────────────────────────────────────────────────────┤
│ TRENDING TOOLS  · full leaderboard →                      │  ← Top by Usage + MOVERS (real deltas)
│ #1 Codex 17.2M npm/wk · 104K ★  ▲2.1   #2 OpenClaw…       │
│ MOVERS THIS WEEK: OpenClaw +4.2 · Mimo +1.8               │
├──────────────────────────────────────────────────────────┤
│ Start Here (pillars) · Comparisons · Opinion              │  ← evergreen, compressed
│ Agents table (collapsed) · CLI box · badges               │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Section-by-section rationale

**1. Freshness line (replaces static stats).**
*Why:* The #1 proof a news product is worth returning to is "it changed since I was here." `updated 2h ago` + `N stories today` is a stronger return hook than `359 articles` (which never moves). Keep the agent/article counts as secondary, static facts.
*Reuse:* nothing new needed — compute from newest `pubDate`/`updatedDate` + adoption snapshot `fetched_at`.

**2. Real signal ticker (replaces fake status panel).**
*Why:* The terminal aesthetic is the brand, and the "live feed" concept is right — it was just faked. Convert it to real data: newest releases/signals with relative timestamps from the daily adoption snapshots and recent post frontmatter. If nothing changed in 24h, the ticker says so ("no new signals — last update 26h ago"). Honesty is the product.
*Reuse:* adoption snapshots (daily), post frontmatter. Drop the fake personas entirely (they also leak pipeline vibes, which the site's invisible-sourcing rules forbid).

**3. Tag nav.** Unchanged. It's a good scanner and an SEO surface.

**4. Today's Biggest Update (hero v2).**
*Why:* The vision needs a "lead story" — the single item a busy developer must not miss today. Rank by editorial priority, not recency: **security/beware > major release/model > pricing change > community debate > news**, with a quality gate (if nothing qualifies, fall back to latest — the pipeline's SKIP logic already exists). Add a "why it matters" line — the existing `description` field (1–2 sentences) is already that; no new fields required for v1.
*Reuse:* existing hero card styles, `description` as the brief, existing tag chips.

**5. Quick Briefs (the InShorts core).**
*Why:* This is the section that fulfills the "under five minutes" promise — 3–5 tappable mini-cards of today's other updates, each with headline + 40–60-word brief (trimmed `description`) + tag + time. One tap = full article. It's the daily-scan mechanic that a flat list can't provide, and it reuses content that already exists — no new writing pipeline needed for v1.
*Reuse:* latestFeed posts, `description` trimmed, mini-card styles from Spotlight.

**6. Newsletter (reframed).**
*Why:* Align the pitch with the product: "The daily brief in your inbox" (with the weekly digest as the slower option). Same Kit forms, new copy. The vision is a daily habit; email is the retention channel for exactly that.

**7. This Week (replaces flat Latest).**
*Why:* The single highest-value change for returning users: group by **Today / Yesterday / Earlier this week**. One glance answers "what happened since I last checked." Same posts, new scannability.
*Reuse:* latestFeed logic, compact-item styles, grouped by date.

**8. Security Watch.**
*Why:* `beware` (37) + `security` (58) posts are the site's most distinctive, highest-trust content — and security news is what developers check daily. A dedicated pinned section converts an existing tag into a return hook. It also reinforces the brand: "we catch what's dangerous."
*Reuse:* tag filter on existing collection; compact-list styles.

**9. Trending Tools (upgrades Top by Usage).**
*Why:* Top by Usage is already the best section — extend it from "top 3 by absolute score" to also show **movers** (biggest score delta between the two most recent adoption snapshots). "OpenClaw +4.2 this week" is real, daily-changing, and uniquely yours (no one else publishes this data). Renaming to "Trending Tools" makes the existing mislabeled "Trending" section honest.
*Reuse:* adoption snapshots (deltas need zero new collection), top-agent-card styles.

**10. Evergreen depth (pillars, comparisons, opinion, agents table, CLI, badges).**
*Why:* These are authority/SEO surfaces, not daily content. Keep them all — just compressed and below the fold. Pillars stay as the "Start here" onboarding block; comparisons collapse to a link row; agents table stays collapsed; CLI + badges stay at the bottom. Nothing is thrown away.

---

## 3. User Flows

**A. New visitor (SEO/social arrival):**
Hero "Today's Biggest Update" → brief → (if interested) full article → scan Quick Briefs → newsletter bar ("get the daily brief") → scroll sees depth (Start Here / Trending Tools / Security Watch) → capture or leave. The page demonstrates the product in 10 seconds.

**B. Returning daily user (the target):**
Freshness line confirms "updated 2h ago" → Today's Biggest Update (≤60s) → Quick Briefs scan (2–3 min) → taps 1–2 → done in 5 minutes. Optional: Security Watch, Trending Tools movers. This is the habit loop the vision sells.

**C. Researcher/comparison shopper:**
Uses tag nav, Search, leaderboard, tool pages, agents table — all unchanged. The redesign does not touch these paths.

---

## 4. Design Rationale Summary

1. **Trust through real data.** Every element that claims liveness becomes live (ticker, trending, stats) or stops claiming it. A briefing product's #1 asset is "this is current."
2. **Time is the primary sorting key.** Today/Yesterday/Earlier + relative timestamps everywhere. Return value = change detection.
3. **The brief is the product.** 60-word units above the fold (hero brief + quick brief cards) make the "under 5 minutes" promise structurally true, not aspirational.
4. **Reuse over rebuild.** Every new section consumes existing data: descriptions → briefs, tags → sections, snapshots → ticker/movers, Kit → email. Zero new collection; one file (`index.astro`) plus small CSS changes carry 90% of the work.
5. **One page, two audiences.** Daily scanner gets everything in the first viewport; depth-seeker gets the full authority stack below. No clicks required to find today's content (current hero requires scrolling past a modal + panel).

---

## 5. Proposed Implementation Phases (for later, step-by-step — NOT started)

| Phase | Change | Files |
|---|---|---|
| 1 | Freshness line + honest stats | `src/pages/index.astro` |
| 2 | Fake status panel → real signal ticker | `index.astro` + data helper (`src/utils/`) |
| 3 | Hero → Today's Biggest Update (priority ranking + why-it-matters brief) | `index.astro` |
| 4 | Quick Briefs section | `index.astro` |
| 5 | Latest → This Week (Today/Yesterday/Earlier) | `index.astro` |
| 6 | Security Watch section | `index.astro` |
| 7 | Trending Tools: Top by Usage + movers (snapshot deltas) | `index.astro` + snapshot-delta helper |
| 8 | Compress evergreen sections (pillars/comparisons/opinion) | `index.astro` + CSS |
| 9 | Copy pass (sub, newsletter, meta description) | `index.astro`, `consts.ts` |
| 10 | Verify: build + route checks + live screenshot | `npm run build`, curl, browser |

**v2 candidates (only after v1 ships):** `brief` + `whyItMatters` frontmatter fields on new posts; standalone 60-word brief pages (SEO play); daily brief post type alongside Coding Agent Weekly.

---

## 6. Risks, Tradeoffs, Open Questions

- **Pillars/comparisons move below the fold** → possible internal-link/engagement dip on evergreen pages. Mitigation: they stay on the page and remain linked from nav, blog index, and tool pages; SEO value is not removed, only repositioned.
- **"Today's Biggest" needs editorial judgment** → if today has nothing important, fall back to newest post (quality-gate pattern already proven in the pipeline). Never force a headline.
- **Ticker/movers depend on snapshot freshness** → snapshots are daily (verified: 2026-07-29 → 08-04); if a day is missed, show honest staleness instead of empty.
- **Modal/popup clutter** → review WelcomeOverlay/ExitPopup timing so capture never blocks the brief.
- **Open question:** should the daily brief also ship as a *post type* (new SEO pages, e.g. `/brief/2026-08-06/`) or stay homepage-only in v1? (Recommendation: homepage-only first; measure; then decide.)
- **Open question:** keep the "Trending" name for the movers widget, or rename to "Movers" to avoid implying engagement data we don't have? (Recommendation: rename to Movers — honesty matches brand.)

---

*Decision needed: approve structure (sections + order), then Phase 1 begins.*
