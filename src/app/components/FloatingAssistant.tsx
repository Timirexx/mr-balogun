import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Lightbulb, Maximize2, Mic, Minus, PenLine, ScanSearch, SquarePen, X } from 'lucide-react'
import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AIAvatar } from '@/components/ui/Avatar'
import { Waveform } from '@/components/ui/Waveform'
import { regenerate, sendMessage, stopStreaming, useStreaming } from '@/lib/ai/engine'
import { useAssistant } from '@/lib/store/assistant'
import { useChat } from '@/lib/store/chat'
import { useSettings } from '@/lib/store/settings'
import type { StoredFile } from '@/lib/types'
import { cn, firstName } from '@/lib/utils'
import { stopSpeaking, useSpeaking } from '@/lib/voice'
import { Composer, type ComposerHandle } from './Composer'
import { MessageList } from './MessageList'

const QUICK = [
  { icon: CalendarDays, label: 'Plan my day', prompt: 'Plan my day' },
  { icon: PenLine, label: 'Write something', prompt: 'Create something' },
  { icon: ScanSearch, label: 'Research a topic', prompt: 'Research the future of personal AI assistants' },
  { icon: Lightbulb, label: 'Help me solve a problem', prompt: 'Help me solve a problem' },
]

export function FloatingAssistant() {
  const { open, setOpen, convId, ensureConversation, reset } = useAssistant()
  const conv = useChat((s) => s.conversations.find((c) => c.id === convId))
  const streaming = useStreaming((s) => (convId ? !!s.active[convId] : false))
  const speaking = useSpeaking((s) => s.speaking)
  const name = useSettings((s) => s.name)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const composer = useRef<ComposerHandle>(null)
  const onChat = pathname.startsWith('/app/chat')

  const send = (text: string, files: StoredFile[] = [], viaVoice = false) => {
    const id = ensureConversation()
    void sendMessage(id, text, { files, speakReply: viaVoice })
  }

  const status = streaming ? 'Thinking…' : speaking ? 'Speaking…' : 'Online'
  const messages = conv?.messages ?? []

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            key="launcher"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={cn('fixed right-4 z-40 sm:right-6', onChat ? 'bottom-[7.5rem] max-md:hidden' : 'bottom-[5.5rem] md:bottom-6')}
          >
            {/* Pill (desktop) */}
            <div
              className={cn(
                'glass-strong group hidden cursor-pointer items-center gap-3 rounded-full border-brand-400/50 py-1.5 pr-1.5 pl-1.5 shadow-[0_0_40px_-8px_rgba(6,140,252,0.7)]',
                !onChat && 'xl:flex',
              )}
              onClick={() => setOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open Mr Balogun assistant"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
            >
              <AIAvatar size={46} />
              <span className="pr-2">
                <span className="block text-sm font-medium text-white">Mr Balogun</span>
                <span className="block text-[0.7rem] text-muted">AI Assistant</span>
              </span>
              <Waveform active={speaking || streaming} bars={7} className="h-5" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                  setTimeout(() => composer.current?.startVoice(), 350)
                }}
                className="ml-1 grid size-11 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_0_20px_rgba(6,140,252,0.9)] transition hover:brightness-110"
                aria-label="Talk to Mr Balogun"
              >
                <Mic className="size-5" />
              </button>
            </div>

            {/* Orb (mobile / tablet / chat page) */}
            <button
              onClick={() => setOpen(true)}
              className={cn('relative grid size-14 place-items-center rounded-full', !onChat && 'xl:hidden')}
              aria-label="Open Mr Balogun assistant"
            >
              <span className="animate-pulse-ring absolute inset-0 rounded-full border border-brand-400/60" />
              <AIAvatar size={56} className="shadow-[0_0_30px_rgba(6,140,252,0.7)]" />
              <span className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full border-2 border-ink-900 bg-brand-500 text-white">
                <Mic className="size-3" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] bg-ink-950/60 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.section
              key="panel"
              aria-label="Mr Balogun assistant"
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              style={{ transformOrigin: 'bottom right' }}
              className="glass-strong edge-glow fixed inset-x-2 top-[10vh] bottom-2 z-[60] flex flex-col overflow-hidden rounded-3xl md:inset-auto md:right-6 md:bottom-6 md:h-[min(620px,calc(100vh-7rem))] md:w-[400px]"
            >
              <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                <AIAvatar size={38} online />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">Mr Balogun</p>
                  <p className={cn('flex items-center gap-1.5 text-xs', status === 'Online' ? 'text-online' : 'text-brand-300')}>
                    <span className={cn('size-1.5 rounded-full', status === 'Online' ? 'bg-online' : 'animate-pulse bg-brand-400')} />
                    {status}
                  </p>
                </div>
                <div className="flex items-center text-muted">
                  {conv && conv.messages.length > 0 && (
                    <button
                      onClick={() => {
                        setOpen(false)
                        navigate(`/app/chat/${conv.id}`)
                      }}
                      className="grid size-8 place-items-center rounded-lg hover:bg-white/5 hover:text-white"
                      aria-label="Continue in full chat"
                      title="Continue in Chat"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                  )}
                  <button onClick={() => reset()} className="grid size-8 place-items-center rounded-lg hover:bg-white/5 hover:text-white" aria-label="New quick chat" title="New chat">
                    <SquarePen className="size-4" />
                  </button>
                  <button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg hover:bg-white/5 hover:text-white" aria-label="Minimize assistant" title="Minimize">
                    <Minus className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      stopSpeaking()
                      if (convId) stopStreaming(convId)
                      reset()
                    }}
                    className="grid size-8 place-items-center rounded-lg hover:bg-white/5 hover:text-white"
                    aria-label="Close assistant"
                    title="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </header>

              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
                  <div className="relative mx-auto mb-4">
                    <span className="absolute -inset-4 rounded-full bg-brand-500/20 blur-2xl" />
                    <AIAvatar size={72} className="relative" />
                  </div>
                  <p className="text-center text-base font-medium text-white">Hi {firstName(name)},</p>
                  <p className="mt-1 text-center text-sm text-muted">I'm your AI assistant. How can I help you today?</p>
                  <ul className="mt-6 space-y-2">
                    {QUICK.map((q) => (
                      <li key={q.label}>
                        <button onClick={() => send(q.prompt)} className="tile flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-fg-soft hover:text-white">
                          <q.icon className="size-4 text-brand-300" />
                          {q.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <MessageList messages={messages} streaming={streaming} compact className="flex-1" onRegenerate={() => convId && regenerate(convId)} />
              )}

              <div className="border-t border-line p-3">
                <Composer
                  ref={composer}
                  compact
                  busy={streaming}
                  onStop={() => convId && stopStreaming(convId)}
                  onSend={(t, f, v) => send(t, f, v)}
                  placeholder="Ask Mr Balogun…"
                  autoFocus
                />
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
