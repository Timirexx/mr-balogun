import { motion } from 'framer-motion'
import { Check, Copy, FileText, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AIAvatar } from '@/components/ui/Avatar'
import { Markdown } from '@/components/ui/Markdown'
import { TypingDots } from '@/components/ui/TypingDots'
import { useFiles, useFileUrl } from '@/lib/store/files'
import type { Attachment, ChatMessage } from '@/lib/types'
import { cn, formatBytes } from '@/lib/utils'
import { speak, stopSpeaking, useSpeaking } from '@/lib/voice'

function AttachmentView({ att }: { att: Attachment }) {
  const meta = useFiles((s) => s.files.find((f) => f.id === att.id))
  const url = useFileUrl(att.type.startsWith('image/') ? meta : undefined)
  if (url) return <img src={url} alt={att.name} className="max-h-48 rounded-xl border border-white/10 object-cover" />
  return (
    <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5">
      <FileText className="size-4 shrink-0" />
      <span className="min-w-0">
        <span className="block max-w-44 truncate text-xs">{att.name}</span>
        <span className="block text-[0.65rem] opacity-70">{meta ? formatBytes(att.size) : 'Removed from Files'}</span>
      </span>
    </span>
  )
}

function ActionButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid size-7 place-items-center rounded-lg text-subtle transition-colors hover:bg-white/5 hover:text-brand-300">
      {children}
    </button>
  )
}

function AssistantActions({ msg, canRegenerate, onRegenerate }: { msg: ChatMessage; canRegenerate: boolean; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false)
  const [mine, setMine] = useState(false)
  const speaking = useSpeaking((s) => s.speaking)

  useEffect(() => {
    if (!speaking) setMine(false)
  }, [speaking])

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="mt-1.5 flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
      <ActionButton onClick={copy} label={copied ? 'Copied' : 'Copy response'}>
        {copied ? <Check className="size-3.5 text-brand-300" /> : <Copy className="size-3.5" />}
      </ActionButton>
      <ActionButton
        onClick={() => {
          if (mine && speaking) stopSpeaking()
          else {
            speak(msg.content)
            setMine(true)
          }
        }}
        label={mine && speaking ? 'Stop reading' : 'Read aloud'}
      >
        {mine && speaking ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </ActionButton>
      {canRegenerate && onRegenerate && (
        <ActionButton onClick={onRegenerate} label="Regenerate response">
          <RefreshCw className="size-3.5" />
        </ActionButton>
      )}
      <span className="ml-1.5 text-[0.68rem] text-subtle">{new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
    </div>
  )
}

interface MessageListProps {
  messages: ChatMessage[]
  streaming: boolean
  onRegenerate?: () => void
  compact?: boolean
  className?: string
}

export function MessageList({ messages, streaming, onRegenerate, compact, className }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const lastId = messages[messages.length - 1]?.id
  const lastContent = messages[messages.length - 1]?.content

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    pinned.current = true
  }, [lastId])

  useEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: 'end' })
  }, [lastId, lastContent])

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  return (
    <div ref={scrollerRef} className={cn('overflow-y-auto overscroll-contain', className)}>
      <div className={cn('mx-auto flex flex-col', compact ? 'gap-4 px-3 py-4' : 'max-w-3xl gap-6 px-4 py-6 sm:px-6')}>
        {messages.map((m) =>
          m.role === 'user' ? (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-end gap-2">
              {m.attachments?.length ? (
                <div className="flex max-w-[85%] flex-wrap justify-end gap-2 text-white">
                  {m.attachments.map((a) => (
                    <AttachmentView key={a.id} att={a} />
                  ))}
                </div>
              ) : null}
              {m.content && (
                <p
                  className={cn(
                    'max-w-[85%] rounded-2xl rounded-br-md bubble-user whitespace-pre-wrap',
                    compact ? 'px-3 py-2 text-[0.84rem]' : 'px-4 py-2.5 text-[0.92rem]',
                  )}
                >
                  {m.content}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group flex gap-3">
              <AIAvatar size={compact ? 26 : 32} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'w-fit max-w-full rounded-2xl rounded-tl-md border border-line bg-ink-750/60 text-fg-soft',
                    compact ? 'px-3 py-2 text-[0.84rem]' : 'px-4 py-3 text-[0.92rem]',
                  )}
                >
                  {m.pending && !m.content ? (
                    <TypingDots />
                  ) : (
                    <>
                      <Markdown text={m.content} className={compact ? 'space-y-2' : undefined} />
                      {m.pending && <span className="animate-blink ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-brand-300" />}
                    </>
                  )}
                </div>
                {!m.pending && (
                  <AssistantActions msg={m} canRegenerate={m.id === lastAssistantId && !streaming} onRegenerate={onRegenerate} />
                )}
              </div>
            </motion.div>
          ),
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
