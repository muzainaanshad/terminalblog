# Email + social channels (free / low-spam)

## Email alternatives to Beehiiv (API send free/generous)

Your Beehiiv plan **cannot** Create/Send posts via API (Enterprise only). Subscribe collection works.

| Provider | Free tier (approx) | Auto-send API | Notes |
|----------|-------------------|---------------|--------|
| **Buttondown** | ~100 subs free | Yes (good API) | Best simple free API for digests |
| **Listmonk** (self-host) | Unlimited | Yes | Free forever; needs a VPS |
| **Resend** + custom | 3k emails/mo free | Yes | You build templates; not a full newsletter CMS |
| **Brevo** (Sendinblue) | 300 emails/day free | Yes | Marketing-ish UI |
| **Mailchimp** | Limited free | Yes | Tight free limits |
| **Substack** | Free | Weak automation | Audience on their domain |
| **Ghost (Pro free trial / self-host)** | Self-host free | Members email | Heavier |

**Recommendation if you leave Beehiiv:** **Buttondown** for simplicity, or **Listmonk** if you want unlimited free on a $5 VPS.

**If you keep Beehiiv (current):** connect **RSS** once → `https://terminalblog.com/rss.xml` so weekly site digests email automatically without Enterprise API.

## Auto-post: X vs Hacker News vs others

| Channel | Free? | Easy automation? | Spam risk | Recommendation |
|---------|-------|------------------|-----------|----------------|
| **X / Twitter** | Free + API paid tiers | Medium (API costly now) | Medium if hourly | **Best for regular** 3–5×/week: one insight + link |
| **Hacker News** | Free | Easy URL submit; hard to rank | **High if frequent** | **Rare only** — original Beware/research, ≤1–2/week max |
| **Reddit** | Free | Easy but bans bots | High if promotional | Human-like value posts only |
| **dev.to** | Free | Easy crosspost + canonical | Low–medium | Good for pillars with `canonical_url` |
| **LinkedIn** | Free | Manual / limited API | Medium | Fine for career/ops angles |
| **Telegram channel** | Free | Easy bot post | Low | Mirror ops + public channel optional |

**"Scweet"** (Twitter scraping) is for *reading* tweets, not posting — not a distribution channel.

### Practical free stack (not spammy)

1. **Weekly email** via Beehiiv RSS (or Buttondown later)  
2. **X** 3×/week: security tip / leaderboard delta / one guide (not every post)  
3. **HN** only for original security writeups with evidence  
4. **dev.to** for pillars only  

---

## Hermes crons vs GitHub Actions

You have **both**:

### Hermes (local gateway, `terminalblog` / legacy `seo-ai-blog` workdir) — content factory

| Job | Schedule | Role | Status after retune |
|-----|----------|------|---------------------|
| blog-article-generator | daily 15:00 | Long-form quality articles | **Quality rewrite, once/day** |
| article-quality-improver | daily 04:00 | Expand/update evergreen | **Uses content-refresh** |
| github-issues-watcher | daily 16:00 | Beware security | **1 max, 900w+** |
| hn-discussions-deep-dive | Sun 18:00 | Deep analysis | **Weekly, 1200w+** |
| adoption-tracker-daily | 02:00 | Leaderboard data | Active |
| ping-search-engines | every 6h | Sitemap ping | Active (script encoding issue to fix) |
| github-commits-watcher | was every 3h | Just-shipped firehose | **PAUSED** |
| huggingnews-roundup | was every 6h | Thin multi-posts | **PAUSED** |
| backlink-outreach | 10:00 | SEO outreach | Active |

### GitHub Actions (cloud) — ops + Telegram

| Job | Schedule |
|-----|----------|
| Site Health | every 6h → Telegram |
| Leaderboard Snapshot | daily 12:00 → Telegram |
| SEO Learn | Mon 06:00 → Telegram |
| Weekly Newsletter | Mon 14:00 → Telegram |
| Content Refresh Queue | Wed 05:00 → Telegram |
| Deploy Notify | on push → Telegram |

**Together:** Hermes writes/updates content; GitHub Actions measures, digests, deploys notify, and messages you.
