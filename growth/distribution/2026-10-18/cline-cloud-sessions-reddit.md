# Reddit Post for r/ClaudeAI / r/cursor

## Title
**Cline v4.1.25 Just Launched Cloud Sessions — Run Agents on GitHub Repos While You Sleep (Gemini 4 Argon Now Default)**

## Body
Cline v4.1.25 dropped October 16 and the headline feature is genuinely new: **Cline Cloud sessions**.

**What it is:** Hosted sandboxes that run Cline tasks on any GitHub repository and branch you choose. You enable it in Settings → Cline Cloud, pick a repo + branch, send a task ("refactor the auth module", "add tests for the payment flow"), and Cline spins up a sandbox, clones the repo, runs the task. **You get a notification when it finishes — even if you closed VS Code.**

**Why this matters:** You don't need a beefy machine. You don't need to keep your editor open. You don't need to babysit the agent. Set it, forget it, get a ping when it's done.

**Other notable changes in v4.1.25:**
- **Gemini 4 Argon is now the default model** on the Cline provider (replacing Claude Sonnet 5.5). OpenRouter stays on Claude Sonnet 5.5.
- **Local models (LM Studio, Ollama): 5-minute timeout fixed** — long prompts no longer fail with `BodyTimeoutError` after 5 minutes of silence
- **OpenAI-compatible base URLs:** No more silent `/v1` injection — host-only URLs now used exactly as entered
- **Images/files attached to answers now reach the model** — previously dropped silently
- **Provider error mid-stream: auto-retry up to 3x** — transient blips absorb themselves

**Rollout is gradual** — if you don't see Cline Cloud in Settings yet, check again in a few days.

Full write-up with upgrade decision matrix: https://terminalblog.com/blog/cline-v4-1-25-cloud-sessions-gemini-argon-model-refresh/

---

*Has anyone tried Cline Cloud yet? Curious about real-world latency and whether the sandbox environment has the tools you need (Docker, specific runtimes, etc.)*