import { AnimatePresence, motion } from 'framer-motion'
import { History, Maximize2, MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'
import { AIAvatar } from '@/components/ui/Avatar'
import { HUE } from '@/lib/hues'
import { cn } from '@/lib/utils'

const ITEMS = [
  { title: 'Project planning', time: '2 hours ago' },
  { title: 'Learning new skills', time: '5 hours ago' },
  { title: 'Personal goals', time: 'Yesterday' },
  { title: 'Tech & productivity', time: '2 days ago' },
  { title: 'Weekly review', time: '4 days ago' },
]

const REMEMBERED = [
  { label: 'Prefers mornings', hue: HUE.fuchsia },
  { label: 'Reading 12 books', hue: HUE.emerald },
  { label: 'Tech & productivity brand', hue: HUE.blue },
]

export function MemoryDemo() {
  const [q, setQ] = useState('')
  const list = ITEMS.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[rgb(var(--hue)/0.12)] blur-3xl" />
      <div className="glass-strong edge-glow rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <AIAvatar size={24} />
            <p className="text-sm font-medium text-white">Chat History</p>
          </div>
          <div className="flex gap-1 text-subtle">
            <MoreHorizontal className="size-4" />
            <Maximize2 className="text-hue size-4" />
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-ink-850/80 px-3 py-2 focus-within:border-brand-400/60">
          <Search className="size-3.5 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full bg-transparent text-xs text-white placeholder:text-subtle focus:outline-none"
          />
        </label>
        <ul className="mt-2 min-h-[13.5rem]">
          <AnimatePresence initial={false}>
            {list.map((i) => (
              <motion.li
                key={i.title}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
              >
                <span className="icon-box size-7 rounded-full">
                  <History className="size-3.5" />
                </span>
                <span className="flex-1 text-[0.8rem] text-fg-soft">{i.title}</span>
                <span className="text-[0.68rem] text-subtle">{i.time}</span>
              </motion.li>
            ))}
          </AnimatePresence>
          {!list.length && <li className="py-10 text-center text-xs text-subtle">No conversations match "{q}"</li>}
        </ul>
        <div className="mt-2 border-t border-line pt-3">
          <p className="mb-2 px-1 text-[0.68rem] tracking-wide text-subtle uppercase">Remembered</p>
          <div className="flex flex-wrap gap-1.5">
            {REMEMBERED.map((r) => (
              <span key={r.label} className={cn('badge-hue rounded-full px-2.5 py-1 text-[0.68rem]', r.hue)}>
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
