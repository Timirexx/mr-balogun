import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, MousePointer2 } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

const ease = [0.16, 1, 0.3, 1] as const

const SPARKS = [
  { l: '62%', t: '18%', s: 3, d: 0 },
  { l: '88%', t: '30%', s: 2, d: 1.2 },
  { l: '54%', t: '64%', s: 2, d: 0.6 },
  { l: '93%', t: '58%', s: 3, d: 2 },
  { l: '70%', t: '8%', s: 2, d: 1.6 },
  { l: '47%', t: '30%', s: 2, d: 2.4 },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 70, damping: 18, mass: 0.6 })
  const rotateY = useTransform(sx, [-1, 1], [-10, 10])
  const rotateX = useTransform(sy, [-1, 1], [7, -7])
  const x = useTransform(sx, [-1, 1], [-18, 18])
  const y = useTransform(sy, [-1, 1], [-12, 12])
  const gx = useTransform(sx, [-1, 1], [30, 70])
  const gy = useTransform(sy, [-1, 1], [22, 62])
  const glow = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(80,170,255,0.28), transparent 42%)`

  const cx = useMotionValue(-200)
  const cy = useMotionValue(-200)
  const ringX = useSpring(cx, { stiffness: 300, damping: 30 })
  const ringY = useSpring(cy, { stiffness: 300, damping: 30 })

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const faceX = r.left + r.width * 0.62
    const faceY = r.top + r.height * 0.4
    mx.set(Math.max(-1, Math.min(1, (e.clientX - faceX) / (r.width * 0.45))))
    my.set(Math.max(-1, Math.min(1, (e.clientY - faceY) / (r.height * 0.5))))
    cx.set(e.clientX - r.left)
    cy.set(e.clientY - r.top)
  }

  const onLeave = () => {
    mx.set(0)
    my.set(0)
    cx.set(-200)
    cy.set(-200)
  }

  return (
    <section
      id="home"
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(900px_600px_at_65%_35%,rgba(12,70,150,0.35),transparent_65%),radial-gradient(600px_400px_at_10%_80%,rgba(6,60,130,0.18),transparent_70%)]" />
      <div className="bg-grid absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_60%_40%,#000,transparent_70%)] opacity-60" />

      {/* Face */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[64svh] [perspective:1200px] md:inset-y-0 md:right-[-4%] md:left-auto md:h-full md:w-[62%] lg:right-[2%] lg:w-[56%]">
        <motion.div
          className="relative h-full w-full"
          style={{ rotateX, rotateY, x, y, transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease }}
        >
          <img
            src="/avatar/hero.webp"
            alt="Mr Balogun — robotic AI assistant"
            className="h-full w-full object-cover object-[36%_10%] md:object-[50%_10%] [mask-composite:intersect] [mask-image:radial-gradient(ellipse_75%_62%_at_50%_38%,#000_50%,transparent_100%),linear-gradient(#000_60%,transparent)] md:[mask-image:radial-gradient(ellipse_50%_66%_at_50%_40%,#000_58%,transparent_100%),linear-gradient(#000_70%,transparent_98%)]"
            draggable={false}
            fetchPriority="high"
          />
          <motion.div className="pointer-events-none absolute inset-0 mix-blend-screen [mask-image:radial-gradient(ellipse_55%_60%_at_50%_42%,#000_40%,transparent_90%)]" style={{ background: glow }} />
        </motion.div>
      </div>

      {SPARKS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -z-10 hidden rounded-full bg-brand-300 shadow-[0_0_10px_3px_rgba(58,166,255,0.6)] md:block"
          style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: p.d }}
        />
      ))}

      {/* Cursor follower */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 hidden size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-400/40 bg-brand-500/5 shadow-[0_0_30px_rgba(6,140,252,0.35)] md:block"
        style={{ x: ringX, y: ringY }}
      />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pt-[50svh] pb-16 sm:px-8 md:justify-center md:pt-24 md:pb-24">
        <div className="max-w-xl">
          <motion.p
            className="text-sm font-medium tracking-wide text-fg-soft"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            Your Personal AI Assistant
          </motion.p>
          <motion.h1
            className="text-brand-gradient text-glow mt-3 text-[3.4rem] leading-[0.95] font-bold tracking-[-0.04em] sm:text-7xl lg:text-[5.6rem]"
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.3, ease }}
          >
            Mr Balogun
          </motion.h1>
          <motion.p
            className="mt-3 text-[1.7rem] font-light tracking-[-0.02em] text-white sm:text-[2.4rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
          >
            Think. Ask. Get It Done.
          </motion.p>
          <motion.p
            className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
          >
            More than just a chatbot — Mr Balogun is your personal AI assistant, built to help you think clearer, work smarter, and handle what
            matters.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease }}
          >
            <Link to="/app" className="btn-primary group px-6 py-3 text-[0.95rem]">
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#features" className="text-sm text-fg-soft transition-colors hover:text-white">
              See what it can do
            </a>
          </motion.div>
          <motion.div
            className="mt-9 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <div className="flex -space-x-2.5">
              {['AB', 'TK', 'JM', 'SO'].map((n, i) => (
                <span
                  key={n}
                  className="grid size-8 place-items-center rounded-full border-2 border-ink-900 text-[0.62rem] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, hsl(${205 + i * 8} 90% ${48 - i * 5}%), hsl(${220 + i * 6} 80% ${22 + i * 3}%))` }}
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs leading-tight text-muted">
              Trusted by people
              <br />
              who think ahead
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right-side annotations */}
      <motion.div
        className="absolute top-[18%] right-[6%] hidden items-start gap-3 lg:flex"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.1, ease }}
      >
        <span className="relative grid size-16 place-items-center rounded-full border border-brand-400/30 bg-brand-500/5">
          <span className="animate-pulse-ring absolute inset-0 rounded-full border border-brand-400/40" />
          <MousePointer2 className="size-5 fill-white text-white" />
        </span>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Move your cursor
          <br />
          and watch me
          <br />
          follow
        </p>
      </motion.div>
      <motion.div
        className="absolute right-[5%] bottom-[16%] hidden text-right text-[0.7rem] leading-[1.9] tracking-[0.3em] text-subtle/80 lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.3 }}
      >
        SMARTER
        <br />
        FASTER
        <br />
        ALWAYS
        <br />
        WITH YOU
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
    </section>
  )
}
