import { addDays, firstName, greeting, toISODate } from '../utils'
import { extractiveSummary, keywords, splitSentences, tidy } from './text'
import type { AIContext, AIProvider, AIRequest } from './types'

const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length]

const limit = <T,>(list: T[], ctx: AIContext) =>
  ctx.responseStyle === 'concise' ? list.slice(0, 3) : ctx.responseStyle === 'balanced' ? list.slice(0, 5) : list

function opener(ctx: AIContext, seed: number) {
  const lines = {
    professional: ['Certainly.', 'Understood — here is a structured take.', 'Here is what I recommend.'],
    friendly: ['Absolutely — happy to help!', "Love this. Let's do it.", 'Sure thing!'],
    creative: ['Ooh, good one.', "Let's make this interesting.", "Alright, let's get inventive."],
  }[ctx.personality]
  return pick(lines, seed)
}

function closing(ctx: AIContext, seed: number) {
  if (ctx.responseStyle === 'concise') return ''
  const lines = {
    professional: ['Let me know if you would like me to refine any part.', 'I can turn this into tasks whenever you are ready.'],
    friendly: ['Want me to tweak anything?', 'Should I turn this into tasks for you?'],
    creative: ['Want a bolder version?', 'Shall we push it even further?'],
  }[ctx.personality]
  return '\n\n' + pick(lines, seed)
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function subject(text: string) {
  const about = text.match(/\b(?:about|on|regarding|for)\s+(.+)/i)
  const raw = (about ? about[1] : text)
    .replace(
      /^(please\s+)?(can you|could you|would you|will you|help me|i want to|i need to|i'd like to|let's|lets)?\s*(research|write|draft|brainstorm|explain|summari[sz]e|plan|decide|learn|study|create|make|give me|tell me)?\s*(me\s+)?(some\s+)?(ideas?\s+for\s+)?/i,
      '',
    )
    .replace(/[?.!]+$/, '')
    .trim()
  return raw || text.trim()
}

/* ---------------- time helpers ---------------- */

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}
const fmt = (min: number) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

/* ---------------- skills ---------------- */

function planDay(ctx: AIContext, seed: number) {
  const tomorrow = ctx.now.getHours() >= 18
  const date = tomorrow ? addDays(toISODate(ctx.now), 1) : toISODate(ctx.now)
  const morningPerson = ctx.memories.some((m) => /morning/i.test(m))
  const rank = { high: 0, medium: 1, low: 2 }
  const tasks = ctx.tasks
    .filter((t) => !t.done && (!t.due || t.due <= date))
    .sort((a, b) => rank[a.priority] - rank[b.priority])
    .slice(0, 4)

  type Block = { s: number; e: number; label: string }
  const blocks: Block[] = ctx.events
    .filter((e) => e.date === date)
    .map((e) => ({ s: toMin(e.start), e: e.end ? toMin(e.end) : toMin(e.start) + 60, label: e.title }))

  const overlaps = (s: number, e: number) => blocks.find((b) => s < b.e && e > b.s)
  if (!overlaps(750, 810)) blocks.push({ s: 750, e: 810, label: 'Lunch break' })

  let cursor = tomorrow || ctx.now.getHours() < 8 ? 480 : Math.ceil((ctx.now.getHours() * 60 + ctx.now.getMinutes()) / 30) * 30
  const place = (label: string, length = 60) => {
    let guard = 0
    let hit = overlaps(cursor, cursor + length)
    while (hit && guard++ < 20) {
      cursor = hit.e
      hit = overlaps(cursor, cursor + length)
    }
    if (cursor + length > 1080) return false
    blocks.push({ s: cursor, e: cursor + length, label })
    cursor += length + 15
    return true
  }

  if (tasks.length) {
    tasks.forEach((t, i) => place(i === 0 ? `Focused work — ${t.title}` : t.title, i === 0 ? 90 : 60))
  } else {
    place('Focused work on your top priority', 90)
    place('Learn something new')
  }
  if (!overlaps(1080, 1110)) blocks.push({ s: 1080, e: 1110, label: 'Review and plan tomorrow' })

  const lines = blocks
    .sort((a, b) => a.s - b.s)
    .map((b) => `- **${fmt(b.s)}** — ${b.label}`)
    .join('\n')

  const hint = morningPerson ? "\n\n_Since you're sharpest in the morning, I put your most important work first._" : ''
  return `${pick(['Here\'s a simple plan for your day:', 'Here is a realistic plan:', 'Your day, mapped out:'], seed).replace('your day', tomorrow ? 'tomorrow' : 'your day')}\n\n${lines}${hint}\n\nLet me know if you want me to adjust it or handle something specific.`
}

function summarize(text: string, ctx: AIContext, source?: string) {
  const n = ctx.responseStyle === 'concise' ? 2 : ctx.responseStyle === 'balanced' ? 3 : 5
  const [tldr = text.slice(0, 140), ...points] = extractiveSummary(text, n + 1)
  const keys = keywords(text, 6)
  return [
    source ? `Here's a summary of **${source}**.` : "Here's the summary.",
    `\n**TL;DR:** ${tldr}`,
    points.length ? `\n### Key points\n${points.map((p) => `- ${p}`).join('\n')}` : '',
    keys.length ? `\n**Keywords:** ${keys.join(', ')}` : '',
    `\n_${splitSentences(text).length} sentences condensed to ${points.length + 1}._`,
  ].join('\n')
}

function research(topic: string, ctx: AIContext, seed: number) {
  const t = cap(topic)
  const questions = limit(
    [
      `What is the current state of ${topic}, and what has changed recently?`,
      'Who are the main players, and how do they differ?',
      'What are the biggest risks, open problems or misconceptions?',
      'What does success look like — and how is it measured?',
      `What would someone new to ${topic} most likely get wrong?`,
      'Where is this heading in the next 2–3 years?',
    ],
    ctx,
  )
  return `${opener(ctx, seed)} Here's a research brief.\n\n### ${t}\n**Goal:** understand this well enough to make a confident decision — or explain it to someone else.\n\n**Key questions**\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n**Angles to explore:** market, people, technology, cost, timing.\n\n**Where to look**\n- Primary sources — official reports, docs and data\n- Expert voices — interviews, talks, podcasts\n- Communities — forums and practitioner groups\n- Recent news from the last 12 months\n\n**Next steps**\n- Pick the two questions that matter most to you\n- Collect notes in **Files**, then ask me to summarize them\n\n> Live web search isn't connected yet — once it is, I'll fill this brief with cited sources automatically.`
}

function writeDraft(topic: string, raw: string, ctx: AIContext, seed: number) {
  const t = topic.replace(/^(a|an|the)\s+/i, '')
  if (/\bbio\b/i.test(raw)) {
    return `Here's a first draft of your bio:\n\n---\n\n**${ctx.userName}** helps people think clearer and work smarter. Focused on ${pick(['technology and productivity', 'building useful digital products', 'creativity and growth'], seed)}, ${firstName(ctx.userName)} shares practical ideas, tools and lessons learned along the way — always with a bias for action.\n\n---\n\nWant a shorter version for social profiles?`
  }
  const hook = pick([`Let's talk about ${t}.`, `Here's what nobody tells you about ${t}.`, `${cap(t)} changed how I work.`], seed)
  const points = limit(
    ['Start before you feel ready', 'Make it simple enough to repeat every day', 'Share the process, not just the result', 'Measure what matters and ignore the rest', 'Ask for feedback early'],
    ctx,
  )
  return `${opener(ctx, seed)} Here's a first draft:\n\n---\n\n**${hook}**\n\nOver the past few weeks I've been thinking a lot about ${t}. What surprised me most: small, consistent steps beat big bursts of effort — every time.\n\nHere's what I've learned so far:\n${points.map((p) => `- ${p}`).join('\n')}\n\nWhat's your take on ${t}? I'd love to hear it.\n\n---${closing(ctx, seed)}`
}

function emailDraft(topic: string, raw: string, ctx: AIContext) {
  const lower = raw.toLowerCase()
  const subjectLine = cap(topic.split(/\s+/).slice(0, 7).join(' '))
  let body = `I'm reaching out regarding ${topic}. I'd love to find a time that works for you to discuss next steps.`
  if (/follow ?up/.test(lower)) body = `I wanted to follow up on ${topic.replace(/^follow(ing)? ?up (on|about|with)?\s*/i, '')}. Could you let me know if there's any update, or if you need anything else from me?`
  else if (/thank/.test(lower)) body = `Thank you so much for ${topic.replace(/^(thank(ing)?( you)?( for)?)\s*/i, '')}. It made a real difference, and I truly appreciate it.`
  else if (/\b(ask|request|day off|leave|permission)\b/.test(lower)) body = `I'd like to request ${topic.replace(/^(ask(ing)?|request(ing)?)\s+(my\s+\w+\s+)?(for\s+)?/i, '')}. I'll make sure everything on my side is covered beforehand. Please let me know if that works.`
  else if (/pitch|collab|partner/.test(lower)) body = `I've been following your work and think there's a great opportunity for us to collaborate on ${topic.replace(/^(pitch(ing)?|a)\s+/i, '')}. I'd love to share a few ideas — would you be open to a quick 15-minute call this week?`
  return `**Subject:** ${subjectLine}\n\nHi [Name],\n\nI hope you're doing well.\n\n${body}\n\nBest regards,\n${firstName(ctx.userName)}\n\n_Tip: replace [Name] and adjust the details before sending._`
}

function decide(raw: string, ctx: AIContext, seed: number) {
  const q = raw.replace(/^(help me decide|should i|i can't decide|i cant decide|decide)[:\s,]*/i, '').replace(/[?.!]+$/, '')
  const m = q.match(/^(.+?)\s+(?:or|vs\.?|versus)\s+(.+)$/i)
  const questions = limit(
    [
      'Which option moves you closer to your 12-month goal?',
      "Which one is easier to reverse if it doesn't work out?",
      'What would you choose if money and fear were not factors?',
      'Which will you regret not trying?',
    ],
    ctx,
  )
  if (!m) {
    return `${opener(ctx, seed)} Let's think it through.\n\nTell me your options (e.g. _"A or B"_) and I'll compare them. In the meantime, ask yourself:\n\n${questions.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
  }
  const [a, b] = [cap(m[1].trim()), cap(m[2].trim())]
  return `${opener(ctx, seed)} Let's weigh it up.\n\n**Option A — ${a}**\n- Upside: momentum and clarity if it fits your current goals\n- Watch out for: hidden costs in time, energy or money\n\n**Option B — ${b}**\n- Upside: new opportunities and learning\n- Watch out for: uncertainty and the cost of switching\n\n**Questions to decide**\n${questions.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n**My suggestion:** score both options 1–5 on impact, cost, risk and enjoyment. If the scores are close, choose the more reversible option — you learn faster with less downside.`
}

function brainstorm(topic: string, ctx: AIContext, seed: number) {
  const groups: [string, string[]][] = [
    ['Quick wins', [`A simple checklist or template for ${topic}`, `A 5-minute daily habit built around ${topic}`, `A "before & after" story about ${topic}`]],
    ['Bold bets', [`A 30-day challenge centred on ${topic}`, `A small community or newsletter for people into ${topic}`, `A tool that automates the boring part of ${topic}`]],
    ['Wildcards', [`Mix ${topic} with a completely unrelated hobby`, `Do the opposite of what everyone expects with ${topic}`, `Co-create something about ${topic} with a total beginner`]],
  ]
  const shown = ctx.responseStyle === 'concise' ? groups.slice(0, 2) : groups
  return `${opener(ctx, seed)} Here are some ideas for **${topic}**:\n\n${shown
    .map(([g, items]) => `### ${g}\n${items.map((i) => `- ${i}`).join('\n')}`)
    .join('\n\n')}${closing(ctx, seed)}`
}

function study(topic: string, ctx: AIContext, seed: number) {
  const morning = ctx.memories.some((m) => /morning/i.test(m))
  return `${opener(ctx, seed)} Here's a learning roadmap for **${topic}**.\n\n### Roadmap\n- **Week 1:** core concepts and vocabulary — aim to explain them in your own words\n- **Week 2:** guided practice with small, real examples\n- **Week 3:** build a mini project that uses what you've learned\n- **Week 4:** review weak spots, teach it to someone, and share your project\n\n### Practice questions\n1. What problem does ${topic} solve?\n2. What are its three most important ideas?\n3. Where do beginners usually get stuck?\n\n### Schedule\n- 45 minutes a day, 5 days a week${morning ? ' — in the morning, when you focus best' : ''}\n- Weekly 20-minute review every Sunday${closing(ctx, seed)}`
}

const EXPLAINERS: [RegExp, string][] = [
  [/\bapi\b/i, "An **API** (Application Programming Interface) is a menu that one piece of software offers to another.\n\n**Analogy:** in a restaurant you don't walk into the kitchen — you order from the menu and the waiter brings back your food. The API is the menu and the waiter.\n\n**Example:** when a weather app shows today's forecast, it asks a weather service's API for the data and displays the answer.\n\n**Key takeaways**\n- APIs let apps talk to each other safely\n- They define what you can ask for and what you'll get back\n- Almost every modern app is built on top of APIs"],
  [/compound interest/i, "**Compound interest** means you earn interest on your interest, not just on what you put in.\n\n**Analogy:** a snowball rolling downhill — the bigger it gets, the more snow it picks up each turn.\n\n**Example:** invest 1,000 at 10% a year. Year one you earn 100. Year two you earn 110, because you're earning on 1,100. After 20 years it's roughly 6,700 — without adding anything.\n\n**Key takeaways**\n- Time matters more than the starting amount\n- Start early, even small\n- It works against you on debt, too"],
  [/inflation/i, "**Inflation** is the general rise in prices over time — which means the same money buys a little less each year.\n\n**Analogy:** it's like a slow leak in a tyre. You don't notice day to day, but over years the difference is big.\n\n**Example:** if inflation is 5%, something that costs 100 today costs about 105 next year.\n\n**Key takeaways**\n- Moderate inflation is normal in a growing economy\n- Cash sitting still loses buying power\n- Wages and investments need to grow faster than inflation to keep up"],
  [/neural network/i, "A **neural network** learns patterns by adjusting millions of tiny dials until its guesses get better.\n\n**Analogy:** learning to throw darts. Each miss tells you to aim a little higher or lower; after thousands of throws you get accurate.\n\n**Example:** shown thousands of labelled cat photos, a network gradually tunes itself to recognise whiskers, ears and fur patterns.\n\n**Key takeaways**\n- It learns from examples, not explicit rules\n- More (and better) data usually means better results\n- It finds patterns, but doesn't 'understand' like a person"],
]

function explain(topic: string, ctx: AIContext, seed: number) {
  const known = EXPLAINERS.find(([re]) => re.test(topic))
  if (known) return known[1]
  return `${opener(ctx, seed)} Here's how I'd break down **${topic}**:\n\n1. **What it is** — a one-sentence plain-language definition\n2. **Why it matters** — the problem it solves\n3. **How it works** — the 3 key steps or parts\n4. **An everyday analogy** — something familiar it resembles\n5. **A common misconception** — what people usually get wrong\n\n> I'm running on the local demo engine, so I can't fill in specialist facts yet. Once a full AI model is connected, I'll answer this directly.`
}

function rewrite(text: string, ctx: AIContext) {
  const polished = tidy(text)
  return `Here's a polished version:\n\n---\n\n${polished}\n\n---${ctx.responseStyle === 'concise' ? '' : '\n\n**What I changed:** removed filler words, fixed capitalisation and tightened the sentences.'}`
}

function memoryRecall(ctx: AIContext) {
  if (!ctx.memories.length) return "I don't have any saved memories about you yet. Tell me something like _\"Remember that I prefer morning meetings\"_ and I'll keep it in mind."
  return `Here's what I remember about you:\n\n${ctx.memories.map((m) => `- ${m}`).join('\n')}\n\nYou can edit or delete any of these in **Memory**.`
}

function capabilities(ctx: AIContext) {
  return `I'm Mr Balogun — your personal AI assistant, ${firstName(ctx.userName)}. Here's what I can do:\n\n- **Chat** — answer questions and think things through with you\n- **Plan** — build your day from your tasks and calendar\n- **Write** — drafts, emails, bios and polished rewrites\n- **Summarize** — condense notes and files into key points\n- **Remember** — say _"remember that…"_ and I'll keep it\n- **Organize** — say _"add a task to…"_ or _"schedule … at 3pm"_\n\nWhat would you like to start with?`
}

function greet(ctx: AIContext, seed: number) {
  const due = ctx.tasks.filter((t) => !t.done && t.due && t.due <= toISODate(ctx.now)).length
  const nudge = due ? `\n\nYou have **${due} task${due > 1 ? 's' : ''}** due today — want me to plan your day around ${due > 1 ? 'them' : 'it'}?` : '\n\nWhat would you like to work on?'
  return `${greeting(ctx.now)}, ${firstName(ctx.userName)}! ${pick(['Good to see you.', 'Ready when you are.', 'How can I help today?'], seed)}${nudge}`
}

function fallback(raw: string, ctx: AIContext, seed: number) {
  const short = raw.length > 80 ? raw.slice(0, 77).trim() + '…' : raw
  return `${opener(ctx, seed)} Here's how I'd approach _"${short}"_:\n\n1. **Clarify the outcome** — what does "done" look like?\n2. **Break it down** — list the three smallest next steps.\n3. **Schedule it** — I can add those steps to your tasks or calendar.\n\nTell me a bit more, or try _"research this"_, _"write a draft"_ or _"help me decide"_.`
}

/* ---------------- router ---------------- */

export function composeReply(req: AIRequest): string {
  const ctx = req.context
  const last = [...req.messages].reverse().find((m) => m.role === 'user')
  const raw = (last?.content ?? '').trim()
  const lower = raw.toLowerCase()
  const seed = (req.variant ?? 0) + raw.length
  const files = req.files ?? []
  const fileText = files.map((f) => f.textExcerpt).filter(Boolean).join('\n\n')
  const topic = subject(raw) || 'this'

  switch (req.toolId) {
    case 'research': return research(topic, ctx, seed)
    case 'summarize': return fileText || raw.length > 60 ? summarize(fileText || raw, ctx, files[0]?.name) : 'Paste a few paragraphs (or attach a text file) and I will summarize it.'
    case 'write': return writeDraft(topic, raw, ctx, seed)
    case 'email': return emailDraft(topic, raw, ctx)
    case 'rewrite': return raw.length > 20 ? rewrite(raw, ctx) : 'Paste the text you want polished and I will clean it up.'
    case 'plan': return planDay(ctx, seed)
    case 'decide': return decide(raw, ctx, seed)
    case 'brainstorm': return brainstorm(topic, ctx, seed)
    case 'study': return study(topic, ctx, seed)
    case 'explain': return explain(topic, ctx, seed)
  }

  if (files.length) {
    if (fileText) return summarize(fileText, ctx, files.map((f) => f.name).join(', '))
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length) return `I've saved **${images.map((f) => f.name).join(', ')}** to your Files.\n\nImage understanding switches on once a vision model is connected — for now, tell me what you'd like to do with ${images.length > 1 ? 'them' : 'it'} and I'll help you plan it.`
    return `I've saved **${files.map((f) => f.name).join(', ')}** to your Files.\n\nI can read text-based files (.txt, .md, .csv, .json) right now. For PDFs and documents, paste the text and I'll summarize it.`
  }

  if (/^(hi|hey|hello|yo|good (morning|afternoon|evening)|sup)\b/.test(lower) && raw.length < 40) return greet(ctx, seed)
  if (/what do you (know|remember) about me|my memor|what have you remembered/.test(lower)) return memoryRecall(ctx)
  if (/^(who are you|what can you do|what are you)\b|^help[.!?]?$/.test(lower)) return capabilities(ctx)
  if (/plan (my|the|our) (day|morning|afternoon|tomorrow)|schedule (my|for) (day|today)|^plan my day/.test(lower)) return planDay(ctx, seed)
  if (/^summari[sz]e|summary of|tl;?dr/.test(lower)) {
    const body = raw.replace(/^summari[sz]e( this)?:?\s*/i, '')
    return body.length > 80 ? summarize(body, ctx) : 'Sure — paste the text or attach a file and I will pull out the key points.'
  }
  if (/^(should i|help me decide|i can'?t decide)|\b(vs\.?|versus)\b/.test(lower)) return decide(raw, ctx, seed)
  if (/^(research|look into|find out|investigate)\b/.test(lower)) return research(topic, ctx, seed)
  if (/\b(email|e-mail)\b/.test(lower) && /\b(write|draft|send|compose)\b/.test(lower)) return emailDraft(topic, raw, ctx)
  if (/^(rewrite|polish|improve|proofread|fix)\b/.test(lower) && raw.length > 40) return rewrite(raw.replace(/^(rewrite|polish|improve|proofread|fix)( this)?:?\s*/i, ''), ctx)
  if (/^(write|draft|create)\b|create something/.test(lower)) {
    if (/create something/.test(lower)) return `${opener(ctx, seed)} What should we create?\n\n- A **post** or article\n- An **email** or message\n- A **plan** for a goal or project\n- A **list of ideas** to get unstuck\n\nTell me the topic and the vibe, and I'll draft it.`
    return writeDraft(topic, raw, ctx, seed)
  }
  if (/\b(ideas?|brainstorm|suggestions?)\b/.test(lower)) return brainstorm(topic, ctx, seed)
  if (/^(teach me|how (do|can) i learn|study plan|learning plan)/.test(lower)) return study(topic, ctx, seed)
  if (/^(explain|what is|what are|what's|how does|how do)\b/.test(lower)) return explain(topic, ctx, seed)
  if (/^(thanks|thank you|thx|cheers)\b/.test(lower)) return pick(["You're welcome! Anything else?", 'Anytime. What next?', 'Happy to help!'], seed)
  if (/solve a problem|help me solve/.test(lower)) return `${opener(ctx, seed)} Let's solve it together.\n\n1. **Describe the problem** in one or two sentences\n2. **What have you tried** so far?\n3. **What does a good outcome** look like?\n\nShare those and I'll suggest a path forward.`

  return fallback(raw, ctx, seed)
}

/* ---------------- streaming ---------------- */

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

export async function* streamText(text: string, signal: AbortSignal) {
  await sleep(380 + Math.random() * 380, signal)
  const tokens = text.match(/\S+\s*|\s+/g) ?? []
  for (let i = 0; i < tokens.length; ) {
    const step = 1 + Math.floor(Math.random() * 3)
    yield tokens.slice(i, i + step).join('')
    i += step
    await sleep(14 + Math.random() * 22, signal)
  }
}

export const mockProvider: AIProvider = {
  id: 'local-demo',
  label: 'Local demo engine',
  stream: (req, signal) => streamText(composeReply(req), signal),
}
