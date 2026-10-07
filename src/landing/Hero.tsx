import { motion } from 'framer-motion'
import { ArrowUpRight, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const ease = [0.16, 1, 0.3, 1] as const
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
})

export function Hero() {
  return (
    <section id="home" className="wrap relative grid items-center gap-8 pt-14 md:min-h-[700px] md:grid-cols-[42%_58%] md:gap-0 md:pt-0">
      <div className="relative z-10 max-md:text-center md:pt-5">
        <motion.p {...rise(0.15)} className="eyebrow">
          YOUR AI ASSISTANT
        </motion.p>
        <motion.h1 {...rise(0.25)} className="font-display mt-0 mb-[22px] text-[54px] leading-none tracking-[-0.055em] sm:text-[64px]">
          Hey, I&apos;m <span className="text-brand-500">Catt.</span>
        </motion.h1>
        <motion.p {...rise(0.35)} className="mb-7 max-w-[330px] text-base leading-[1.5] text-[#aaa] max-md:mx-auto">
          Your personal AI assistant, always ready to chat, help, and get things done.
        </motion.p>
        <motion.div {...rise(0.45)}>
          <Link to="/app" className="btn-primary group py-1.5 pr-[21px] pl-[7px] text-sm">
            <span className="grid size-[34px] place-items-center rounded-full bg-[#ff7b1e]">
              <ArrowUpRight className="size-[17px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            Get in
          </Link>
        </motion.div>
        <motion.div {...rise(0.6)} className="mt-12 flex items-center gap-3 text-[11px] leading-[1.35] text-[#85817e] max-md:justify-center md:mt-[86px]">
          <div className="flex">
            {['◒', '◓', '◑', '◐'].map((g, i) => (
              <span
                key={g}
                className="grid size-[30px] place-items-center rounded-full border-2 border-[#5d5a57] bg-[#1c1b1a] text-[17px] text-[#f47d22]"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              >
                {g}
              </span>
            ))}
          </div>
          <span>
            Trusted by thousands
            <br />
            of users worldwide
          </span>
        </motion.div>
      </div>

      <motion.div
        className="relative flex h-[400px] items-end justify-center md:h-[670px]"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        {/* warm pool of light the cat stands in */}
        <div className="pointer-events-none absolute bottom-[6%] h-[150px] w-[420px] max-w-full bg-[radial-gradient(ellipse,rgba(247,103,11,0.38),transparent_65%)] blur-[14px] md:w-[560px]" />
        <img
          src="/avatar/hero.webp"
          alt="Catt, a friendly black cat AI assistant"
          className="relative z-10 -mb-[10px] w-[300px] max-w-none [filter:saturate(1.12)_contrast(1.08)_brightness(0.96)] [mask-image:linear-gradient(#000_80%,transparent)] md:-mb-[35px] md:w-[440px]"
          draggable={false}
          fetchPriority="high"
        />

        <motion.div
          className="absolute top-[48%] right-0 z-20 flex items-center gap-3 rounded-[18px] border border-line bg-[rgba(20,18,17,0.72)] py-3.5 pr-[22px] pl-[13px] backdrop-blur-[10px] max-md:scale-[0.85] md:top-[45%]"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease }}
        >
          <span className="grid size-[34px] place-items-center rounded-full bg-[#3c1b09] text-brand-500">
            <Volume2 className="size-[18px]" />
          </span>
          <span>
            <strong className="block text-xs font-semibold">Hey Catt...</strong>
            <small className="mt-[5px] block text-xs text-[#8d8985]">I&apos;m listening</small>
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
