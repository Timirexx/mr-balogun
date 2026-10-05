import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({ title, subtitle, actions, className }: { title: string; subtitle?: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-4 pt-6 sm:px-6 md:pt-8 lg:px-8', className)}>{children}</div>
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('glass rounded-2xl', className)}>{children}</section>
}
