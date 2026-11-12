import os
import re

blog_dir = r'C:\Users\muzai\terminalblog\src\content\blog'
for filename in os.listdir(blog_dir):
    if filename.endswith('.mdx'):
        filepath = os.path.join(blog_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        in_code = False
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith('```'):
                in_code = not in_code
            if not in_code:
                matches = list(re.finditer(r'<(\w+)', line))
                for m in matches:
                    tag = m.group(1).lower()
                    valid_tags = ['script', 'code', 'details', 'summary', 'pre', 'html', 'head', 'body', 'div', 'span', 'a', 'img', 'br', 'hr', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'strong', 'em', 'b', 'i', 'u', '!--']
                    if tag not in valid_tags:
                        before = line[:m.start()]
                        if not ('](' in before and ')' in line[m.end():]):
                            print(f'{filename}:{i}: {line.strip()[:120]}')
                            print(f'  Tag: <{tag}>')
                            print()