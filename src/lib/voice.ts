import { useCallback, useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import { stripMarkdown } from './ai/text'
import { useSettings } from './store/settings'

/* ---------------- speech synthesis ---------------- */

export const useSpeaking = create<{ speaking: boolean }>(() => ({ speaking: false }))

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(markdown: string) {
  if (!canSpeak()) return
  const { voiceURI, voiceRate } = useSettings.getState()
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(stripMarkdown(markdown).slice(0, 1200))
  const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI)
  if (voice) u.voice = voice
  u.rate = voiceRate
  u.onstart = () => useSpeaking.setState({ speaking: true })
  u.onend = u.onerror = () => useSpeaking.setState({ speaking: false })
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
  useSpeaking.setState({ speaking: false })
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (!canSpeak()) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])
  return voices
}

/* ---------------- speech recognition ---------------- */

interface RecognitionResultEvent {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionResultEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

type RecognitionCtor = new () => Recognition

const getRecognition = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const canListen = () => !!getRecognition()

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<Recognition | null>(null)
  const finalRef = useRef('')
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  })

  const start = useCallback(() => {
    const Ctor = getRecognition()
    if (!Ctor) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    stopSpeaking()
    const rec = new Ctor()
    rec.lang = navigator.language || 'en-US'
    rec.continuous = false
    rec.interimResults = true
    finalRef.current = ''
    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript
        else live += r[0].transcript
      }
      setInterim(finalRef.current + live)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Microphone access was blocked. Allow it in your browser to use voice.')
      else if (e.error !== 'aborted' && e.error !== 'no-speech') setError('Voice input hit a problem. Please try again.')
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
      const text = finalRef.current.trim()
      if (text) onFinalRef.current(text)
    }
    recRef.current = rec
    setError(null)
    setListening(true)
    rec.start()
  }, [])

  const stop = useCallback(() => recRef.current?.stop(), [])

  useEffect(() => () => recRef.current?.abort(), [])

  return { listening, interim, error, start, stop, toggle: listening ? stop : start, supported: canListen() }
}
