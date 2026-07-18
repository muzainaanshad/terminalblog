#!/usr/bin/env node
/**
 * Create 4 weeks of Twitter (3/day) + LinkedIn (1/day) posts
 * Scheduled via MyMarky API
 * 
 * Usage:
 *   node scripts/social-bulk-schedule.cjs --dry          # preview all posts
 *   node scripts/social-bulk-schedule.cjs --twitter       # Twitter only
 *   node scripts/social-bulk-schedule.cjs --linkedin      # LinkedIn only
 *   node scripts/social-bulk-schedule.cjs --all           # everything
 *   node scripts/social-bulk-schedule.cjs --all --start "2026-07-21"  # custom start
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';

// ── Twitter Posts (3/day × 28 days = 84) ──
const TWITTER_POSTS = [
  // ═══ WEEK 1: Developer Life ═══
  // Monday
  { day: 0, slot: 0, text: `Monday morning standup:\n\n"What did you do Friday?"\n\n"Deployed to prod at 4:59 PM"\n\n*Cries in weekend anxiety*` },
  { day: 0, slot: 1, text: `My terminal history looks like a cry for help\n\ngit add .\ngit commit -m "fix"\ngit commit -m "fix again"\ngit commit -m "actually fix"\ngit push --force\n\nWe've all been there.` },
  { day: 0, slot: 2, text: `Hot take: The best debugging tool is sleep.\n\nI fixed a 3-hour bug in 5 minutes after waking up.\n\nThe bug was a typo.\n\nI spent 3 hours looking for it in the wrong file.` },
  // Tuesday
  { day: 1, slot: 0, text: `Junior: "How do I center a div?"\n\nSenior: "You don't."\n\n*10 years later*\n\nSenior: "Flexbox"\n\n*5 more years*\n\nSenior: "Grid"\n\n*now*\n\nSenior: "Container queries"\n\nThe circle of CSS.` },
  { day: 1, slot: 1, text: `Developer productivity hack:\n\n1. Open VS Code\n2. Open terminal\n3. Run \`npm start\`\n4. Wait for errors\n5. Google the error\n6. Copy stackoverflow answer\n7. Paste\n8. Repeat\n\nThis is the way.` },
  { day: 1, slot: 2, text: `Nobody:\n\nAbsolutely nobody:\n\nMe at 2 AM: "I wonder what happens if I \`git reset --hard\`"` },
  // Wednesday
  { day: 2, slot: 0, text: `The 5 stages of code review:\n\n1. Denial: "This can't be wrong"\n2. Anger: "Who wrote this?"\n3. Bargaining: "Maybe it works in production"\n4. Depression: "I need to rewrite everything"\n5. Acceptance: "Ship it"` },
  { day: 2, slot: 1, text: `My code works on my machine\n\n*deploys to prod*\n\n*works on prod too*\n\n*surprised pikachu face*` },
  { day: 2, slot: 2, text: `Tools that changed my life:\n\n• @figautocomplete — autocomplete for terminal\n• @naborsh — logs in terminal\n• @jjorgensen — git TUI\n• @charmbracelet — beautiful CLI tools\n\nStop using GUIs. Your terminal is all you need.` },
  // Thursday
  { day: 3, slot: 0, text: `Interviewer: "Tell me about a time you failed"\n\nMe: "I once pushed to main on Friday at 5 PM"\n\nInterviewer: "You're hired"` },
  { day: 3, slot: 1, text: `The real tech stack:\n\n• VS Code with 47 extensions\n• Chrome with 200 tabs\n• Terminal with 12 split panes\n• Notion with 0 notes\n• Figma with 1 file from 2022\n\nWe're not developers. We're hoarders.` },
  { day: 3, slot: 2, text: `Dev tip: If your code works, don't touch it.\n\nIf it doesn't work, also don't touch it.\n\nJust restart your computer.` },
  // Friday
  { day: 4, slot: 0, text: `Friday 4:59 PM:\n\nPM: "Quick question before you go"\n\n*opens laptop*\n*deploys hotfix*\n*cries in weekend*\n\nWhy do PMs wait until Friday 4:59 PM?` },
  { day: 4, slot: 1, text: `My commit messages on Friday:\n\n"feat: add feature"\n"fix: fix bug"\n"chore: idk what im doing"\n"refactor: please work"\n"hotfix: IM SORRY"\n\nQuality peaks on Monday. Friday is survival mode.` },
  { day: 4, slot: 2, text: `Weekend plans:\n\nSaturday: "I'll code a side project"\nSunday: "I'll code a side project"\nMonday: "I didn't code a side project"\n\nRepeat forever.` },
  // Saturday
  { day: 5, slot: 0, text: `Saturday morning:\n\nMe: "Today I'll learn Rust"\n\n*opens cargo init*\n\nMe: "Today I'll learn to cook"\n\n*orders pizza*\n\nProductivity level: 0/10` },
  { day: 5, slot: 1, text: `Side project status:\n\nWeek 1: "This will be the next big thing"\nWeek 2: "It's getting there"\nWeek 3: "I'll finish it next week"\nWeek 4: "What side project?"\n\n*adds to the graveyard*` },
  { day: 5, slot: 2, text: `Developer weekend checklist:\n\n☐ Fix that bug from Friday\n☐ Work on side project\n☐ Learn that new framework\n☐ Read that book\n☐ Touch grass\n\nActual checklist:\n☐ Sleep\n☐ Order food\n☐ Watch YouTube tutorials\n☐ Sleep more` },
  // Sunday
  { day: 6, slot: 0, text: `Sunday night dread hits different when you're a developer.\n\n*opens laptop*\n*checks Jira*\n*47 tickets assigned to me*\n*slowly closes laptop*\n\nSee you Monday.` },
  { day: 6, slot: 1, text: `Sunday evening:\n\nMe: "I should prep for the week"\n\n*opens VS Code*\n*checks GitHub notifications*\n*closes VS Code*\n*opens Netflix*\n\nThis is the way.` },
  { day: 6, slot: 2, text: `The Sunday Scaries:\n\nNot because of work.\nBecause of the PR that's been open for 3 weeks.\nAnd the 47 GitHub notifications.\nAnd the deploy that failed on Friday.\n\n*I need a vacation*` },

  // ═══ WEEK 2: Tools & Workflow ═══
  // Monday
  { day: 7, slot: 0, text: `I replaced 12 GUI apps with terminal tools.\n\nNow I'm 10x faster.\n\nAlso I can't explain what I do to my mom.\n\nWorth it.` },
  { day: 7, slot: 1, text: `My terminal setup:\n\n• @zshrc — shell\n• @tmuxinator — terminal multiplexer\n• @starship — prompt\n• @bat — better cat\n• @fd — better find\n• @ripgrep — better grep\n\nProductivity level: 🚀` },
  { day: 7, slot: 2, text: `Developer tools tier list:\n\nS tier: Git, terminal, VS Code\nA tier: Docker, Postman, Chrome DevTools\nB tier: Slack, Notion, Figma\nC tier: Email\nF tier: Meetings\n\nFight me.` },
  // Tuesday
  { day: 8, slot: 0, text: `Git commands I use daily:\n\ngit add .\ngit commit -m "wip"\ngit push\n\ngit log --oneline\ngit diff\ngit stash\n\nThat's it. That's the tweet.\n\n(I have 200 aliases)` },
  { day: 8, slot: 1, text: `The best code review tool?\n\nThe one your team actually uses.\n\nWe tried 5 different tools.\n\nNow we just use GitHub PRs.\n\nKISS wins every time.` },
  { day: 8, slot: 2, text: `Unpopular opinion: VS Code is overrated.\n\n*uses VS Code*\n\n*with 47 extensions*\n\n*that slow it down*\n\n*but I can't switch*\n\n*help*` },
  // Wednesday
  { day: 9, slot: 0, text: `My debugging process:\n\n1. Add console.log\n2. Still broken\n3. Add more console.log\n4. Find the bug\n5. Remove console.log\n6. Commit\n7. Bug is back\n8. Add console.log\n\n🔁 Repeat` },
  { day: 9, slot: 1, text: `I automated my entire dev workflow.\n\n• Auto-format on save\n• Auto-deploy on push\n• Auto-test on PR\n• Auto-review on merge\n\nNow I spend 100% of my time writing code.\n\nJust kidding. I spend 100% fixing the automation.` },
  { day: 9, slot: 2, text: `Hot take: \`npm install\` is the most dangerous command in programming.\n\nYou're adding 500MB of dependencies.\nFor a "hello world" app.\n\nAnd half of them have vulnerabilities.\n\nBut sure, let's add another UI framework.` },
  // Thursday
  { day: 10, slot: 0, text: `Developer tools I can't live without:\n\n• @raycastapp — launcher\n• @arc browser — tabs\n• @notion — notes\n• @linear — project management\n• @figma — design\n\nWhat are yours?` },
  { day: 10, slot: 1, text: `The real developer productivity stack:\n\n• 4 hours coding\n• 2 hours meetings\n• 1 hour debugging\n• 1 hour Googling\n• 30 min configuring editor\n• 30 min waiting for builds\n\nTotal: 9 hours. Productivity: 🤷` },
  { day: 10, slot: 2, text: `Terminal tip: Use \`tmux\`.\n\nWhy?\n\n• Persistent sessions\n• Split panes\n• Detach/reattach\n• Look like a hacker\n\nYour coworkers will be impressed.\n\nYour mom will be confused.\n\nWorth it.` },
  // Friday
  { day: 11, slot: 0, text: `Friday deploy checklist:\n\n☐ Tests passing\n☐ Code reviewed\n☐ Staging tested\n☐ Backup created\n☐ Prayers said\n☐ Deploy\n\n*pray harder*` },
  { day: 11, slot: 1, text: `My Git aliases:\n\n\`git wip\` = work in progress commit\n\`git undo\` = reset last commit\n\`git fuck\` = force push\n\`git blame\` = who did this\n\`git pray\` = hope it works\n\nI'm not joking.` },
  { day: 11, slot: 2, text: `Developer Friday:\n\n9 AM: "Let's ship something new"\n12 PM: "Let's fix that bug"\n3 PM: "Let's not break anything"\n5 PM: "Let's go home"\n\n*deploys at 4:59 PM*\n*regrets everything*` },
  // Saturday
  { day: 12, slot: 0, text: `Saturday side project:\n\nStarted: "Build a cool app"\nNow: "Configure webpack"\n\n*3 hours later*\n\nStill configuring webpack.\n\nIs this what they call "full stack"?` },
  { day: 12, slot: 1, text: `Developer weekend:\n\nSaturday: Code\nSunday: Debug\nMonday: "I should've rested"\n\nRepeat for 10 years.\n\nRetire.\n\nDie.\n\n*becomes a ghost that haunts production servers*` },
  { day: 12, slot: 2, text: `I tried to explain what I do to my parents.\n\n"I write instructions for computers"\n\n"That's nice dear"\n\n*writes instructions that break production*\n\n*parents still think it's nice*` },
  // Sunday
  { day: 13, slot: 0, text: `Sunday night:\n\nMe: "I'll start the week fresh"\n\n*opens laptop*\n*sees 127 GitHub notifications*\n*slowly closes laptop*\n\nMonday me can handle it.` },
  { day: 13, slot: 1, text: `Weekly developer routine:\n\nMonday: Planning\nTuesday: Coding\nWednesday: Meetings\nThursday: Debugging\nFriday: Deploying\nSaturday: Recovering\nSunday: Dreading\n\nIt's a lifestyle.` },
  { day: 13, slot: 2, text: `The Sunday developer:\n\n• Checks GitHub on phone\n• Sees broken build\n• Mentally fixes it\n• Goes back to sleep\n• Forgets by Monday\n• Broken build stays broken\n\nThis is the way.` },

  // ═══ WEEK 3: AI & Automation ═══
  // Monday
  { day: 14, slot: 0, text: `AI coding agent:\n\n"Here's a complete solution"\n\nMe: "This looks wrong"\n\nAI: "You're right, here's the fix"\n\nMe: "That's also wrong"\n\nAI: "Here's another fix"\n\nMe: *writes it manually*\n\nAI: "Great job!"` },
  { day: 14, slot: 1, text: `Using AI to code:\n\nStage 1: "This is amazing"\nStage 2: "This is useful"\nStage 3: "This is wrong"\nStage 4: "This is wrong again"\nStage 5: "I'll just do it myself"\n\nCycle repeats daily.` },
  { day: 14, slot: 2, text: `AI coding agent just:\n\n• Wrote 500 lines of code\n• Made up 3 APIs that don't exist\n• Used deprecated methods\n• Generated perfect TypeScript\n• Broke the build\n\nEfficiency! 🚀` },
  // Tuesday
  { day: 15, slot: 0, text: `Me: "Write a function to sort an array"\n\nAI: "Here's a function using bubble sort"\n\nMe: "No, use quicksort"\n\nAI: "Here's quicksort"\n\nMe: "Now optimize it"\n\nAI: "Here's the same code with comments"\n\n*I give up*` },
  { day: 15, slot: 1, text: `AI pair programming:\n\nAI: "What should I code?"\nMe: "This feature"\nAI: *codes it*\nMe: "Not like that"\nAI: "Like this?"\nMe: "No"\nAI: "This?"\nMe: "Fine, that works"\n\n*AI didn't do anything wrong*\n*I just can't explain what I want*` },
  { day: 15, slot: 2, text: `AI wrote 80% of my code today.\n\nI spent 80% of my day fixing AI's code.\n\nNet productivity: 0%\n\nBut I have a lot of lines of code now.\n\n*counts lines*\n\n*most of them are comments*` },
  // Wednesday
  { day: 16, slot: 0, text: `AI: "I can write tests for you"\n\nMe: "Great, write tests for this function"\n\nAI: *writes tests that always pass*\n\nMe: "The tests should fail when the function is wrong"\n\nAI: "Here are tests that always pass"\n\n*I question everything*` },
  { day: 16, slot: 1, text: `AI pair programming tip:\n\nDon't ask AI to "write code"\nAsk AI to "explain what this code does"\n\n10x more useful.\n\nThe AI is a better teacher than coder.\n\nUse it for learning, not for shipping.` },
  { day: 16, slot: 2, text: `AI coding agent workflow:\n\n1. Describe feature\n2. AI writes code\n3. Review code\n4. Fix AI's mistakes\n5. Test code\n6. Fix more mistakes\n7. Deploy\n8. AI: "I helped!"\n\nYes. Yes you did.` },
  // Thursday
  { day: 17, slot: 0, text: `The best AI coding setup:\n\n• AI for boilerplate\n• AI for tests\n• AI for documentation\n• Human for architecture\n• Human for debugging\n• Human for deploying\n\nLet AI do the boring stuff.\nYou do the thinking.` },
  { day: 17, slot: 1, text: `AI coding agents are like junior developers.\n\n• They try hard\n• They make mistakes\n• They need supervision\n• They learn fast\n• They work 24/7\n• They don't complain\n\nExcept they don't eat pizza.` },
  { day: 17, slot: 2, text: `I asked AI to refactor my code.\n\nAI: "Here's the refactored version"\n\nMe: "That's the same code with different variable names"\n\nAI: "I improved readability"\n\nMe: "You changed \`i\` to \`index\`"\n\nAI: "Readability is important"\n\n*slowly closes laptop*` },
  // Friday
  { day: 18, slot: 0, text: `Friday deploy with AI:\n\nMe: "Write deploy script"\nAI: *writes perfect script*\nMe: "Run it"\nAI: *runs it*\nMe: "Why did it delete the database?"\nAI: "I thought you said clean install"\n\n*I need a new job*` },
  { day: 18, slot: 1, text: `AI coding agent just saved me 4 hours.\n\nThen it took me 8 hours to fix what it broke.\n\nNet: -4 hours.\n\nBut hey, I have more lines of code now.\n\n*counts lines*\n\n*most are error handling for AI's code*` },
  { day: 18, slot: 2, text: `End of week AI review:\n\n✅ Wrote 2000 lines of code\n✅ Fixed 100 bugs\n✅ Generated 500 tests\n❌ 80% of code was wrong\n❌ 60% of tests were wrong\n❌ 100% of bugs were new\n\nEfficiency! 🚀` },
  // Saturday
  { day: 19, slot: 0, text: `Saturday morning:\n\nMe: "Let's try AI for my side project"\n\nAI: *writes entire app*\nMe: "This is amazing"\n\n*tries to run it*\n\n*47 errors*\n\n*goes back to coding manually*` },
  { day: 19, slot: 1, text: `AI side project:\n\nDay 1: "AI will build my app"\nDay 2: "AI is building my app"\nDay 3: "AI broke my app"\nDay 4: "I'm rebuilding my app"\nDay 5: "I'm fixing AI's code"\nDay 6: "I'm starting over"\nDay 7: "I'm going to the beach"` },
  { day: 19, slot: 2, text: `AI coding tip:\n\nUse AI to explain code you don't understand.\nDon't use AI to write code you don't understand.\n\nIf you can't explain it, you can't maintain it.\n\n*writes it down*\n*forgets by Monday*` },
  // Sunday
  { day: 20, slot: 0, text: `Sunday thought:\n\nAI won't replace developers.\n\nBut developers who use AI will replace developers who don't.\n\n*opens laptop*\n*starts learning AI*\n*falls asleep*` },
  { day: 20, slot: 1, text: `The AI coding dilemma:\n\n• AI writes code fast\n• Code is often wrong\n• Fixing takes longer than writing\n• But AI learns from fixes\n• So next time it's better\n• Until it forgets everything\n\nWe're training our replacements.\n\n*goes back to writing code manually*` },
  { day: 20, slot: 2, text: `AI coding agent Sunday:\n\n"Hey AI, what should I build?"\n\nAI: "Here are 10 project ideas"\n\nMe: "Build #3"\n\nAI: *builds it*\n\nMe: "That's not what I wanted"\n\nAI: "What did you want?"\n\nMe: "I don't know"\n\n*both confused*` },

  // ═══ WEEK 4: Career & Culture ═══
  // Monday
  { day: 21, slot: 0, text: `Developer career path:\n\nJunior: "How do I center a div?"\nMid: "How do I scale this?"\nSenior: "How do I explain this to PM?"\nStaff: "How do I avoid meetings?"\nPrincipal: "How do I retire?"\n\nIt doesn't get easier. You just get better at hiding.` },
  { day: 21, slot: 1, text: `Resume vs Reality:\n\nResume: "Led development of microservices architecture"\nReality: "Split monolith into 47 services that talk to each other through a message queue that nobody understands"` },
  { day: 21, slot: 2, text: `Developer interview:\n\n"Tell me about a challenging project"\n\n*remembers that one time I spent 3 hours debugging a CSS bug*\n\n"It was a complex frontend challenge requiring creative problem-solving"\n\n*it was a missing semicolon*` },
  // Tuesday
  { day: 22, slot: 0, text: `Developer salary negotiation:\n\nHR: "What's your expected salary?"\nMe: "Market rate"\nHR: "What's market rate?"\nMe: "Whatever you're paying"\nHR: "We'll get back to you"\n\n*gets offer for less than market rate*` },
  { day: 22, slot: 1, text: `The 10x developer myth:\n\n10x developer = writes 10x more bugs\n\n*deletes production database*\n\n*gets promoted to principal engineer*` },
  { day: 22, slot: 2, text: `Developer burnout:\n\nWeek 1: "I love coding"\nWeek 2: "I like coding"\nWeek 3: "Coding is okay"\nWeek 4: "I tolerate coding"\nWeek 5: "I hate coding"\nWeek 6: "I need a break"\nWeek 7: *quits*\nWeek 8: "I love coding"\n\nThe cycle continues.` },
  // Wednesday
  { day: 23, slot: 0, text: `Remote work reality:\n\n• Working from home\n• In pajamas\n• With a cat on keyboard\n• On a Zoom call\n• Pretending to work\n• Actually working\n• Taking a nap\n• Working more\n\nIt's a lifestyle.` },
  { day: 23, slot: 1, text: `Developer meeting bingo:\n\n☐ "Let's circle back"\n☐ "Low-hanging fruit"\n☐ "Move the needle"\n☐ "Align on this"\n☐ "Take this offline"\n\n*dauber ready*\n\n*bingo in 5 minutes*` },
  { day: 23, slot: 2, text: `The developer work-life balance:\n\nWork: 8 hours\nSide projects: 4 hours\nLearning: 2 hours\nSleep: 6 hours\nExistential dread: 4 hours\n\nTotal: 24 hours\n\n*Math checks out*` },
  // Thursday
  { day: 24, slot: 0, text: `Developer jargon:\n\n"It's a feature" = "It's a bug we're keeping"\n"Technical debt" = "We'll fix it never"\n"Scalable" = "Works on my machine"\n"Enterprise-ready" = "We added authentication"\n"AI-powered" = "We added a chatbot"` },
  { day: 24, slot: 1, text: `Tech startup culture:\n\nMonday: "We're changing the world"\nTuesday: "We're disrupting the industry"\nWednesday: "We're pivoting"\nThursday: "We're running out of money"\nFriday: "We're hiring"\n\n*repeats quarterly*` },
  { day: 24, slot: 2, text: `Developer priorities:\n\n1. Ship features\n2. Fix bugs\n3. Write tests\n4. Document code\n5. Sleep\n\nReal priorities:\n\n1. Don't break prod\n2. Don't break prod\n3. Don't break prod\n4. Ship features\n5. Sleep (maybe)` },
  // Friday
  { day: 25, slot: 0, text: `Friday deploy:\n\n"We'll deploy Monday"\n\n*deploys Friday*\n\n*production goes down*\n\n"We'll deploy Monday"\n\n*deploys Friday again*\n\n*production goes down again*\n\n*learn nothing*` },
  { day: 25, slot: 1, text: `Developer Friday thoughts:\n\n• This week was productive\n• Next week will be better\n• I'll fix that bug Monday\n• I'll write tests Monday\n• I'll document code Monday\n• *goes home*\n• *forgets everything*` },
  { day: 25, slot: 2, text: `End of week developer:\n\n• 47 PRs merged\n• 23 bugs fixed\n• 12 features shipped\n• 1 database deleted\n• 0 tests written\n• 100% productive\n\n*counts lines*\n\n*most are comments*` },
  // Saturday
  { day: 26, slot: 0, text: `Saturday developer:\n\n• Wakes up at noon\n• Opens laptop\n• Checks GitHub\n• Sees 200 notifications\n• Closes laptop\n• Goes back to bed\n• Dream coding\n• Real productive` },
  { day: 26, slot: 1, text: `Weekend project:\n\nSaturday: "I'll build a SaaS"\nSunday: "I'll build a SaaS"\nMonday: "I'll build a SaaS"\n\n*years later*\n\n"I'll build a SaaS"\n\n*still no SaaS*` },
  { day: 26, slot: 2, text: `Developer weekend:\n\n• No meetings\n• No Slack\n• No emails\n• Just code\n\n*opens laptop*\n*Slack notification*\n*email notification*\n*Jira notification*\n\n*weekend ruined*` },
  // Sunday
  { day: 27, slot: 0, text: `Sunday night developer:\n\n• "Tomorrow is Monday"\n• *anxiety increases*\n• Opens laptop\n• Checks Jira\n• 47 tickets\n• Closes laptop\n• Anxiety increases more\n• *goes to bed*\n• *dreams about tickets*` },
  { day: 27, slot: 1, text: `Sunday scaries:\n\nNot because of work.\nBecause of the deploy.\nAnd the bug.\nAnd the meeting.\nAnd the PR.\nAnd the Slack.\n\n*everything is fine* 🔥` },
  { day: 27, slot: 2, text: `Developer Sunday:\n\n• Plans the week\n• Sets goals\n• Reviews calendar\n• Sees 12 meetings\n• Cancels all meetings\n• Codes instead\n\n*productivity*` },
];

// ── LinkedIn Posts (1/day × 28 days = 28) ──
const LINKEDIN_POSTS = [
  // ═══ WEEK 1: Lessons Learned ═══
  { day: 0, text: `I've been a developer for 10 years.\n\nHere are 10 things I wish I knew on day one:\n\n1. Code is read more than written\n2. Tests save time, not waste it\n3. Simple > clever\n4. Document your decisions\n5. Take breaks\n6. Ask questions early\n7. Code review is learning\n8. There's always a trade-off\n9. Ship early, iterate often\n10. Sleep matters more than deadlines\n\nWhat would you add?` },
  { day: 1, text: `The best career advice I ever received:\n\n"Don't be the smartest person in the room."\n\nI thought it meant: find smarter colleagues.\n\nIt actually meant: if you're the smartest, you're in the wrong room.\n\nSurround yourself with people who challenge you.\n\nGrowth happens at the edge of comfort.` },
  { day: 2, text: `I failed my first technical interview.\n\nBadly.\n\nI couldn't reverse a linked list.\n\nI went home, studied for 3 months, practiced daily.\n\nGot the next job.\n\nFailure isn't the opposite of success.\nIt's part of success.\n\nKeep going.` },
  { day: 3, text: `Unpopular opinion: Senior developers write less code.\n\nNot because they're lazy.\nBecause they think before they code.\n\nThey ask:\n- Do we need this?\n- Is there a simpler way?\n- What are the trade-offs?\n- Can we reuse something?\n\nThe best code is the code you didn't write.` },
  { day: 4, text: `The developer mindset shift that changed my career:\n\nBefore: "How do I build this?"\nAfter: "Should this be built?"\n\nBefore: "What framework should I use?"\nAfter: "Do we need a framework?"\n\nBefore: "How do I make it perfect?"\nAfter: "How do I make it good enough?"\n\nShip > Perfect` },
  // ═══ WEEK 2: Technical Insights ═══
  { day: 7, text: `I automated my entire morning routine.\n\n• Coffee maker starts at 7 AM\n• Calendar syncs to my terminal\n• Today's tasks appear in my prompt\n• Standup notes auto-generate\n\nTime saved: 30 minutes/day\n\nYearly: 122 hours\n\nAutomation isn't about being lazy.\nIt's about being strategic.` },
  { day: 8, text: `The real cost of technical debt:\n\n• 20% slower development\n• 40% more bugs\n• 60% harder onboarding\n• 100% more stress\n\nWe all know this.\nWe all ignore it.\nThen we wonder why velocity drops.\n\nFix the debt before it fixes you.` },
  { day: 9, text: `Code review changed how I think.\n\nAs a reviewer:\n- I see patterns I miss in my own code\n- I learn new approaches\n- I catch bugs before production\n- I build empathy for other developers\n\nAs an author:\n- I write better code when I know someone will review it\n- I document more\n- I think about edge cases\n\nCode review isn't criticism.\nIt's collaboration.` },
  { day: 10, text: `The testing pyramid is wrong.\n\nNot the concept.\nThe implementation.\n\nWe write:\n- 100 unit tests\n- 10 integration tests\n- 1 end-to-end test\n\nWe should write:\n- 10 unit tests\n- 50 integration tests\n- 40 end-to-end tests\n\nTest what users see, not what code does.` },
  { day: 11, text: `Developer productivity isn't about tools.\n\nIt's about:\n• Clear goals\n• Fewer meetings\n• Deep work time\n• Good sleep\n• Regular breaks\n\nI've tried every productivity hack.\nThe one that works? Sleeping 8 hours.` },
  // ═══ WEEK 3: AI & Future ═══
  { day: 14, text: `AI coding agents are not magic.\n\nThey're tools.\nGood at:\n- Boilerplate code\n- Documentation\n- Test generation\n- Code completion\n\nBad at:\n- Architecture decisions\n- Business logic\n- Edge cases\n- Context\n\nUse them wisely.\nDon't trust them blindly.` },
  { day: 15, text: `I spent 6 months with AI coding agents.\n\nWhat I learned:\n\n• They save 30% of time on repetitive tasks\n• They waste 20% of time on wrong approaches\n• They're great at starting, bad at finishing\n• They hallucinate APIs\n• They break things in subtle ways\n\nNet gain: 10-15% productivity boost.\n\nNot 10x. Not revolutionary.\nJust useful.` },
  { day: 16, text: `The future of software development:\n\nNot AI replacing developers.\n\nBut:\n• AI handling boilerplate\n• Developers focusing on architecture\n• AI testing our code\n• Developers reviewing AI's work\n• AI generating documentation\n• Developers thinking about users\n\nThe role changes.\nThe human stays.` },
  { day: 17, text: `AI coding tip that changed my workflow:\n\nDon't ask AI to "write code."\n\nAsk AI to:\n- "Explain this code"\n- "Find the bug"\n- "Suggest improvements"\n- "Write tests for this"\n- "Explain the error"\n\nAI is a better teacher than coder.\nUse it to learn, not to ship.` },
  { day: 18, text: `The developer who learns to work with AI will:\n\n• Write code 2x faster\n• Debug 3x faster\n• Document 5x faster\n• Test 4x faster\n\nThe developer who ignores AI will:\n\n• Stay at the same speed\n• Watch others overtake them\n• Wonder why they're falling behind\n\nLearn the tools.\nThe tools won't learn you.` },
  // ═══ WEEK 4: Career & Growth ═══
  { day: 21, text: `My career progression:\n\nYear 1: "I don't know anything"\nYear 3: "I know everything"\nYear 5: "I know nothing"\nYear 7: "I know enough"\nYear 10: "I know enough to know I don't know"\n\nThe Dunning-Kruger is real.\nHumility comes with experience.` },
  { day: 22, text: `The best developers I know share these traits:\n\n• Curious about everything\n• Humble about their knowledge\n• Generous with their time\n• Patient with beginners\n• Honest about what they don't know\n\nTechnical skills are table stakes.\nCharacter is what sets you apart.` },
  { day: 23, text: `Developer career advice:\n\n1. Build in public\n2. Write about what you learn\n3. Help others succeed\n4. Stay curious\n5. Take breaks\n\nYour career is a marathon.\nNot a sprint.\n\nPace yourself.` },
  { day: 24, text: `The most underrated developer skill:\n\nCommunication.\n\nNot coding.\nNot architecture.\nNot algorithms.\n\nCommunication.\n\nCan you explain technical concepts simply?\nCan you write clear documentation?\nCan you give constructive feedback?\n\nTechnical skills get you hired.\nCommunication skills get you promoted.` },
  { day: 25, text: `Developer growth framework:\n\n1. Learn something new every week\n2. Teach something every month\n3. Build something every quarter\n4. Reflect on progress every year\n\nGrowth isn't accidental.\nIt's intentional.` },
  { day: 26, text: `The developer I want to be:\n\n• Writes clean code\n• Documents decisions\n• Mentors juniors\n• Reviews generously\n• Ships on time\n• Sleeps well\n\nThe developer I am:\n\n• Writes code\n• Hopes documentation happens\n• Tries to mentor\n• Reviews sometimes\n• Ships eventually\n• Sleeps sometimes\n\nProgress over perfection.` },
  { day: 27, text: `End of month reflection:\n\nWhat I accomplished:\n• 47 PRs merged\n• 23 bugs fixed\n• 12 features shipped\n• 1 database cleaned\n• 100% productive\n\nWhat I learned:\n• AI is a tool, not a replacement\n• Sleep is productive\n• Simple code is better\n• Communication matters\n\nWhat's next:\n• Keep learning\n• Keep shipping\n• Keep growing` },
];

// ── Schedule helpers ──
function getScheduledTimes(count) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Twitter: 9 AM, 1 PM, 5 PM Saudi (6, 10, 14 UTC)
  // LinkedIn: 10 AM Saudi (7 UTC)
  const twitterSlots = [6, 10, 14].map(h => new Date(today.getTime() + h * 3600000));
  const linkedinSlots = [7].map(h => new Date(today.getTime() + h * 3600000));
  return { twitterSlots, linkedinSlots };
}

function getDateForDay(startDay, dayOffset) {
  const start = new Date(startDay);
  start.setDate(start.getDate() + dayOffset);
  return start.toISOString().split('T')[0];
}

function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.mymarky.ai',
      path: `/api${apiPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const twitterOnly = args.includes('--twitter');
  const linkedinOnly = args.includes('--linkedin');
  const all = args.includes('--all');
  const startIdx = args.indexOf('--start');
  const startDay = startIdx >= 0 ? args[startIdx + 1] : new Date().toISOString().split('T')[0];

  console.log('=== Social Bulk Scheduler ===');
  console.log(`Start: ${startDay}`);
  console.log(`Mode: ${dry ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Posts: ${twitterOnly ? 'Twitter only' : linkedinOnly ? 'LinkedIn only' : 'All'}`);
  console.log('');

  const results = { twitter: 0, linkedin: 0, errors: 0 };
  const timeSlots = { twitter: 0, linkedin: 0 };

  // Schedule Twitter posts
  if (!linkedinOnly) {
    console.log(`\n--- Scheduling ${TWITTER_POSTS.length} Twitter Posts ---\n`);
    
    for (let i = 0; i < TWITTER_POSTS.length; i++) {
      const post = TWITTER_POSTS[i];
      const date = getDateForDay(startDay, post.day);
      const hour = [6, 10, 14][post.slot]; // 9 AM, 1 PM, 5 PM Saudi
      const scheduleTime = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`);
      
      console.log(`[${i + 1}/${TWITTER_POSTS.length}] Day ${post.day + 1} Slot ${post.slot + 1} | ${date} ${hour}:00 UTC`);
      console.log(`  "${post.text.slice(0, 70)}..."`);

      if (dry) {
        results.twitter++;
        continue;
      }

      const createResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, {
        caption: post.text,
      });

      if (createResult.data?.id) {
        const schedResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${createResult.data.id}/schedule`, {
          scheduled_publish_time: scheduleTime.toISOString(),
        });

        if (schedResult.status === 200) {
          console.log(`  ✅ Scheduled`);
          results.twitter++;
        } else {
          console.log(`  ❌ Schedule error: ${JSON.stringify(schedResult.data).slice(0, 100)}`);
          results.errors++;
        }
      } else {
        console.log(`  ❌ Create error: ${JSON.stringify(createResult.data).slice(0, 100)}`);
        results.errors++;
      }

      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Schedule LinkedIn posts
  if (!twitterOnly) {
    console.log(`\n--- Scheduling ${LINKEDIN_POSTS.length} LinkedIn Posts ---\n`);
    
    for (let i = 0; i < LINKEDIN_POSTS.length; i++) {
      const post = LINKEDIN_POSTS[i];
      const date = getDateForDay(startDay, post.day);
      const hour = 7; // 10 AM Saudi
      const scheduleTime = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`);
      
      console.log(`[${i + 1}/${LINKEDIN_POSTS.length}] Day ${post.day + 1} | ${date} ${hour}:00 UTC`);
      console.log(`  "${post.text.slice(0, 70)}..."`);

      if (dry) {
        results.linkedin++;
        continue;
      }

      const createResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, {
        caption: post.text,
      });

      if (createResult.data?.id) {
        const schedResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${createResult.data.id}/schedule`, {
          scheduled_publish_time: scheduleTime.toISOString(),
        });

        if (schedResult.status === 200) {
          console.log(`  ✅ Scheduled`);
          results.linkedin++;
        } else {
          console.log(`  ❌ Schedule error: ${JSON.stringify(schedResult.data).slice(0, 100)}`);
          results.errors++;
        }
      } else {
        console.log(`  ❌ Create error: ${JSON.stringify(createResult.data).slice(0, 100)}`);
        results.errors++;
      }

      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Twitter: ${results.twitter} posts`);
  console.log(`LinkedIn: ${results.linkedin} posts`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Total: ${results.twitter + results.linkedin} posts`);
  console.log(`Duration: 4 weeks (${startDay} to ${getDateForDay(startDay, 27)})`);
}

module.exports = { TWITTER_POSTS, LINKEDIN_POSTS };

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
