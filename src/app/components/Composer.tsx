import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Mic, Paperclip, SendHorizontal, Square, X } from 'lucide-react'
import { useEffect, useImperativeHandle, useRef, useState, type ClipboardEvent, type KeyboardEvent, type Ref } from 'react'
import { toast } from '@/components/ui/Toast'
import { Waveform } from '@/components/ui/Waveform'
import { useFiles } from '@/lib/store/files'
import { useSettings } from '@/lib/store/settings'
import type { StoredFile } from '@/lib/types'
import { cn, formatBytes } from '@/lib/utils'
import { useSpeechRecognition } from '@/lib/voice'

export interface ComposerHandle {
  addFiles: (files: File[]) => void
  focus: () => void
  setText: (t: string) => void
  startVoice: () => void
  openFilePicker: () => void
}

interface ComposerProps {
  onSend: (text: string, files: StoredFile[], viaVoice: boolean) => void
  onStop?: () => void
  busy?: boolean
  placeholder?: string
  compact?: boolean
  autoFocus?: boolean
  ref?: Ref<ComposerHandle>
}

const MAX_FILE = 25 * 1024 * 1024

function PendingChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file.type.startsWith('image/')) return
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex items-center gap-2 rounded-xl border border-line bg-ink-800/80 py-1.5 pr-7 pl-1.5"
    >
      {url ? (
        <img src={url} alt="" className="size-8 rounded-lg object-cover" />
      ) : (
        <span className="icon-box size-8 rounded-lg">
          <FileText className="size-4" />
        </span>
      )}
      <span className="max-w-32">
        <span className="block truncate text-xs text-fg-soft">{file.name}</span>
        <span className="block text-[0.65rem] text-subtle">{formatBytes(file.size)}</span>
      </span>
      <button onClick={onRemove} className="absolute top-1 right-1 grid size-5 place-items-center rounded-md text-subtle hover:bg-white/10 hover:text-white" aria-label={`Remove ${file.name}`}>
        <X className="size-3" />
      </button>
    </motion.div>
  )
}

export function Composer({ onSend, onStop, busy, placeholder = 'Message CATT…', compact, autoFocus, ref }: ComposerProps) {
  const [text, setText] = useState('')
  const [pending, setPending] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const sendOnEnter = useSettings((s) => s.sendOnEnter)
  const addToStore = useFiles((s) => s.addFiles)

  const voice = useSpeechRecognition((t) => onSend(t, [], true))

  useEffect(() => {
    if (voice.error) toast(voice.error, 'error')
  }, [voice.error])

  const addFiles = (files: File[]) => {
    const ok = files.filter((f) => f.size <= MAX_FILE)
    if (ok.length < files.length) toast('Files over 25 MB were skipped', 'error')
    setPending((p) => [...p, ...ok].slice(0, 6))
  }

  useImperativeHandle(ref, () => ({
    addFiles,
    focus: () => taRef.current?.focus(),
    setText: (t: string) => {
      setText(t)
      requestAnimationFrame(() => taRef.current?.focus())
    },
    startVoice: () => {
      if (!voice.listening) voice.start()
    },
    openFilePicker: () => fileRef.current?.click(),
  }))

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, compact ? 120 : 200)}px`
  }, [text, compact])

  const submit = async () => {
    if (busy || uploading) return
    const t = text.trim()
    if (!t && !pending.length) return
    let stored: StoredFile[] = []
    if (pending.length) {
      setUploading(true)
      try {
        stored = await addToStore(pending)
      } finally {
        setUploading(false)
      }
    }
    setText('')
    setPending([])
    onSend(t, stored, false)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && sendOnEnter && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void submit()
    }
  }

  const onPaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files)
    if (files.length) {
      e.preventDefault()
      addFiles(files)
    }
  }

  const canSend = (text.trim() || pending.length) && !uploading

  return (
    <div
      className={cn(
        'glass rounded-2xl transition-shadow focus-within:border-brand-400/50 focus-within:shadow-[0_0_0_3px_rgba(6,140,252,0.12),0_0_40px_-12px_rgba(6,140,252,0.6)]',
        compact ? 'p-2' : 'p-2.5',
      )}
    >
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap gap-2 px-1 pt-1 pb-2">
              <AnimatePresence>
                {pending.map((f, i) => (
                  <PendingChip key={`${f.name}-${i}`} file={f} onRemove={() => setPending((p) => p.filter((_, j) => j !== i))} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="grid size-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-brand-300"
          aria-label="Attach files or images"
          title="Attach files or images"
        >
          <Paperclip className="size-[18px]" />
        </button>

        <div className="relative min-w-0 flex-1">
          {voice.listening ? (
            <div className="flex min-h-9 items-center gap-3 px-1 py-1.5">
              <Waveform bars={9} className="h-5" />
              <span className="truncate text-sm text-brand-200">{voice.interim || 'Listening…'}</span>
            </div>
          ) : (
            <textarea
              ref={taRef}
              rows={1}
              value={text}
              autoFocus={autoFocus}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              onPaste={onPaste}
              placeholder={placeholder}
              aria-label="Message"
              className="block max-h-[200px] min-h-9 w-full resize-none bg-transparent px-1 py-[7px] text-[0.92rem] leading-relaxed text-white placeholder:text-subtle focus:outline-none"
            />
          )}
        </div>

        <button
          onClick={voice.toggle}
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
            voice.listening ? 'bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/60' : 'text-muted hover:bg-white/5 hover:text-brand-300',
          )}
          aria-label={voice.listening ? 'Stop listening' : 'Speak your message'}
          title={voice.supported ? 'Voice input' : 'Voice input needs Chrome or Edge'}
        >
          {voice.listening ? <Square className="size-3.5 fill-current" /> : <Mic className="size-[18px]" />}
        </button>

        {busy ? (
          <button
            onClick={onStop}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-400/60 bg-ink-700 text-brand-200"
            aria-label="Stop generating"
            title="Stop"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={() => void submit()}
            disabled={!canSend}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_0_18px_-2px_rgba(6,140,252,0.9)] transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
