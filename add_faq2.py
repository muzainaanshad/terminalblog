with open(r'C:\Users\muzai\terminalblog\src\content\blog\how-to-setup-ai-coding-agents.mdx', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r'^(---.*?\n---)', content, re.DOTALL)
if match:
    frontmatter = match.group(1)
    faq_addition = '\nfaq:\n  - q: "What is the best AI coding agent for beginners?"\n    a: "For terminal-first beginners, Copilot CLI is the smoothest if you have a GitHub account. For zero-cost, OpenCode and Hermes take a few minutes but need API keys. For IDE-first, Cursor installs like an editor and needs no API keys."\n  - q: "Do I need a GitHub account to use a coding agent?"\n    a: "Not for most local agents, but a GitHub account helps for Copilot CLI, Codex cloud parallel execution, and most of the ecosystem. The exception is fully local setup with Ollama."\n  - q: "What is an AGENTS.md file and why do I need one?"\n    a: "AGENTS.md is a universal instruction sheet that tells the agent your project conventions, architecture, and rules. It is the single biggest quality multiplier -- without it, you are using a powerful tool with no instructions."\n  - q: "How important is sandbox security for beginners?"\n    a: "More important than the model you choose. A coding agent is a process with your environment; without isolation, a mistake can wipe a repo or leak a token. Run the security checklist before your first real task."\n  - q: "What is the cheapest way to start with AI coding agents?"\n    a: "A free BYO-key terminal agent like OpenCode or Hermes with a single API key and a free-tier model can run at $0/month for light usage."\n  - q: "Which agent is easiest to set up on Windows?"\n    a: "Copilot CLI is the smoothest if you already have a GitHub account. For zero-cost, OpenCode and Hermes take a few minutes but need keys. Read the Windows stepchild deep dive for sandbox and permission fixes."\n'
    new_frontmatter = frontmatter.replace(
        'canonical: "https://terminalblog.com/blog/how-to-setup-ai-coding-agents/"\n\n---',
        'canonical: "https://terminalblog.com/blog/how-to-setup-ai-coding-agents/"' + faq_addition + '---'
    )
    if new_frontmatter != frontmatter:
        content = content.replace(frontmatter, new_frontmatter)
        with open(r'C:\Users\muzai\terminalblog\src\content\blog\how-to-setup-ai-coding-agents.mdx', 'w', encoding='utf-8') as f:
            f.write(content)
        print('SUCCESS: FAQ added to frontmatter')
    else:
        print('REPLACEMENT DID NOT CHANGE ANYTHING')
else:
    print('FAILED to find frontmatter')