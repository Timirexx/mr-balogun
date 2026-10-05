import { AnimatePresence, motion } from 'framer-motion'
import { Download, Eye, File, FileCode, FileImage, FileText, Folder, HardDrive, Search, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, Tabs } from '@/components/ui/Controls'
import { Markdown } from '@/components/ui/Markdown'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { sendMessage } from '@/lib/ai/engine'
import { useChat } from '@/lib/store/chat'
import { downloadFile, isImage, isTextLike, useFiles, useFileUrl } from '@/lib/store/files'
import type { StoredFile } from '@/lib/types'
import { HUE } from '@/lib/hues'
import { cn, formatBytes, timeAgo } from '@/lib/utils'
import { Page, PageHeader, Panel } from '../components/PageHeader'

type Kind = 'all' | 'documents' | 'images' | 'other'

const kindOf = (f: StoredFile): Exclude<Kind, 'all'> => (isImage(f) ? 'images' : isTextLike(f) || /pdf|word|document|sheet|presentation/.test(f.type) ? 'documents' : 'other')

const CODE = /\.(js|ts|tsx|jsx|py|css|html?|json)$/i

const fileHue = (f: StoredFile) =>
  HUE[isImage(f) ? 'fuchsia' : CODE.test(f.name) ? 'cyan' : isTextLike(f) || /pdf|word|document/.test(f.type) ? 'blue' : 'amber']

function FileIcon({ f, className }: { f: StoredFile; className?: string }) {
  if (isImage(f)) return <FileImage className={className} />
  if (CODE.test(f.name)) return <FileCode className={className} />
  if (isTextLike(f) || /pdf|word|document/.test(f.type)) return <FileText className={className} />
  return <File className={className} />
}

function Thumb({ f }: { f: StoredFile }) {
  const url = useFileUrl(isImage(f) ? f : undefined)
  if (url) return <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
  return (
    <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,rgb(var(--hue)/0.2),transparent_70%)]">
      <span className="icon-box size-14 rounded-2xl">
        <FileIcon f={f} className="size-7" />
      </span>
    </div>
  )
}

function Preview({ f, onClose }: { f: StoredFile | null; onClose: () => void }) {
  const url = useFileUrl(f && isImage(f) ? f : undefined)
  return (
    <Modal open={!!f} onClose={onClose} title={f?.name} className="max-w-2xl">
      {f && (
        <div className="max-h-[65vh] overflow-y-auto">
          {isImage(f) ? (
            url ? <img src={url} alt={f.name} className="mx-auto max-h-[60vh] rounded-xl" /> : <div className="skeleton h-64 rounded-xl" />
          ) : f.textExcerpt ? (
            /\.md$/i.test(f.name) ? (
              <Markdown text={f.textExcerpt} className="text-sm text-fg-soft" />
            ) : (
              <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-fg-soft">{f.textExcerpt}</pre>
            )
          ) : (
            <p className="py-10 text-center text-sm text-muted">No preview available for this file type. You can still download it.</p>
          )}
          <p className="mt-4 text-xs text-subtle">
            {formatBytes(f.size)} · added {timeAgo(f.createdAt)}
          </p>
        </div>
      )}
    </Modal>
  )
}

export default function Files() {
  const { files, addFiles, remove } = useFiles()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<Kind>('all')
  const [q, setQ] = useState('')
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<StoredFile | null>(null)

  const counts = useMemo(() => {
    const c = { all: files.length, documents: 0, images: 0, other: 0 }
    files.forEach((f) => c[kindOf(f)]++)
    return c
  }, [files])

  const list = useMemo(
    () => files.filter((f) => (kind === 'all' || kindOf(f) === kind) && f.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.createdAt - a.createdAt),
    [files, kind, q],
  )

  const used = files.reduce((s, f) => s + f.size, 0)
  const quota = 500 * 1024 * 1024

  const upload = async (list: File[]) => {
    if (!list.length) return
    setBusy(true)
    try {
      const added = await addFiles(list)
      toast(`${added.length} file${added.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast('Upload failed — storage may be full', 'error')
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    void upload(Array.from(e.dataTransfer.files))
  }

  const askAbout = (f: StoredFile) => {
    const id = useChat.getState().create()
    void sendMessage(id, isTextLike(f) ? 'Summarize this file' : 'What can you do with this file?', { files: [f] })
    navigate(`/app/chat/${id}`)
  }

  return (
    <Page>
      <PageHeader
        title="Files"
        subtitle="Upload, manage and work with your files."
        actions={
          <button onClick={() => inputRef.current?.click()} className="btn-primary rounded-xl px-4 py-2.5 text-sm">
            <UploadCloud className="size-4" /> Upload
          </button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void upload(Array.from(e.target.files))
          e.target.value = ''
        }}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all',
            drag ? 'border-brand-400 bg-brand-500/10 shadow-[0_0_50px_-10px_rgba(6,140,252,0.8)]' : 'border-line-strong/60 bg-ink-850/40 hover:border-brand-400/60 hover:bg-brand-500/5',
          )}
        >
          <motion.span animate={drag ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }} className="icon-box hue-amber size-14 rounded-2xl">
            <UploadCloud className="size-7" />
          </motion.span>
          <p className="mt-4 text-sm font-medium text-white">{busy ? 'Uploading…' : drag ? 'Drop to upload' : 'Drag & drop files here'}</p>
          <p className="mt-1 text-xs text-muted">or click to browse · up to 25 MB each · text files can be summarized instantly</p>
        </div>
        <Panel className="flex flex-col justify-center p-5">
          <div className="flex items-center gap-3">
            <span className="icon-box hue-amber size-10">
              <HardDrive className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-white">Storage</p>
              <p className="text-xs text-muted">Saved privately on this device</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-700">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-gold-300 to-gold-100 shadow-[0_0_10px_rgba(233,190,112,0.7)]" initial={{ width: 0 }} animate={{ width: `${Math.max(2, (used / quota) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {formatBytes(used)} of {formatBytes(quota)} · {files.length} files
          </p>
        </Panel>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={kind}
          onChange={setKind}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'documents', label: 'Documents', count: counts.documents },
            { value: 'images', label: 'Images', count: counts.images },
            { value: 'other', label: 'Other', count: counts.other },
          ]}
        />
        <label className="flex items-center gap-2 rounded-xl border border-line bg-ink-850/70 px-3 focus-within:border-brand-400/60 sm:w-64">
          <Search className="size-4 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" aria-label="Search files" className="h-10 w-full bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
        </label>
      </div>

      {list.length === 0 ? (
        <Panel className="mt-4">
          <EmptyState icon={<Folder className="size-6" />} title={q ? 'No matching files' : 'No files yet'} text={q ? 'Try a different search.' : 'Upload documents and images to work with them here and in chat.'} />
        </Panel>
      ) : (
        <motion.ul layout className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {list.map((f) => (
              <motion.li key={f.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className={cn('tile group overflow-hidden rounded-2xl', fileHue(f))}>
                <button onClick={() => setPreview(f)} className="block aspect-[16/9] w-full overflow-hidden border-b border-line" aria-label={`Preview ${f.name}`}>
                  <Thumb f={f} />
                </button>
                <div className="p-4">
                  <p className="truncate text-sm font-medium text-white" title={f.name}>
                    {f.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatBytes(f.size)} · {timeAgo(f.createdAt)}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <button onClick={() => askAbout(f)} className="btn-ghost mr-auto h-8 rounded-lg px-2.5 text-xs">
                      <Sparkles className="hue-violet text-hue size-3.5" /> {isTextLike(f) ? 'Summarize' : 'Ask about it'}
                    </button>
                    <button onClick={() => setPreview(f)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white" aria-label={`Preview ${f.name}`}>
                      <Eye className="size-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!(await downloadFile(f))) toast('This file is no longer available', 'error')
                      }}
                      className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white"
                      aria-label={`Download ${f.name}`}
                    >
                      <Download className="size-4" />
                    </button>
                    <button
                      onClick={async () => {
                        await remove(f.id)
                        toast('File deleted')
                      }}
                      className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                      aria-label={`Delete ${f.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Preview f={preview} onClose={() => setPreview(null)} />
    </Page>
  )
}
