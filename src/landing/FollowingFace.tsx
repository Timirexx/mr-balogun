import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useSettings } from '@/lib/store/settings'
import { cn } from '@/lib/utils'

// Frames 12–31 of the reference head-movement video: the turn toward the
// viewer's right (eyes lead, then head and shoulders follow). The left turn is
// the same sequence mirrored, so the suit stays identical on both sides.
const FRAMES = Array.from({ length: 20 }, (_, i) => 12 + i)
const LAST = FRAMES.length - 1

const FRAME_W = 680
const FRAME_H = 700
const pad3 = (n: number) => String(n).padStart(3, '0')
const src = (size: 'lg' | 'sm', f: number) => `/avatar/face/${size}/${pad3(f)}.webp`
const POSTER = src('lg', FRAMES[0])

// Critically damped spring on the frame position. Peak speed is capped near the
// reference video's 24 fps so a full turn takes about as long as in the clip.
const OMEGA = 9
const MAX_SPEED = 28

type Frame = ImageBitmap | HTMLImageElement

function useFrames(enabled: boolean) {
  const [frames, setFrames] = useState<Frame[] | null>(null)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const size: 'lg' | 'sm' = window.innerWidth < 768 ? 'sm' : 'lg'
    const load = async (f: number): Promise<Frame> => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src(size, f)
      await img.decode()
      return 'createImageBitmap' in window ? createImageBitmap(img) : img
    }
    const run = async () => {
      const out: Frame[] = []
      for (let i = 0; i < FRAMES.length; i += 5) {
        out.push(...(await Promise.all(FRAMES.slice(i, i + 5).map(load))))
        if (cancelled) return
      }
      setFrames(out)
    }
    const start = () => run().catch(() => undefined)
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    if (idle) idle(start)
    else setTimeout(start, 300)
    return () => {
      cancelled = true
    }
  }, [enabled])
  return frames
}

export function FollowingFace({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  const reduceSetting = useSettings((s) => s.reduceMotion)
  const [reduced, setReduced] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const frames = useFrames(!reduced)
  const ready = !!frames && !reduced

  // A faint lean of the whole figure toward the cursor, layered on the real turn.
  const lean = useMotionValue(0)
  const sl = useSpring(lean, { stiffness: 60, damping: 18, mass: 0.8 })
  const rotateY = useTransform(sl, [-1, 1], [-3, 3])
  const x = useTransform(sl, [-1, 1], [-8, 8])
  const gx = useTransform(sl, [-1, 1], [38, 62])
  const glow = useMotionTemplate`radial-gradient(circle at ${gx}% 28%, rgba(80,170,255,0.2), transparent 40%)`

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches || reduceSetting)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [reduceSetting])

  useEffect(() => {
    if (!ready || !frames) return
    const canvas = canvasRef.current!
    const wrap = wrapRef.current!
    const ctx = canvas.getContext('2d')!

    // pos: signed frame position, negative = turned toward the viewer's left (mirrored).
    let pos = 0
    let vel = 0
    let goal = 0
    let mode: 'mouse' | 'touch' | 'idle' = 'idle'
    let lastTouch = 0
    let raf = 0
    let last = performance.now()
    let visible = true

    const draw = () => {
      const side = pos < 0 ? -1 : 1
      const a = Math.min(LAST, Math.abs(pos))
      const i0 = Math.floor(a)
      const i1 = Math.min(LAST, i0 + 1)
      const t = a - i0
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H)
      const dw = FRAME_W * scale
      const dh = FRAME_H * scale
      const ox = (cw - dw) / 2
      const oy = (ch - dh) * 0.1

      const paint = (i: number, alpha: number, op: GlobalCompositeOperation) => {
        if (alpha <= 0.001) return
        ctx.globalAlpha = alpha
        ctx.globalCompositeOperation = op
        if (side < 0 && i > 0) {
          ctx.save()
          ctx.translate(cw, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(frames[i], cw - ox - dw, oy, dw, dh)
          ctx.restore()
        } else {
          ctx.drawImage(frames[i], ox, oy, dw, dh)
        }
      }

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, cw, ch)
      // Premultiplied cross-dissolve, (1-t)·A + t·B, so neighbouring frames blend instead of stacking.
      paint(i0, 1 - t, 'source-over')
      if (i1 !== i0) paint(i1, t, 'lighter')
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const acc = OMEGA * OMEGA * (goal - pos) - 2 * OMEGA * vel
      vel = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, vel + acc * dt))
      pos = Math.max(-LAST, Math.min(LAST, pos + vel * dt))
      draw()
      const settled = Math.abs(goal - pos) < 0.01 && Math.abs(vel) < 0.02
      if (!settled && visible) raf = requestAnimationFrame(step)
    }

    const kick = () => {
      if (raf || !visible) return
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    const setTarget = (nx: number) => {
      const mag = Math.abs(nx) < 0.03 ? 0 : Math.pow(Math.min(1, Math.abs(nx) * 1.12), 0.9)
      // Frames 0↔1 on the left side bridge the original and its mirror; never rest
      // inside that step so a half-dissolve is never held on screen.
      const f = mag * LAST
      goal = Math.sign(nx) * (f < 0.5 ? 0 : Math.max(1, f))
      lean.set(nx * 0.4)
      kick()
    }

    const onPointer = (e: PointerEvent) => {
      if (!e.isPrimary) return
      if (e.pointerType === 'mouse') mode = 'mouse'
      else {
        mode = 'touch'
        lastTouch = performance.now()
      }
      const r = wrap.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const dx = e.clientX - cx
      setTarget(Math.max(-1, Math.min(1, dx / Math.max(80, dx > 0 ? window.innerWidth - cx : cx))))
    }

    const onLeave = () => {
      mode = 'idle'
      setTarget(0)
    }

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      draw()
    }

    // No mouse to follow (touch devices, or the cursor left the window): glance side to side.
    const GLANCES = [0.45, 0, -0.5, 0, 0.2, -0.25, 0]
    let g = 0
    const idle = window.setInterval(() => {
      if (mode === 'mouse') return
      if (mode === 'touch' && performance.now() - lastTouch < 3000) return
      setTarget(GLANCES[g++ % GLANCES.length])
    }, 2600)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    io.observe(wrap)
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(idle)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [ready, frames, lean])

  return (
    <div className={cn('relative h-full w-full [perspective:1200px]', className)}>
      <motion.div ref={wrapRef} className="relative h-full w-full" style={{ rotateY, x, transformStyle: 'preserve-3d' }}>
        <img
          src={POSTER}
          alt="Mr Balogun — robotic AI assistant"
          className={cn('absolute inset-0 h-full w-full object-cover object-[50%_10%] transition-opacity duration-700', ready && 'opacity-0', imgClassName)}
          draggable={false}
          fetchPriority="high"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn('absolute inset-0 h-full w-full transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-screen [mask-image:radial-gradient(ellipse_50%_55%_at_50%_30%,#000_40%,transparent_90%)]" style={{ background: glow }} />
      </motion.div>
    </div>
  )
}
