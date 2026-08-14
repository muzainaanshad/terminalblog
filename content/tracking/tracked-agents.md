---
title: Tracked Agents — Future Article Watchlist
description: >
  Agents, frameworks, and tools flagged during research that
  may warrant terminalblog.com coverage. Updated as status changes.
---

## Active Tracking

### Prime Agent (`PrimeIntellect-ai/prime-agent`)
- **Repo:** https://github.com/PrimeIntellect-ai/prime-agent
- **Status:** Tracked (article-worthy)
- **First spotted:** 2026-08-14
- **Why track:** Self-improving RLM agent, daemon-backed persistence, built-in subagents, Continual Harness (`/refine`), skills-as-Python-packages, JSON/RPC headless modes. Novel angle on "agent that keeps running + improving after detach."
- **Article candidates:** 3 (see Recommended Articles)
- **Notes:** macOS/Linux only — no Windows native support. Built on `pi`/`pi-mono`. 15.6k stars. MIT license.

## Recommended Articles

These are concrete, ready-to-draft pieces that map to terminalblog.com's "AI coding agents" lane and the
"not too technical, not too basic" sweet spot.

### 1. Prime Agent vs. Claude Code / OpenCode / Codex CLI — Why daemon-backed persistence matters
- **Why now:** Most agent CLIs lose all context when the terminal closes. prime-agent keeps sessions,
  IPython state, subagents, and schedules running as daemon-backed workers — you detach and reattach.
- **Angle:** Compare the detach/reattach + heartbeat + schedule model vs. the stateless restart model
  of the big three. Tie to terminalblog's own cron / ops-digest workflows.
- **Hook:** "Your agent doesn't have to stop when your laptop sleeps."
- **Target length:** ~1,200–1,600 words. Include the daemon runtime diagram from the architecture docs.

### 2. The RLM model in practice — prompt-as-a-variable + recursive subagents as function calls
- **Why now:** RLM (Recursive Language Model) is the conceptual differentiator but poorly explained
  in mainstream coverage. It reframes context as variables and child agents as callable functions
  inside a persistent Python kernel.
- **Angle:** Walk the RLM loop with a real, minimal example (spawn `auth-reviewer`, `api-reviewer`,
  `integration-audit` in parallel; collect via `agent_message`). Compare to "one-shot tool call" agents.
- **Hook:** "If your agent's tools are just API calls, you're still playing in the shallow end."
- **Target length:** ~1,000–1,400 words. Use the mermaid flowchart from `rlm.md`.

### 3. prime-agent skills → Python packages: how executable skills beat prompt-only skills
- **Why now:** prime-agent supports both markdown Agent-Skills spec skills AND Python-backed skills
  (`pyproject.toml` + `src/<name>/__init__.py` installed editable into the kernel venv). The agent can
  *create* skills from natural language via the built-in `skill-creator`.
- **Angle:** Contrast instruction-only skills (Claude Code / OpenCode plugins) with importable,
  typed, `await release_audit(...)` callables. Show the built-in `skill-creator` workflow.
- **Hook:** "A skill that's a prompt is copy-paste. A skill that's a package is an API."
- **Target length:** ~1,000–1,300 words. Include the `brave-search/` and `release-audit` examples.

## Draft Plan (next)

1. Pick article #1 (persistence) — highest novelty + ties to existing terminalblog infra.
2. Clone prime-agent locally (`git clone`) — confirm install path / version. (Linux VM — Windows host only supports git-bash, no native daemon.)
3. Quick smoke: `prime-agent --version`, `/login` flow, `agents` / `status` / `doctor`.
4. Draft with: RLM loop diagram, daemon lifecycle diagram, table vs. Claude Code / OpenCode / Codex.
5. Ship → ops-digest only (`node scripts/telegram-ops-digest.cjs --send`).

## Status Legend
- **Tracked** = watched for future coverage
- **Draft** = actively being written
- **Shipped** = published on terminalblog.com