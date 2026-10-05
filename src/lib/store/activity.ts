import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Activity, ActivityKind } from '../types'
import { uid } from '../utils'

interface ActivityState {
  items: Activity[]
  log: (kind: ActivityKind, title: string, detail?: string) => void
  clear: () => void
}

const HOUR = 3_600_000

export const useActivity = create<ActivityState>()(
  persist(
    (set) => ({
      items: [
        { id: uid(), kind: 'chat', title: 'Business strategy plan', detail: 'Conversation', at: Date.now() - 2 * HOUR },
        { id: uid(), kind: 'tool', title: 'Market research summary', detail: 'Research tool', at: Date.now() - 5 * HOUR },
        { id: uid(), kind: 'memory', title: 'Personal goals', detail: 'Memory saved', at: Date.now() - 26 * HOUR },
        { id: uid(), kind: 'task', title: 'Learning plan', detail: 'Task created', at: Date.now() - 50 * HOUR },
        { id: uid(), kind: 'file', title: 'Project ideas', detail: 'File uploaded', at: Date.now() - 74 * HOUR },
      ],
      log: (kind, title, detail) =>
        set((s) => ({ items: [{ id: uid(), kind, title, detail, at: Date.now() }, ...s.items].slice(0, 60) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'mrb-activity' },
  ),
)

export const logActivity = (kind: ActivityKind, title: string, detail?: string) =>
  useActivity.getState().log(kind, title, detail)
