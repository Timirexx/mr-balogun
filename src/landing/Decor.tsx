import { motion } from 'framer-motion'
import { useId, type ReactNode } from 'react'
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
          <stop offset="0" style={{ stopColor: 'rgb(var(--hue, 244 119 33))' }} stopOpacity="0" />
          <stop offset="0.5" style={{ stopColor: 'rgb(var(--hue, 255 155 56))' }} stopOpacity="0.9" />
          <stop offset="1" style={{ stopColor: 'rgb(var(--hue, 244 119 33))' }} stopOpacity="0" />
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
