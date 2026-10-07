import { motion } from 'framer-motion'
import { Brain, ChevronRight, Command, Mic, Sparkles, SquareTerminal, Zap, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'
import { Reveal } from './Decor'

const FEATURES: { title: string; description: string; icon: LucideIcon }[] = [
  { title: 'Voice chat', description: 'Just speak, and I’ll respond instantly.', icon: Mic },
  { title: 'Always on', description: 'Ready whenever you need me.', icon: Zap },
  { title: 'Smart & helpful', description: 'Get answers, ideas, & solutions.', icon: Brain },
  { title: 'Works everywhere', description: 'On your laptop, any time, anywhere.', icon: SquareTerminal },
  { title: 'Custom settings', description: 'Make it yours. Your way.', icon: Command },
]

export function Features() {
  return (
    <section id="features" className="wrap grid scroll-mt-24 gap-8 border-t border-white/10 pt-14 pb-16 md:grid-cols-[37%_63%] md:gap-[30px] md:pt-[66px] md:pb-[90px]">
      <Reveal>
        <p className="eyebrow">FEATURES</p>
        <h2 className="font-display mt-0 mb-[18px] text-[27px] leading-[1.2] tracking-[-0.045em] sm:text-[31px]">
          More than just a chatbot.
          <br />
          <span className="text-brand-500">It’s your AI companion.</span>
        </h2>
        <p className="max-w-[330px] text-sm leading-[1.6] text-[#96918d]">
          From quick answers to deep conversations, Catt is here to make your life easier, smarter and more productive.
        </p>
        <div className="mt-[38px] flex h-[115px] w-[280px] max-w-full flex-col gap-[22px] rounded-[18px] border border-brand-500/35 bg-[linear-gradient(130deg,rgba(77,29,6,0.6),rgba(15,14,13,0.5))] p-[18px] text-brand-500">
          <Sparkles className="size-5" />
          <span className="text-xs text-[#c6aaa0]">
            <i className="mr-[7px] inline-block size-[7px] rounded-full bg-brand-500 not-italic" />
            Ready when you are
          </span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 md:grid-cols-6">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative min-h-[170px] rounded-2xl border border-line bg-[linear-gradient(145deg,rgba(31,30,29,0.76),rgba(12,12,12,0.7))] p-[17px]',
              'transition duration-200 hover:-translate-y-[3px] hover:border-brand-500/55',
              i < 3 ? 'md:col-span-2' : 'md:col-span-3',
            )}
          >
            <span className="grid size-[35px] place-items-center rounded-full bg-[#3a1b09] text-brand-500 shadow-[0_0_15px_rgba(244,119,33,0.2)]">
              <f.icon className="size-[18px]" />
            </span>
            <h3 className="font-display mt-[18px] mb-[7px] text-sm">{f.title}</h3>
            <p className="m-0 max-w-[140px] text-[11px] leading-[1.35] text-[#8c8884]">{f.description}</p>
            <span className="absolute bottom-[15px] left-[17px] grid size-[25px] place-items-center rounded-full bg-[#4b220a] text-brand-500">
              <ChevronRight className="size-3.5" />
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export function About() {
  return (
    <section id="about" className="wrap grid scroll-mt-24 gap-10 border-t border-white/10 py-16 md:grid-cols-2 md:py-[100px]">
      <Reveal>
        <p className="eyebrow">BUILT FOR MOMENTS THAT MATTER</p>
        <h2 className="font-display m-0 text-[38px] leading-[1.2] tracking-[-0.045em] md:text-[46px]">
          Less searching.
          <br />
          <span className="text-brand-500">More doing.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.12} className="self-end">
        <p className="max-w-[390px] text-sm leading-[1.6] text-[#96918d]">
          Catt brings conversation, voice, and useful actions into one calm place. Ask a question, give a command, or simply think out loud — your
          assistant is already there.
        </p>
      </Reveal>
    </section>
  )
}

export function Footer() {
  return (
    <footer id="contact" className="wrap flex scroll-mt-24 flex-col items-start gap-4 border-t border-white/10 pt-[25px] pb-8 text-[11px] text-[#77716c] sm:flex-row sm:items-center sm:justify-between">
      <Logo />
      <span>© {new Date().getFullYear()} Catt AI. Made for moving forward.</span>
      <a href="#home" className="text-[#aaa] no-underline hover:text-white">
        Back to top ↑
      </a>
    </footer>
  )
}
