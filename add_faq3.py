with open(r'C:\Users\muzai\terminalblog\src\content\blog\claude-code-alternatives-2026.mdx', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r'^(---.*?\n---)', content, re.DOTALL)
if match:
    frontmatter = match.group(1)
    if 'faq:' in frontmatter:
        print('FAQ already in frontmatter')
    else:
        faq_addition = '\nfaq:\n  - q: "Is Claude Code worth the price compared to alternatives?"\n    a: "Claude Code\'s $20/month (with usage limits) or pay-per-token API pricing is justified if you regularly do complex multi-file refactors, deep codebase reasoning, or agentic coding tasks. For simple completions or single-file edits, cheaper tools like Aider (free), Gemini CLI (free), or Tabnine ($12/month) may suffice."\n  - q: "Can I use multiple alternatives together?"\n    a: "Yes, and many developers do. Common combinations include: Cursor for daily editing + Claude Code for complex refactors; GitHub Copilot for autocomplete + Aider for agentic terminal tasks; Hermes Agent for automation + any IDE for interactive coding."\n  - q: "What is the best free Claude Code alternative?"\n    a: "Aider and Gemini CLI are the strongest free options. Aider gives you model flexibility and a Git-native workflow. Gemini CLI gives you a generous free tier with Google\'s models. For IDE integration, Cline is free and open source for VS Code users."\n  - q: "Are open-source alternatives as good as Claude Code?"\n    a: "It depends on the task. Open-source tools like Aider, Cline, and Hermes Agent can match Claude Code\'s quality because they connect to the same underlying models. The difference is in the workflow, not the model."\n  - q: "Which alternative is best for enterprise teams?"\n    a: "GitHub Copilot leads for enterprise: SSO, audit logs, content exclusions, and admin controls are mature. Amazon Q Developer is strong for AWS-heavy enterprises. Tabnine wins for regulated industries needing on-premise deployment."\n'
        new_frontmatter = frontmatter.replace(
            'canonical: "https://terminalblog.com/blog/claude-code-alternatives-2026/"\n\n---',
            'canonical: "https://terminalblog.com/blog/claude-code-alternatives-2026/"' + faq_addition + '---'
        )
        if new_frontmatter != frontmatter:
            content = content.replace(frontmatter, new_frontmatter)
            with open(r'C:\Users\muzai\terminalblog\src\content\blog\claude-code-alternatives-2026.mdx', 'w', encoding='utf-8') as f:
                f.write(content)
            print('SUCCESS: FAQ added to frontmatter')
        else:
            print('REPLACEMENT DID NOT CHANGE ANYTHING')
else:
    print('FAILED to find frontmatter')