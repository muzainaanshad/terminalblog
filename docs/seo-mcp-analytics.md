# Continuous SEO + analytics learning

Goal: every week, **data tells you what to write/fix next** — not gut feel.

## What we already automated (no Google account needed)

```bash
npm run seo:learn
# → docs/seo-learnings/YYYY-MM-DD.md
# → seo-learnings-latest.json
```

This combines:

- Content gate (duplicates, just-shipped caps)
- Historical debt (thin pages, bad `tool:` tags)
- Pillar inventory
- Optional GSC query data (if credentials present)

## Beehiiv newsletter (done in code)

| Piece | Location |
|-------|----------|
| Subscribe API | `POST /api/newsletter` |
| Env vars | `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` (Vercel encrypted) |
| UI | Homepage `#newsletter` form |

**Never put the Beehiiv API key in frontend code.**

## Google Search Console (strongest SEO signal)

### One-time setup

1. GSC property for `https://terminalblog.com/` (you said sitemap is already in).
2. Create a Google Cloud project → enable **Search Console API**.
3. Create a **service account** → download JSON key.
4. In GSC → Settings → Users → add the service account email as **Full** user.
5. Locally / CI:

```bash
# path to the JSON key file
export GOOGLE_APPLICATION_CREDENTIALS=/secure/path/gsc-sa.json
export GSC_SITE_URL=https://terminalblog.com/

npm i -D googleapis
npm run seo:learn
```

6. On Vercel (optional cron): store the JSON as a secret file or base64 env `GSC_SA_JSON_BASE64` (extend script if you want CI).

### What you get

- Top queries + pages (28 days)
- **CTR opportunities** (high impressions, low CTR, position ≤ 20)
- Written into `docs/seo-learnings/` as concrete rewrite tasks

## Google Analytics 4 (optional second signal)

1. GA4 property → Admin → Property access → add same service account.
2. Enable **Google Analytics Data API**.
3. Set `GA4_PROPERTY_ID=properties/123456789`.
4. Future extension: landing-page bounce / engagement in `seo-learn.cjs`.

Site already has gtag `G-G9YFDJFKD3` in Layout.

## MCP options (for your agents / IDE)

These are **not** magic SEO — they are connectors your coding agent can call:

| Integration | Purpose | How |
|-------------|---------|-----|
| **GSC via service account + script** | Best continuous learning | `seo-learn.cjs` above |
| **Vercel MCP / CLI** | Deploy status, env | You already use PAT |
| **GitHub MCP** | Issues for “expand this thin post” | Create issues from debt report |
| **Browser MCP / Playwright** | Spot-check titles, redirects | Manual or e2e |
| **Filesystem MCP** | Read `seo-learnings-latest.json` | Point agent at that file every session |

### Recommended agent workflow (weekly)

1. Run `npm run seo:learn` (cron or manual).  
2. Open `docs/seo-learnings/latest` file for today.  
3. Agent prompt: *“Implement the P0 actions in docs/seo-learnings/TODAY.md — rewrite titles, fix internal links, do not add just-shipped posts.”*  
4. Run `npm run content-gate:strict` before merge.  
5. Deploy → `npm run ping-seo`.

### Optional GitHub Action (sketch)

```yaml
# .github/workflows/seo-learn.yml
on:
  schedule: [{ cron: '0 6 * * 1' }]  # Mondays
  workflow_dispatch:
jobs:
  learn:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run seo:learn
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GSC_SA_PATH }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: weekly SEO learnings'
```

(Wire secrets carefully; prefer storing the SA JSON as a secret file.)

## What NOT to do

- Do not paste GSC/Beehiiv/Vercel tokens into MDX or client JS.  
- Do not auto-publish new posts from GSC without the content gate.  
- Do not chase every impression — prefer **coding-agent intent** queries.

## Historical debt vs learnings

| Concept | Meaning |
|---------|---------|
| **Historical debt** | Old thin/mis-tagged posts already on the site |
| **SEO learnings** | What to fix *next* based on debt + GSC |

Clear debt with:

```bash
node scripts/clear-historical-debt.cjs           # see numbers
node scripts/clear-historical-debt.cjs --fix-tools
node scripts/clear-historical-debt.cjs --archive-thin
```
