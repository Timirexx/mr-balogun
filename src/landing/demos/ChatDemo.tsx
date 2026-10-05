import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Maximize2, SendHorizontal, SquarePen } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AIAvatar } from '@/components/ui/Avatar'
import { Markdown } from '@/components/ui/Markdown'
import { TypingDots } from '@/components/ui/TypingDots'
import { buildContext } from '@/lib/ai/engine'
import { composeReply, streamText } from '@/lib/ai/mock'
import { uid } from '@/lib/utils'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  text: string
  typing?: boolean
}

const INTRO_Q = 'Help me plan my day'

export function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const ask = async (q: string) => {
    if (busy) return
    setBusy(true)
    const id = uid()
    setMsgs((m) => [...m, { id: uid(), role: 'user', text: q }, { id, role: 'assistant', text: '', typing: true }])
    const controller = new AbortController()
    abortRef.current = controller
    const reply = composeReply({
      messages: [{ id: 'q', role: 'user', content: q, createdAt: Date.now() }],
      context: { ...buildContext(), responseStyle: 'concise' },
    })
    let out = ''
    try {
      for await (const chunk of streamText(reply, controller.signal)) {
        out += chunk
        setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: out, typing: false } : x)))
      }
    } catch {
      /* unmounted */
    }
    setBusy(false)
  }

  useEffect(() => {
    if (inView && msgs.length === 0) {
      const t = setTimeout(() => ask(INTRO_Q), 500)
      return () => clearTimeout(t)
    }
  }, [inView])

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setInput('')
    ask(q)
  }

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-10 -z-10 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="glass-strong edge-glow overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AIAvatar size={34} online />
            <div>
              <p className="text-sm font-medium text-white">Mr Balogun</p>
              <p className="flex items-center gap-1.5 text-[0.7rem] text-muted">
                <span className="size-1.5 rounded-full bg-online" /> Online
              </p>
            </div>
          </div>
          <div className="flex gap-1 text-brand-300">
            <span className="grid size-7 place-items-center rounded-lg hover:bg-white/5">
              <SquarePen className="size-3.5" />
            </span>
            <span className="grid size-7 place-items-center rounded-lg hover:bg-white/5">
              <Maximize2 className="size-3.5" />
            </span>
          </div>
        </div>

        <div ref={scroller} className="h-[330px] space-y-4 overflow-y-auto px-4 py-5">
          <AnimatePresence initial={false}>
            {msgs.map((m) =>
              m.role === 'user' ? (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-b from-brand-500 to-brand-600 px-3.5 py-2 text-sm text-white shadow-[0_8px_24px_-8px_rgba(6,140,252,0.8)]">
                    {m.text}
                  </p>
                </motion.div>
              ) : (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                  <AIAvatar size={28} />
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-ink-750/70 px-3.5 py-2.5 text-[0.82rem] text-fg-soft">
                    {m.typing ? <TypingDots /> : <Markdown text={m.text} className="space-y-2" />}
                  </div>
                </motion.div>
              ),
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} className="border-t border-line p-3">
          <div className="flex items-center gap-2 rounded-full border border-line bg-ink-850/80 py-1.5 pr-1.5 pl-4 focus-within:border-brand-400/60">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              aria-label="Message Mr Balogun"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid size-8 place-items-center rounded-full bg-brand-500 text-white shadow-[0_0_16px_rgba(6,140,252,0.7)] transition disabled:opacity-50"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[0.68rem] text-subtle">Try it — ask anything. Running on the local demo engine.</p>
        </form>
      </div>
    </div>
  )
}
