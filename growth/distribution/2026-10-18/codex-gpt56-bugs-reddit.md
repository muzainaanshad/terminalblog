# Reddit Post for r/ClaudeAI / r/cursor

## Title
**Codex GPT-5.6 Has a Tool-Call Namespace Collision Bug (`execexec`) + Workspace Tools Don't Attach on First Task — Workarounds Inside**

## Body
OpenAI rolled out the GPT-5.6 family inside Codex and it's generating a cluster of bug reports. Three issues, one theme: the new model family is shipping faster than the tool-wiring and entitlement plumbing around it.

**Bug 1: "unsupported custom tool call: execexec"**
- On `gpt-5.6-sol`, the agent emits a tool call that collides with an existing one
- Root cause: GPT-5.6 introduces a new `exec` tool for shell commands, but Codex's internal tool registry already has a custom `exec` tool from earlier versions
- When the model emits `exec`, the registry sees a collision and rejects it as `execexec` (custom tool's name prefixed by model's tool name)
- **Workaround**: Downgrade to `gpt-5.6` (non-sol) or set `CODEX_TOOL_REGISTRY_ORDER=model_first` env var (undocumented, works in 0.158+)

**Bug 2: New tasks start without workspace tools**
- On GPT-5.6 Codex Desktop (Windows), new tasks can start without workspace tools attached
- First prompt: "read package.json" → "I don't have access to the file system" despite workspace tools being enabled
- Tools attach correctly on the *second* task in the same session
- Root cause: Task initialization race condition — desktop app creates task context before tool manager finishes registering workspace tools on Windows
- Fix landed in Codex 0.160 as `fix: await toolManager.ready() before task init`

**Bug 3: GPT-5.6 not available on cloud workstations**
- Entitlement gap — the model marketing talks about isn't the model your account can reach
- Plus users don't get GPT-5.6-sol; Pro/Team/Enterprise do
- Gradual rollout by region and signup cohort

**Quick diagnostic checklist before reporting:**
- [ ] `codex --version` shows 0.160+ (tool init fix)
- [ ] `CODEX_TOOL_REGISTRY_ORDER=model_first` set if using `gpt-5.6-sol`
- [ ] Model actually appears in `codex models list` output
- [ ] Workspace tools attach on *second* task (known race on first)
- [ ] Windows: run as Administrator for file tool access (UAC blocks tool registration)

Full write-up with entitlement matrix and related articles: https://terminalblog.com/blog/codex-gpt-5-6-tool-call-bugs/

---

*Anyone else hit the `execexec` collision? The `CODEX_TOOL_REGISTRY_ORDER=model_first` workaround saved my session but it's undocumented — curious if there are other undocumented env vars floating around.*