import os
import re

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0

for fname in files:
    path = os.path.join(blog_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find and fix tags arrays with escaped quotes like:
    # tags:
    #   - \"\\\"security\\\"\"
    #   - \"\\\"beware\\\"\"
    # This pattern matches: - \"\\\"word\\\"\"
    
    def fix_tags_block(match):
        global fixed
        block = match.group(0)
        # Fix each tag line
        lines = block.split('\n')
        new_lines = []
        for line in lines:
            # Match: - \"\\\"something\\\"\"
            m = re.match(r'(\s*-\s*)"(\\\\.*)"', line)
            if m:
                indent = m.group(1)
                tag_content = m.group(2)
                # Unescape: \\" -> "
                tag_content = tag_content.replace('\\"', '"').replace("\\\\", "\\")
                new_lines.append(f'{indent}"{tag_content}"')
                fixed += 1
            else:
                new_lines.append(line)
        return '\n'.join(new_lines)
    
    # Pattern to match the tags block
    # tags:\n  - \"...\"\n  - \"...\"\n
    new_content = re.sub(
        r'(tags:\n(?:\s*-\s*".*"\n)+)',
        fix_tags_block,
        content
    )
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)

print(f"Fixed {fixed} tag entries")