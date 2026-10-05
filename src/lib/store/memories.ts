import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Memory, MemoryCategory } from '../types'
import { uid } from '../utils'
import { logActivity } from './activity'

interface MemoryState {
  memories: Memory[]
  enabled: boolean
  add: (content: string, category?: MemoryCategory, source?: Memory['source']) => Memory
  update: (id: string, patch: Partial<Memory>) => void
  remove: (id: string) => void
  clear: () => void
  setEnabled: (v: boolean) => void
}

const DAY = 86_400_000

export const useMemories = create<MemoryState>()(
  persist(
    (set, get) => ({
      enabled: true,
      memories: [
        { id: uid(), content: 'Prefers concise answers with clear next steps', category: 'preference', createdAt: Date.now() - 6 * DAY, source: 'chat' },
        { id: uid(), content: 'Is building a personal brand around tech & productivity', category: 'work', createdAt: Date.now() - 4 * DAY, source: 'chat' },
        { id: uid(), content: 'Wants to read 12 books this year', category: 'goal', createdAt: Date.now() - 2 * DAY, source: 'manual' },
        { id: uid(), content: 'Most productive in the morning, before 12 PM', category: 'personal', createdAt: Date.now() - DAY, source: 'chat' },
      ],
      add: (content, category = 'other', source = 'manual') => {
        const memory: Memory = { id: uid(), content: content.trim(), category, createdAt: Date.now(), source }
        set({ memories: [memory, ...get().memories] })
        logActivity('memory', memory.content.slice(0, 48), 'Memory saved')
        return memory
      },
      update: (id, patch) => set({ memories: get().memories.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
      remove: (id) => set({ memories: get().memories.filter((m) => m.id !== id) }),
      clear: () => set({ memories: [] }),
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'mrb-memories' },
  ),
)

export function guessCategory(text: string): MemoryCategory {
  const t = text.toLowerCase()
  if (/\b(prefer|like|love|hate|favou?rite|enjoy|rather)\b/.test(t)) return 'preference'
  if (/\b(goal|want to|plan to|aim|dream|hope to)\b/.test(t)) return 'goal'
  if (/\b(work|job|company|client|business|project|team|career)\b/.test(t)) return 'work'
  if (/\b(i am|i'm|my|born|live|family|birthday|name)\b/.test(t)) return 'personal'
  return 'other'
}
