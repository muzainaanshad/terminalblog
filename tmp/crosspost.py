#!/usr/bin/env python3
import json, subprocess, time, sys

key = '9Kw5MgKzMvJ2g1G8TCUoR3un'
api = 'https://dev.to/api/articles'

articles = [
    ('bytedance-seedream-5-0-pro-platforms',
     'ByteDance Just Flipped the Switch on Seedream 5.0 Pro — Multiplatform Release Is Live',
     'ByteDance just pushed Seedream 5.0 Pro live across multiple platforms. The latest version of their image generation model is no longer locked to a single service — it\u2019s rolling out widely, which means more API endpoints, more integration paths, and more options for developers who want to pipe visual generation into their workflows.\n\nWhat changed? Seedream 5.0 Pro was previously available in limited channels. Now ByteDance is distributing it broadly, putting the model in reach of anyone building agentic pipelines that need on-demand image generation. Think UI mockup generators, diagram producers, or asset creators that run as steps inside a coding agent\u2019s loop.\n\nFor coding agent users, this matters because the gap between \u201cwrite code\u201d and \u201cproduce visuals\u201d keeps narrowing. Agents that can generate screenshots, wireframes, or documentation diagrams inline are more useful than agents that dump text and expect you to open a separate tool. A widely-available model like Seedream 5.0 Pro makes that integration cheaper and more reliable.\n\nThe takeaway: ByteDance is betting on distribution. Seedream 5.0 Pro going multiplatform means one more visual generation engine is available for your agent stack \u2014 and competition in this space pushes quality up and latency down.'),

    ('tencent-hy3-14-cents-coding-ai',
     'Tencent Just Dropped a Coding AI at $0.14/M Tokens \u2014 Cheaper Than Your Coffee',
     'The pricing floor just dropped again. Tencent launched Hy3, a coding-focused AI model, at $0.14 per million input tokens. That is not a teaser rate or an introductory promotion \u2014 it is the listed price, and it lands well below what most frontier models charge for developer-facing workloads.\n\nHere is what the number actually means. At $0.14/M input tokens, a developer running 10,000 iterative coding-agent calls per month pays peanuts compared to GPT or Claude equivalents. That changes the calculus on always-on agent loops \u2014 auto-fixing lint errors in CI, generating tests on every commit, or running multi-step refactors that would have been too expensive to leave running overnight.\n\nThe catch: input price is only half the equation. Output token cost, context-window limits, and real-world code generation quality matter just as much. A cheap model that hallucinates half its diffs is no bargain. But a credible coding-specialized model from a major lab at this price point puts pressure on every other vendor to justify their per-token rates. Expect the pricing transparency trend to accelerate.\n\nThe takeaway: Hy3 resets the low end of coding AI pricing. If quality holds up, it changes how much agentic iteration you can afford to run.'),

    ('ethereum-foundation-ai-audit-bugs',
     'Ethereum Foundation Found Real Bugs With AI Audits \u2014 This Changes Smart Contract Security',
     'AI audits just caught real bugs \u2014 not hypothetical ones, not toy examples. The Ethereum Foundation ran AI-powered security audits against smart contract code and found genuine vulnerabilities that would have shipped to mainnet.\n\nThis is the validation the security-agent crowd has been waiting for. Smart contract audits have always been high-stakes: one missed reentrancy bug or access control flaw can cost millions. If AI agents can reliably surface those bugs in Ethereum\u2019s notoriously tricky Solidity code, the same approach applies to any codebase that needs rigorous review.\n\nFor coding agent users, this shifts the conversation from \u201ccan AI help write code?\u201d to \u201ccan AI help verify code?\u201d The strongest use case for agents has always been catching what humans overlook \u2014 especially in large, complex codebases where manual review fatigue sets in fast. The Ethereum Foundation putting real money and trust into AI audits signals that this use case has crossed the credibility threshold.\n\nThe takeaway: AI agents found production-grade bugs in Ethereum contracts. If they can do that, your code review pipeline should be asking the same question: what are your traditional tools missing?'),

    ('kraken-agentic-trading-bots',
     'Kraken\u2019s Mobile Relaunch Puts Agentic Trading Bots in Your Pocket',
     'Agentic behavior is moving from developer terminals into consumer apps. Kraken relaunched its mobile app with integrated agentic trading bots \u2014 automated strategies that run directly on your phone, no separate infrastructure or API key management needed.\n\nThis is a notable move because it normalizes autonomous agents for a mainstream audience. The same pattern that powers coding agents \u2014 a model that observes context, makes decisions, and executes actions \u2014 is now baked into a crypto trading app. Set your parameters, and the bot trades for you. No dashboards, no VPS, no DevOps.\n\nFor the coding agent crowd, this is the pattern migrating outward. If agentic trading bots are viable in a mobile app, the same architectural questions apply: What does the agent observe? How does it decide? What happens when it makes a bad call? These are exactly the problems being solved in open-source coding agents right now \u2014 observability, sandboxing, and rollback authority.\n\nThe takeaway: Agentic trading bots in a mobile app prove the pattern is platform-agnostic. The autonomy architecture built for code is eating every decision-making surface \u2014 including your portfolio.'),

    ('gpt-5-6-claude-fable-code-arena',
     'GPT-5.6 Sol Matches Claude Fable 5 on Code Arena \u2014 For 40% Less',
     'The benchmark numbers landed, and they are tight: GPT-5.6 Sol tied Claude Fable 5 on Code Arena \u2014 the standard coding agent evaluation \u2014 while costing 40% less. That is the kind of performance-per-dollar delta that makes budgeting for agentic workflows interesting again.\n\nCode Arena measures real-world code generation, debugging, and refactoring tasks. A tie means both models produce comparable quality on the coding workloads that matter to developers. The 40% cost difference shifts the recommendation from \u201cuse whichever is best\u201d to \u201cstart with the cheaper option and upgrade only if you hit a specific failure mode.\u201d\n\nFor teams running agents at scale, this matters directly. Agentic loops multiply per-token cost by the number of iterations. A 40% savings on the model layer compounds fast when you are running hundreds or thousands of agent calls per day. It also puts pressure on both vendors: OpenAI can claim efficiency, and Anthropic needs to justify the premium on Fable 5 for coding tasks.\n\nThe takeaway: GPT-5.6 Sol matches the top coding benchmark score at a fraction of the cost. For agent users, the math just got interesting \u2014 cheaper doesn\u2019t mean worse anymore.'),
]

for slug, title, body in articles:
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
    cmd = [
        'curl', '-s', '-X', 'POST', api,
        '-H', f'api-key: {key}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(payload),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        url = data.get('url', 'NO_URL')
        print(f'{slug}: {url}')
    except Exception as e:
        print(f'{slug}: ERROR {result.stdout[:300]}')
        print(f'Exception: {e}')
    time.sleep(3)
