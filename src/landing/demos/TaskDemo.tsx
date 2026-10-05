import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Brain, CircleCheck, Folder, Loader2, MessageSquare, RotateCcw, Settings, SquareCheckBig } from 'lucide-react'
import { useState } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'
import { LightStreaks } from '../Decor'

const NAV = [
  { icon: MessageSquare, label: 'Chat' },
  { icon: SquareCheckBig, label: 'Tasks', active: true },
  { icon: Folder, label: 'Files' },
  { icon: Brain, label: 'Memory' },
  { icon: Settings, label: 'Settings' },
]

const PLAN = ['Define 3 content pillars', 'Map a weekly publishing rhythm', 'Draft 4 headline ideas', 'Schedule Friday review']

export function TaskDemo() {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')
  const [shown, setShown] = useState(0)

  const generate = () => {
    if (state !== 'idle') {
      setState('idle')
      setShown(0)
      return
    }
    setState('working')
    setTimeout(() => {
      setState('done')
      PLAN.forEach((_, i) => setTimeout(() => setShown(i + 1), 260 * (i + 1)))
    }, 900)
  }

  return (
    <div className="relative">
      <LightStreaks className="top-[38%] -left-[30%] h-[85%] w-[165%]" />
      <div className="glass-strong relative mx-auto flex max-w-lg overflow-hidden rounded-2xl">
        <aside className="hidden w-36 shrink-0 border-r border-line bg-ink-900/40 p-3 sm:block">
          <div className="mb-4 flex items-center gap-1.5 px-1">
            <LogoMark className="size-5" />
            <span className="text-xs font-semibold text-white">Mr Balogun</span>
          </div>
          <ul className="space-y-1">
            {NAV.map(({ icon: Icon, label, active }) => (
              <li key={label} className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.72rem]', active ? 'chip-active border' : 'text-muted')}>
                <Icon className="size-3.5" />
                {label}
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted">
            <ArrowLeft className="size-3.5" />
            <span className="text-[0.7rem]">Tasks</span>
          </div>
          <div className="rounded-xl border border-line bg-ink-800/70 p-4">
            <p className="text-sm font-medium text-white">Create a content plan</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">I'll help you build a focused content plan based on your goals.</p>

            <AnimatePresence>
              {state === 'done' && (
                <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-1.5 overflow-hidden">
                  {PLAN.slice(0, shown).map((p) => (
                    <motion.li key={p} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-fg-soft">
                      <CircleCheck className="text-hue size-3.5" />
                      {p}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <button onClick={generate} className="btn-primary mt-4 rounded-lg px-3.5 py-1.5 text-xs">
              {state === 'idle' && 'Generate Plan'}
              {state === 'working' && (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Thinking…
                </>
              )}
              {state === 'done' && (
                <>
                  <RotateCcw className="size-3.5" /> Reset
                </>
              )}
            </button>
          </div>
          <div className="mt-3 h-12 rounded-xl border border-dashed border-line-soft" />
        </div>
      </div>
    </div>
  )
}
