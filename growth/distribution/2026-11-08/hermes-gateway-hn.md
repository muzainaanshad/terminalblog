# HN Comment Draft

## Context
Hermes Agent recent commits: gateway readiness checks, session-scoped model switches, hardened usage attribution.

## Comment
The "boring but load-bearing" framing is exactly right. These are the commits that separate a demo from a tool you can run in a team.

**Gateway readiness** — the two-phase check (gateway-local → runtime-attached) eliminates the "green dot but backend dead" race. For cron/automation users, the dashboard "healthy" badge now means the runtime *will accept work right now*.

**Session-scoped model switching** — the singleton `ModelPickerStore` bug was real. Before: switch Session A to Opus, Session B (Haiku) silently inherits it. After: `sessionId`-scoped map. Also fixes delegation — child agent captures parent's model at spawn, parent switching later doesn't retroactively change the child.

**Usage attribution** — per-route tracking with `route_id`, `provider`, `model`, `session_id`, `delegation_depth` in `usage.jsonl`. Finally answers "who spent what, on which route, why doesn't it add up?" when requests chain through local → OpenRouter → Nous Portal.

Full write-up: https://terminalblog.com/blog/hermes-gateway-parent-runtime-session-scope/

Running Hermes in production/team? What's your cost allocation setup?