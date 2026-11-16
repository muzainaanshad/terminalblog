# Reddit Post for r/ClaudeAI / r/cursor

**Title:** Gitlawb Zero sandbox was leaking ALL your env credentials — AWS keys, GitHub tokens, DB passwords (PR #660)

**Body:**

Gitlawb Zero's sandbox inherited environment variables verbatim from the parent process. Every `AWS_*` variable, every `GITHUB_TOKEN`, every `DATABASE_URL`, every `API_KEY` your shell had loaded was passed directly to sandboxed code.

**The Issue:** PR #660 in Gitlawb Zero addresses a credential exposure bug: the sandbox environment was not scrubbing sensitive environment variables before passing them to executed code.

The PR description is blunt: "scrub sensitive credentials from sandbox environment." Translation — any code you ran inside the sandbox, any extension you tested, any third-party plugin you loaded had unfettered access to every credential in your environment. The sandbox protected your filesystem and network, but left the front door wide open for credential theft.

Four commenters on the PR flagged additional categories of credentials that needed scrubbing — cloud provider tokens, package registry auth tokens, internal CA certificates. The fix is still being refined, which means even the initial scrub may miss some secrets. If you run Zero, treat PR #660 as "leak mostly closed," not "leak closed."

**Are you affected?**
- You use Gitlawb Zero with sandbox mode
- You have credentials in environment variables (most devs do)
- You run untrusted extensions or third-party plugins
- You haven't audited what your sandbox inherits

**Quick test — run this against ANY agent you use:**
```bash
# 1. Load a canary secret into your shell
export CANARY_SECRET="sandbox-leak-test-$(date +%s)"

# 2. Launch your agent in sandbox mode and run:
#    env | grep CANARY_SECRET

# 3. If it prints the value, your sandbox leaks env.
```

This canary test is more honest than reading docs. Several agents claim isolation but still inherit `process.env` via the default `child_process.spawn()` options — exactly the mistake Zero made. Run the canary against **every** agent you use, including ones you trust. The result is usually surprising.

Full article with security checklist: https://terminalblog.com/blog/zero-sandbox-credential-leak/

---

*Cross-posted from terminalblog.com (canonical URL)*