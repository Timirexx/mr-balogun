import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Minimal, dependency-free markdown for assistant replies. Renders to React
// elements (never innerHTML), so model output can't inject markup.

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_|\*[^*\s][^*]*\*)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const k = `${keyBase}-${i++}`
    if (tok.startsWith('**')) out.push(<strong key={k} className="font-semibold text-white">{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) out.push(<code key={k} className="rounded-md border border-line bg-ink-950/60 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-200">{tok.slice(1, -1)}</code>)
    else out.push(<em key={k} className="text-fg-soft">{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      i++
      blocks.push(
        <pre key={key++} className="overflow-x-auto rounded-xl border border-line bg-ink-950/70 p-3 font-mono text-[0.82rem] leading-relaxed text-brand-100">
          {code.join('\n')}
        </pre>,
      )
      continue
    }

    if (/^\s*---\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="border-line" />)
      i++
      continue
    }

    const h = line.match(/^(#{1,4})\s+(.*)/)
    if (h) {
      blocks.push(
        <p key={key++} className={cn('font-semibold text-white', h[1].length <= 2 ? 'text-base' : 'text-[0.95rem]', 'pt-1')}>
          {inline(h[2], `h${key}`)}
        </p>,
      )
      i++
      continue
    }

    if (line.startsWith('> ')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) quote.push(lines[i++].slice(2))
      blocks.push(
        <div key={key++} className="rounded-lg border-l-2 border-brand-500/70 bg-brand-500/5 px-3 py-2 text-[0.85rem] text-muted">
          {inline(quote.join(' '), `q${key}`)}
        </div>,
      )
      continue
    }

    if (/^\s*[-•]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-•]\s+/, ''))
      blocks.push(
        <ul key={key++} className="space-y-1.5">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5">
              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(58,166,255,0.8)]" />
              <span>{inline(it, `li${key}-${j}`)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''))
      blocks.push(
        <ol key={key++} className="space-y-1.5">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5">
              <span className="mt-[0.1em] grid size-5 shrink-0 place-items-center rounded-md border border-brand-500/40 bg-brand-500/10 text-[0.7rem] font-semibold text-brand-300">
                {j + 1}
              </span>
              <span>{inline(it, `ol${key}-${j}`)}</span>
            </li>
          ))}
        </ol>,
      )
      continue
    }

    if (!line.trim()) {
      i++
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(\s*[-•]\s+|\s*\d+\.\s+|#{1,4}\s|> |```|\s*---\s*$)/.test(lines[i])) para.push(lines[i++])
    blocks.push(
      <p key={key++}>
        {para.map((p, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {inline(p, `p${key}-${j}`)}
          </Fragment>
        ))}
      </p>,
    )
  }

  return <div className={cn('space-y-3 leading-relaxed', className)}>{blocks}</div>
}
