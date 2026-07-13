# terminalblog content policy

Purpose: grow traffic with **trustworthy, durable coverage** of AI coding agents — not volume for its own sake.

## One story, one URL

- Never publish 2–4 rewrites of the same news item with different slugs.
- Prefer updating an existing post (`updatedDate`) over a new URL.
- Near-duplicates are rejected by `node scripts/content-gate.cjs --strict`.

## Daily caps (automation)

| Type | Max / day | Notes |
|------|-----------|--------|
| just-shipped / commit roundups | **3** | Prefer one multi-agent digest |
| All new posts | **8** soft | Deep posts > firehose |
| just-shipped word count | **≥ 400** | Else batch into weekly digest |

## What we publish (priority order)

1. **Security / Beware** — GitHub issues with repro, mitigations, blast radius  
2. **Comparisons & pricing** — data, tables, real tradeoffs  
3. **Workflow / AGENTS.md / MCP** — practical operator guides  
4. **Adoption / leaderboard** — charts from real npm/GitHub stats  
5. **Just-shipped digests** — batched, not one post per repo hour  
6. **Industry** — only if it affects coding-agent operators; use `tool: industry`

## Off-niche

Do **not** lead homepage with trading bots, pure image models, or general AI gossip.  
If kept, tag `tool: industry` and `tags: [industry, news]` — they appear under Industry, not hero.

## Attribution & money

- Human editor: Anshad (`/about`)
- AI personas are writers, not sole authority
- Affiliate links (e.g. aiFiesta) require disclosure on the post (auto-shown when detected)

## Pre-publish checklist

```bash
node scripts/content-gate.cjs path/to/draft.mdx --strict
node scripts/quality-check.cjs
```

## Distribution (not optional)

After a **pillar** or **Beware** post ships:

1. X thread (problem → evidence → fix → link)  
2. Optional HN only if original research  
3. Newsletter / digest weekly (not every post)  
4. `node scripts/ping-search-engines.cjs` after deploy  

See [distribution-playbook.md](./distribution-playbook.md).
