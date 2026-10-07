import { cn } from '@/lib/utils'

/** The brand mark: a cat-whisker glyph in a soft-cornered, orange-edged box.
 *  Callers set the box size and a matching glyph size. */
export function LogoMark({ className = 'size-[30px] text-[24px]' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-[10px] border border-brand-400/50 leading-none text-brand-500',
        'shadow-[0_0_16px_rgba(244,119,33,0.2)_inset]',
        className,
      )}
    >
      <span className="-translate-y-[0.18em]">ᵔ</span>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-[18px] leading-none font-bold tracking-[-0.04em] text-white">
        catt<span className="text-brand-500">.</span>
      </span>
    </span>
  )
}
