import glob

# Check each of the modified files for issues at specific lines
files = [
    'src/content/blog/hermes-agent-main-branch-5600-commits-since-release.mdx',
    'src/content/blog/ampcode-android-app-october-2026.mdx',
    'src/content/blog/github-copilot-cli-1-0-104-105-assisted-permissions-default.mdx',
    'src/content/blog/opencode-v1-19-3-model-reasoning-configurable.mdx',
    'src/content/blog/openclaw-v2026-9-7-safer-browser-stable-macos.mdx',
    'src/content/blog/qwen-code-managed-runtime-lightweight-pairing.mdx',
]

for f in files:
    with open(f, 'r') as fp:
        lines = fp.readlines()
        if len(lines) >= 348:
            print(f'{f} line 348: {lines[347]}')
        # Also check for < > patterns that could cause issues
        for i, line in enumerate(lines):
            if '<' in line and '>' in line:
                # Skip script tags, href links, and code blocks
                if not ('<script' in line or 'href=' in line or 'api/og' in line or '```' in line or '<details' in line or '<summary' in line or '<a ' in line):
                    # Check for standalone < > that might be interpreted as JSX
                    if line.strip().startswith('<') and '>' in line:
                        print(f'{f}:{i+1}: {line[:150]}')