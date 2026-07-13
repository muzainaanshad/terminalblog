## terminalblog / Hermes (read first)

Before any content work:

1. [docs/HERMES-SESSION-HANDOFF.md](docs/HERMES-SESSION-HANDOFF.md) — current autopilot state (2026-07-14)
2. [docs/AUTOPILOT.md](docs/AUTOPILOT.md) — GHA + Telegram + Beehiiv map
3. [docs/content-policy.md](docs/content-policy.md) — quality floors, firehose OFF

Hermes = content factory. GitHub Actions = ops + Telegram. Do not resume paused firehose crons.

## Content policy (mandatory for posts)

Read and follow:

- [docs/content-policy.md](docs/content-policy.md) — caps, one story one URL, off-niche rules
- [docs/distribution-playbook.md](docs/distribution-playbook.md) — X / HN / newsletter
- [docs/gsc-ops.md](docs/gsc-ops.md) — Search Console & IndexNow
- [docs/channels-and-email.md](docs/channels-and-email.md) — Beehiiv/RSS, Hermes vs GHA

Before publishing any new MDX:

```bash
npm run content-gate:strict
# or for one file:
node scripts/content-gate.cjs src/content/blog/your-post.mdx --strict
```

Daily caps: **just-shipped = 0** (paused); max **3 new posts/day**; prefer **updates** (`updatedDate`) over new URLs. Floors: ≥600w any, ≥1000w evergreen/guide/beware.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
