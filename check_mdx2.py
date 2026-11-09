import glob
import re

# Check all mdx files for problematic patterns
for f in glob.glob('src/content/blog/*.mdx'):
    with open(f, 'r') as fp:
        content = fp.read()
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # Look for < followed by a non-whitespace, non-/ character (which would be JSX)
            # but not in code blocks, not in script tags, not in hrefs
            if '<' in line and '>' in line:
                # Check if it's a markdown link or code
                if 'href=' in line or 'api/og' in line:
                    continue
                if '```' in line:
                    continue
                # Look for standalone <X> patterns that aren't HTML tags
                matches = re.findall(r'<([a-zA-Z][^>]*)>', line)
                for m in matches:
                    if not m.startswith('/') and m not in ['script', 'details', 'summary', 'a ', 'img', 'br', 'hr', 'strong', 'em', 'code', 'p', 'div', 'span', 'section', 'header', 'footer', 'main', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                        print(f'{f}:{i+1}: {line[:150]}')
                        break