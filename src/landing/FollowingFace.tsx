import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useSettings } from '@/lib/store/settings'
import { cn } from '@/lib/utils'

// Frames come from the reference head-movement video: 12–31 is the turn to the
// viewer's right (eyes lead, then head and shoulders), 136–159 is the vertical
// sweep (147 is level gaze, 136 full up, 159 head bowed). The left turn mirrors
// the right turn so the suit stays identical on both sides.
const range = (a: number, b: number) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => (b >= a ? a + i : a - i))
const HUB = 12
const LEVEL = 147
const RIGHT = range(12, 31)

type Arm = 'right' | 'left' | 'up' | 'down'
interface Entry {
  f: number
  m?: boolean
}

const ARMS: Record<Arm, Entry[]> = {
  right: RIGHT.map((f) => ({ f })),
  left: RIGHT.map((f) => ({ f, m: f !== HUB })),
  up: [{ f: HUB }, ...range(LEVEL, 136).map((f) => ({ f }))],
  down: [{ f: HUB }, ...range(LEVEL, 159).map((f) => ({ f }))],
}

const FRAME_W = 680
const FRAME_H = 700
const EYE_Y = 0.22
const pad3 = (n: number) => String(n).padStart(3, '0')
const src = (size: 'lg' | 'sm', f: number) => `/avatar/face/${size}/${pad3(f)}.webp`

const POSTER = src('lg', HUB)

// Critically damped spring, in frames. Peak speed is capped near the
// reference video's 24 fps so full turns take about as long as in the clip.
const OMEGA = 9
const MAX_SPEED = 28

function useFrames(enabled: boolean) {
  const [frames, setFrames] = useState<Map<number, ImageBitmap | HTMLImageElement> | null>(null)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const size: 'lg' | 'sm' = window.innerWidth < 768 ? 'sm' : 'lg'
    const order = [HUB, ...RIGHT.slice(1), ...range(LEVEL, 136), ...range(LEVEL + 1, 159)]
    const load = async (f: number) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src(size, f)
      await img.decode()
      return [f, 'createImageBitmap' in window ? await createImageBitmap(img) : img] as const
    }
    const run = async () => {
      const out = new Map<number, ImageBitmap | HTMLImageElement>()
      for (let i = 0; i < order.length; i += 6) {
        const batch = await Promise.all(order.slice(i, i + 6).map(load))
        batch.forEach(([f, img]) => out.set(f, img))
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

  // Secondary, subtle 3D lean so diagonal cursor positions still read on both axes.
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const sx = useSpring(tx, { stiffness: 60, damping: 18, mass: 0.8 })
  const sy = useSpring(ty, { stiffness: 60, damping: 18, mass: 0.8 })
  const rotateY = useTransform(sx, [-1, 1], [-4, 4])
  const rotateX = useTransform(sy, [-1, 1], [3, -3])
  const x = useTransform(sx, [-1, 1], [-10, 10])
  const y = useTransform(sy, [-1, 1], [-6, 6])
  const gx = useTransform(sx, [-1, 1], [36, 64])
  const gy = useTransform(sy, [-1, 1], [16, 40])
  const glow = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(80,170,255,0.22), transparent 40%)`

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

    const state = { arm: 'right' as Arm, idx: 0, vel: 0 }
    const target = { arm: 'right' as Arm, idx: 0 }
    let mode: 'mouse' | 'touch' | 'idle' = 'idle'
    let lastTouch = 0
    let raf = 0
    let last = performance.now()
    let visible = true

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      draw()
      kick()
    }

    const setTarget = (nx: number, ny: number) => {
      const ax = Math.abs(nx)
      const ay = Math.abs(ny)
      const horizontalNow = target.arm === 'left' || target.arm === 'right'
      const vertical = horizontalNow ? ay > ax * 1.35 : ax <= ay * 1.35
      const mag = vertical ? ay : ax
      const eased = mag < 0.03 ? 0 : Math.pow(Math.min(1, mag * 1.12), 0.9)
      if (eased > 0) target.arm = vertical ? (ny < 0 ? 'up' : 'down') : nx < 0 ? 'left' : 'right'
      // The first step of each direction bridges two different source poses (or the
      // mirror). Never rest inside it, so a half-dissolve is never held on screen.
      const idx = eased * (ARMS[target.arm].length - 1)
      target.idx = idx < 0.5 ? 0 : Math.max(1, idx)
      tx.set(vertical ? nx * 0.8 : nx * 0.35)
      ty.set(vertical ? ny * 0.35 : ny * 0.8)
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
      const cy = r.top + r.height * EYE_Y
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const nx = dx / Math.max(80, dx > 0 ? window.innerWidth - cx : cx)
      const ny = dy / Math.max(80, dy > 0 ? window.innerHeight - cy : cy)
      setTarget(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)))
    }

    const onLeave = () => {
      mode = 'idle'
      setTarget(0, 0)
    }

    const draw = () => {
      const entries = ARMS[state.arm]
      const i0 = Math.max(0, Math.min(entries.length - 1, Math.floor(state.idx)))
      const i1 = Math.min(entries.length - 1, i0 + 1)
      const t = Math.max(0, Math.min(1, state.idx - i0))
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H)
      const dw = FRAME_W * scale
      const dh = FRAME_H * scale
      const ox = (cw - dw) / 2
      const oy = (ch - dh) * 0.1

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, cw, ch)
      const paint = (e: Entry, alpha: number, op: GlobalCompositeOperation) => {
        const img = frames.get(e.f)
        if (!img || alpha <= 0.001) return
        ctx.globalAlpha = alpha
        ctx.globalCompositeOperation = op
        if (e.m) {
          ctx.save()
          ctx.translate(cw, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(img, cw - ox - dw, oy, dw, dh)
          ctx.restore()
        } else {
          ctx.drawImage(img, ox, oy, dw, dh)
        }
      }
      // Premultiplied cross-dissolve: (1-t)·A + t·B, so silhouettes blend instead of stacking.
      paint(entries[i0], 1 - t, 'source-over')
      if (i1 !== i0) paint(entries[i1], t, 'lighter')
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const switching = target.arm !== state.arm
      const goal = switching ? -0.6 : target.idx
      const acc = OMEGA * OMEGA * (goal - state.idx) - 2 * OMEGA * state.vel
      state.vel = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, state.vel + acc * dt))
      state.idx += state.vel * dt

      if (switching && state.idx <= 0) {
        // Pass through the front-facing pose into the new direction, keeping momentum.
        state.arm = target.arm
        state.idx = -state.idx
        state.vel = Math.abs(state.vel) * 0.6
      }
      state.idx = Math.max(0, Math.min(ARMS[state.arm].length - 1, state.idx))

      const settled = !switching && Math.abs(goal - state.idx) < 0.01 && Math.abs(state.vel) < 0.02
      draw()
      if (!settled && visible) raf = requestAnimationFrame(step)
    }

    const kick = () => {
      if (raf || !visible) return
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    // No mouse to follow (touch devices, or the cursor left the window): glance around gently.
    const GLANCES: [number, number][] = [
      [0.45, 0.05],
      [0, 0],
      [-0.5, -0.05],
      [-0.1, -0.35],
      [0, 0],
      [0.25, 0.3],
      [0, 0],
    ]
    let g = 0
    const idle = window.setInterval(() => {
      if (mode === 'mouse') return
      if (mode === 'touch' && performance.now() - lastTouch < 3000) return
      const [nx, ny] = GLANCES[g++ % GLANCES.length]
      setTarget(nx, ny)
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
  }, [ready, frames, tx, ty])

  return (
    <div className={cn('relative h-full w-full [perspective:1200px]', className)}>
      <motion.div ref={wrapRef} className="relative h-full w-full" style={{ rotateX, rotateY, x, y, transformStyle: 'preserve-3d' }}>
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
