import { AnimatePresence, motion } from 'framer-motion'
import { Brain, CircleCheck, CornerDownLeft, FileText, MessageSquareMore, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { startConversation, useAssistant } from '@/lib/store/assistant'
import { useChat } from '@/lib/store/chat'
import { useFiles } from '@/lib/store/files'
import { useMemories } from '@/lib/store/memories'
import { useTasks } from '@/lib/store/tasks'
import { TOOLS } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import { NAV } from '../nav'

interface Item {
  id: string
  group: string
  label: string
  hint?: string
  icon: ComponentType<{ className?: string }>
  run: () => void
}

export function CommandPalette() {
  const open = useAssistant((s) => s.paletteOpen)
  const setOpen = useAssistant((s) => s.setPaletteOpen)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const conversations = useChat((s) => s.conversations)
  const tasks = useTasks((s) => s.tasks)
  const memories = useMemories((s) => s.memories)
  const files = useFiles((s) => s.files)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!useAssistant.getState().paletteOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
    }
  }, [open])

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => navigate(to)
    const query = q.trim().toLowerCase()
    const match = (s: string) => !query || s.toLowerCase().includes(query)
    const out: Item[] = []
    if (query) {
      out.push({
        id: 'ask',
        group: 'Ask',
        label: `Ask CATT: “${q.trim()}”`,
        icon: Sparkles,
        run: async () => navigate(`/app/chat/${await startConversation(q.trim())}`),
      })
    }
    NAV.filter((n) => match(n.label)).forEach((n) => out.push({ id: n.to, group: 'Go to', label: n.label, icon: n.icon, run: go(n.to) }))
    TOOLS.filter((t) => match(t.name) || match(t.tagline)).forEach((t) => out.push({ id: `tool-${t.id}`, group: 'Tools', label: t.name, hint: t.tagline, icon: t.icon, run: go(`/app/skills/${t.id}`) }))
    if (query) {
      conversations
        .filter((c) => match(c.title) || c.messages.some((m) => match(m.content)))
        .slice(0, 5)
        .forEach((c) => out.push({ id: c.id, group: 'Conversations', label: c.title, icon: MessageSquareMore, run: go(`/app/chat/${c.id}`) }))
      tasks.filter((t) => match(t.title)).slice(0, 4).forEach((t) => out.push({ id: t.id, group: 'Tasks', label: t.title, hint: t.done ? 'Done' : t.due, icon: CircleCheck, run: go('/app/tasks') }))
      memories.filter((m) => match(m.content)).slice(0, 4).forEach((m) => out.push({ id: m.id, group: 'Memory', label: m.content, icon: Brain, run: go('/app/memory') }))
      files.filter((f) => match(f.name)).slice(0, 4).forEach((f) => out.push({ id: f.id, group: 'Files', label: f.name, icon: FileText, run: go('/app/files') }))
    }
    return out
  }, [q, conversations, tasks, memories, files, navigate])

  useEffect(() => {
    setIdx(0)
  }, [q])

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  const run = (item?: Item) => {
    if (!item) return
    setOpen(false)
    item.run()
  }

  let lastGroup = ''

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="glass-strong edge-glow relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-brand-300" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setIdx((i) => Math.min(i + 1, items.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setIdx((i) => Math.max(i - 1, 0))
                  } else if (e.key === 'Enter') run(items[idx])
                  else if (e.key === 'Escape') setOpen(false)
                }}
                placeholder="Search or ask CATT…"
                aria-label="Search"
                className="h-14 flex-1 bg-transparent text-[0.95rem] text-white placeholder:text-subtle focus:outline-none"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[0.65rem] text-muted">ESC</kbd>
            </div>
            <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results</li>}
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null
                lastGroup = item.group
                return (
                  <li key={`${item.group}-${item.id}`}>
                    {header && <p className="px-3 pt-3 pb-1.5 text-[0.68rem] font-medium tracking-wider text-subtle uppercase">{header}</p>}
                    <button
                      data-idx={i}
                      onMouseMove={() => setIdx(i)}
                      onClick={() => run(item)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm', i === idx ? 'bg-brand-500/15 text-white ring-1 ring-brand-400/30' : 'text-fg-soft')}
                    >
                      <item.icon className={cn('size-4 shrink-0', i === idx ? 'text-brand-300' : 'text-muted')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && <span className="truncate text-xs text-subtle">{item.hint}</span>}
                      {i === idx && <CornerDownLeft className="size-3.5 text-brand-300" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
