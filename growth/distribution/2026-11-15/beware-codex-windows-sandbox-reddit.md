# Reddit Post for r/ClaudeAI / r/cursor

**Title:** Beware: Codex Windows Sandbox vulnerability — one session silently drops another's file protections (ACL bug in v0.162.0+)

**Body:**

If you use OpenAI Codex CLI on Windows with elevated sandbox mode and custom `deny_read_paths`, there's a critical vulnerability you need to know about.

**The Bug:** All Codex sessions share the same group SID (`CodexSandboxUsers`). When any session refreshes its ACLs, it revokes ALL previously applied deny ACEs for that group that aren't in its own current deny list.

**Real-world impact:** If Session A has 16 deny-read paths (protecting SSH keys, .env files, API keys), and Session B starts with a permissive profile (zero deny entries), Session B's refresh **wipes out Session A's protections**. Your secrets become readable by the agent without warning.

**Making it worse:** Missing deny paths are created as **directories** in your real filesystem. A stale entry recreates `key.pem\` as an empty directory. On next refresh from another session, the parent folder gets an explicit **allow** grant (`RX`) that overrides the inherited deny.

**How to check if you're vulnerable:**
```powershell
# 1. Check version
codex --version
# Vulnerable if >= 0.162.0-alpha.2

# 2. Check sandbox mode
cat $env:USERPROFILE\.codex\config.toml | Select-String "sandbox"
# Look for: sandbox = "elevated"

# 3. Check for custom deny_read_paths
cat $env:USERPROFILE\.codex\config.toml | Select-String "deny_read_paths"

# 4. Inspect live ACL state (while Codex is active)
cat $env:USERPROFILE\.codex\.sandbox\deny_read_acl_state.json
# Watch for: "principals": {} alternating with populated entries
```

**Workarounds:**
1. Run only ONE Codex session at a time
2. Move secrets out of denied paths (the mechanism is fundamentally broken)
3. Use `workspace-write` or `read-only` sandbox mode instead

Full technical details and formal proof: https://terminalblog.com/blog/beware-codex-windows-sandbox-deny-read-shared-acl/

---

*Cross-posted from terminalblog.com (canonical URL)*