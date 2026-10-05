import { Briefcase, Moon, MoonStar, Palette, Smile, SunMoon, Zap, AlignLeft, AlignJustify, ScrollText } from 'lucide-react'
import { useState } from 'react'
import { OptionCards, Tabs } from '@/components/ui/Controls'
import { toast } from '@/components/ui/Toast'
import { useSettings } from '@/lib/store/settings'
import type { Personality, ResponseStyle, ThemeName } from '@/lib/types'

export function PersonalizationDemo() {
  const settings = useSettings()
  const [tab, setTab] = useState<'appearance' | 'personality'>('appearance')
  const [theme, setTheme] = useState<ThemeName>(settings.theme)
  const [tone, setTone] = useState<Personality>(settings.personality)
  const [style, setStyle] = useState<ResponseStyle>(settings.responseStyle)

  const save = () => {
    settings.update({ theme, personality: tone, responseStyle: style })
    toast(`Saved — Mr Balogun will be ${tone} and ${style}.`)
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[rgb(var(--hue)/0.12)] blur-3xl" />
      <div className="glass-strong edge-glow rounded-2xl p-5">
        <p className="text-sm font-medium text-white">Customize Your AI</p>
        <Tabs
          className="mt-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'appearance', label: 'Appearance' },
            { value: 'personality', label: 'Personality' },
          ]}
        />

        {tab === 'appearance' ? (
          <>
            <p className="mt-5 mb-2.5 text-xs text-muted">Theme</p>
            <OptionCards
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
                { value: 'midnight', label: 'Midnight', icon: <MoonStar className="size-4" /> },
                { value: 'auto', label: 'Auto', icon: <SunMoon className="size-4" /> },
              ]}
            />
            <p className="mt-5 mb-2.5 text-xs text-muted">AI Tone</p>
            <OptionCards
              value={tone}
              onChange={setTone}
              options={[
                { value: 'professional', label: 'Professional', icon: <Briefcase className="size-4" /> },
                { value: 'friendly', label: 'Friendly', icon: <Smile className="size-4" /> },
                { value: 'creative', label: 'Creative', icon: <Palette className="size-4" /> },
              ]}
            />
          </>
        ) : (
          <>
            <p className="mt-5 mb-2.5 text-xs text-muted">Response style</p>
            <OptionCards
              value={style}
              onChange={setStyle}
              options={[
                { value: 'concise', label: 'Concise', icon: <AlignLeft className="size-4" /> },
                { value: 'balanced', label: 'Balanced', icon: <AlignJustify className="size-4" /> },
                { value: 'detailed', label: 'Detailed', icon: <ScrollText className="size-4" /> },
              ]}
            />
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-ink-800/60 p-3">
              <Zap className="text-hue size-4 shrink-0" />
              <p className="text-xs leading-relaxed text-muted">These settings carry straight into the app — try saving, then open Chat.</p>
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={save} className="btn-primary px-5 py-2 text-xs">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
