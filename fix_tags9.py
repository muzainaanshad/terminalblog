import os
import re

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0

for fname in files:
    path = os.path.join(blog_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    def fix_tags_block(match):
        global fixed
        block = match.group(0)
        lines = block.split('\n')
        new_lines = []
        for line in lines:
            # Check for two tags on one line like: - "antigravity\"  - \"incident-response"
            m = re.match(r'(\s*-\s*)"([^"]*)\\\\""\s*-\s*"\\\\"([^"]*)"', line)
            if m:
                indent = m.group(1)
                tag1 = m.group(2)
                tag2 = m.group(3)
                new_lines.append(f'{indent}"{tag1}"')
                new_lines.append(f'{indent}"{tag2}"')
                fixed += 2
            else:
                new_lines.append(line)
        return '\n'.join(new_lines)
    
    new_content = re.sub(
        r'(tags:\n(?:\s*-\s*".*"\n)+)',
        fix_tags_block,
        content
    )
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)

print(f"Fixed {fixed} tag entries")