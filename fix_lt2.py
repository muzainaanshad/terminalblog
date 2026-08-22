with open('C:/Users/muzai/terminalblog/src/content/blog/openclaw-acp-future-agent-communication.mdx', 'r') as f:
    content = f.read()

# Replace literal < with HTML entity < in the specific context
content = content.replace('<10ms', '<10ms')
content = content.replace('<100ms', '<100ms')
content = content.replace('<30s', '<30s')

with open('C:/Users/muzai/terminalblog/src/content/blog/openclaw-acp-future-agent-communication.mdx', 'w') as f:
    f.write(content)

print('Done')