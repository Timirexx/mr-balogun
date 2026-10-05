import { AnimatePresence, motion } from 'framer-motion'
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '@/components/ui/Controls'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useAssistant } from '@/lib/store/assistant'
import { sortEvents, useCalendar } from '@/lib/store/calendar'
import { useTasks } from '@/lib/store/tasks'
import { cn, parseISODate, toISODate, todayISO } from '@/lib/utils'
import { Page, PageHeader, Panel } from '../components/PageHeader'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function EventForm({ date, onDone }: { date: string; onDone: () => void }) {
  const add = useCalendar((s) => s.add)
  const [title, setTitle] = useState('')
  const [d, setD] = useState(date)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [notes, setNotes] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    add({ title: title.trim(), date: d, start, end: end > start ? end : undefined, notes: notes.trim() || undefined })
    toast('Event added')
    onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" aria-label="Event title" className="field" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <input type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Date" className="field col-span-2 [color-scheme:dark] sm:col-span-1" />
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Start time" className="field [color-scheme:dark]" />
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="End time" className="field [color-scheme:dark]" />
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)" aria-label="Notes" className="field resize-none" />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="btn-ghost px-4 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" disabled={!title.trim()} className="btn-primary rounded-xl px-5 py-2 text-sm">
          Add event
        </button>
      </div>
    </form>
  )
}

export default function Calendar() {
  const events = useCalendar((s) => s.events)
  const removeEvent = useCalendar((s) => s.remove)
  const { tasks, toggle } = useTasks()
  const ask = useAssistant((s) => s.ask)
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState(today)
  const [adding, setAdding] = useState(false)

  const cells = useMemo(() => {
    const offset = (cursor.getDay() + 6) % 7
    const start = new Date(cursor)
    start.setDate(1 - offset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [cursor])

  const byDate = useMemo(() => {
    const map = new Map<string, { events: typeof events; tasks: typeof tasks }>()
    const get = (k: string) => map.get(k) ?? (map.set(k, { events: [], tasks: [] }), map.get(k)!)
    events.forEach((e) => get(e.date).events.push(e))
    tasks.forEach((t) => t.due && get(t.due).tasks.push(t))
    map.forEach((v) => v.events.sort(sortEvents))
    return map
  }, [events, tasks])

  const day = byDate.get(selected) ?? { events: [], tasks: [] }
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))

  return (
    <Page>
      <PageHeader
        title="Calendar"
        subtitle="Plan your days and see what's coming up."
        actions={
          <>
            <button onClick={() => ask('Plan my day')} className="btn-ghost px-4 py-2.5 text-sm">
              <Sparkles className="size-4 text-brand-300" /> Plan with AI
            </button>
            <button onClick={() => setAdding(true)} className="btn-primary rounded-xl px-4 py-2.5 text-sm">
              <CalendarPlus className="size-4" /> New event
            </button>
          </>
        }
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel className="p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-white">{monthLabel}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const d = new Date()
                  setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
                  setSelected(today)
                }}
                className="btn-ghost mr-1 h-9 px-3 text-xs"
              >
                Today
              </button>
              <button onClick={() => shift(-1)} className="grid size-9 place-items-center rounded-xl text-fg-soft hover:bg-white/5" aria-label="Previous month">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => shift(1)} className="grid size-9 place-items-center rounded-xl text-fg-soft hover:bg-white/5" aria-label="Next month">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {WEEKDAYS.map((w) => (
              <p key={w} className="pb-2 text-center text-[0.7rem] font-medium tracking-wide text-subtle uppercase">
                {w}
              </p>
            ))}
            {cells.map((d) => {
              const iso = toISODate(d)
              const info = byDate.get(iso)
              const inMonth = d.getMonth() === cursor.getMonth()
              const isSel = iso === selected
              const isToday = iso === today
              const pendingTasks = info?.tasks.filter((t) => !t.done).length ?? 0
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  aria-label={d.toDateString()}
                  aria-pressed={isSel}
                  className={cn(
                    'relative flex aspect-square flex-col rounded-xl border p-1 text-left transition-all sm:aspect-auto sm:min-h-24 sm:p-2',
                    isSel ? 'border-brand-400/80 bg-brand-500/12 shadow-[0_0_24px_-8px_rgba(6,140,252,0.9)]' : 'border-line-soft hover:border-line-strong hover:bg-white/[0.02]',
                    !inMonth && 'opacity-35',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full text-xs sm:size-7 sm:text-sm',
                      isToday ? 'bg-brand-500 font-semibold text-white shadow-[0_0_12px_rgba(6,140,252,0.9)]' : 'text-fg-soft',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className="mt-1 hidden w-full space-y-1 sm:block">
                    {info?.events.slice(0, 2).map((e) => (
                      <span key={e.id} className="block truncate rounded-md border-l-2 border-brand-400 bg-brand-500/10 px-1.5 py-0.5 text-[0.65rem] text-brand-100">
                        {e.title}
                      </span>
                    ))}
                    {(info?.events.length ?? 0) > 2 && <span className="block text-[0.62rem] text-muted">+{info!.events.length - 2} more</span>}
                  </span>
                  <span className="absolute right-1.5 bottom-1.5 flex gap-0.5 sm:hidden">
                    {!!info?.events.length && <span className="size-1.5 rounded-full bg-brand-400" />}
                    {pendingTasks > 0 && <span className="size-1.5 rounded-full bg-brand-200" />}
                  </span>
                  {pendingTasks > 0 && <span className="absolute top-2 right-2 hidden text-[0.6rem] text-brand-200 sm:block">{pendingTasks} task{pendingTasks > 1 ? 's' : ''}</span>}
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel className="p-4 sm:p-5">
          <p className="text-xs tracking-wide text-subtle uppercase">{selected === today ? 'Today' : 'Selected day'}</p>
          <p className="mt-1 text-lg font-semibold text-white">{parseISODate(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>

          <p className="mt-6 mb-2 text-sm font-medium text-white">Events</p>
          {day.events.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-xs text-muted">No events scheduled.</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {day.events.map((e) => (
                  <motion.li key={e.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="group flex gap-3 rounded-xl border border-line bg-ink-800/50 p-3">
                    <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-300 to-brand-600 shadow-[0_0_8px_rgba(6,140,252,0.7)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <Clock className="size-3" /> {fmtTime(e.start)}
                        {e.end && ` – ${fmtTime(e.end)}`}
                      </p>
                      {e.notes && <p className="mt-1 text-xs text-subtle">{e.notes}</p>}
                    </div>
                    <button
                      onClick={() => {
                        removeEvent(e.id)
                        toast('Event removed')
                      }}
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-subtle hover:bg-danger/10 hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Delete ${e.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <p className="mt-6 mb-2 text-sm font-medium text-white">Tasks due</p>
          {day.tasks.length === 0 ? (
            <EmptyState icon={<Check className="size-5" />} title="Nothing due" text="Tasks with this due date appear here." />
          ) : (
            <ul className="space-y-1">
              {day.tasks.map((t) => (
                <li key={t.id}>
                  <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/[0.03]">
                    <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', t.done ? 'border-brand-400 bg-brand-500' : 'border-line-strong')}>
                      {t.done && <Check className="size-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className={cn('truncate text-sm', t.done ? 'text-subtle line-through' : 'text-fg-soft')}>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setAdding(true)} className="btn-ghost mt-6 w-full py-2.5 text-sm">
            <CalendarPlus className="size-4 text-brand-300" /> Add event on this day
          </button>
        </Panel>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="New event">
        <EventForm date={selected} onDone={() => setAdding(false)} />
      </Modal>
    </Page>
  )
}
