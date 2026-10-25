with open(r'C:\Users\muzai\terminalblog\src\content\blog\beware-hermes-agent-oct2026-security-audit-6-high-findings.mdx', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r'^(---.*?\n---)', content, re.DOTALL)
if match:
    frontmatter = match.group(1)
    new_frontmatter = frontmatter.replace(
        'canonical: "https://terminalblog.com/blog/beware-hermes-agent-oct2026-security-audit-6-high-findings/"\n---',
        'canonical: "https://terminalblog.com/blog/beware-hermes-agent-oct2026-security-audit-6-high-findings/"\nfaq:\n  - q: "What is the Hermes Agent October 2026 security audit?"\n    a: "A full-tree security audit of NousResearch/hermes-agent (15,136 files, ~1.1M lines) published on October 2, 2026, that uncovered 403 findings including 6 HIGH-severity vulnerabilities with working reproductions."\n  - q: "What are the 6 HIGH-severity findings?"\n    a: "1) Hardline command blocklist bypass via git aliases and wrapper prefixes. 2) OSC-8 terminal escape injection in markdown links. 3) Skill threat scanner trusts bundle\\'s own .skillignore. 4) Stored XSS via bot name attribute breakout. 5) WSL openExternal unquoted URL command injection. 6) Full audit with 43 medium findings including TTS shell injection, path traversal, SSRF, open redirect."\n  - q: "Am I affected if I run Hermes Agent?"\n    a: "Yes. Everyone running Hermes Agent is affected by at least some findings. The command blocklist bypass affects all users. Terminal injection affects TUI users. Skill scanner bypass affects anyone installing skills. XSS affects Desktop app users. WSL injection affects Windows+WSL users."\n  - q: "Are there fixes available?"\n    a: "Local fixes have been developed and tested for all 6 HIGH findings, but they are not yet merged upstream. Track GitHub issues #131561-#131566 for merge status."\n  - q: "What should I do right now?"\n    a: "1) Update Hermes when fixes land. 2) Restrict API server to 127.0.0.1. 3) Audit installed skills for .skillignore files. 4) Avoid clicking/rendering untrusted links in Desktop app. 5) Review bot configs for suspicious names. 6) Monitor the issue threads for merged fixes."\n---'
    )
    if new_frontmatter != frontmatter:
        content = content.replace(frontmatter, new_frontmatter)
        with open(r'C:\Users\muzai\terminalblog\src\content\blog\beware-hermes-agent-oct2026-security-audit-6-high-findings.mdx', 'w', encoding='utf-8') as f:
            f.write(content)
        print('SUCCESS: FAQ added to frontmatter')
    else:
        print('REPLACEMENT DID NOT CHANGE ANYTHING')
else:
    print('FAILED to find frontmatter')