# Reddit Post for r/ClaudeAI

## Title
**Claude Code Still Hides Your Rate-Limit Headroom — GitHub Issue #77018 Asks Anthropic to Expose It for Headless Runs**

## Body
A fresh GitHub issue in the Claude Code repo (#77018) asks Anthropic to expose rate-limit utilization in headless contexts — via `stream-json`, `--output-format json`, or a dedicated usage subcommand.

**The problem:** In interactive sessions, you get subtle cues — slower responses, a warning, a soft block. In headless runs (cron jobs, CI pipelines, long background agents), those cues disappear. The agent keeps issuing requests until it hits a hard limit and stops, often mid-task, with no clean signal about how close it was to the edge.

Exposing utilization (the issue proposes a `used_percentage` field) would let automation make decisions: back off, queue work, or hand a task to a different model when one is saturated.

**Why headless matters more now:** Headless and background agents are no longer edge cases. The same workflows that promote heavier weekly limits also push more work into unattended runs — and unattended runs are precisely where you can't watch the meter.

**What the rate-limit headers actually contain:** When you hit the Anthropic API directly, the response includes `anthropic-ratelimit-requests-limit`, `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-limit`, and `anthropic-ratelimit-tokens-remaining`. Claude Code's CLI strips these entirely — you only see them if you proxy through mitmproxy.

**Workarounds that actually work today:**
1. **Token-counting wrapper** — Use `tiktoken` or Anthropic's `count_tokens` endpoint to estimate request size before sending. Track cumulative tokens per rolling window and pause at 80% of tier limit.
2. **Request pacing with jitter** — Insert `sleep(random(500, 2000))` between agent steps. Prevents most burst-limit hits.
3. **Circuit-breaker pattern** — Wrap CLI calls to catch `429`, extract `retry-after`, back off exponentially.
4. **Multi-model fallback** — When Claude hits limits, route to GPT-4o, Gemini, or local model via Ollama. Hermes and OpenCode support this natively; Claude Code needs a thin orchestration layer.
5. **Usage dashboard sidecar** — Cron that queries Anthropic usage API (`/v1/organizations/{org_id}/usage`) and exposes `/metrics` for agents to poll.

**How other agents handle this:**

| Agent | Headless utilization signal | Fallback strategy |
|-------|----------------------------|-------------------|
| **Claude Code** | None (issue 77018 open) | Manual wrapper required |
| **OpenCode** | `--model` flag + provider routing | Built-in multi-provider |
| **Codex** | Cloud execution = server-side limits | Per-task billing, no local quota |
| **GitHub Copilot CLI** | `--format json` includes quota | Tied to GitHub seat |
| **Hermes** | `hermes usage` subcommand + cron | Multi-provider routing built-in |

**The cost of silence:** A team running 3 parallel Claude Code agents in CI for 8 hours/day burns through a Tier 3 limit (~100k tokens/min) in under 2 hours if they don't pace. At $15/million tokens (Sonnet 4), that's ~$180/day in pure token cost — but the real cost is the 45 minutes of stalled CI runs per day when agents hit the wall mid-task.

Full write-up with FAQ and related articles: https://terminalblog.com/blog/claude-code-rate-limit-utilization/

---

*What's your current workaround for headless rate limits? Token counting wrapper? Pacing? Curious what's working in production.*