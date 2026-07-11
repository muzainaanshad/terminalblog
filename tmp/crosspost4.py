#!/usr/bin/env python3
import json, subprocess, time

key = '9Kw5MgKzMvJ2g1G8TCUoR3un'
api = 'https://dev.to/api/articles'

slug = 'gpt-5-6-claude-fable-code-arena'
title = 'GPT-5.6 Sol Matches Claude Fable 5 on Code Arena \u2014 For 40% Less'
body = 'The benchmark numbers landed, and they are tight: GPT-5.6 Sol tied Claude Fable 5 on Code Arena \u2014 the standard coding agent evaluation \u2014 while costing 40% less. That is the kind of performance-per-dollar delta that makes budgeting for agentic workflows interesting again.\n\nCode Arena measures real-world code generation, debugging, and refactoring tasks. A tie means both models produce comparable quality on the coding workloads that matter to developers. The 40% cost difference shifts the recommendation from \u201cuse whichever is best\u201d to \u201cstart with the cheaper option and upgrade only if you hit a specific failure mode.\u201d\n\nFor teams running agents at scale, this matters directly. Agentic loops multiply per-token cost by the number of iterations. A 40% savings on the model layer compounds fast when you are running hundreds or thousands of agent calls per day. It also puts pressure on both vendors: OpenAI can claim efficiency, and Anthropic needs to justify the premium on Fable 5 for coding tasks.\n\nThe takeaway: GPT-5.6 Sol matches the top coding benchmark score at a fraction of the cost. For agent users, the math just got interesting \u2014 cheaper doesn\u2019t mean worse anymore.'

canonical = f'https://terminalblog.com/blog/{slug}/'
payload = {
    'article': {
        'title': title,
        'body_markdown': body,
        'published': True,
        'tags': ['career', 'productivity', 'linux'],
        'canonical_url': canonical,
    }
}

print('Waiting 350s for rate limit cooldown...')
time.sleep(350)

cmd = [
    'curl', '-s', '-X', 'POST', api,
    '-H', f'api-key: {key}',
    '-H', 'Content-Type: application/json',
    '-d', json.dumps(payload),
]
result = subprocess.run(cmd, capture_output=True, text=True)
data = json.loads(result.stdout)
url = data.get('url', 'NO_URL')
err = data.get('error', '')
print(f'{slug}: {url} {err}')
