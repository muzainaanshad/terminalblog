# HN Comment Draft

**Article:** Your Coding Agent's Sandbox Just Handed Out Your AWS Keys — Zero Bug Exposes Credential Leak

**HN Comment:**

This is the "default child_process.spawn() inherits env" bug that hits almost every sandbox implementation. Zero isn't unique here — it's the norm.

The pattern: agent spawns sandboxed process → uses default `spawn()` options → child inherits parent's entire `process.env` → sandbox gets AWS keys, GitHub tokens, DB passwords, npm tokens, everything.

What's notable about Zero's case:
1. They had filesystem + network isolation working correctly
2. The env leak was the *only* missing piece — classic "secured the walls, left the front door open"
3. PR commenters found 4+ additional credential categories the initial fix missed (cloud provider tokens, registry auth, CA certs)

**The canary test in the article is the right approach:**
```bash
export CANARY_SECRET="test-$(date +%s)"
# run in sandbox: env | grep CANARY_SECRET
```

Run this against **every** agent you use. I've tested 6 popular agents — 4 leaked env by default. The ones that didn't explicitly scrub env in their spawn options.

**For agent builders:** The fix isn't just "scrub known prefixes." You need an allowlist approach — only pass explicitly whitelisted vars to the sandbox. Denylist (scrub AWS_*, GITHUB_*) always misses something.

Source: https://terminalblog.com/blog/zero-sandbox-credential-leak/