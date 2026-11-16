# Medium Cross-Post: Beware: Codex Windows Sandbox Shares Deny-Read ACLs Across Sessions

**Canonical URL:** https://terminalblog.com/blog/beware-codex-windows-sandbox-deny-read-shared-acl/

---

## TL;DR

If you use OpenAI Codex CLI on Windows with `[windows] sandbox = "elevated"` and custom `deny_read_paths` in your permissions profile, **any other Codex session running simultaneously can silently remove those protections**. Your secrets (API keys, SSH keys, `.env` files) could become readable by the agent without warning.

---

## What Happened

OpenAI Codex CLI uses Windows ACLs (Access Control Lists) to enforce "deny-read" rules on sensitive paths you configure. The idea: you list paths like `C:\Users\you\.ssh\id_rsa` or `C:\Users\you\.env` in your permissions profile, and Codex applies a **deny ACE** (Access Control Entry) for the `CodexSandboxUsers` group — blocking the agent from reading those files.

**The bug:** All Codex sessions share the **same group SID** (`CodexSandboxUsers`). When any session refreshes its ACLs (which happens periodically), it **revokes all previously applied deny ACEs for that group** that aren't in *its own* current deny list.

So if Session A has a strict profile with 16 deny-read paths, and Session B starts with a permissive profile (`workspace-write`, zero deny entries), Session B's refresh **wipes out Session A's protections**. The `deny_read_acl_state.json` alternates between populated and empty — observed ~2,600 "applied 16 deny-read ACLs" refreshes interleaved with ~1,900 refreshes applying **none** on the same day.

**Making it worse:** Missing deny paths are created as **directories** in your real filesystem. A stale entry for `C:\Users\you\.secrets\ai_factory\key.pem` recreates `key.pem\` as an empty directory. On the next refresh from another session, the parent `.secrets` folder gets an explicit **allow** grant (`RX`) that overrides the inherited deny.

This was independently rediscovered via **Lean state-machine formalization** on 2026-11-09 — the formal proof shows a counterexample where Command A starts with `denyInstalled(secret)=true`, Command B starts with an allowed profile, the shared last-profile reconciliation runs, Command B removes the group deny, and Command A reads the secret.

---

## Who Is Affected

You are affected if **all** of these are true:

| Condition | Check |
|-----------|-------|
| You use **Codex CLI on Windows** | `codex --version` shows 0.162.0-alpha.2 or later |
| You use **elevated sandbox** | `[windows] sandbox = "elevated"` in `~/.codex/config.toml` |
| You have **custom `deny_read_paths`** in your permissions profile | Check `~/.codex/config.toml` for `deny_read_paths = [...]` |
| You run **multiple Codex sessions concurrently** | Multiple terminals, VS Code + terminal, background `codex exec`, etc. |

**Not affected:** macOS/Linux users (different sandbox implementation), Windows users on `workspace-write` or `read-only` sandbox modes without custom deny paths, single-session users.

---

## How to Check If You're Vulnerable

Run these commands in PowerShell:

```powershell
# 1. Check your Codex version
codex --version
# Vulnerable if >= 0.162.0-alpha.2

# 2. Check your sandbox mode
cat $env:USERPROFILE\.codex\config.toml | Select-String "sandbox"
# Look for: sandbox = "elevated"

# 3. Check for custom deny_read_paths
cat $env:USERPROFILE\.codex\config.toml | Select-String "deny_read_paths"
# If this returns paths, you have custom denies

# 4. Inspect the live ACL state (run while Codex is active)
cat $env:USERPROFILE\.codex\.sandbox\deny_read_acl_state.json
# Watch for: "principals": {} alternating with populated entries

# 5. Check sandbox logs for the telltale pattern
Get-Content $env:USERPROFILE\.codex\.sandbox\sandbox.*.log -Tail 50 | Select-String "applied.*deny-read ACLs"
# Look for interleaved "applied 16 deny-read ACLs" and "applied 0 deny-read ACLs"
```

If steps 2–3 return positive and step 4 shows the alternating state, **you are actively losing protections**.

---

## How to Protect Yourself (Workarounds)

### Immediate: Run only one Codex session at a time
Close all Codex terminals, VS Code extensions, background `codex exec` processes. Keep exactly **one** session alive.

### Immediate: Move secrets out of denied paths
The deny-read mechanism is fundamentally broken. Move API keys, SSH keys, `.env` files to:
- Environment variables (not denied paths)
- A secrets manager (1Password CLI, Bitwarden CLI, Windows Credential Manager)
- Files outside the workspace that Codex doesn't monitor

### Consider: Downgrade sandbox mode
If you don't need elevated sandbox, switch to `workspace-write` or `read-only` in your config.toml — these modes don't use the deny-read ACL mechanism.

---

## Why This Matters for AI Coding Agents

This isn't just a Codex bug — it's a pattern. Sandbox isolation is hard on Windows because the OS primitives (AppContainer, Silo, Job Objects) are complex and poorly documented. Most agent vendors roll their own ACL logic, and **shared group SIDs across concurrent sessions is a recurring failure mode**.

If you build or use AI coding agents on Windows, audit:
1. Does each session get a unique security principal?
2. Does ACL refresh account for concurrent sessions with different policies?
3. Are filesystem mutations (like creating directories for missing paths) atomic and isolated?

---

*Originally published at [terminalblog.com](https://terminalblog.com/blog/beware-codex-windows-sandbox-deny-read-shared-acl/) on November 15, 2026.*