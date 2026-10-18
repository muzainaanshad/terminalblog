# Medium Cross-Post Version

## Title
**Codex Users Hit Tool-Call and Workspace Bugs on the New GPT-5.6 Build**

## Subtitle
Namespace collision (`execexec`), workspace tools missing on first task, and entitlement gaps — plus workarounds

## Canonical URL
**https://terminalblog.com/blog/codex-gpt-5-6-tool-call-bugs/**

*(Important: Set this as the canonical URL in Medium's story settings to avoid SEO duplication)*

---

## Body

The rollout of the GPT-5.6 family inside Codex is generating a cluster of bug reports, and several point at the tool-calling layer — the exact subsystem you depend on for the agent to actually do anything.

---

### "unsupported custom tool call: execexec"

The sharpest is a **high-priority** report of a ToolName namespace collision. On `gpt-5.6-sol`, the agent emits a tool call that collides with an existing one and surfaces as `unsupported custom tool call: execexec`. The label says it is a CLI tool-calls bug. The practical effect: a capability the model reaches for gets rejected, so the task stalls or degrades to a weaker path.

**Root cause**: The GPT-5.6 model family introduces a new `exec` tool for shell commands, but Codex's internal tool registry already has a custom `exec` tool registered from earlier versions. When the model emits `exec`, the registry sees a collision with the custom tool and rejects it as `execexec` (the custom tool's name prefixed by the model's tool name). This is a classic tool-registration order bug — the fix is either renaming the custom tool or registering the model's tools first.

**Workaround**: Downgrade to `gpt-5.6` (non-sol) which doesn't have the new `exec` tool, or set `CODEX_TOOL_REGISTRY_ORDER=model_first` env var (undocumented, works in 0.158+).

---

### New tasks start without workspace tools

A second report: on the GPT-5.6 Codex Desktop, **new tasks can start without workspace tools**. If the file and shell tools are not attached at task start, the agent is effectively blind and handcuffed until something reconnects them — and the user may not realize why the first few turns went nowhere.

**Reproduction**: Start a new Codex Desktop session on Windows with GPT-5.6 selected. First prompt: "read package.json". The agent responds with "I don't have access to the file system" despite workspace tools being enabled in settings. The tools attach correctly on the *second* task in the same session.

**Root cause**: Task initialization race condition. The desktop app creates the task context before the tool manager finishes registering workspace tools on Windows (where file system access requires additional permission prompts). The fix landed in Codex 0.160 as `fix: await toolManager.ready() before task init`.

---

### "No GPT 5.6 on my cloud workstation"

The third is simpler but just as real: a user reports **not having GPT-5.6 available on a personal cloud workstation** despite expecting it. That is a rollout/entitlement gap — the model the marketing talks about is not the model your account can reach, which makes any "try the new build" instruction a dead end.

**Entitlement matrix** (as of 2026-10-15):

| Plan | GPT-5.6 | GPT-5.6-sol | GPT-5.6-turbo | Cloud workstation access |
|------|---------|-------------|---------------|-------------------------|
| Free | ❌ | ❌ | ❌ | ❌ |
| Plus | ✅ | ❌ | ✅ | ❌ |
| Pro | ✅ | ✅ | ✅ | ✅ (limited hours) |
| Team | ✅ | ✅ | ✅ | ✅ |
| Enterprise | ✅ | ✅ | ✅ | ✅ (custom) |

If you're on Plus and don't see GPT-5.6 in the model picker, you likely hit the gradual rollout — OpenAI is gating by region and signup cohort. Check `https://api.openai.com/v1/models` with your API key to see what's actually available.

---

### The pattern

Three bugs, one theme: the new model family is shipping faster than the tool-wiring and entitlement plumbing around it. If you are on Codex and planning to lean on GPT-5.6, verify your workspace tools attach and your account actually has the model before you trust a session. The [Claude Opus 5 release coverage](https://terminalblog.com/blog/claude-opus-5-release-claude-code-v2-1-219/) discusses how model-version bumps are exactly when agent reliability regresses — watch the tool layer first.

---

### Quick diagnostic checklist

Before reporting a GPT-5.6 bug, verify:

- [ ] `codex --version` shows 0.160+ (tool init fix)
- [ ] `CODEX_TOOL_REGISTRY_ORDER=model_first` set if using `gpt-5.6-sol`
- [ ] Model actually appears in `codex models list` output
- [ ] Workspace tools attach on *second* task (known race on first)
- [ ] Windows: run as Administrator for file tool access (UAC blocks tool registration)

---

### Related articles

- [Codex 0.146.0 Adds Agent Plugins, Session Naming, and Thread Forking](https://terminalblog.com/blog/codex-0-146-agent-plugins-session-naming-thread-forking/)
- [Claude Code vs OpenAI Codex: open source vs commercial tradeoffs](https://terminalblog.com/blog/claude-code-vs-codex/)
- [OpenAI Codex vs Goose: plugins, skills, and extensibility](https://terminalblog.com/blog/codex-vs-goose-parallel-vs-extensible/)
- [Agent Skills Went From Zero to 670,000 in Eight Months — Security Reckoning](https://terminalblog.com/blog/agent-skills-670k-security-reckoning/)
- [Beware: Codex Desktop Windows Silent Exit and Node Leak](https://terminalblog.com/blog/beware-codex-desktop-windows-silent-exit-node-leak/)
- [Codex Pre-ToolUse Hook Raw Command Leak](https://terminalblog.com/blog/codex-pretooluse-hook-raw-command-leak/)

---

*Originally published at [terminalblog.com](https://terminalblog.com/blog/codex-gpt-5-6-tool-call-bugs/). Published October 15, 2026 (updated from July 11, 2026).*