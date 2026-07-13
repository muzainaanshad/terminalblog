## Content policy (mandatory for posts)

Read and follow:

- [docs/content-policy.md](docs/content-policy.md) — caps, one story one URL, off-niche rules
- [docs/distribution-playbook.md](docs/distribution-playbook.md) — X / HN / newsletter
- [docs/gsc-ops.md](docs/gsc-ops.md) — Search Console & IndexNow

Before publishing any new MDX:

```bash
npm run content-gate:strict
# or for one file:
node scripts/content-gate.cjs src/content/blog/your-post.mdx --strict
```

Daily caps: **≤3 just-shipped**, soft **≤8 posts/day**. Prefer digests over firehose.

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
