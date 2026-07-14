# When do new posts appear on terminalblog?

## Short answer

**Few brand-new URLs right now is deliberate.** We paused the thin “just-shipped” firehose so the homepage is not flooded with low-value commit roundups. Quality work updates **existing** comparison URLs rather than inventing parallel slugs.

## What is paused

| Automation | Status | Why |
|------------|--------|-----|
| Hermes `github-commits-watcher` | **Paused** | Just-shipped multi-posts hurt SEO trust |
| Hermes `huggingnews-roundup` | **Paused** | Thin multi-posts |
| Just-shipped daily caps | **0 / day** | Content policy |

## What still produces (or can produce) new posts

| Source | Schedule | What you get |
|--------|----------|----------------|
| Hermes **blog-article-generator** | Daily **15:00** local (when gateway + model healthy) | **At most 1** long-form quality article if the content-gate allows |
| Hermes **article-quality-improver** | Daily **04:00** | Updates **existing** evergreen posts (`updatedDate`), not necessarily new URLs |
| Hermes **github-issues-watcher** | Daily **16:00** | ≤1 Beware/security post when signal is real |
| Hermes **hn-discussions-deep-dive** | Weekly Sun **18:00** | Deep dive when model is pinned (may skip on config drift) |
| GitHub Actions **Weekly Newsletter** | Mon **14:00 UTC** | Site digest page `/blog/coding-agent-weekly-…` + RSS |

## When will you see something new on the homepage?

1. **Next quality article:** after the next successful `blog-article-generator` run that passes `content-gate` (target: once per day max, often fewer if gate blocks thin topics).
2. **Next weekly digest:** next Monday GHA newsletter job (or on-demand).
3. **Comparison work:** rewrites **change existing pages** (e.g. `/blog/kilo-vs-pi-dot-dev/`) — they do **not** look like “new posts” in a firehose, but the content and `updatedDate` refresh for SEO.

If nothing new appears for several days: check Hermes gateway is running, article generator last status (`hermes cron list`), and content-gate daily caps / quality floor.

## Operator policy

- Prefer **one strong URL** over ten thin ones.
- Prefer **update + `updatedDate`** over new near-duplicate slugs.
- Firehose stays off until a human re-enables those crons on purpose.
