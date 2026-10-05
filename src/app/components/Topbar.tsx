import { Bell, Brain, CalendarClock, ChevronDown, CircleAlert, CircleCheck, ExternalLink, Moon, MoonStar, Search, Settings, SlidersHorizontal, SunMoon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { AIAvatar } from '@/components/ui/Avatar'
import { Popover } from '@/components/ui/Popover'
import { toast } from '@/components/ui/Toast'
import { useAssistant } from '@/lib/store/assistant'
import { useCalendar } from '@/lib/store/calendar'
import { useMemories } from '@/lib/store/memories'
import { useSettings } from '@/lib/store/settings'
import { useTasks } from '@/lib/store/tasks'
import type { ThemeName } from '@/lib/types'
import { cn, timeAgo, todayISO } from '@/lib/utils'

const SEEN_KEY = 'mrb-notifications-seen'

function useNotifications() {
  const tasks = useTasks((s) => s.tasks)
  const events = useCalendar((s) => s.events)
  const memories = useMemories((s) => s.memories)

  return useMemo(() => {
    const today = todayISO()
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    const items: { id: string; icon: typeof Bell; title: string; text: string; to: string }[] = []
    const due = tasks.filter((t) => !t.done && t.due === today)
    const overdue = tasks.filter((t) => !t.done && t.due && t.due < today)
    const next = events
      .filter((e) => e.date === today && Number(e.start.slice(0, 2)) * 60 + Number(e.start.slice(3)) >= nowMin)
      .sort((a, b) => a.start.localeCompare(b.start))[0]
    if (due.length) items.push({ id: `due-${today}-${due.length}`, icon: CircleCheck, title: `${due.length} task${due.length > 1 ? 's' : ''} due today`, text: due.map((t) => t.title).slice(0, 2).join(' · '), to: '/app/tasks' })
    if (overdue.length) items.push({ id: `over-${overdue.length}`, icon: CircleAlert, title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`, text: overdue[0].title, to: '/app/tasks' })
    if (next) items.push({ id: `ev-${next.id}`, icon: CalendarClock, title: `Up next: ${next.title}`, text: `Today at ${next.start}`, to: '/app/calendar' })
    const recent = memories[0]
    if (recent && Date.now() - recent.createdAt < 86_400_000) items.push({ id: `mem-${recent.id}`, icon: Brain, title: 'New memory saved', text: `${recent.content} · ${timeAgo(recent.createdAt)}`, to: '/app/memory' })
    return items
  }, [tasks, events, memories])
}

const THEMES: { value: ThemeName; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'midnight', label: 'Midnight', icon: MoonStar },
  { value: 'auto', label: 'Auto', icon: SunMoon },
]

export function Topbar() {
  const navigate = useNavigate()
  const { name, theme, update } = useSettings()
  const setPaletteOpen = useAssistant((s) => s.setPaletteOpen)
  const notes = useNotifications()
  const [scrolled, setScrolled] = useState(false)
  const [seen, setSeen] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const unread = notes.filter((n) => !seen.includes(n.id)).length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const markRead = () => {
    const ids = notes.map((n) => n.id)
    setSeen(ids)
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable */
    }
  }

  const themeIdx = THEMES.findIndex((t) => t.value === theme)
  const ThemeIcon = THEMES[themeIdx]?.icon ?? Moon
  const cycleTheme = () => {
    const next = THEMES[(themeIdx + 1) % THEMES.length]
    update({ theme: next.value })
    toast(`Theme: ${next.label}`, 'info')
  }

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 transition-colors duration-300 sm:px-6 md:h-[72px] lg:px-8',
        scrolled ? 'border-line-soft bg-ink-900/75 backdrop-blur-xl' : 'border-line-soft/60 bg-transparent',
      )}
    >
      <Link to="/app" className="md:hidden" aria-label="Home">
        <LogoMark className="size-8" />
      </Link>

      <button
        onClick={() => setPaletteOpen(true)}
        className="glass hidden h-11 w-full max-w-[30rem] items-center gap-3 rounded-xl px-4 text-left text-sm text-subtle transition-colors hover:border-line-strong sm:flex"
      >
        <Search className="size-[18px] text-fg-soft" />
        <span className="flex-1">Search anything…</span>
        <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[0.7rem] text-muted">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button onClick={() => setPaletteOpen(true)} className="grid size-10 place-items-center rounded-xl text-fg-soft hover:bg-white/5 sm:hidden" aria-label="Search">
          <Search className="size-5" />
        </button>

        <Popover
          className="w-[min(22rem,calc(100vw-2rem))]"
          trigger={({ toggle }) => (
            <button
              onClick={() => {
                toggle()
                markRead()
              }}
              className="relative grid size-10 place-items-center rounded-xl text-fg-soft transition-colors hover:bg-white/5 hover:text-white"
              aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
            >
              <Bell className="size-[21px]" strokeWidth={1.6} />
              {unread > 0 && <span className="absolute top-2 right-2.5 size-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(58,166,255,1)]" />}
            </button>
          )}
        >
          {(close) => (
            <div>
              <p className="px-3 pt-2 pb-1 text-sm font-medium text-white">Notifications</p>
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
                      <span className="icon-box mt-0.5 size-8 shrink-0 rounded-lg">
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

        <button onClick={cycleTheme} className="grid size-10 place-items-center rounded-xl text-fg-soft transition-colors hover:bg-white/5 hover:text-white" aria-label={`Theme: ${THEMES[themeIdx]?.label}. Switch theme`} title="Switch theme">
          <ThemeIcon className="size-[21px]" strokeWidth={1.6} />
        </button>

        <span className="mx-1 hidden h-8 w-px bg-line sm:block" />

        <Popover
          className="w-60"
          trigger={({ toggle, open }) => (
            <button onClick={toggle} className="flex items-center gap-3 rounded-xl py-1 pr-1 pl-1 transition-colors hover:bg-white/5 sm:pr-2" aria-label="Account menu" aria-expanded={open}>
              <AIAvatar size={40} />
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-medium whitespace-nowrap text-white">{name}</span>
                <span className="flex items-center gap-1.5 text-xs text-online">
                  <span className="size-1.5 rounded-full bg-online" /> Online
                </span>
              </span>
              <ChevronDown className={cn('hidden size-4 text-muted transition-transform lg:block', open && 'rotate-180')} />
            </button>
          )}
        >
          {(close) => (
            <ul className="text-sm">
              <li className="border-b border-line px-3 py-2.5">
                <p className="font-medium text-white">{name}</p>
                <p className="text-xs text-muted">Personal workspace</p>
              </li>
              {[
                { to: '/app/settings', label: 'Settings', icon: Settings },
                { to: '/app/settings?tab=ai', label: 'Personalization', icon: SlidersHorizontal },
                { to: '/app/memory', label: 'Memory', icon: Brain },
              ].map((i) => (
                <li key={i.to}>
                  <Link to={i.to} onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-fg-soft hover:bg-white/[0.04] hover:text-white">
                    <i.icon className="size-4 text-muted" /> {i.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-1">
                <Link to="/" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-fg-soft hover:bg-white/[0.04] hover:text-white">
                  <ExternalLink className="size-4 text-muted" /> Visit website
                </Link>
              </li>
            </ul>
          )}
        </Popover>
      </div>
    </header>
  )
}
