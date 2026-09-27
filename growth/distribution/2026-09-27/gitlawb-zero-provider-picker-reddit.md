# Reddit Post for r/ClaudeAI (cross-post to r/cursor, r/opencode)

## Title
**Gitlawb Zero's new provider picker is the best terminal UX I've seen in an AI coding agent — 20+ providers, live search, keyboard-native, zero config**

## Body
I've been testing Gitlawb Zero's new setup wizard (PR #400) and the provider picker genuinely surprised me. Most AI coding agents make you edit config files (JSON/YAML/TOML) to add providers. Zero gives you a searchable, filterable TUI built with Ink (React for terminal) + Fuse.js fuzzy search.

**What you get:**
- 20+ providers out of the box: OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek, Mistral, xAI, Qwen, Kimi, GitHub Models, Ollama, LM Studio, any OpenAI/Anthropic-compatible endpoint
- Live search (<16ms latency) — type "open" → filters to OpenAI/OpenRouter/compatible; type "loc" → Ollama/LM Studio
- Category tabs: Cloud / Local / Community / Custom (Tab to switch)
- Keyboard-native: j/k or arrows, / to focus search, Enter to select, Esc to cancel
- Visual indicators: ✓ configured, ○ available, ⚠ missing API key
- Endpoint preview on highlight

**The flow:** Run `zero` first time → picker opens → search/select provider → paste API key (stored in OS keychain) → pick model from live `/v1/models` fetch → done in ~15 seconds.

**Unique feature:** `Ctrl+P` (or `zero --model`) anytime mid-session to hot-swap providers without restart. Other agents require new session.

**Comparison table from the article:**

| Agent | Setup Method | Search/Filter | Categories | Visual Feedback | Time to First Model |
|-------|--------------|---------------|------------|-----------------|---------------------|
| **Gitlawb Zero** | Interactive TUI picker | ✅ Live fuzzy | ✅ 4 tabs | ✅ Configured/missing | ~15 seconds |
| **Claude Code** | `claude config` + manual edit | ❌ | ❌ | ❌ | ~2 min |
| **Codex** | Web dashboard → CLI auth | ❌ | ❌ | ⚠️ Limited | ~3 min |
| **Hermes** | Interactive setup wizard | ✅ Basic | ✅ Groups | ✅ Status icons | ~30 sec |
| **OpenCode** | `opencode config` edit YAML | ❌ | ❌ | ❌ | ~2 min |
| **Kilo** | Environment variables | ❌ | ❌ | ❌ | ~1 min |
| **Oh My Pi** | Config file (TOML) | ❌ | ❌ | ❌ | ~2 min |

**Why this matters:** Terminal UX is an afterthought for most agents. Zero proves you can have a genuinely pleasant onboarding experience in the terminal. The picker component is fully testable (unit tests in `ProviderPicker.test.tsx`) and decoupled — just receives provider list, calls `onSelect(provider)`.

Article: https://terminalblog.com/blog/gitlawb-zero-provider-picker-terminal-ux/

---

*What's your experience with provider setup in other agents? Still editing YAML files?*