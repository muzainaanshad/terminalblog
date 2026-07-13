# Beehiiv automation (subscribe + weekly send)

## Subscribe (live)

- Homepage form -> `POST /api/newsletter`
- Env on Vercel: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
- Success copy: **You're subscribed.**
- Welcome email from Beehiiv is **off** (`send_welcome_email: false`)

If Beehiiv still emails a confirmation link, turn off **double opt-in** in Beehiiv:

Settings -> Audience / Growth -> Double opt-in (disable if you want instant subscribe).

## Weekly automated emails

### Script

```bash
# Draft only (safe)
export BEEHIIV_API_KEY=...
export BEEHIIV_PUBLICATION_ID=pub_...
node scripts/send-weekly-beehiiv.cjs

# Create + publish/send
BEEHIIV_SEND=true node scripts/send-weekly-beehiiv.cjs
```

What it sends:

- Top posts from last 7 days (skips just-shipped noise)
- Prefers pillar / security / guide
- Link to leaderboard + embed
- HTML preview always written to `tmp/beehiiv-digest-YYYY-MM-DD.html`

### GitHub Action

File: `.github/workflows/weekly-newsletter.yml`

| Trigger | When |
|---------|------|
| Schedule | Mondays 14:00 UTC |
| Manual | Actions -> Weekly Beehiiv Newsletter -> Run workflow |

**Secrets to add** (GitHub repo -> Settings -> Secrets -> Actions):

| Secret | Value |
|--------|--------|
| `BEEHIIV_API_KEY` | your Beehiiv API key |
| `BEEHIIV_PUBLICATION_ID` | `pub_525553b2-05b5-4521-ad24-67a059d78f89` |

First runs should leave **Send = false** (creates **draft** in Beehiiv).  
When happy, re-run with Send = true, or set secret `BEEHIIV_SEND` is not used globally — use workflow_dispatch input.

Optional: change the workflow so schedule always sends:

```yaml
BEEHIIV_SEND: 'true'
```

### Enterprise vs free plan (important)

Your key returned:

`SEND_API_NOT_ENTERPRISE_PLAN` (403)

| Plan | Behavior |
|------|----------|
| Enterprise + `posts:write` | Script creates draft or confirmed send |
| Scale / free (you) | API cannot send — use **RSS free path** below |

### Free-plan automation (recommended for you)

The weekly Action **always** writes a site post:

`/blog/coding-agent-weekly-YYYY-MM-DD/`

Then Beehiiv emails it via RSS:

1. Beehiiv dashboard → **Grow / Automations / RSS** (wording varies)
2. Feed URL: **`https://terminalblog.com/rss.xml`**
3. Enable email when new items appear (or weekly)
4. Filter to titles starting with `Coding Agent Weekly` if available

Flow:

```text
Monday Action
  -> commits weekly MDX to site
  -> Vercel deploys
  -> Beehiiv RSS sees new post
  -> email goes to all subscribers
```

### Enterprise path (if you upgrade)

```bash
npm run newsletter:send   # or Action with send=true
```

## First-week checklist

1. [x] Subscribe works on site  
2. [ ] Add GitHub secrets `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID`  
3. [ ] Run **Weekly Beehiiv Newsletter** workflow once  
4. [ ] Confirm weekly MDX appears after deploy  
5. [ ] Connect Beehiiv RSS → `https://terminalblog.com/rss.xml`  
6. [ ] (Optional) Beehiiv: disable double opt-in for instant subscribe  
7. [ ] (Optional) Enterprise: enable API send with `send=true`  

