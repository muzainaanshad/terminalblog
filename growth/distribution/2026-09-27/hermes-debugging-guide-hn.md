# HN Comment Draft for Hermes Debugging Guide

## Context
Post to Hermes Show HN or relevant thread about debugging autonomous agents. Keep it under 2000 chars.

---

**Comment:**

Hermes agents stall silently — no crash, no error, just a blinking cursor or "executing" for 45 minutes. This guide covers the 5 production failure modes and Console REPL diagnosis:

**1. Subagent hang** (most common): Parent waits on `delegate_task`, child shows "executing" but tool log frozen. Diagnosis: `agents.get("child-id").tools.recent(10)` → find pending `edit_file` at 1200s. Fix: `stop(keepPartial: true)` to recover partial work, or `approvals.pending()` for invisible prompts.

**2. MCP server disconnect**: `mcp.servers.list()` shows "disconnected" with stale ping. `mcp.servers.get("postgres").calls.pending()` reveals 47-min stuck query. Fix: `reconnect()` forces fail-fast, or enable `healthCheckInterval: 30000` + `autoReconnect: true` in config.

**3. Cron job drift**: Job stops reporting, no error. `hermes cron list` + Bot Chat check. Fix: heartbeat logging + dead-man's-switch.

**4. Memory corruption**: Agent repeats/hallucinates. `agent.memory.dump()` → find duplicates/truncation. Fix: `agent.memory.compact()` or `reset()` + re-prime.

**5. Provider rate limit**: Queue builds, no error. Console → Model Status → queue depth. Fix: `providerTimeout` + `maxRetries` in config.

Key pattern: **nothing throws**. The agent waits for child/tool/token/lock with no timeout. Console REPL exposes all of it.

Full guide: https://terminalblog.com/blog/hermes-agent-debugging-guide-stuck-agents-silent-failures/