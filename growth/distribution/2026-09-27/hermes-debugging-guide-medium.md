# Medium Cross-Post: Hermes Agent Debugging Guide

## Canonical URL
https://terminalblog.com/blog/hermes-agent-debugging-guide-stuck-agents-silent-failures/

---

## Title
**Your Hermes Agent Just Went Silent — Here's How to Bring It Back**

## Tags
ai-agents, debugging, hermes, autonomous-agents, developer-tools, troubleshooting

---

## Body

You gave Hermes a task. It started. Then... nothing. No error. No completion. Just a blinking cursor or a dashboard that says "executing" for 45 minutes.

This isn't a crash. It's a **stall** — the most common failure mode in autonomous agents. And unlike a crash, a stall doesn't leave a stack trace. It leaves you guessing.

This guide covers the five real failure modes we see in production Hermes deployments, and how to diagnose each one using the Console REPL instead of hope.

---

## The Core Insight: Stalls ≠ Crashes

A crash is loud. A stall is silent. Hermes agents stall for five reasons, in order of frequency:

| Failure Mode | Symptom | Where to Look First |
|--------------|---------|---------------------|
| **Subagent hang** | Parent agent waits forever on `delegate_task` | Console → Active Sessions → child status |
| **MCP server disconnect** | Tool calls time out silently | Console → Tool Calls → `mcp.*` latency |
| **Cron job drift** | Scheduled job stops reporting, no error logged | `hermes cron list` + job's Bot Chat |
| **Memory/context corruption** | Agent repeats itself, hallucinates file paths | Console REPL → `agent.memory.dump()` |
| **Provider rate limit / quota** | Requests queue, then stall without error | Console → Model Status → queue depth |

The pattern: **nothing throws**. The agent is *waiting* — for a child, for a tool, for a token, for a lock — and the wait has no timeout.

---

## 1. Subagent Hang: The "Fire and Pray" Trap

You delegated a task. The parent agent shows "executing: waiting for subagent." The child shows "executing" but its tool call log hasn't updated in 20 minutes.

### Diagnosis (Console REPL)

```bash
# List all active sessions
> agents.list()
=> ["main-refactor-7f2a", "sub-refactor-auth-3b1c", "sub-refactor-tests-9d4e"]

# Check the stuck child
> agents.get("sub-refactor-auth-3b1c").status
=> "executing: applying changes to auth/middleware.ts"

# See its recent tool calls
> agents.get("sub-refactor-auth-3b1c").tools.recent(10)
=> [
  { tool: "edit_file", file: "auth/middleware.ts", duration: 1200, status: "pending" },
  { tool: "search_files", pattern: "auth.*middleware", duration: 45, status: "ok" }
]
```

The `edit_file` has been "pending" for 1200 seconds. That's the hang.

### Why It Happens

- **Large file edits** on slow filesystems (network drives, WSL cross-mount)
- **Permission prompt** the agent can't see (happens in headless mode)
- **Provider timeout** — the model call succeeded but the response stream stalled
- **Tool schema validation** looping on a malformed argument

### Fixes (in order)

**A. Kill and resume with partial results**

```bash
> agents.get("sub-refactor-auth-3b1c").stop(keepPartial: true)
=> { stopped: true, partialResult: "Edited auth/middleware.ts lines 1-47; remaining 3 hunks pending" }
```

The parent receives the partial result and can re-delegate the remainder.

**B. Check for invisible approval prompts**

```bash
> agents.get("sub-refactor-auth-3b1c").approvals.pending()
=> [{ id: "apt-7f2a", tool: "edit_file", reason: "Destructive write to auth middleware", timeout: 300 }]
```

If this returns prompts, the agent is waiting for *you*. Approve via Console or CLI:

```bash
hermes approve apt-7f2a --yes
```

**C. Increase tool timeout for this session**

```bash
> agents.get("sub-refactor-auth-3b1c").config.set("toolTimeouts.edit_file", 300000)
```

5 minutes instead of the default 2. Only do this for known-slow operations.

**D. The nuclear option: fork from last good state**

```bash
> agents.get("main-refactor-7f2a").fork(fromMessage: "msg-3b1c-complete")
=> "main-refactor-7f2a-fork-1"
```

Creates a new session from the last known-good message. You lose the stuck child's work but preserve everything before it.

---

## 2. MCP Server Disconnect: The Silent Tool Failure

Your agent calls `mcp.search_code` or `mcp.query_db`. The call shows "executing" in the tool log. Ten minutes later, still executing. No error. No timeout.

### Diagnosis

```bash
# Check MCP server health from Console REPL
> mcp.servers.list()
=> [
  { name: "github", status: "connected", lastPing: "2m ago", tools: 12 },
  { name: "postgres", status: "disconnected", lastPing: "47m ago", tools: 8 },
  { name: "slack", status: "connected", lastPing: "1m ago", tools: 6 }
]
```

Postgres shows "disconnected" with a 47-minute stale ping. That's your culprit.

```bash
# See which tool calls are stuck on that server
> mcp.servers.get("postgres").calls.pending()
=> [
  { id: "call-9f2a", tool: "query", sql: "SELECT * FROM audit_log...", duration: 2840000, status: "pending" }
]
```

2.84 million milliseconds = 47 minutes. The call never returned.

### Why It Happens

- **MCP server crashed** (OOM, unhandled exception, config drift)
- **Network partition** between Hermes gateway and MCP server
- **Auth token expired** mid-session (common with OAuth-based MCP servers)
- **Server-side query hang** — the MCP tool itself is stuck

### Fixes

**A. Force-reconnect the server**

```bash
> mcp.servers.get("postgres").reconnect()
=> { reconnected: true, newSessionId: "mcp-postgres-7f2a" }
```

This drops the stale connection and re-establishes it. Pending calls **fail fast** with a clear error — which is what you want.

**B. Enable background health checks (preventive)**

```yaml
# In your hermes config
mcp:
  healthCheckInterval: 30000  # 30 seconds
  healthCheckTimeout: 5000
  autoReconnect: true
```

Hermes v0.21+ has this built into the MCP dashboard. Turn it on.

**C. Add tool-level timeouts**

```bash
# Per-tool timeout so MCP calls can't hang forever
> config.set("toolTimeouts.mcp.query", 120000)  # 2 minutes max
> config.set("toolTimeouts.mcp.search_code", 60000)
```

---

## 3. Cron Job Drift: The Silent Scheduler

Scheduled job runs daily. Worked for weeks. Suddenly stops. No error in logs. Dashboard says "last run: 3 days ago."

### Diagnosis

```bash
hermes cron list
# Check the job's Bot Chat for last actual message
```

### Fixes

- Add explicit heartbeat logging to every cron job
- Set up dead-man's-switch alerts (if no heartbeat in 2x schedule, alert)
- Test manually: `hermes cron run <job-name>`

---

## 4. Memory/Context Corruption

Agent repeats itself, hallucinates file paths, forgets earlier decisions.

### Diagnosis

```bash
> agent.memory.dump()
# Look for: duplicate entries, truncated context, corrupted embeddings
```

### Fix

```bash
> agent.memory.compact()   # Deduplicate, summarize
> agent.memory.reset()     # Full wipe — then re-prime with project summary
```

---

## 5. Provider Rate Limit / Quota

Requests queue, then stall. No error thrown — just... waiting.

### Diagnosis

Console → Model Status → queue depth. If queue > 0 and latency climbing, you're rate limited.

### Fix

Add to agent config:
```yaml
providerTimeout: 60000
maxRetries: 3
retryBackoff: exponential
```

Switch to higher-quota provider (OpenRouter, local Ollama) for batch work.

---

## Bottom Line

Stop guessing. Open the Console REPL. The data is there — every stalled child, every disconnected MCP server, every queued request, every corrupted memory entry.

The five failure modes above cover 95% of production stalls. Learn the Console REPL commands, add preventive config (health checks, timeouts, heartbeats), and you'll debug in minutes what used to take hours.

---

*Originally published at [terminalblog.com](https://terminalblog.com/blog/hermes-agent-debugging-guide-stuck-agents-silent-failures/)*