import { motion } from 'framer-motion'
import { ArrowRight, Brain, Check, MessageSquareText, Rocket, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from '@/components/ui/BrandIcons'
import { toast } from '@/components/ui/Toast'
import { HUE } from '@/lib/hues'
import { cn } from '@/lib/utils'
import { Reveal } from './Decor'

/* ---------------- How it works ---------------- */

const STEPS = [
  { icon: MessageSquareText, title: 'Ask', text: 'Type or speak naturally — a question, a goal, a messy idea.', hue: HUE.blue },
  { icon: Brain, title: 'Mr Balogun thinks', text: 'He draws on your memory, tasks, calendar and files for context.', hue: HUE.violet },
  { icon: Rocket, title: 'Get it done', text: 'Plans, drafts, summaries and tasks — ready for you to act on.', hue: HUE.emerald },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 border-t border-line-soft">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="font-display text-sm font-medium tracking-wide text-brand-400">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            Three steps. <span className="font-accent text-brand-gradient">Zero friction.</span>
          </h2>
        </Reveal>
        <div className="relative mt-14 grid gap-5 md:grid-cols-3">
          <div className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-blue-500/0 via-violet-400/60 to-emerald-400/0 md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12}>
              <div className={cn('glass group relative h-full overflow-hidden rounded-2xl p-6 text-center transition-transform duration-500 hover:-translate-y-1', s.hue)}>
                <div className="pointer-events-none absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-[rgb(var(--hue)/0.14)] blur-2xl" />
                <div className="icon-box relative mx-auto size-14 rounded-2xl bg-ink-800">
                  <s.icon className="size-6" />
                </div>
                <p className="text-hue mt-5 text-xs font-medium tracking-[0.2em]">STEP {i + 1}</p>
                <p className="mt-1.5 text-lg font-semibold text-white">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Pricing ---------------- */

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    note: 'Everything you need to start',
    features: ['Unlimited chat with Mr Balogun', 'Tasks, calendar & files', 'Memory & personalization', 'Voice input (supported browsers)', '10 built-in AI tools'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Early access',
    note: 'For people who run on Mr Balogun',
    features: ['Advanced AI models', 'Live web research with sources', 'Unlimited memory', 'Natural voice conversations', 'Priority access to new tools'],
    cta: 'Join the waitlist',
    highlight: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden border-t border-line-soft">
      <div className="absolute top-1/2 left-[40%] -z-10 h-80 w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-[62%] -z-10 h-72 w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(233,190,112,0.08)] blur-3xl" />
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="font-display text-sm font-medium tracking-wide text-brand-400">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            Start free. <span className="font-accent text-gold-gradient">Grow into Pro.</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.12}>
              <div className={cn('relative flex h-full flex-col rounded-2xl p-7', p.highlight ? 'glass-strong edge-gold hue-gold isolate' : 'glass')}>
                {p.highlight && (
                  <>
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(120%_70%_at_100%_0%,rgba(233,190,112,0.16),transparent_60%)]" />
                    <span className="badge-hue absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-ink-800 px-2.5 py-1 text-[0.68rem]">
                      <Sparkles className="size-3" /> Coming soon
                    </span>
                  </>
                )}
                <p className="text-sm text-muted">{p.name}</p>
                <p className={cn('font-display mt-2 text-3xl font-semibold tracking-tight', p.highlight ? 'text-gold-gradient' : 'text-white')}>{p.price}</p>
                <p className="mt-1 text-sm text-subtle">{p.note}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-fg-soft">
                      <Check className={cn('mt-0.5 size-4 shrink-0', p.highlight ? 'text-hue' : 'text-brand-400')} />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.highlight ? (
                  <button onClick={() => toast("You're on the list — we'll let you know when Pro opens.")} className="btn-gold mt-7 w-full py-2.5 text-sm">
                    {p.cta}
                  </button>
                ) : (
                  <Link to="/app" className="btn-primary mt-7 w-full py-2.5 text-sm">
                    {p.cta} <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Final CTA ---------------- */

function ridge(seed: number, base: number, amp: number, step: number) {
  let s = seed
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  let d = `M0 400 L0 ${base}`
  for (let x = 0; x <= 1440; x += step) {
    const peak = Math.sin(x / 210 + seed) * amp * 0.6 + (rand() - 0.5) * amp
    d += ` L${x} ${base - Math.abs(peak)}`
  }
  return `${d} L1440 400 Z`
}

const RANGES = [
  { d: ridge(3, 210, 150, 36), fill: 'url(#m-far)' },
  { d: ridge(7, 270, 120, 30), fill: 'url(#m-mid)' },
  { d: ridge(11, 330, 90, 24), fill: 'url(#m-near)' },
]

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line-soft">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,#24384f_0%,#101c2b_45%,var(--color-ink-900)_100%)]" />
      <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 -z-10 h-[78%] w-full" aria-hidden>
        <defs>
          <linearGradient id="m-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4e66" />
            <stop offset="1" stopColor="#152234" />
          </linearGradient>
          <linearGradient id="m-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22344a" />
            <stop offset="1" stopColor="#0b1522" />
          </linearGradient>
          <linearGradient id="m-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#121f30" />
            <stop offset="1" stopColor="#03080f" />
          </linearGradient>
          <linearGradient id="m-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7ba3cc" stopOpacity="0" />
            <stop offset="0.6" stopColor="#7ba3cc" stopOpacity="0.12" />
            <stop offset="1" stopColor="#7ba3cc" stopOpacity="0" />
          </linearGradient>
        </defs>
        {RANGES.map((r, i) => (
          <motion.path
            key={i}
            d={r.d}
            fill={r.fill}
            initial={{ y: 30 + i * 15, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        <rect x="0" y="180" width="1440" height="140" fill="url(#m-mist)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
      <div className="bg-aurora absolute top-[8%] left-1/2 -z-10 h-[70%] w-[min(60rem,100%)] -translate-x-1/2 blur-2xl" />

      <Reveal className="mx-auto max-w-2xl px-5 py-28 text-center sm:py-36">
        <h2 className="text-3xl font-light tracking-[-0.02em] text-brand-100 sm:text-5xl">
          Ready to <span className="font-accent text-brand-gradient">Experience</span>
          <br />
          <span className="font-semibold text-white">Mr Balogun?</span>
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-fg-soft/80">
          Your personal AI assistant is just a click away.
          <br />
          Get started today and see what's possible.
        </p>
        <Link to="/app" className="btn-primary group mt-8 px-7 py-3 text-[0.95rem]">
          Get Started <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  )
}

/* ---------------- Footer ---------------- */

const FOOT_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
]

const SOCIALS = [
  { icon: XIcon, label: 'X' },
  { icon: InstagramIcon, label: 'Instagram' },
  { icon: YouTubeIcon, label: 'YouTube' },
  { icon: LinkedInIcon, label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer id="about" className="scroll-mt-20 border-t border-line-soft bg-ink-950/60">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-2 text-sm text-muted">Think. Ask. Get It Done.</p>
            <p className="mt-4 text-xs leading-relaxed text-subtle">
              Mr Balogun is a personal AI assistant built to help you think clearer, work smarter and handle what matters — in one place.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOT_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-fg-soft transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <span key={label} aria-label={label} title={`${label} — coming soon`} className="grid size-9 place-items-center rounded-xl border border-line text-fg-soft transition-colors hover:border-line-strong hover:text-brand-300">
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line-soft pt-6 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Mr Balogun. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
