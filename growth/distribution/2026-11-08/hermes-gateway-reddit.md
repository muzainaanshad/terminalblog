# Reddit Post for r/LocalLLaMA / r/Agents / r/MachineLearning

## Title
**Hermes Agent Hardens Its Gateway: Live Runtime Checks and Session-Scoped Model Switches**

## Body
A sweep of recent Hermes Agent commits tightens how the gateway decides a session is ready and makes mid-session model switches stick to the right scope — plus better usage attribution.

### The Problem: False "Ready" Signals
If you've ever watched a desktop app show a green dot while the backend behind it was dead, you know why this matters — a false ready signal means the first prompt fails in a confusing way instead of at startup, where it's easy to diagnose.

### The Fix: Two-Phase Readiness
The gateway (`gateway-core`) sits between the desktop TUI and the actual agent runtime (local, remote, or hybrid). Previously, the gateway marked itself "ready" as soon as it bound its port and loaded config — it did not verify the runtime process was actually responding.

Now:
1. **Gateway-local ready**: Config loaded, port bound, auth initialized
2. **Runtime-attached ready**: Gateway successfully completes a round-trip health check against the runtime (`GET /health` with auth token)

The desktop TUI now only shows "Connected" when phase 2 passes. This eliminates the race where a user sends a prompt to a "ready" gateway, only to have it timeout because the runtime hadn't finished starting.

---

### Model Switches Stay Where You Put Them
When you switch models mid-conversation, that choice should apply to *this session* — not leak into every other open session or evaporate the moment you navigate away.

**The bug:** The desktop app used a singleton `ModelPickerStore` that didn't distinguish between sessions. Switching Session A to Opus could bleed into Session B.

**The fix:** A `sessionId`-scoped model selection map, so each session maintains its own model context independently.

This also fixes a subtle delegation bug: when a parent agent delegates to a child agent, the child inherits the parent's model *at delegation time*. If the parent later switches models, the child shouldn't retroactively change. The session-scoped store ensures the child's model is captured at spawn and isolated thereafter.

---

### Usage Attribution Got Hardened
Three commits touch usage attribution and telemetry:
- Hardened per-route usage attribution
- Mapped usage attribution contributors
- Persisted first-accounted fallback route

**The problem:** When requests route through multiple providers (local model → OpenRouter fallback → Nous Portal), token accounting got messy. A single prompt might generate 500 input tokens to local (free), 2,000 output from OpenRouter (billed), 500 input to Nous Portal (billed differently). Previously, attribution would sometimes lump all tokens under the *final* provider, losing the breakdown.

**The fix:** Per-route attribution tracks each hop independently. `usage.jsonl` now includes `route_id`, `provider`, `model`, `session_id`, and `delegation_depth` — enough to reconstruct the full cost tree.

For teams sharing a Hermes instance (or running it as a service), this means accurate cost allocation per user, per project, per session.

---

### Why This Matters
None of this is glamorous. It's the difference between an agent you can run in a team and one that only works on the maintainer's laptop — which is exactly why Hermes positions itself as a **local-first autonomous assistant** rather than a demo.

**Full article:** https://terminalblog.com/blog/hermes-gateway-parent-runtime-session-scope/

*Running Hermes in production? What's your observability setup for multi-session cost tracking?*