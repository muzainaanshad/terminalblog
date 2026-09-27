# Medium Cross-Post: Gitlawb Zero's Provider Picker

## Canonical URL
https://terminalblog.com/blog/gitlawb-zero-provider-picker-terminal-ux/

---

## Title
**Gitlawb Zero's New Provider Picker Is the Best Terminal UX I've Seen in an AI Coding Agent**

## Tags
ai-coding-agents, terminal-ux, developer-tools, gitlawb-zero, developer-experience

---

## Body

Terminal UI is hard. Most CLI tools don't even try. Gitlawb Zero just tried — and nailed it.

PR #400 adds a search/filter provider picker to Zero's setup wizard. If you haven't seen it, imagine choosing from 20+ LLM providers in a terminal interface that actually feels good to use.

### What It Looks Like

When you run `zero` for the first time (or reconfigure), you're presented with a searchable list of providers. Type "open" and it filters to OpenAI, OpenRouter, and compatible endpoints. Type "loc" and it shows Ollama, LM Studio, and local models.

The picker shows provider names, endpoint URLs, and whether they're configured. Navigation is keyboard-native — arrow keys, vim bindings, and tab completion all work.

### The Provider List

Zero supports every major provider out of the box:
- OpenAI, Anthropic, Gemini, Groq
- OpenRouter, DeepSeek, Mistral, xAI
- Qwen, Kimi, GitHub Models
- Ollama, LM Studio (local)
- Any OpenAI-compatible or Anthropic-compatible endpoint

The picker categorizes them: Cloud, Local, Community, Custom. You can filter by category or search across everything.

### Why Terminal UX Matters

Most coding agents make you set up providers in config files. JSON, YAML, TOML — you edit a file, remember the correct key names, and hope it works.

Zero's picker is the opposite of configuration. It's exploration. See what's available, pick what you want, move on. The agent handles the rest.

This is the kind of attention to onboarding that separates tools people try from tools people adopt. Hermes has a similar setup flow. OpenCode and Kilo still require manual config. Mimo inherits OpenCode's approach. Oh My Pi uses config files too.

Zero's provider picker sets a new bar.

### Technical Implementation

The picker is built with `ink` (React for terminal) and uses a fuzzy search algorithm (Fuse.js) for instant filtering. It's not a simple `select` — it's a full TUI component with:

- **Live search** — filters as you type, under 16ms latency
- **Category tabs** — Cloud / Local / Community / Custom (Tab to switch)
- **Keyboard shortcuts** — `j`/`k` or arrows, `/` to focus search, `Enter` to select, `Esc` to cancel
- **Visual indicators** — ✓ for configured, ○ for available, ⚠ for missing API key
- **Endpoint preview** — shows the base URL when highlighted

The component is fully testable (unit tests in `ProviderPicker.test.tsx`) and decoupled from the rest of the setup flow — it just receives a provider list and calls `onSelect(provider)`.

### Provider Configuration Flow

After selecting a provider, Zero guides you through configuration:

1. **API Key** — Pasted securely (not echoed), stored in OS keychain (Windows Credential Manager, macOS Keychain, libsecret on Linux)
2. **Base URL** — Pre-filled for known providers, editable for custom endpoints
3. **Model Selection** — Shows available models for that provider (fetched live from `/v1/models` endpoint)
4. **Default Model** — Sets your primary model for the session

For local providers (Ollama, LM Studio), Zero auto-detects running instances:
```bash
# Zero detects these automatically
ollama serve                    # → "Ollama (running on localhost:11434)" ✓
lms server start               # → "LM Studio (running on localhost:1234)" ✓
```

No manual config needed if the server is running.

### Switching Providers Mid-Session

The picker isn't just for first-time setup. Press `Ctrl+P` (or run `zero --model`) anytime to switch providers without restarting:
```
zero --model
# Opens the same picker, pre-highlights current provider
# Select new provider → Zero hot-swaps, preserves session context
```

This is unique — other agents require restart or new session for model switches.

### What This Means for Daily Use

The provider picker is a small feature that compounds. It means:
- **Experimentation is free** — try a new model in 10 seconds, not 5 minutes
- **No config debt** — you don't accumulate broken YAML files
- **Team onboarding** — new contributors run `zero` and are productive immediately
- **Multi-provider workflows** — swap from GPT-5 (reasoning) to Groq (speed) to Ollama (privacy) per task

---

*Originally published at [terminalblog.com](https://terminalblog.com/blog/gitlawb-zero-provider-picker-terminal-ux/)*