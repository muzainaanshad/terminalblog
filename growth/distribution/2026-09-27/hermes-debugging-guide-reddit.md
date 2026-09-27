# Reddit Post for r/ClaudeAI (cross-post to r/opencode, r/agenticcoding)

## Title
**Your Hermes agent just went silent? Here's how to actually debug it — 5 real failure modes, Console REPL commands, and fixes (no guesswork)**

## Body
Hermes agents don't crash loudly — they stall, hang, or drift into silent failures. This guide covers the 5 real failure modes we see in production and how to diagnose each using the Console REPL instead of hope.

**The core insight: Stalls ≠ Crashes**

A crash is loud. A stall is silent. Hermes agents stall for 5 reasons (in frequency order):

| Failure Mode | Symptom | Where to Look First |
|--------------|---------|---------------------|
| **Subagent hang** | Parent waits forever on `delegate_task` | Console → Active Sessions → child status |
| **MCP server disconnect** | Tool calls time out silently | Console → Tool Calls → `mcp.*` latency |
| **Cron job drift** | Scheduled job stops reporting, no error | `hermes cron list` + job's Bot Chat |
| **Memory/context corruption** | Agent repeats, hallucinates file paths | Console REPL → `agent.memory.dump()` |
| **Provider rate limit/quota** | Requests queue, then stall without error | Console → Model Status → queue depth |

**Pattern: nothing throws.** The agent is *waiting* — for a child, for a tool, for a token, for a lock — and the wait has no timeout.

---

### 1. Subagent Hang: The "Fire and Pray" Trap
You delegated a task. Parent shows "executing: waiting for subagent." Child shows "executing" but tool log hasn't updated in 20 min.

**Diagnosis (Console REPL):**
```bash
> agents.list()
=> ["main-refactor-7f2a", "sub-refactor-auth-3b1c", "sub-refactor-tests-9d4e"]

> agents.get("sub-refactor-auth-3b1c").status
=> "executing: applying changes to auth/middleware.ts"

> agents.get("sub-refactor-auth-3b1c").tools.recent(10)
=> [
  { tool: "edit_file", file: "auth/middleware.ts", duration: 1200, status: "pending" },
  { tool: "search_files", pattern: "auth.*middleware", duration: 45, status: "ok" }
]
```
The `edit_file` has been "pending" for 1200 seconds. That's the hang.

**Fixes (in order):**
- **A. Kill and resume with partial results** — `agents.get("sub-refactor-auth-3b1c").stop(keepPartial: true)` returns partial work, parent can re-delegate remainder
- **B. Check for invisible approval prompts** — `agents.get(...).approvals.pending()` reveals hidden prompts
- **C. Increase tool timeout for this session** — `config.set("toolTimeouts.edit_file", 300000)` (5 min vs default 2)
- **D. Nuclear option: fork from last good state** — `agents.get("main-refactor-7f2a").fork(fromMessage: "msg-3b1c-complete")`

---

### 2. MCP Server Disconnect: The Silent Tool Failure
Agent calls `mcp.search_code` or `mcp.query_db`. Shows "executing" for 10+ min. No error. No timeout.

**Diagnosis:**
```bash
> mcp.servers.list()
=> [
  { name: "github", status: "connected", lastPing: "2m ago", tools: 12 },
  { name: "postgres", status: "disconnected", lastPing: "47m ago", tools: 8 },
  { name: "slack", status: "connected", lastPing: "1m ago", tools: 6 }
]
```
Postgres shows "disconnected" with 47-min stale ping.

```bash
> mcp.servers.get("postgres").calls.pending()
=> [{ id: "call-9f2a", tool: "query", sql: "SELECT * FROM audit_log...", duration: 2840000, status: "pending" }]
```
2.84M ms = 47 minutes. Call never returned.

**Fixes:**
- **A. Force-reconnect** — `mcp.servers.get("postgres").reconnect()` drops stale connection, pending calls fail fast with clear error
- **B. Enable background health checks (preventive)** — add to config: `mcp.healthCheckInterval: 30000`, `autoReconnect: true`
- **C. Add tool-level timeouts** — `config.set("toolTimeouts.mcp.query", 120000)`

---

### 3. Cron Job Drift: The Silent Scheduler
Scheduled job runs daily. Worked for weeks. Suddenly stops. No error in logs. Dashboard says "last run: 3 days ago."

**Diagnosis:** `hermes cron list` + check job's Bot Chat for last actual message.

**Fixes:** Add explicit heartbeat logging, dead-man's-switch alerts, or use `hermes cron run <job>` manually to test.

---

### 4. Memory/Context Corruption
Agent repeats itself, hallucinates file paths, forgets earlier decisions.

**Diagnosis:** `agent.memory.dump()` in Console REPL — look for duplicate entries, truncated context, or corrupted embeddings.

**Fix:** `agent.memory.compact()` or `agent.memory.reset()` then re-prime with project summary.

---

### 5. Provider Rate Limit/Quota
Requests queue, then stall. No error thrown — just... waiting.

**Diagnosis:** Console → Model Status → queue depth. If queue > 0 and latency climbing, you're rate limited.

**Fix:** Add `providerTimeout` and `maxRetries` to agent config. Switch to higher-quota provider (OpenRouter, local) for batch work.

---

**Bottom line:** Stop guessing. Open the Console REPL. The data is there.

Full guide with more commands and prevention strategies: https://terminalblog.com/blog/hermes-agent-debugging-guide-stuck-agents-silent-failures/

---

*What's the weirdest silent failure you've seen in an autonomous agent?*