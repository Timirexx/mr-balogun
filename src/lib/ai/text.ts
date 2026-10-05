const STOP = new Set(
  'the a an and or but if then so of to in on at for with by from as is are was were be been being it its this that these those i you he she we they me my your our their his her them us not no do does did have has had will would can could should may might just than too very also into about over after before more most such only own same other some any each few both all what which who whom when where why how there here up down out off again further once because while during until against between through above below'.split(
    ' ',
  ),
)

export function splitSentences(text: string) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return (flat.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [flat]).map((s) => s.trim()).filter(Boolean)
}

function wordFreq(text: string) {
  const freq = new Map<string, number>()
  for (const w of text.toLowerCase().match(/[\p{L}']+/gu) ?? []) {
    if (w.length < 3 || STOP.has(w)) continue
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  return freq
}

export function keywords(text: string, n = 6) {
  return [...wordFreq(text).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w)
}

export function extractiveSummary(text: string, n = 3) {
  const sentences = splitSentences(text)
  if (sentences.length <= n) return sentences
  const freq = wordFreq(text)
  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().match(/[\p{L}']+/gu) ?? []
    const score = words.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0) / Math.sqrt(words.length + 1)
    return { s, i, score: i === 0 ? score * 1.15 : score }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
}

export function tidy(text: string) {
  return splitSentences(text)
    .map((s) =>
      s
        .replace(/\b(really|very|basically|actually|just|literally|kind of|sort of)\s+/gi, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\bi\b/g, 'I')
        .replace(/^./, (c) => c.toUpperCase()),
    )
    .join(' ')
}

export function stripMarkdown(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`>]/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}
