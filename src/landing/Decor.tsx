import { motion } from 'framer-motion'
import { useId, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LightStreaks({ className, flip }: { className?: string; flip?: boolean }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute', flip && '-scale-x-100', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" x2="1">
          <stop offset="0" stopColor="#068cfc" stopOpacity="0" />
          <stop offset="0.5" stopColor="#3aa6ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#068cfc" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <motion.path
          key={i}
          d={`M-20 ${300 - i * 22} C 200 ${180 - i * 30}, 420 ${380 - i * 10}, 820 ${120 + i * 26}`}
          fill="none"
          stroke={`url(#${id}-a)`}
          strokeWidth={i === 0 ? 2.2 : 1}
          opacity={0.75 - i * 0.15}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <path d="M-20 300 C 200 180, 420 380, 820 120" fill="none" stroke={`url(#${id}-a)`} strokeWidth="10" opacity="0.35" filter={`url(#${id}-blur)`} />
    </svg>
  )
}

export function Reveal({ children, className, delay = 0, y = 26 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 space-y-3.5">
      {items.map((it, i) => (
        <motion.li
          key={it}
          className="flex items-center gap-3 text-[0.95rem] text-fg-soft"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
        >
          <span className="grid size-5 place-items-center rounded-full bg-brand-500 shadow-[0_0_12px_rgba(6,140,252,0.7)]">
            <Check className="size-3 text-white" strokeWidth={3} />
          </span>
          {it}
        </motion.li>
      ))}
    </ul>
  )
}

interface FeatureSectionProps {
  id?: string
  index: number
  total: number
  title: string
  accentWord?: string
  text: string
  bullets: string[]
  visual: ReactNode
  reverse?: boolean
  className?: string
  decor?: ReactNode
}

export function FeatureSection({ id, index, total, title, accentWord, text, bullets, visual, reverse, className, decor }: FeatureSectionProps) {
  const parts = accentWord ? title.split(accentWord) : [title]
  return (
    <section id={id} className={cn('relative scroll-mt-20 overflow-hidden border-t border-line-soft', className)}>
      {decor}
      <div className={cn('relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:gap-16')}>
        <Reveal className={cn(reverse && 'lg:order-2')}>
          <p className="font-display text-sm font-medium tracking-wide text-brand-400">
            {String(index).padStart(2, '0')} <span className="text-subtle">/ {String(total).padStart(2, '0')}</span>
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            {parts[0]}
            {accentWord && <span className="font-accent text-brand-gradient">{accentWord}</span>}
            {parts[1]}
          </h2>
          <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted">{text}</p>
          <CheckList items={bullets} />
        </Reveal>
        <Reveal delay={0.15} className={cn('relative', reverse && 'lg:order-1')}>
          {visual}
        </Reveal>
      </div>
    </section>
  )
}
