# HN Comment Draft

**Article:** Zed vs Cursor: native AI editor or VS Code fork?

**HN Comment:**

Been using both daily for 6 months. The comparison posts miss the operational reality:

**Cursor wins on:**
- Composer is genuinely better for multi-file refactors. Zed's inline editing is fast but Composer's "here's 15 files, apply this change" workflow is more reliable for complex changes.
- Extension ecosystem matters. Need a specific linter, debugger, or language server? VS Code marketplace has it. Zed's plugin API is growing but years behind.
- Team onboarding: everyone knows VS Code keybindings. Zed's learning curve is real.

**Zed wins on:**
- Native performance. No Electron tax. Large files, big repos, instant startup.
- Real-time collaboration is built-in, not an extension. Pair programming "just works."
- BYOK is a massive cost saver at scale. We cut 60% on model spend switching to Zed + direct provider keys.
- Local-first: works offline, no telemetry phone-home.

**The honest take:** Most teams should default to Cursor. The productivity floor is higher. Adopt Zed as a specialist tool for:
- Performance-critical work (large codebases, heavy files)
- Pair programming sessions
- When model costs matter and you have engineering capacity to manage BYOK

Zed v1.22+ subagents narrow the Composer gap, but Cursor's workflow polish is still ahead.

Source: https://terminalblog.com/blog/zed-vs-cursor/