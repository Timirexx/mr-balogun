import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleCheck, Flag, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, Tabs } from '@/components/ui/Controls'
import { toast } from '@/components/ui/Toast'
import { HUE, PRIORITY_HUE } from '@/lib/hues'
import { startConversation } from '@/lib/store/assistant'
import { useTasks } from '@/lib/store/tasks'
import type { Priority, Task } from '@/lib/types'
import { addDays, cn, parseISODate, todayISO } from '@/lib/utils'
import { Page, PageHeader, Panel } from '../components/PageHeader'

type Filter = 'all' | 'today' | 'upcoming' | 'completed'

const PRIORITY_LABEL: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }

function dueLabel(due?: string) {
  if (!due) return null
  const today = todayISO()
  if (due === today) return { text: 'Today', cls: 'hue-cyan text-hue' }
  if (due === addDays(today, 1)) return { text: 'Tomorrow', cls: 'hue-violet text-hue' }
  if (due < today) return { text: 'Overdue', cls: 'hue-rose text-hue' }
  return { text: parseISODate(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), cls: 'text-muted' }
}

function ProgressRing({ value }: { value: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-16">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(56 128 214 / 0.16)" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.7))' }}
        />
        <defs>
          <linearGradient id="ring" x1="0" x2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#2dd4ec" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">{Math.round(value * 100)}%</span>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const { toggle, remove, update } = useTasks()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const due = dueLabel(task.due)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-line hover:bg-white/[0.02]"
    >
      <button
        onClick={() => toggle(task.id)}
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? `Mark "${task.title}" as not done` : `Complete "${task.title}"`}
        className={cn(
          'hue-emerald grid size-6 shrink-0 place-items-center rounded-full border transition-all',
          task.done ? 'bg-hue border-[rgb(var(--hue))] shadow-[0_0_12px_rgb(var(--hue)/0.8)]' : 'border-line-strong hover:border-[rgb(var(--hue))]',
        )}
      >
        <AnimatePresence>
          {task.done && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="size-3.5 text-ink-950" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim()) update(task.id, { title: title.trim() })
              setEditing(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            aria-label="Task title"
            className="w-full bg-transparent text-sm text-white focus:outline-none"
          />
        ) : (
          <button onClick={() => setEditing(true)} className={cn('block w-full truncate text-left text-sm transition-colors', task.done ? 'text-subtle line-through' : 'text-white')}>
            {task.title}
          </button>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs">
          {due && <span className={due.cls}>{due.text}</span>}
          {due && <span className="text-subtle">·</span>}
          <span className={cn('badge-hue flex items-center gap-1 rounded-md px-1.5 py-px text-[0.65rem]', HUE[PRIORITY_HUE[task.priority]])}>
            <span className="bg-hue size-1 rounded-full" />
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          remove(task.id)
          toast('Task deleted')
        }}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle transition hover:bg-danger/10 hover:text-danger md:opacity-0 md:group-hover:opacity-100"
        aria-label={`Delete "${task.title}"`}
      >
        <Trash2 className="size-4" />
      </button>
    </motion.li>
  )
}

export default function Tasks() {
  const { tasks, add, clearCompleted } = useTasks()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(todayISO())
  const [priority, setPriority] = useState<Priority>('medium')
  const today = todayISO()

  const counts = useMemo(
    () => ({
      all: tasks.filter((t) => !t.done).length,
      today: tasks.filter((t) => !t.done && t.due && t.due <= today).length,
      upcoming: tasks.filter((t) => !t.done && t.due && t.due > today).length,
      completed: tasks.filter((t) => t.done).length,
    }),
    [tasks, today],
  )

  const list = useMemo(() => {
    const rank = { high: 0, medium: 1, low: 2 }
    const f = tasks.filter((t) => {
      if (filter === 'completed') return t.done
      if (t.done) return false
      if (filter === 'today') return !!t.due && t.due <= today
      if (filter === 'upcoming') return !!t.due && t.due > today
      return true
    })
    return f.sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || rank[a.priority] - rank[b.priority])
  }, [tasks, filter, today])

  const todayTasks = tasks.filter((t) => t.due === today)
  const progress = todayTasks.length ? todayTasks.filter((t) => t.done).length / todayTasks.length : 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    add({ title, due: due || undefined, priority })
    setTitle('')
    toast('Task added')
  }

  const breakDown = async () => {
    const goal = title.trim() || 'my most important goal this week'
    navigate(`/app/chat/${await startConversation(`Help me break down this goal into small steps: ${goal}`)}`)
  }

  return (
    <Page>
      <PageHeader
        title="Tasks"
        subtitle="Stay organized, set goals and get things done."
        actions={
          <Panel className="flex items-center gap-4 px-4 py-3">
            <ProgressRing value={progress} />
            <div>
              <p className="text-sm font-medium text-white">Today's progress</p>
              <p className="text-xs text-muted">
                {todayTasks.filter((t) => t.done).length} of {todayTasks.length} done
              </p>
            </div>
          </Panel>
        }
      />

      <Panel className="mt-6 p-3 sm:p-4">
        <form onSubmit={submit} className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-ink-850/70 px-3 focus-within:border-brand-400/60">
            <Plus className="hue-emerald text-hue size-5" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a new task…" aria-label="New task" className="h-11 flex-1 bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" className="field h-11 w-auto [color-scheme:dark]" />
            <label className="relative flex items-center">
              <Flag className={cn('text-hue pointer-events-none absolute left-3 size-4', HUE[PRIORITY_HUE[priority]])} />
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority" className="field h-11 w-auto appearance-none pr-8 pl-9">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <button type="submit" className="btn-primary h-11 rounded-xl px-5 text-sm">
              Add task
            </button>
            <button type="button" onClick={breakDown} className="btn-ghost h-11 px-4 text-sm" title="Ask Mr Balogun to break it down">
              <Sparkles className="hue-violet text-hue size-4" /> <span className="hidden sm:inline">Break it down</span>
            </button>
          </div>
        </form>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'today', label: 'Today', count: counts.today },
            { value: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { value: 'completed', label: 'Completed', count: counts.completed },
          ]}
        />
        {filter === 'completed' && counts.completed > 0 && (
          <button onClick={() => clearCompleted()} className="text-xs text-muted hover:text-danger">
            Clear completed
          </button>
        )}
      </div>

      <Panel className="mt-4 p-2 sm:p-3">
        {list.length === 0 ? (
          <EmptyState
            icon={<CircleCheck className="size-6" />}
            title={filter === 'completed' ? 'Nothing completed yet' : 'All clear'}
            text={filter === 'completed' ? 'Finished tasks will show up here.' : 'Add a task above, or ask Mr Balogun to plan your day.'}
          />
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {list.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>
    </Page>
  )
}
