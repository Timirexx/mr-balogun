import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, FilePlus2, MessageSquareMore, RotateCcw, Sparkles, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Markdown } from '@/components/ui/Markdown'
import { toast } from '@/components/ui/Toast'
import { TypingDots } from '@/components/ui/TypingDots'
import { runTool } from '@/lib/ai/engine'
import { logActivity } from '@/lib/store/activity'
import { titleFrom, useChat } from '@/lib/store/chat'
import { isTextLike, useFiles } from '@/lib/store/files'
import { getTool } from '@/lib/tools/registry'
import type { StoredFile } from '@/lib/types'
import { Page, Panel } from '../components/PageHeader'

const FILE_TOOLS = ['summarize', 'rewrite']

export default function ToolRunner() {
  const { toolId } = useParams()
  const tool = getTool(toolId)
  const navigate = useNavigate()
  const files = useFiles((s) => s.files)
  const addFiles = useFiles((s) => s.addFiles)
  const [input, setInput] = useState('')
  const [file, setFile] = useState<StoredFile | null>(null)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setInput('')
    setOutput('')
    setFile(null)
    return () => abortRef.current?.abort()
  }, [toolId])

  if (!tool) return <Navigate to="/app/tools" replace />

  const textFiles = files.filter(isTextLike)
  const canRun = !!(input.trim() || file) && !running

  const run = async () => {
    if (!canRun) return
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setOutput('')
    try {
      await runTool(tool.id, input.trim(), file ? [file] : [], setOutput, controller.signal)
      logActivity('tool', `${tool.name}: ${titleFrom(input || file?.name || tool.name)}`, `${tool.name} tool`)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast('Something went wrong. Try again.', 'error')
    } finally {
      setRunning(false)
    }
  }

  const continueInChat = () => {
    const chat = useChat.getState()
    const id = chat.create(`${tool.name}: ${titleFrom(input || file?.name || '')}`)
    chat.append(id, { role: 'user', content: input || `Use ${tool.name} on ${file?.name}`, attachments: file ? [{ id: file.id, name: file.name, type: file.type, size: file.size }] : undefined })
    chat.append(id, { role: 'assistant', content: output })
    navigate(`/app/chat/${id}`)
  }

  const saveToFiles = async () => {
    const name = `${tool.name} – ${titleFrom(input || file?.name || 'result')}.md`.replace(/[\\/:*?"<>|]/g, '')
    await addFiles([new File([output], name, { type: 'text/markdown' })])
    toast('Saved to Files')
  }

  return (
    <Page>
      <Link to="/app/tools" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" /> All tools
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="icon-box size-14 rounded-2xl">
          <tool.icon className="size-7" strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{tool.name}</h1>
          <p className="mt-1 text-sm text-muted">{tool.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel className="flex flex-col p-4 sm:p-5">
          <label htmlFor="tool-input" className="text-sm font-medium text-white">
            Input
          </label>
          <textarea
            id="tool-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run()
            }}
            rows={FILE_TOOLS.includes(tool.id) ? 9 : 5}
            placeholder={tool.placeholder}
            className="field mt-3 resize-y leading-relaxed"
          />

          {FILE_TOOLS.includes(tool.id) && textFiles.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted">Or use a file</p>
              <div className="flex flex-wrap gap-2">
                {textFiles.slice(0, 6).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFile(file?.id === f.id ? null : f)
                      if (tool.id === 'rewrite' && f.textExcerpt) setInput(f.textExcerpt)
                    }}
                    className={file?.id === f.id ? 'chip border-brand-400/70 bg-brand-500/15 text-white' : 'chip'}
                  >
                    {file?.id === f.id && <Check className="size-3.5 text-brand-300" />}
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool.examples.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted">Try an example</p>
              <div className="flex flex-wrap gap-2">
                {tool.examples.map((ex) => (
                  <button key={ex} onClick={() => setInput(ex)} className="chip">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <span className="hidden text-xs text-subtle sm:inline">Ctrl + Enter to run</span>
            {running ? (
              <button onClick={() => abortRef.current?.abort()} className="btn-ghost ml-auto px-5 py-2.5 text-sm">
                <Square className="size-3.5 fill-current" /> Stop
              </button>
            ) : (
              <button onClick={() => void run()} disabled={!canRun} className="btn-primary ml-auto px-6 py-2.5 text-sm">
                <Sparkles className="size-4" /> Generate
              </button>
            )}
          </div>
        </Panel>

        <Panel className="relative flex min-h-80 flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Result</p>
            {output && !running && (
              <div className="flex gap-1">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(output)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1400)
                  }}
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white"
                  aria-label="Copy result"
                  title="Copy"
                >
                  {copied ? <Check className="size-4 text-brand-300" /> : <Copy className="size-4" />}
                </button>
                <button onClick={() => void saveToFiles()} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white" aria-label="Save to Files" title="Save to Files">
                  <FilePlus2 className="size-4" />
                </button>
                <button onClick={() => void run()} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white" aria-label="Run again" title="Run again">
                  <RotateCcw className="size-4" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-line-soft bg-ink-900/40 p-4 text-[0.92rem] text-fg-soft">
            <AnimatePresence mode="wait">
              {!output && !running && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-full min-h-48 place-items-center text-center">
                  <div>
                    <tool.icon className="mx-auto size-8 text-brand-500/50" />
                    <p className="mt-3 text-sm text-subtle">Your result will appear here.</p>
                  </div>
                </motion.div>
              )}
              {running && !output && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TypingDots />
                </motion.div>
              )}
              {output && (
                <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Markdown text={output} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {output && !running && (
            <button onClick={continueInChat} className="btn-ghost mt-4 py-2.5 text-sm">
              <MessageSquareMore className="size-4 text-brand-300" /> Continue in chat
            </button>
          )}
        </Panel>
      </div>
    </Page>
  )
}
