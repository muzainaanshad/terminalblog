# HN Comment Draft

## For Hacker News (when rate-limit observability gets discussed)

**Comment:**

Claude Code issue #77018 asks Anthropic to expose rate-limit utilization in headless mode. The pain is real: interactive sessions show soft warnings as you approach limits. Headless runs (cron, CI, background agents) have no visible meter — they stall mid-task with no signal about how close they were.

When you hit the Anthropic API directly, you get `anthropic-ratelimit-requests-limit`, `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-limit`, `anthropic-ratelimit-tokens-remaining`. Claude Code's CLI strips these entirely.

**Workarounds teams use in production:**
1. Token-counting wrapper (tiktoken / count_tokens endpoint) — pause at 80% of tier
2. Request pacing with jitter — `sleep(random(500, 2000))` between steps
3. Circuit-breaker — catch 429, extract retry-after, exponential backoff
4. Multi-model fallback — route to GPT-4o/Gemini/local when Claude saturated
5. Usage dashboard sidecar — cron queries Anthropic usage API, exposes /metrics

**Comparison across agents:**

| Agent | Headless utilization | Fallback |
|-------|---------------------|----------|
| **Claude Code** | None (issue 77018 open) | Manual wrapper |
| **OpenCode** | `--model` flag + provider routing | Built-in multi-provider |
| **Codex** | Cloud = server-side limits | Per-task billing |
| **Copilot CLI** | `--format json` includes quota | GitHub seat |
| **Hermes** | `hermes usage` subcommand | Multi-provider routing |

The cost: 3 parallel agents in CI for 8hrs/day burns Tier 3 (~100k tokens/min) in <2hrs without pacing. ~$180/day token cost, but real cost is 45min stalled CI/day.

Full breakdown: https://terminalblog.com/blog/claude-code-rate-limit-utilization/

---

**Shorter thread reply:**

> Claude Code strips rate-limit headers that the Anthropic API returns. Issue #77018 asks for them in stream-json/--output-format json. Workarounds: token counting wrapper (pause at 80%), jitter pacing, circuit-breaker, multi-model fallback. OpenCode/Hermes/Copilot CLI already expose this. Cost of silence: 45min stalled CI/day for 3-agent team.