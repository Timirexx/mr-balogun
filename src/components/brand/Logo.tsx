import { useId } from 'react'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('drop-shadow-[0_0_10px_rgba(6,140,252,0.55)]', className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8fd6ff" />
          <stop offset="0.5" stopColor="#3aa6ff" />
          <stop offset="1" stopColor="#1477f2" />
        </linearGradient>
      </defs>
      <path
        d="M16.2 34.2 8.4 27.2V7.6l9.2 12.6q2.4 3.2 4.8 0l9.2-12.6v19.6l-7.8 7"
        stroke={`url(#${id})`}
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="size-8 shrink-0" />
      <span className="text-[1.3rem] font-semibold tracking-[-0.02em] text-white">Mr Balogun</span>
    </span>
  )
}
