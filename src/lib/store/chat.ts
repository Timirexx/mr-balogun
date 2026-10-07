import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Conversation } from '../types'
import { uid } from '../utils'

interface ChatState {
  conversations: Conversation[]
  create: (title?: string) => string
  append: (convId: string, msg: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string }) => string
  patchMessage: (convId: string, msgId: string, patch: Partial<ChatMessage>) => void
  truncateFrom: (convId: string, msgId: string) => void
  rename: (convId: string, title: string) => void
  togglePin: (convId: string) => void
  assignProject: (convId: string, projectId: string | undefined) => void
  remove: (convId: string) => void
  clear: () => void
}

const HOUR = 3_600_000
const DAY = 24 * HOUR

const seedConv = (title: string, ago: number, user: string, reply: string): Conversation => ({
  id: uid(),
  title,
  createdAt: Date.now() - ago,
  updatedAt: Date.now() - ago,
  messages: [
    { id: uid(), role: 'user', content: user, createdAt: Date.now() - ago - 60_000 },
    { id: uid(), role: 'assistant', content: reply, createdAt: Date.now() - ago },
  ],
})

const seed: Conversation[] = [
  seedConv(
    'Create a content plan',
    2 * HOUR,
    'Help me create a content plan for my tech & productivity brand.',
    "Here's a detailed content plan for your goals.\n\n### Pillars\n- **Productivity systems** — workflows, templates, routines\n- **AI for creators** — practical tools and prompts\n- **Building in public** — wins, lessons, numbers\n\n### Weekly cadence\n1. Monday — long-form essay draft\n2. Wednesday — short video breakdown\n3. Friday — newsletter roundup\n\nWant me to turn this into tasks on your calendar?",
  ),
  seedConv(
    'Business strategy',
    5 * HOUR,
    'Can you help me think through my business strategy?',
    "Let's break down your business strategy step by step.\n\n1. **Who** exactly is your best customer?\n2. **What** painful problem do you solve better than anyone?\n3. **How** will they find you — and why will they stay?\n\nAnswer those three and I'll draft a one-page strategy for you.",
  ),
  seedConv(
    'Study plan',
    DAY + HOUR,
    'I need a study plan for learning data analysis.',
    "I've created a personalized study plan based on your goals.\n\n- **Weeks 1–2:** spreadsheets & descriptive statistics\n- **Weeks 3–5:** SQL fundamentals with real datasets\n- **Weeks 6–8:** Python + pandas, one mini project per week\n- **Week 9:** portfolio project and write-up\n\nSince you're sharpest in the morning, I'd schedule study blocks before noon.",
  ),
  seedConv(
    'Website ideas',
    2 * DAY + 3 * HOUR,
    'Give me ideas for a modern personal website.',
    "Here are some modern website ideas that match your brand.\n\n- A **live AI guide** that answers questions about your work\n- An **interactive timeline** of projects and lessons\n- A **'now' page** that updates weekly from your notes\n- A **resource library** with your favourite tools and templates",
  ),
]

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: seed,
      create: (title = 'New conversation') => {
        const conv: Conversation = { id: uid(), title, createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
        set({ conversations: [conv, ...get().conversations] })
        return conv.id
      },
      append: (convId, msg) => {
        const id = msg.id ?? uid()
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, updatedAt: Date.now(), messages: [...c.messages, { ...msg, id, createdAt: Date.now() }] }
              : c,
          ),
        })
        return id
      },
      patchMessage: (convId, msgId, patch) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) }
              : c,
          ),
        }),
      truncateFrom: (convId, msgId) =>
        set({
          conversations: get().conversations.map((c) => {
            if (c.id !== convId) return c
            const idx = c.messages.findIndex((m) => m.id === msgId)
            return idx === -1 ? c : { ...c, messages: c.messages.slice(0, idx) }
          }),
        }),
      rename: (convId, title) =>
        set({ conversations: get().conversations.map((c) => (c.id === convId ? { ...c, title } : c)) }),
      togglePin: (convId) =>
        set({ conversations: get().conversations.map((c) => (c.id === convId ? { ...c, pinned: !c.pinned } : c)) }),
      assignProject: (convId, projectId) =>
        set({ conversations: get().conversations.map((c) => (c.id === convId ? { ...c, projectId } : c)) }),
      remove: (convId) => set({ conversations: get().conversations.filter((c) => c.id !== convId) }),
      clear: () => set({ conversations: [] }),
    }),
    {
      name: 'mrb-chat',
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatState> | undefined
        if (!p?.conversations) return current
        return {
          ...current,
          conversations: p.conversations.map((c) => ({
            ...c,
            messages: c.messages.map((m) => (m.pending ? { ...m, pending: false } : m)),
          })),
        }
      },
    },
  ),
)

export const sortConversations = (a: Conversation, b: Conversation) =>
  Number(!!b.pinned) - Number(!!a.pinned) || b.updatedAt - a.updatedAt

export function titleFrom(text: string) {
  const clean = text.replace(/[^\p{L}\p{N}\s'&-]/gu, ' ').replace(/\s+/g, ' ').trim()
  const words = clean.split(' ').slice(0, 6).join(' ')
  if (!words) return 'New conversation'
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function lastPreview(c: Conversation) {
  const last = [...c.messages].reverse().find((m) => m.role === 'assistant') ?? c.messages[c.messages.length - 1]
  return last ? last.content.replace(/[#*`>_]|^-|\s-\s/g, ' ').replace(/\s+/g, ' ').trim() : 'No messages yet'
}
