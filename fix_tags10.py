import os
import re

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0

for fname in files:
    path = os.path.join(blog_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix malformed tag lines with two tags on one line
    # Pattern: - "tag1"  - \"\"tag2\"
    def fix_line(line):
        global fixed
        # Match: - "tag1"  - \"\"tag2\""
        m = re.match(r'(\s*-\s*)"([^"]*)"\s+-\s*\\*"([^"]*)"', line)
        if m:
            indent = m.group(1)
            tag1 = m.group(2)
            tag2 = m.group(3)
            return f'{indent}"{tag1}"\n{indent}"{tag2}"'
        
        # Match: - "tag1\"  - \"\"tag2"
        m = re.match(r'(\s*-\s*)"([^"]*)\\\\""\s*-\s*\\*"([^"]*)"', line)
        if m:
            indent = m.group(1)
            tag1 = m.group(2)
            tag2 = m.group(3)
            return f'{indent}"{tag1}"\n{indent}"{tag2}"'
        
        return line

    lines = content.split('\n')
    new_lines = [fix_line(line) for line in lines]
    new_content = '\n'.join(new_lines)
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        # Count how many lines changed
        for i, (old, new) in enumerate(zip(lines, new_lines)):
            if old != new:
                fixed += 1

print(f"Fixed {fixed} tag entries")