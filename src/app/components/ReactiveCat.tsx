import { cn } from '@/lib/utils'

export type CatState = 'idle' | 'listening' | 'thinking' | 'speaking'

const LABELS: Record<CatState, string> = {
  idle: 'Waiting for you',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
}

/** The mascot, reacting to what Catt is doing — pulsing while it listens or
 *  speaks, floating while it thinks. */
export function ReactiveCat({ state = 'idle', className }: { state?: CatState; className?: string }) {
  return (
    <div className={cn('relative my-1 flex h-[210px] items-center justify-center sm:h-[250px]', className)}>
      <div
        className={cn(
          'absolute bottom-[18px] h-[130px] w-[220px] rounded-[50%] bg-[radial-gradient(ellipse,rgba(244,119,33,0.34),transparent_68%)] blur-[12px]',
          state === 'listening' && 'animate-[cat-pulse_1.2s_infinite]',
          state === 'speaking' && 'animate-[cat-pulse_0.55s_infinite]',
        )}
      />
      <img
        src="/avatar/hero.webp"
        alt="Catt"
        className={cn(
          'relative z-10 h-[210px] w-[210px] object-contain [filter:drop-shadow(0_0_24px_rgba(244,119,33,0.28))] sm:h-[245px] sm:w-[245px]',
          state === 'thinking' && 'animate-[cat-float_1.5s_infinite]',
        )}
        draggable={false}
      />
      <div className="absolute bottom-[3px] z-20 rounded-[20px] border border-line bg-[rgba(22,20,18,0.85)] px-3 py-[7px] text-[10px] text-[#b6aaa1]">
        <span className="mr-[5px] inline-block size-[6px] rounded-full bg-brand-500" />
        {LABELS[state]}
      </div>
    </div>
  )
}
