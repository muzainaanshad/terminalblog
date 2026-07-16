# Social Media Playbook

Platform-specific formats, templates, and rules for terminalblog social channels.

## Platform Strategy

### X (Twitter) — @terminalblog_en
**Goal:** Follower growth through humor + hot takes
**Format:** Text-first (3.56% engagement), images close (3.40%)
**Frequency:** 5-10x/week, weekdays 9-11am or 1-3pm UTC

**Rules:**
- 70-140 chars = highest engagement
- Links in REPLIES only, never main tweet (45% penalty)
- 0-1 hashtags max
- Humor > information here
- Front-load the punchline
- Quote-tweet dev discussions to ride existing engagement

**What works:**
- Hot takes with real experience behind them
- Tool discoveries: "Just found X and it replaces my entire Y workflow"
- Short build logs: "Shipped dark mode today. 2 hours. CSS custom properties + class toggle."
- Code snippets that teach ONE specific thing
- Jokes about dependency hell, CSS specificity, debugging
- "Builder's diary" — short daily updates on what you're shipping

**What flops:**
- Corporate speak ("excited to announce")
- Thread-bait openers ("I've spent 10 years... here are 15 lessons")
- Long preambles before the useful part
- More than 2 hashtags
- Links in main tweet

---

### LinkedIn
**Goal:** Authority + professional network growth
**Format:** Carousels/PDFs dominate (21.77% engagement), 3-image posts best (3.11%)
**Frequency:** 3-5x/week, Tue-Thu 10am-noon local

**Rules:**
- First 200 characters = hook (that's where "see more" cuts)
- Links in FIRST COMMENT, never post body
- 3-5 hashtags at end
- 3-4 image carousels optimal (5+ drops engagement)
- dwell time matters most — long posts that keep people scrolling win

**What works:**
- Contrarian takes backed by data
- "Here's what I learned" storytelling
- Lessons from failures (not just successes)
- Industry observations with specific examples
- Document/carousel format for key insights

**What flops:**
- External links in post body
- Text-only posts (585% less than carousels)
- Polished corporate tone
- Posts under 200 characters (no dwell time)

---

### Instagram
**Goal:** Brand awareness + community
**Format:** Carousels win engagement (6.9%), Reels win reach (2.25x)
**Frequency:** 3-5x/week, Mon-Fri 9am-11am

**Rules:**
- 1080x1350 (4:5) for feed — max vertical real estate
- 7+ slides get re-served to non-swipers
- Saves and shares > likes in algorithm
- No clickable links in captions — "link in bio" only
- 3-5 hashtags max

**What works:**
- Carousels with 7+ slides (educational, relatable)
- Behind-the-scenes content
- Relatable developer moments
- Before/after comparisons
- "Save this for later" reference cards

**What flops:**
- Single images (4.4% vs 6.9% for carousels)
- Reels for engagement (3.3% — use for reach only)
- Polished corporate aesthetic
- Links in captions (not clickable)

---

### Facebook
**Goal:** Community discussion
**Format:** Most format-agnostic — images (5.2%), video (4.84%), text (4.76%) all close
**Frequency:** 3-5x/week, Mon-Fri 8am-noon

**Rules:**
- Reply chains matter most (one 10-reply comment > ten one-off comments)
- 1-2 hashtags max (almost no organic benefit)
- Links demoted but less than LinkedIn/X
- Open-ended questions drive algorithm

**What works:**
- Open-ended questions that generate reply chains
- Images with relatable content
- Community discussions
- Polls and opinion asks

**What flops:**
- Links (demoted)
- Statement posts (no engagement)
- Corporate tone

---

## Universal Rules

1. **No links in main posts** — put in replies/comments
2. **Comments > likes** on every platform (X: reply 27x > like)
3. **Authentic > polished** — AI images get 12% engagement penalty
4. **Carousels = engagement king** on LinkedIn + Instagram
5. **Text = king on X**
6. **Video = reach king everywhere**
7. **3-5 hashtags max** everywhere (1-2 on X/Facebook)
8. **Never ask for follows** — earn them through quality

---

## Post Templates

### Template 1: Hot Take (X)
```
[Contrarian opinion]

[1-2 sentences backing it up with experience]

[Optional: question to drive replies]
```
Example: "Kubernetes is overkill for 90% of startups. We moved to a single VPS and our infra costs dropped 80%. Sometimes boring technology wins."

### Template 2: Tool Discovery (X)
```
Just found [tool] and it replaces my entire [workflow].

[What it does in 1 sentence]

[Why it's better in 1 sentence]
```
Example: "Just found uv and it replaces my entire Python dependency workflow. 10-100x faster than pip. No more virtual env activation."

### Template 3: Build Log (X)
```
Shipped [feature] today.

[Time it took]

[How in 1-2 sentences]

[Optional: what's next]
```
Example: "Shipped dark mode today. 2 hours. CSS custom properties + class toggle on body. No library needed."

### Template 4: Relatable Moment (X)
```
[Setup: relatable situation]

[Punchline: what actually happened]

[Optional: question]
```
Example: "Spent 4 hours debugging only to find it was a missing semicolon. The IDE even underlined it. I just... didn't see it."

### Template 5: Carousel Post (LinkedIn/Instagram)
```
Slide 1: Hook statement (the "see more" trigger)
Slide 2-3: Problem/context
Slide 4-6: Solution/insight
Slide 7-8: Key takeaways
Slide 9: Call to action (save this, share your experience)
```

### Template 6: Question Post (Facebook)
```
[Context about a real situation]

[Open-ended question that invites sharing]

[Optional: what's your experience?]
```
Example: "We just replaced our entire test suite with AI-generated tests. Coverage went from 60% to 95%. But I'm not sure if the tests are actually good. How do you validate AI-generated code quality?"

### Template 7: Data Drop (LinkedIn)
```
[Number that surprises]

[Context: why this matters]

[What we can learn from this]
```
Example: "LinkedIn carousels get 21.77% engagement. Text posts get 3.18%. That's a 585% difference. The format IS the strategy."

### Template 8: Observation (X)
```
[Pattern you noticed]

[Why it matters]
```
Example: "Every senior dev I know has a 'it was DNS' story. Every single one. DNS is the universal debugging punchline."

### Template 9: Thread Starter (X — use sparingly)
```
[Core insight in 1 tweet]

Link to full write-up in reply.
```
Example: "Here's the thing about coding agents: they're not replacing developers. They're replacing the boring parts developers hate. Thread..."

### Template 10: Community Question (All platforms)
```
[Honest situation/struggle]

[What did you do?]

[Optional: sharing for others in same spot]
```
Example: "My team just inherited a 50K line codebase with zero tests. Do we write tests first or ship features? Genuinely asking."

---

## Content Mix (Weekly)

| Platform | Posts/Week | Mix |
|----------|-----------|-----|
| X | 5-7 | 3 hot takes, 2 tool discoveries, 1-2 jokes |
| LinkedIn | 3-5 | 2 carousels, 1-2 text takes, 1 data drop |
| Instagram | 3-5 | 2-3 carousels, 1-2 reels (for reach) |
| Facebook | 3-4 | 2 questions, 1-2 images |

---

## MyMarky Integration

When generating posts via MyMarky:
1. Use profile tone: "Tech-savvy friend who makes you laugh"
2. Rotate themes: programmer life, hot takes, humor, remote work, AI tools
3. Let MyMarky generate images (avoid 12% AI penalty by using design/carousel formats)
4. Schedule to all 4 platforms
5. Track what works, double down on winners

---

*Last updated: 2026-07-16*
*Sources: Buffer 2026 State of Social, HubSpot 2026, Socialinsider 2026, Ordinal 270K post analysis*
