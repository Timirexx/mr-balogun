import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { create } from 'zustand'
import { uid } from '@/lib/utils'

type ToastKind = 'success' | 'info' | 'error'
interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

const useToasts = create<{ items: ToastItem[] }>(() => ({ items: [] }))

export function toast(message: string, kind: ToastKind = 'success') {
  const id = uid()
  useToasts.setState((s) => ({ items: [...s.items, { id, kind, message }].slice(-3) }))
  setTimeout(() => useToasts.setState((s) => ({ items: s.items.filter((t) => t.id !== id) })), 2800)
}

const ICONS = { success: CircleCheck, info: Info, error: TriangleAlert }

export function Toaster() {
  const items = useToasts((s) => s.items)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="glass-strong pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-fg"
            >
              <Icon className={t.kind === 'error' ? 'size-4 text-danger' : 'size-4 text-brand-300'} />
              {t.message}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
