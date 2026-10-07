import { Bell, Brain, CalendarClock, CircleAlert, CircleCheck, ExternalLink, Menu, Search, Settings, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Popover } from '@/components/ui/Popover'
import { useAssistant } from '@/lib/store/assistant'
import { useCalendar } from '@/lib/store/calendar'
import { useMemories } from '@/lib/store/memories'
import { useSettings } from '@/lib/store/settings'
import { useStreaming } from '@/lib/ai/engine'
import { useTasks } from '@/lib/store/tasks'
import { cn, timeAgo, todayISO } from '@/lib/utils'

const SEEN_KEY = 'mrb-notifications-seen'

function useNotifications() {
  const tasks = useTasks((s) => s.tasks)
  const events = useCalendar((s) => s.events)
  const memories = useMemories((s) => s.memories)

  return useMemo(() => {
    const today = todayISO()
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const items: { id: string; icon: typeof Bell; title: string; text: string; to: string }[] = []
    const due = tasks.filter((t) => !t.done && t.due === today)
    const overdue = tasks.filter((t) => !t.done && t.due && t.due < today)
    const next = events
      .filter((e) => e.date === today && Number(e.start.slice(0, 2)) * 60 + Number(e.start.slice(3)) >= nowMin)
      .sort((a, b) => a.start.localeCompare(b.start))[0]
    if (due.length)
      items.push({ id: `due-${today}-${due.length}`, icon: CircleCheck, title: `${due.length} task${due.length > 1 ? 's' : ''} due today`, text: due.map((t) => t.title).slice(0, 2).join(' · '), to: '/app/tasks' })
    if (overdue.length)
      items.push({ id: `over-${overdue.length}`, icon: CircleAlert, title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`, text: overdue[0].title, to: '/app/tasks' })
    if (next) items.push({ id: `ev-${next.id}`, icon: CalendarClock, title: `Up next: ${next.title}`, text: `Today at ${next.start}`, to: '/app/calendar' })
    const recent = memories[0]
    if (recent && Date.now() - recent.createdAt < 86_400_000)
      items.push({ id: `mem-${recent.id}`, icon: Brain, title: 'New memory saved', text: `${recent.content} · ${timeAgo(recent.createdAt)}`, to: '/app/memory' })
    return items
  }, [tasks, events, memories])
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

export function Topbar({ onOpenNav }: { onOpenNav?: () => void }) {
  const navigate = useNavigate()
  const name = useSettings((s) => s.name)
  const setPaletteOpen = useAssistant((s) => s.setPaletteOpen)
  const busy = useStreaming((s) => Object.keys(s.active).length > 0)
  const notes = useNotifications()
  const [seen, setSeen] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const unread = notes.filter((n) => !seen.includes(n.id)).length

  const markRead = () => {
    const ids = notes.map((n) => n.id)
    setSeen(ids)
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable */
    }
  }

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-5 border-b border-line px-4 sm:px-8">
      <button onClick={onOpenNav} className="grid size-9 place-items-center rounded-lg text-fg-soft hover:bg-white/5 md:hidden" aria-label="Open navigation">
        <Menu className="size-5" />
      </button>
      <Link to="/app" className="md:hidden" aria-label="catt home">
        <Logo />
      </Link>

      <p className="m-auto hidden items-center text-xs text-[#9b9691] sm:flex">
        <span className={cn('mr-[7px] inline-block size-[7px] rounded-full', busy ? 'animate-pulse bg-brand-500 shadow-[0_0_10px_#f47721]' : 'bg-online shadow-[0_0_10px_#73b383]')} />
        {busy ? 'Catt is thinking…' : 'Catt is ready'}
      </p>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="grid size-9 place-items-center rounded-lg text-[#89837e] transition-colors hover:bg-[#322c27] hover:text-white"
          aria-label={`Search (${isMac ? 'Cmd' : 'Ctrl'} K)`}
          title="Search"
        >
          <Search className="size-[18px]" />
        </button>

        <Popover
          className="w-[min(22rem,calc(100vw-2rem))]"
          trigger={({ toggle }) => (
            <button
              onClick={() => {
                toggle()
                markRead()
              }}
              className="relative grid size-9 place-items-center rounded-lg text-[#89837e] transition-colors hover:bg-[#322c27] hover:text-white"
              aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
            >
              <Bell className="size-[18px]" />
              {unread > 0 && <span className="absolute top-1.5 right-2 size-2 rounded-full bg-brand-500 shadow-[0_0_8px_#f47721]" />}
            </button>
          )}
        >
          {(close) => (
            <div>
              <p className="font-display px-3 pt-2 pb-1 text-sm font-medium text-white">Notifications</p>
              {notes.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">You're all caught up.</p>}
              <ul>
                {notes.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        navigate(n.to)
                        close()
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.04]"
                    >
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] bg-[rgba(100,40,8,0.62)] text-brand-500">
                        <n.icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm text-fg">{n.title}</span>
                        <span className="block truncate text-xs text-muted">{n.text}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Popover>

        <Popover
          className="w-60"
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className="font-display grid size-[34px] place-items-center rounded-full border border-[#514d48] bg-[#282522] text-[11px] text-white"
              aria-label="Open profile"
            >
              {initials(name)}
            </button>
          )}
        >
          {(close) => (
            <ul className="text-sm">
              <li className="border-b border-line px-3 py-2.5">
                <p className="font-display font-medium text-white">{name}</p>
                <p className="text-xs text-muted">Personal workspace</p>
              </li>
              {[
                { to: '/app/settings', label: 'Settings', icon: Settings },
                { to: '/app/settings?tab=ai', label: 'Personalization', icon: SlidersHorizontal },
                { to: '/app/memory', label: 'Memory', icon: Brain },
              ].map((i) => (
                <li key={i.to}>
                  <Link to={i.to} onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-fg-soft hover:bg-white/[0.04] hover:text-white">
                    <i.icon className="size-4 text-brand-500" /> {i.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-1">
                <Link to="/" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-fg-soft hover:bg-white/[0.04] hover:text-white">
                  <ExternalLink className="size-4 text-brand-500" /> Visit website
                </Link>
              </li>
            </ul>
          )}
        </Popover>
      </div>
    </header>
  )
}
