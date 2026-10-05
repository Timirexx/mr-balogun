import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent } from '../types'
import { addDays, todayISO, uid } from '../utils'
import { logActivity } from './activity'

interface CalendarState {
  events: CalendarEvent[]
  add: (e: Omit<CalendarEvent, 'id'>) => CalendarEvent
  update: (id: string, patch: Partial<CalendarEvent>) => void
  remove: (id: string) => void
}

const today = todayISO()

export const useCalendar = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [
        { id: uid(), title: 'Deep work: content plan', date: today, start: '09:00', end: '11:00' },
        { id: uid(), title: 'Team sync', date: today, start: '13:30', end: '14:00' },
        { id: uid(), title: 'Gym session', date: today, start: '18:00', end: '19:00' },
        { id: uid(), title: 'Strategy review', date: addDays(today, 1), start: '10:00', end: '11:00' },
        { id: uid(), title: 'Learning block', date: addDays(today, 3), start: '16:00', end: '17:30' },
      ],
      add: (e) => {
        const event = { ...e, id: uid() }
        set({ events: [...get().events, event] })
        logActivity('event', event.title, 'Event scheduled')
        return event
      },
      update: (id, patch) => set({ events: get().events.map((e) => (e.id === id ? { ...e, ...patch } : e)) }),
      remove: (id) => set({ events: get().events.filter((e) => e.id !== id) }),
    }),
    { name: 'mrb-calendar' },
  ),
)

export const sortEvents = (a: CalendarEvent, b: CalendarEvent) =>
  a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)
