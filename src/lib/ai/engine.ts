import { create } from 'zustand'
import { logActivity } from '../store/activity'
import { useCalendar } from '../store/calendar'
import { titleFrom, useChat } from '../store/chat'
import { useMemories } from '../store/memories'
import { useSettings } from '../store/settings'
import { useTasks } from '../store/tasks'
import type { Attachment, StoredFile } from '../types'
import { speak } from '../voice'
import { runCommand } from './commands'
import { mockProvider, streamText } from './mock'
import type { AIContext, AIProvider } from './types'

// Swap this for a network-backed provider (e.g. a /api/chat route that
// streams from a hosted model) — nothing else in the app needs to change.
export const provider: AIProvider = mockProvider

export const useStreaming = create<{ active: Record<string, true> }>(() => ({ active: {} }))
const controllers = new Map<string, AbortController>()

const setActive = (convId: string, on: boolean) =>
  useStreaming.setState((s) => {
    const active = { ...s.active }
    if (on) active[convId] = true
    else delete active[convId]
    return { active }
  })

export function buildContext(): AIContext {
  const s = useSettings.getState()
  const mem = useMemories.getState()
  return {
    userName: s.name,
    personality: s.personality,
    responseStyle: s.responseStyle,
    memories: mem.enabled ? mem.memories.map((m) => m.content) : [],
    tasks: useTasks.getState().tasks.map(({ title, due, priority, done }) => ({ title, due, priority, done })),
    events: useCalendar.getState().events.map(({ title, date, start, end }) => ({ title, date, start, end })),
    now: new Date(),
  }
}

const toAttachment = (f: StoredFile): Attachment => ({ id: f.id, name: f.name, type: f.type, size: f.size })

interface RespondOptions {
  files?: StoredFile[]
  speakReply?: boolean
  toolId?: string
  variant?: number
}

async function respond(convId: string, userText: string, opts: RespondOptions) {
  const chat = useChat.getState()
  const msgId = chat.append(convId, { role: 'assistant', content: '', pending: true })
  const controller = new AbortController()
  controllers.set(convId, controller)
  setActive(convId, true)

  let out = ''
  try {
    const history = useChat.getState().conversations.find((c) => c.id === convId)?.messages ?? []
    const local = opts.toolId ? null : runCommand(userText, history.slice(0, -1))
    const iter =
      local !== null
        ? streamText(local, controller.signal)
        : provider.stream(
            { messages: history.slice(0, -1), context: buildContext(), files: opts.files, toolId: opts.toolId, variant: opts.variant },
            controller.signal,
          )
    for await (const chunk of iter) {
      out += chunk
      useChat.getState().patchMessage(convId, msgId, { content: out })
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      out += out ? '\n\n_Something interrupted that response._' : "_Sorry — I couldn't respond just now. Please try again._"
    }
  } finally {
    useChat.getState().patchMessage(convId, msgId, { content: out || '_Stopped._', pending: false })
    controllers.delete(convId)
    setActive(convId, false)
    if (out && (opts.speakReply || useSettings.getState().speakReplies)) speak(out)
  }
}

export async function sendMessage(convId: string, text: string, opts: RespondOptions = {}) {
  const chat = useChat.getState()
  const conv = chat.conversations.find((c) => c.id === convId)
  if (!conv || (!text.trim() && !opts.files?.length)) return
  if (!conv.messages.length) {
    chat.rename(convId, titleFrom(text || opts.files?.[0]?.name || 'New conversation'))
    logActivity('chat', titleFrom(text || opts.files?.[0]?.name || 'Conversation'), 'Conversation started')
  }
  chat.append(convId, { role: 'user', content: text.trim(), attachments: opts.files?.map(toAttachment) })
  await respond(convId, text.trim(), opts)
}

export async function regenerate(convId: string, opts: { speakReply?: boolean } = {}) {
  const conv = useChat.getState().conversations.find((c) => c.id === convId)
  if (!conv || useStreaming.getState().active[convId]) return
  const lastAssistant = [...conv.messages].reverse().find((m) => m.role === 'assistant')
  const lastUser = [...conv.messages].reverse().find((m) => m.role === 'user')
  if (!lastAssistant || !lastUser) return
  useChat.getState().truncateFrom(convId, lastAssistant.id)
  await respond(convId, lastUser.content, { ...opts, variant: 1 + Math.floor(Math.random() * 1000) })
}

export function stopStreaming(convId: string) {
  controllers.get(convId)?.abort()
}

export async function runTool(toolId: string, input: string, files: StoredFile[], onChunk: (text: string) => void, signal: AbortSignal) {
  let out = ''
  for await (const chunk of provider.stream(
    {
      messages: [{ id: 'tool', role: 'user', content: input, createdAt: Date.now() }],
      context: buildContext(),
      files,
      toolId,
    },
    signal,
  )) {
    out += chunk
    onChunk(out)
  }
  return out
}
