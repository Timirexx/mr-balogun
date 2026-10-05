import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
        checked ? 'switch-on' : 'border-line bg-ink-750',
      )}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

interface Option<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

export function OptionCards<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  className?: string
}) {
  return (
    <div className={cn('grid gap-2.5', className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-all',
              active ? 'option-active' : 'border-line bg-ink-800/60 text-muted hover:border-line-strong hover:text-fg-soft',
            )}
          >
            {o.icon && <span className={active ? 'text-hue' : ''}>{o.icon}</span>}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, tabs, className }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; count?: number }[]; className?: string }) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-line bg-ink-850/70 p-1', className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn('relative shrink-0 rounded-lg px-3.5 py-1.5 text-[0.8rem] transition-colors', active ? 'text-white' : 'text-muted hover:text-fg-soft')}
          >
            {active && (
              <motion.span layoutId={`tab-${tabs.map((x) => x.value).join('')}`} className="absolute inset-0 rounded-lg border border-brand-400/40 bg-brand-500/15" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 text-subtle">{t.count}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="icon-box mb-4 size-14 rounded-2xl">{icon}</div>
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
