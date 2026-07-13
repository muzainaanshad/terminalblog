# Distribution playbook

SEO alone is slow. Ship **distribution with every high-signal post**.

## Channels (priority)

| Channel | When | Cadence |
|---------|------|---------|
| **X / @terminalblog_en** | Every pillar + Beware | Daily insight or chart |
| **RSS + CLI** | Always on | Passive promotion |
| **Newsletter** | Weekly digest | 1× / week (not every post) |
| **Hacker News** | Original research / security only | ≤1–2 / week |
| **Reddit** | Answer first, link second | As relevant |
| **dev.to** | Crosspost pillars with canonical | Selective |

## Post types → distribution

| Type | X | HN | Newsletter | Notes |
|------|---|----|------------|-------|
| Beware / security | Thread | Maybe | Yes | Evidence + mitigations |
| Pillar guide | Thread | Rarely | Yes | Evergreen CTA |
| Leaderboard move | Chart image | No | Yes | Embed: `/embed/leaderboard/` |
| just-shipped | Skip or digest | No | Digest only | Do not spam |
| Industry off-niche | Skip homepage push | No | No | Tag industry only |

## X thread template (Beware)

1. Hook: failure mode in one sentence  
2. Evidence: issue # / version  
3. Why it matters (blast radius)  
4. What to do now (3 bullets)  
5. Link to full post  

## HN rules

- Only if **original synthesis** or first clear writeup of a serious issue  
- No “just shipped N commits”  
- Engage in comments honestly  

## Weekly ops (30 min)

```bash
# 1. Content gate (should already pass in CI)
node scripts/content-gate.cjs

# 2. Optional leaderboard snapshot for social
node scripts/fetch-adoption-data.cjs
node scripts/gen-weekly-leaderboard-note.cjs

# 3. After deploy
node scripts/ping-search-engines.cjs
```

## Embed code (backlinks)

```html
<iframe
  src="https://terminalblog.com/embed/leaderboard/"
  title="AI coding agent leaderboard"
  width="100%"
  height="420"
  style="border:0;border-radius:8px;overflow:hidden"
  loading="lazy"
></iframe>
<p>Data: <a href="https://terminalblog.com/leaderboard/">terminalblog leaderboard</a></p>
```

## Newsletter setup

1. Create Beehiiv or Buttondown list “Coding Agent Weekly”  
2. Set env `PUBLIC_NEWSLETTER_ACTION` to the form POST URL  
3. Redeploy — homepage form activates  
