# HN Comment Draft

## For Hacker News (when Codex GPT-5.6 bugs get discussed)

**Comment:**

Codex GPT-5.6 rollout has three related bugs — all tool-wiring issues, not model capability:

1. **Namespace collision: `execexec`** — GPT-5.6 introduces an `exec` tool, but Codex's registry already has a custom `exec`. Model emits `exec` → registry sees collision → rejects as `execexec`. Workaround: `CODEX_TOOL_REGISTRY_ORDER=model_first` (undocumented, 0.158+) or downgrade to non-sol.

2. **Workspace tools don't attach on first task (Windows)** — Race condition: task context created before tool manager registers workspace tools. Fix in 0.160: `await toolManager.ready()`. Tools work on second task.

3. **Entitlement gap** — Plus users don't get GPT-5.6-sol; gradual rollout by region/cohort. Check `api.openai.com/v1/models` with your key to see what's actually available.

This is the pattern with agent releases: model capability ships faster than tool-wiring and entitlement plumbing. Same subsystem failing in different directions — see Codex pre-tooluse hook raw command leak, Codex Desktop Windows silent exit.

Full breakdown with entitlement matrix: https://terminalblog.com/blog/codex-gpt-5-6-tool-call-bugs/

---

**Shorter thread reply:**

> Three bugs, one theme: GPT-5.6 tool-wiring shipped before plumbing was ready. `execexec` namespace collision (workaround: `CODEX_TOOL_REGISTRY_ORDER=model_first`), workspace tools race on first Windows task (fixed 0.160), Plus entitlement gap for -sol variant. Model capability ≠ agent reliability.