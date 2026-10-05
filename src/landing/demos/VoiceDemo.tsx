import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AIAvatar } from '@/components/ui/Avatar'
import { canSpeak, speak, stopSpeaking, useSpeaking } from '@/lib/voice'
import { cn } from '@/lib/utils'

const QUESTION = "Hey Mr Balogun, what's the best time to start a new project?"
const ANSWER = "Right now — while the idea is fresh. Block 45 minutes tomorrow morning, define the first small win, and I'll remind you."

function Wave({ side, active }: { side: 'left' | 'right'; active: boolean }) {
  const bars = 26
  return (
    <div className={cn('flex h-16 flex-1 items-center gap-[3px]', side === 'left' ? 'justify-end [mask-image:linear-gradient(90deg,transparent,#000)]' : '[mask-image:linear-gradient(90deg,#000,transparent)]')}>
      {Array.from({ length: bars }, (_, i) => {
        const k = side === 'left' ? i : bars - i
        const h = 0.2 + Math.abs(Math.sin(k * 1.7)) * 0.8 * (k / bars)
        return (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-brand-400 shadow-[0_0_6px_rgba(58,166,255,0.9)]"
            animate={{ height: active ? [`${h * 30}%`, `${h * 100}%`, `${h * 50}%`] : `${h * 45}%` }}
            transition={active ? { duration: 0.7 + (i % 5) * 0.12, repeat: Infinity, repeatType: 'mirror' } : { duration: 0.5 }}
          />
        )
      })}
    </div>
  )
}

export function VoiceDemo() {
  const [stage, setStage] = useState<'idle' | 'listening' | 'answer'>('idle')
  const speaking = useSpeaking((s) => s.speaking)

  useEffect(() => () => stopSpeaking(), [])

  const run = () => {
    if (stage !== 'idle') {
      stopSpeaking()
      setStage('idle')
      return
    }
    setStage('listening')
    setTimeout(() => {
      setStage('answer')
      if (canSpeak()) speak(ANSWER)
    }, 1600)
  }

  const active = stage === 'listening' || speaking

  return (
    <div className="relative">
      <div className="relative z-10 mb-8 ml-auto w-fit max-w-[19rem] sm:mr-8">
        <div className="glass-strong flex items-start gap-3 rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-[0.82rem] leading-relaxed text-fg-soft">{QUESTION}</p>
          <AIAvatar size={30} />
        </div>
      </div>

      <div className="relative flex items-center gap-4">
        <Wave side="left" active={active} />
        <button
          onClick={run}
          aria-label={stage === 'idle' ? 'Play voice demo' : 'Stop voice demo'}
          className="group relative grid size-20 shrink-0 place-items-center rounded-full border border-brand-400/60 bg-ink-800/80 text-brand-200 shadow-[0_0_40px_-4px_rgba(6,140,252,0.7),inset_0_0_20px_rgba(6,140,252,0.25)] transition hover:scale-105"
        >
          {[0, 0.8, 1.6].map((d) => (
            <span key={d} className="animate-pulse-ring absolute inset-0 rounded-full border border-brand-400/50" style={{ animationDelay: `${d}s` }} />
          ))}
          {stage === 'idle' ? <Mic className="size-7" /> : <Square className="size-6 fill-current" />}
        </button>
        <Wave side="right" active={active} />
      </div>

      <div className="mt-6 min-h-20">
        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-xs text-subtle">
              Tap the mic to hear Mr Balogun answer
            </motion.p>
          )}
          {stage === 'listening' && (
            <motion.p key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-xs text-brand-300">
              Listening…
            </motion.p>
          )}
          {stage === 'answer' && (
            <motion.div key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass mx-auto flex max-w-sm gap-3 rounded-2xl rounded-tl-sm px-4 py-3">
              <AIAvatar size={28} />
              <p className="text-[0.82rem] leading-relaxed text-fg-soft">{ANSWER}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
