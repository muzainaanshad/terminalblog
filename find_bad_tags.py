import os
import re

blog_dir = r'C:\Users\muzai\terminalblog\src\content\blog'
for filename in os.listdir(blog_dir):
    if filename.endswith('.mdx'):
        filepath = os.path.join(blog_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        in_code = False
        for i, line in enumerate(lines, 1):
            if line.strip().startswith('```'):
                in_code = not in_code
            if not in_code:
                # Find < followed by letter (not ! / ?) that's not in a code block
                matches = list(re.finditer(r'<([a-zA-Z!])', line))
                for m in matches:
                    if m.group(1) not in ['!', '/']:
                        print(f'{filename}:{i}: {line.strip()[:120]}')
                        break