import { cn } from '@/lib/utils'

export function AIAvatar({ size = 40, online, ring = true, className }: { size?: number; online?: boolean; ring?: boolean; className?: string }) {
  return (
    <span className={cn('relative inline-block shrink-0 rounded-full', className)} style={{ width: size, height: size }}>
      <img
        src="/avatar/avatar.webp"
        alt="CATT"
        width={size}
        height={size}
        className={cn(
          'size-full rounded-full object-cover',
          ring && 'ring-1 ring-brand-400/50 shadow-[0_0_calc(18px*var(--glow))_-2px_rgba(6,140,252,0.6)]',
        )}
        draggable={false}
      />
      {online && (
        <span className="absolute right-0 bottom-0 size-[28%] max-h-3 max-w-3 rounded-full border-2 border-ink-900 bg-online shadow-[0_0_8px_rgba(34,227,161,0.8)]" />
      )}
    </span>
  )
}
