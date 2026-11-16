# Medium Cross-Post: Your Coding Agent's Sandbox Just Handed Out Your AWS Keys — Zero Bug Exposes Credential Leak

**Canonical URL:** https://terminalblog.com/blog/zero-sandbox-credential-leak/

---

## The Issue

Pull request [#660](https://github.com/Gitlawb/zero/pull/660) in Gitlawb Zero addresses a credential exposure bug: the sandbox environment was not scrubbing sensitive environment variables before passing them to executed code. Every `AWS_*` variable, every `GITHUB_TOKEN`, every `DATABASE_URL`, every `API_KEY` your shell had loaded was inherited verbatim by the sandbox process.

The PR description is blunt: "scrub sensitive credentials from sandbox environment." Translation — any code you ran inside the sandbox, any extension you tested, any third-party plugin you loaded had unfettered access to every credential in your environment. The sandbox protected your filesystem and network, but left the front door wide open for credential theft.

Four commenters on the PR flagged additional categories of credentials that needed scrubbing — cloud provider tokens, package registry auth tokens, internal CA certificates. The fix is still being refined, which means even the initial scrub may miss some secrets. If you run Zero, treat PR #660 as "leak mostly closed," not "leak closed."

---

## Are You Affected?

Check what credentials your shell has loaded right now:

```bash
# List sensitive environment variables
env | grep -iE '^(AWS_|GITHUB_|DATABASE_|API_KEY|SECRET|TOKEN|PASSWORD|DB_|PG|MONGODB|REDIS|NPM_TOKEN|NEXUS|JFROG)'
```

```bash
# Check if zero is scrubbing env
# Look for the sandbox env filter in zero's config
grep -r "sandbox.env" ~/.zero/ 2>/dev/null
```

You're affected if:
- You use Gitlawb Zero with sandbox mode
- You have credentials in environment variables (most devs do)
- You run untrusted extensions or third-party plugins
- You haven't audited what your sandbox inherits

---

## How to Verify Your Sandbox Actually Isolates Secrets

The bug above is a specific instance of a general failure: sandboxes that filter the filesystem and network but pass `env` through untouched. You can test any agent's sandbox in under a minute:

```bash
# 1. Load a canary secret into your shell
export CANARY_SECRET="sandbox-leak-test-$(date +%s)"

# 2. Launch your agent in sandbox mode and run:
#    env | grep CANARY_SECRET

# 3. If it prints the value, your sandbox leaks env.
```

This canary test is more honest than reading docs. Several agents claim isolation but still inherit `process.env` via the default `child_process.spawn()` options — exactly the mistake Zero made. Run the canary against **every** agent you use, including ones you trust. The result is usually surprising.

For the full list of what to check before letting any agent touch your machine, our [coding agent security checklist for 2026](/blog/coding-agent-security-checklist-2026/) walks through sandbox, credential scoping, and network egress in one place. If you run agents from an `AGENTS.md`-driven workflow, our [AGENTS.md complete guide](/blog/agents-md-complete-guide/) explains how to pin exactly which commands and tools an agent is allowed to invoke — a second layer of defense when the sandbox itself is leaky.

---

## The Fix

The Zero team is working on an environment variable scrubber that runs before spawning sandboxed processes. The approach:
1. Maintain an allowlist of safe environment variables to pass through
2. Scrub everything else by default
3. Allow user configuration for project-specific vars

This is the correct model — denylists (scrub `AWS_*`, `GITHUB_*`) always miss something. An allowlist is the only way to be sure.

---

## Why This Matters for AI Coding Agents

This isn't just a Zero bug — it's a pattern. **Environment variable inheritance is the #1 sandbox leak vector across all AI coding agents.**

If you build or use AI coding agents, audit:
1. Does the sandbox spawn with a clean environment (allowlist only)?
2. Are credentials scoped per-session or global?
3. Can untrusted code in the sandbox exfiltrate `process.env`?

The filesystem and network isolation get all the attention, but `env` is where the secrets live. Secure that first.

---

*Originally published at [terminalblog.com](https://terminalblog.com/blog/zero-sandbox-credential-leak/) on July 12, 2026 (updated July 14, 2026).*