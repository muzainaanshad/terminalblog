# terminalblog AUTOPILOT map

Goal: **you do almost nothing**; GitHub Actions + Vercel + Beehiiv run the site; **Telegram** is your ops dashboard.

Bot notifications use secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

---

## A) What runs automatically today (GitHub Actions)

| Automation | Schedule (UTC) | What AI/bots do | Telegram? |
|------------|----------------|-----------------|-----------|
| **Site Health** | every 6h | Hits homepage, blog, leaderboard, embed, RSS, sitemap, newsletter API | Yes — OK/FAIL report |
| **Leaderboard Snapshot** | daily 12:00 | Fetches npm/GitHub adoption, commits snapshot if changed, leaderboard blurb | Yes — note + link |
| **SEO Learn** | Mon 06:00 | Content-gate + debt scan + seo-learn report | Yes — learnings file |
| **Weekly Newsletter** | Mon 14:00 | Builds high-signal digest, site post `/blog/coding-agent-weekly-…`, tries Beehiiv API, commits | Yes — full log |
| **Deploy Notify** | on every push to `master` | Tells you commit SHA + link (Vercel auto-deploys) | Yes |

Workflow files: `.github/workflows/*.yml`

---

## B) What Vercel does (no action needed)

| Event | What happens |
|-------|----------------|
| Push to `master` | Build Astro site → deploy `terminalblog.com` |
| Env vars | Beehiiv keys for `/api/newsletter` |
| Live subscribe | Homepage form → Beehiiv audience |

Project name in Vercel UI: **`seo-ai-blog`**.

---

## C) What Beehiiv does

| Piece | Status |
|-------|--------|
| Collect emails (site form) | **Autopilot** |
| Welcome email | Off (by design) |
| Weekly API send | **Blocked** unless Enterprise plan |
| Free email path | Connect **RSS** once: `https://terminalblog.com/rss.xml` → then weekly posts auto-email |

---

## D) Scripts AI / Actions use (you do not run these daily)

| Script | Role |
|--------|------|
| `scripts/telegram-notify.cjs` | All Telegram alerts |
| `scripts/site-health.cjs` | Live URL health |
| `scripts/seo-learn.cjs` | SEO action list |
| `scripts/content-gate.cjs` | Publish quality / caps |
| `scripts/clear-historical-debt.cjs` | Thin/bad-tag cleanup tools |
| `scripts/send-weekly-beehiiv.cjs` | Weekly digest |
| `scripts/fetch-adoption-data.cjs` | Leaderboard data |
| `scripts/gen-weekly-leaderboard-note.cjs` | Social/leaderboard blurb |
| `scripts/ping-search-engines.cjs` | Sitemap ping (can add to deploy job later) |
| `scripts/orchestrator.js` | Content signal fetch (for external AI cron if you use Hermes/etc.) |

---

## E) What is NOT fully autopilot (honest)

| Area | Why | How to close |
|------|-----|--------------|
| **AI writing new blog posts** | Still needs your content engine / Hermes / manual agents | Point external AI cron at `orchestrator.js` + content-gate; Telegram can report |
| **Beehiiv API blast** | Enterprise-only | RSS once, or upgrade plan |
| **GSC live rankings** | Needs one-time service account + share in GSC | `npm run gsc:setup:win` once, then SEO Learn uses it if credentials in Actions secrets later |
| **X / HN posting** | No autopilot bot wired | Optional future Action + API keys |
| **Approving weird content** | Safety | content-gate blocks bad firehose |

---

## F) Telegram message types you will receive

### Primary — **Ops Digest** (daily ~13:00 UTC + on-demand)

Exact format:

```
Articles Management
1- N new articles created
   • title (hyperlink)
2- N existing articles were updated
   • title (hyperlink) — short note (≤7 words)
3- N Articles deleted          ← omitted if 0
4- N New Interlinks …          ← list only if < 5

Others
1- new seo learning            ← omitted if none new
2- leaderboard updates         ← omitted if no change
3- automation errors           ← omitted if none
```

Run: `npm run telegram:digest` · script: `scripts/telegram-ops-digest.cjs`

### Secondary (keep for alerts)

1. **Health** — every 6h (or failures)  
2. **Newsletter** — Monday Beehiiv/site digest status  
3. **Deploy** — every git push to master  

---

## G) One-time setup checklist (only human minutes left)

- [x] Beehiiv API secrets on GitHub  
- [x] Telegram secrets (set by agent if tokens provided)  
- [x] Weekly + health + SEO + leaderboard + deploy workflows  
- [ ] Beehiiv RSS → `https://terminalblog.com/rss.xml` (for free email)  
- [ ] GSC service account once (for real search learnings)  
- [ ] Optional: external AI content cron using content-gate  

---

## H) Autopilot principle

```text
Internet / GitHub / Vercel
        |
   GitHub Actions (schedule)     Hermes gateway (content crons)
        |                              |
   scripts/* (measure / publish)  MDX write/update (quality-only)
        |                              |
   Telegram  <---- you only read this -+
```

You manage the product by **reading Telegram**, not by logging into Vercel/GitHub daily.

## I) Hermes awareness

Hermes loads persistent memory from `%LOCALAPPDATA%\hermes\memories\MEMORY.md` + `USER.md`.

Repo-side briefing (cron prompts also point here):

- [HERMES-SESSION-HANDOFF.md](./HERMES-SESSION-HANDOFF.md)
- [content-policy.md](./content-policy.md)
- this file
