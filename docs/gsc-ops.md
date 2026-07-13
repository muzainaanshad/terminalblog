# Google Search Console & indexing ops

## One-time setup

1. Open [Google Search Console](https://search.google.com/search-console)  
2. Property: `https://terminalblog.com` (URL-prefix or domain)  
3. Verification is already in site meta (`google-site-verification` in Layout)  
4. Submit sitemap: `https://terminalblog.com/sitemap-index.xml`  
5. Also submit Bing Webmaster with the same sitemap  

## After each production deploy

```bash
node scripts/ping-search-engines.cjs
```

Pings Google, Bing, and IndexNow (`public/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.txt` key file must stay published).

## Weekly monitor (15 min)

| Check | Action if bad |
|-------|----------------|
| Coverage → Not indexed | Inspect URL; fix soft-404 / noindex mistakes |
| Pages with 301s | Confirm redirect targets 200 |
| Queries | Double-down on pillar pages ranking |
| Duplicate without user-selected canonical | We use 301s + one URL — delete extra MDX |

## Soft-404 prevention

- Thin just-shipped posts: blocked by content-gate  
- Empty tool hubs: only real agents  
- Tag pages with &lt;3 posts: `noindex, follow`  

## 301 inventory

Managed in `vercel.json`. When you delete a post, keep the redirect.

## Manual URL inspection (after big SEO change)

Inspect:

- `/` (title/meta)  
- `/blog/coding-agent-security-checklist-2026/`  
- `/blog/best-coding-agents-2026-decision-guide/`  
- `/leaderboard/`  
- One redirected URL (should 308/301 to canonical)  
