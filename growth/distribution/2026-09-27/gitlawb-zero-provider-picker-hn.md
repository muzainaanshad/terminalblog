# HN Comment Draft for Gitlawb Zero Provider Picker Article

## Context
Post to the Gitlawb Zero Show HN or relevant thread about AI coding agent UX. Keep it under 2000 chars.

---

**Comment:**

Zero's provider picker (PR #400) is the first time I've seen terminal onboarding that doesn't feel like a compromise. Most agents: edit YAML, remember keys, hope it works. Zero: run `zero`, search "open", pick OpenRouter, paste key, select model from live `/v1/models` fetch — 15 seconds.

The implementation details that matter:
- Built with Ink (React for terminal) + Fuse.js fuzzy search (<16ms)
- Category tabs: Cloud/Local/Community/Custom
- OS keychain storage (Windows Credential Manager, macOS Keychain, libsecret)
- Hot-swap mid-session with `Ctrl+P` — no restart, preserves context
- Auto-detects running Ollama/LM Studio instances
- Unit tested, decoupled component (just receives providers, calls onSelect)

Comparison: Claude Code, Codex, OpenCode, Kilo, Oh My Pi all require manual config edit. Hermes has a wizard but basic search. Zero is the only one with live fuzzy search + categories + visual status + hot-swap.

This is the bar for terminal UX now. If your agent makes me edit a config file to add a provider, you've already lost the onboarding battle.

Article has the full breakdown + comparison table: https://terminalblog.com/blog/gitlawb-zero-provider-picker-terminal-ux/