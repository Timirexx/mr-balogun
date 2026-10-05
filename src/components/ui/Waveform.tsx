import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const PATTERN = [0.35, 0.6, 0.9, 0.5, 1, 0.7, 0.4, 0.85, 0.55, 0.3, 0.75, 0.95, 0.45, 0.65, 0.3]

export function Waveform({ active = true, bars = 11, className }: { active?: boolean; bars?: number; className?: string }) {
  return (
    <div className={cn('flex h-6 items-center gap-[3px]', className)} aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const h = PATTERN[i % PATTERN.length]
        return (
          <motion.span
            key={i}
            className="w-[2.5px] rounded-full bg-gradient-to-t from-brand-600 to-brand-300 shadow-[0_0_6px_rgba(58,166,255,0.7)]"
            initial={{ height: '20%' }}
            animate={active ? { height: [`${h * 30}%`, `${h * 100}%`, `${h * 45}%`] } : { height: `${18 + h * 22}%` }}
            transition={active ? { duration: 0.9 + (i % 4) * 0.15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.05 } : { duration: 0.4 }}
          />
        )
      })}
    </div>
  )
}
