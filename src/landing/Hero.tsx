import { motion } from 'framer-motion'
import { ArrowRight, MousePointer2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FollowingFace } from './FollowingFace'

const ease = [0.16, 1, 0.3, 1] as const

const SPARKS = [
  { l: '58%', t: '16%', s: 3, d: 0 },
  { l: '92%', t: '30%', s: 2, d: 1.2 },
  { l: '50%', t: '64%', s: 2, d: 0.6 },
  { l: '96%', t: '58%', s: 3, d: 2 },
  { l: '72%', t: '8%', s: 2, d: 1.6 },
  { l: '46%', t: '32%', s: 2, d: 2.4 },
]

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(900px_600px_at_62%_35%,rgba(12,70,150,0.32),transparent_65%),radial-gradient(600px_400px_at_20%_80%,rgba(6,60,130,0.16),transparent_70%)]" />
      <div className="bg-grid absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_55%_40%,#000,transparent_70%)] opacity-60" />

      {/* Everything — copy, face and annotations — shares one centred container. */}
      <div className="relative mx-auto min-h-[100svh] max-w-6xl px-5 sm:px-8">
        <motion.div
          className="absolute inset-x-0 top-0 -z-10 h-[64svh] md:top-[7vh] md:right-[-2%] md:left-[42%] md:aspect-[680/740] md:h-auto lg:top-0 lg:right-[-4%] lg:bottom-0 lg:left-[44%] lg:aspect-auto lg:h-auto"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease }}
        >
          <div className="absolute top-[4%] left-1/2 h-[62%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(10,90,200,0.38),rgba(6,50,120,0.16)_55%,transparent)] blur-2xl" />
          <FollowingFace imgClassName="[mask-composite:intersect] [mask-image:radial-gradient(ellipse_78%_66%_at_50%_38%,#000_55%,transparent_100%),linear-gradient(#000_58%,transparent)] md:[mask-image:radial-gradient(ellipse_52%_68%_at_50%_40%,#000_60%,transparent_100%),linear-gradient(#000_68%,transparent_97%)]" />
        </motion.div>

        {SPARKS.map((p, i) => (
          <motion.span
            key={i}
            className="absolute -z-10 hidden rounded-full bg-brand-300 shadow-[0_0_10px_3px_rgba(58,166,255,0.6)] md:block"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: p.d }}
          />
        ))}

        <div className="relative flex min-h-[100svh] flex-col justify-end pt-[50svh] pb-16 md:justify-center md:pt-24 md:pb-24">
          <div className="max-w-xl">
            <motion.p
              className="font-display text-sm font-medium tracking-wide text-fg-soft"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            >
              Your Personal AI Assistant
            </motion.p>
            <motion.h1
              className="text-brand-gradient text-glow mt-3 -mb-[0.16em] pb-[0.16em] text-[3.4rem] leading-[0.95] font-bold tracking-[-0.04em] sm:text-7xl lg:text-[5.6rem]"
              initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.3, ease }}
            >
              Mr Balogun
            </motion.h1>
            <motion.p
              className="font-display mt-3 text-[1.7rem] font-light tracking-[-0.02em] text-white sm:text-[2.4rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease }}
            >
              Think. Ask. <span className="font-accent text-brand-100">Get It Done.</span>
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
            <motion.p
              className="mt-10 hidden items-center gap-3 text-xs text-muted pointer-fine:flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <span className="grid size-9 place-items-center rounded-full border border-brand-400/30 bg-brand-500/5">
                <MousePointer2 className="size-4 fill-white text-white" />
              </span>
              Move your cursor — watch me follow
            </motion.p>
          </div>
        </div>

        <motion.div
          className="absolute right-5 bottom-[16%] hidden text-right text-[0.7rem] leading-[1.9] tracking-[0.3em] text-subtle/80 sm:right-8 xl:block"
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
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
    </section>
  )
}
