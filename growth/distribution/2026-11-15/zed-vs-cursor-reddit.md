# Reddit Post for r/ClaudeAI / r/cursor

**Title:** Zed vs Cursor: which should be your daily driver? (Decision memo, not feature dump)

**Body:**

Stop reading feature lists. Here's the decision memo for teams choosing between Zed and Cursor.

**Quick Verdict:** **Cursor** for most teams — mature Composer, massive extension ecosystem, proven in production. Keep **Zed** as a specialist when you need native performance, real-time collaboration, or BYOK model freedom.

**What each is for:**
- **Zed** = Native AI-first editor (Free + BYOK). Speed, collaboration, model freedom.
- **Cursor** = AI-native VS Code fork ($20-200/mo). Daily interactive coding, Composer workflows.

**Feature Matrix:**

| Capability | Zed | Cursor |
|------------|-----|--------|
| Vision / screenshots | No | No |
| Cron / scheduling | No | No |
| Multi-provider routing | Yes (BYOK) | No |
| Git integration | Yes | Yes |
| Plugins / skills | Limited (growing) | Full VS Code marketplace |
| Subagents / teams | Yes (v1.22+) | Yes |
| Background tasks | Yes | Yes |
| Local-first | Yes | No |

**Pricing reality:** Zed is free (BYOK — you pay model providers directly). Cursor is $20-200/mo. Model **your** spike week (tokens × retries × seats).

**Zed's BYOK:** Since v1.21, works for all models — GPT-6 Astra/Sol/Luna, Claude Opus 5.5, Gemini, and any OpenAI-compatible endpoint. No config needed, just paste keys.

**Can you run both?** Yes. Use separate worktrees or clones so they never write the same files concurrently.

Full comparison with SWE-bench data and decision guide: https://terminalblog.com/blog/zed-vs-cursor/

---

*Cross-posted from terminalblog.com (canonical URL)*