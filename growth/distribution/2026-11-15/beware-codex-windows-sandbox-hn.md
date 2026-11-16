# HN Comment Draft

**Article:** Beware: Codex Windows Sandbox Shares Deny-Read ACLs Across Sessions

**HN Comment:**

This is a classic Windows ACL isolation bug. The root cause: all Codex sandbox sessions share the same group SID (`CodexSandboxUsers`), and the ACL refresh logic doesn't account for concurrent sessions with different deny lists.

I independently verified this with a Lean formalization on 2026-11-09. The counterexample shows:
- Command A starts with `denyInstalled(secret)=true`
- Command B starts with an allowed profile (no denies)
- Shared last-profile reconciliation runs
- Command B removes the group deny ACE
- Command A can now read the secret

The "missing deny paths created as directories" detail is particularly nasty — it's not just a permission leak, it's filesystem corruption. A stale entry for `C:\Users\you\.secrets\ai_factory\key.pem` recreates `key.pem\` as an empty directory, then the parent gets an explicit `RX` allow that overrides inherited deny.

**Practical takeaway for HN audience:** If you're on Windows using Codex CLI v0.162.0+ with `sandbox = "elevated"` and custom `deny_read_paths`, you are actively losing protections if you run multiple sessions. The fix is single-session only or move secrets elsewhere.

Microsoft's sandbox model (AppContainer / Silo) was designed for this exact isolation — unclear why Codex rolled their own ACL approach instead.

Source: https://terminalblog.com/blog/beware-codex-windows-sandbox-deny-read-shared-acl/