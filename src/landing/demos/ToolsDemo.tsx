import { motion } from 'framer-motion'
import { FileText, Sparkles, UploadCloud } from 'lucide-react'
import { TOOLS } from '@/lib/tools/registry'

export function ToolsDemo() {
  const shown = TOOLS.slice(0, 6)
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 -z-10 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="glass-strong edge-glow rounded-2xl p-4">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-brand-400/40 bg-brand-500/5 p-3">
          <span className="icon-box size-10">
            <UploadCloud className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">Q4 content plan.md</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-300"
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            </div>
          </div>
          <motion.span
            className="flex items-center gap-1 text-[0.68rem] text-brand-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.7 }}
          >
            <Sparkles className="size-3" /> Summary ready
          </motion.span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {shown.map((t, i) => (
            <motion.div
              key={t.id}
              className="tile flex flex-col items-center gap-2 rounded-xl px-2 py-3.5 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <span className="icon-box size-9">
                <t.icon className="size-4" />
              </span>
              <span className="text-[0.72rem] text-fg-soft">{t.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-ink-800/60 px-3 py-2.5">
          <FileText className="size-3.5 shrink-0 text-brand-300" />
          <p className="truncate text-[0.72rem] text-muted">
            <span className="text-fg-soft">TL;DR:</span> Grow the newsletter to 5,000 subscribers with two essays a month.
          </p>
        </div>
      </div>
    </div>
  )
}
