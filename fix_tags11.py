import os
import re

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0

for fname in files:
    path = os.path.join(blog_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix malformed tag lines with empty string like: - ""guide"
    def fix_line(line):
        global fixed
        # Match: - ""tag"
        m = re.match(r'(\s*-\s*)""([^"]*)"', line)
        if m:
            indent = m.group(1)
            tag = m.group(2)
            return f'{indent}"{tag}"'
        return line

    lines = content.split('\n')
    new_lines = [fix_line(line) for line in lines]
    new_content = '\n'.join(new_lines)
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        for i, (old, new) in enumerate(zip(lines, new_lines)):
            if old != new:
                fixed += 1

print(f"Fixed {fixed} tag entries")