import { useCalendar } from '../store/calendar'
import { guessCategory, useMemories } from '../store/memories'
import { useTasks } from '../store/tasks'
import type { ChatMessage } from '../types'
import { addDays, todayISO } from '../utils'

function parseDay(text: string) {
  if (/\btomorrow\b/i.test(text)) return addDays(todayISO(), 1)
  if (/\btoday|tonight\b/i.test(text)) return todayISO()
  return undefined
}

function parseTime(raw: string) {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2] ?? 0)
  const ap = m[3]?.toLowerCase()
  if (ap === 'pm' && h < 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  if (!ap && h < 7) h += 12
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

const THIRD_PERSON: [RegExp, string][] = [
  [/^i prefer\b/i, 'Prefers'],
  [/^i like\b/i, 'Likes'],
  [/^i love\b/i, 'Loves'],
  [/^i hate\b/i, 'Dislikes'],
  [/^i want\b/i, 'Wants'],
  [/^i need\b/i, 'Needs'],
  [/^i have\b/i, 'Has'],
  [/^i work\b/i, 'Works'],
  [/^i live\b/i, 'Lives'],
  [/^i(?: am|'m)\b/i, 'Is'],
]

const toMemory = (fact: string) => {
  const hit = THIRD_PERSON.find(([re]) => re.test(fact))
  const out = hit ? fact.replace(hit[0], hit[1]) : fact
  return out.charAt(0).toUpperCase() + out.slice(1)
}

const stripDay = (s: string) => s.replace(/\b(today|tomorrow|tonight)\b/gi, '').replace(/\s{2,}/g, ' ').replace(/[.!]+$/, '').trim()

// Actions the assistant performs on the user's own data. Returns a reply when
// the message is a command, otherwise null so the AI provider answers.
export function runCommand(text: string, history: ChatMessage[]): string | null {
  const t = text.trim()

  const remember = t.match(/^(?:please\s+)?remember(?:\s+that)?\s+(.+)/i)
  if (remember) {
    const { enabled, add } = useMemories.getState()
    if (!enabled) return 'Memory is currently turned off. You can switch it back on in **Memory** settings.'
    const fact = remember[1].replace(/[.!]+$/, '')
    add(toMemory(fact), guessCategory(fact), 'chat')
    return `Got it — I'll remember that ${fact.replace(/^i\b/i, 'you').replace(/\bmy\b/gi, 'your').replace(/\bi'm\b/gi, "you're").replace(/\bi am\b/gi, 'you are')}.\n\nYou can review or remove this anytime in **Memory**.`
  }

  const forget = t.match(/^(?:please\s+)?forget(?:\s+that)?\s+(.+)/i)
  if (forget) {
    const { memories, remove } = useMemories.getState()
    const words = forget[1].toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    const hit = memories.find((m) => words.some((w) => m.content.toLowerCase().includes(w)))
    if (!hit) return "I couldn't find a matching memory. You can browse everything I remember in **Memory**."
    remove(hit.id)
    return `Done — I've forgotten: _"${hit.content}"_.`
  }

  const task = t.match(/^(?:please\s+)?(?:add|create|new)(?:\s+a)?\s+task(?:\s+to)?[:\s]+(.+)|^remind me to\s+(.+)/i)
  if (task) {
    const body = task[1] ?? task[2]
    const due = parseDay(body) ?? (task[2] ? todayISO() : undefined)
    const priority = /\b(urgent|asap|important)\b/i.test(body) ? 'high' : 'medium'
    const title = stripDay(body.replace(/\b(urgent|asap)\b/gi, ''))
    const created = useTasks.getState().add({ title: title.charAt(0).toUpperCase() + title.slice(1), due, priority })
    const when = due === todayISO() ? ' — due **today**' : due ? ' — due **tomorrow**' : ''
    return `Added to your tasks: **${created.title}**${when}.\n\nYou'll find it in **Tasks**.`
  }

  const sched = t.match(/^(?:please\s+)?(?:schedule|book|add an? event(?: for)?)\s+(.+?)\s+(?:at|for)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(.*)$/i)
  if (sched) {
    const start = parseTime(sched[2])
    if (start) {
      const date = parseDay(sched[3] + ' ' + sched[1]) ?? todayISO()
      const title = stripDay(sched[1])
      const [h, m] = start.split(':').map(Number)
      const end = `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      useCalendar.getState().add({ title: title.charAt(0).toUpperCase() + title.slice(1), date, start, end })
      return `Scheduled **${title}** ${date === todayISO() ? 'today' : 'tomorrow'} at **${sched[2].trim()}**. It's on your **Calendar**.`
    }
  }

  if (/^(?:please\s+)?(?:turn|make|convert)\s+(?:this|that|it|these)\s+into\s+tasks|add (?:these|them|this) to (?:my )?tasks/i.test(t)) {
    const prev = [...history].reverse().find((m) => m.role === 'assistant' && /^\s*(?:[-•]|\d+\.)\s+/m.test(m.content))
    if (!prev) return "I don't see a list to convert yet. Ask me for a plan first, then say _\"turn this into tasks\"_."
    const { add, tasks } = useTasks.getState()
    const known = new Set([...tasks.filter((x) => !x.done).map((x) => x.title), ...useCalendar.getState().events.map((e) => e.title)].map((s) => s.toLowerCase()))
    const items = prev.content
      .split('\n')
      .map((l) => l.match(/^\s*(?:[-•]|\d+\.)\s+(.+)/)?.[1])
      .filter((x): x is string => !!x)
      .map((x) =>
        x
          .replace(/\*\*/g, '')
          .replace(/^[\d:]+\s*(AM|PM)\s*—\s*/i, '')
          .replace(/^focused work\s*—\s*/i, '')
          .replace(/_/g, '')
          .trim(),
      )
      .filter((x) => x.length > 2 && !/^(lunch|break|review and plan tomorrow)/i.test(x) && !known.has(x.toLowerCase()))
      .slice(0, 8)
    if (!items.length) return "Everything in that list is already on your tasks or calendar — you're all set."
    items.forEach((title) => add({ title: title.charAt(0).toUpperCase() + title.slice(1), priority: 'medium' }))
    return `Done — I added **${items.length} task${items.length === 1 ? '' : 's'}**:\n\n${items.map((i) => `- ${i}`).join('\n')}\n\nYou'll find them in **Tasks**.`
  }

  return null
}
