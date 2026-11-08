# HN Comment Draft

## Context
Four browser-first AI coding agents compared: Bolt.new, Replit Agent, v0.dev, Lovable. The key distinction: browser agents own the environment for you (file tree, dev server, preview, deploy), while terminal agents assume you own the environment.

## Comment
This comparison misses the forest for the trees. The real split isn't Bolt vs Replit vs v0 vs Lovable — it's **browser agents vs terminal agents**.

Terminal agents (Cursor, Claude Code, Codex, Zed) assume you bring the repo, the terminal, the deployment pipeline. The agent helps you *inside* your world.

Browser agents give you the world: file tree, running dev server, live preview, one-click deploy, zero local deps. Trade-off: you lose git history, local debugging, offline work, full stack control. Gain: idea → URL in 3 minutes.

The comparison table in the article is useful but the "which to pick" framing is wrong. They're not interchangeable — they're different *categories of workflow*:

- **Bolt.new** = disposable frontend prototypes, design validation, "show me this idea"
- **Replit Agent** = only one that's a *real* backend (Postgres, auth, secrets, cron). If you need a working SaaS today, this is the only browser option that isn't a toy.
- **v0.dev** = designer handoff tool. Generates shadcn/UI that doesn't look like AI garbage. Frontend only.
- **Lovable** = non-technical founder path. Natural language → SaaS skeleton. Supabase backend. You trade control for "it just works."

The article's verdict table at the end gets this right. But the headline comparison obscures the architectural difference.

Full write-up: https://terminalblog.com/blog/browser-ai-coding-agents-bolt-replit-v0-lovable/

What's your actual use case? Prototype → Bolt. Real app → Replit. Designer → v0. Founder → Lovable. Terminal dev → stick with Cursor/Claude Code.