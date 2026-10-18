# HN Comment Draft

## For Hacker News (when Cline Cloud gets submitted or in relevant thread)

**Comment:**

Cline v4.1.25 shipped Cline Cloud last week — hosted agent sandboxes on your GitHub repos. The paradigm shift: you send a task, close your laptop, get notified when done. No more keeping VS Code open for 3 hours while an agent refactors a codebase.

A few things that stood out to me:

1. **Gemini 4 Argon is now the default** on the Cline provider (not OpenRouter — that stays on Sonnet 5.5). If you don't pin models, your default just changed. Provider defaults shift with catalog refreshes — pin if you want stability.

2. **Local model 5-minute timeout is gone**. Was a hard `BodyTimeoutError` after 5 min of silence even while the server was still processing. Now waits as long as needed. Big for 100k+ context dumps to local Llama 3.1 70B.

3. **OpenAI-compatible base URLs no longer get silent `/v1` injection**. Enter `https://my-gateway.com` → used exactly as entered. Existing setups get `/v1` added once for backward compat.

4. **Attachments on answers now work**. Was a silent loss — you'd attach a screenshot to answer Cline's question and it never reached the model.

5. **Mid-stream provider errors auto-retry up to 3x** before failing the turn.

The Cloud feature is the real story though. It's not a fix — it's a new primitive. Hosted agent sandboxes on your repos changes what you attempt. The team shipped 24 patch fixes across v4.1.23–.25. Now they ship the platform.

Full breakdown: https://terminalblog.com/blog/cline-v4-1-25-cloud-sessions-gemini-argon-model-refresh/

---

**Alternative shorter version for thread replies:**

> Cline Cloud is the first hosted agent sandbox that actually works on *your* GitHub repos (not a demo repo). You pick repo+branch, send task, close editor, get ping when done. Gemini 4 Argon is now default on Cline provider. Local model timeout fixed. Base URL handling fixed. Attachments on answers fixed. 24 patches in .23-.25, now shipping platform primitives.