import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Priority, Task } from '../types'
import { addDays, todayISO, uid } from '../utils'
import { logActivity } from './activity'

interface TaskState {
  tasks: Task[]
  add: (input: { title: string; due?: string; priority?: Priority; notes?: string }) => Task
  toggle: (id: string) => void
  update: (id: string, patch: Partial<Task>) => void
  remove: (id: string) => void
  clearCompleted: () => void
}

const today = todayISO()

export const useTasks = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [
        { id: uid(), title: 'Finalize Q4 content plan', priority: 'high', due: today, done: false, createdAt: Date.now() - 86_400_000 },
        { id: uid(), title: 'Review market research summary', priority: 'medium', due: today, done: false, createdAt: Date.now() - 50_000_000 },
        { id: uid(), title: 'Draft personal learning roadmap', priority: 'low', due: addDays(today, 2), done: false, createdAt: Date.now() - 20_000_000 },
        { id: uid(), title: 'Book dentist appointment', priority: 'low', due: addDays(today, -1), done: true, createdAt: Date.now() - 172_800_000, completedAt: Date.now() - 90_000_000 },
      ],
      add: ({ title, due, priority = 'medium', notes }) => {
        const task: Task = { id: uid(), title: title.trim(), due, priority, notes, done: false, createdAt: Date.now() }
        set({ tasks: [task, ...get().tasks] })
        logActivity('task', task.title, 'Task created')
        return task
      },
      toggle: (id) =>
        set({
          tasks: get().tasks.map((t) => {
            if (t.id !== id) return t
            const done = !t.done
            if (done) logActivity('task', t.title, 'Task completed')
            return { ...t, done, completedAt: done ? Date.now() : undefined }
          }),
        }),
      update: (id, patch) => set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      remove: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),
      clearCompleted: () => set({ tasks: get().tasks.filter((t) => !t.done) }),
    }),
    { name: 'mrb-tasks' },
  ),
)
