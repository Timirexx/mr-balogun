import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LogoMark } from './components/brand/Logo'
import { Toaster } from './components/ui/Toast'
import LandingPage from './landing/LandingPage'
import { useSettings } from './lib/store/settings'

const AppRoutes = lazy(() => import('./app/AppRoutes'))

function ThemeController() {
  const theme = useSettings((s) => s.theme)
  const glow = useSettings((s) => s.glow)
  const reduceMotion = useSettings((s) => s.reduceMotion)

  useEffect(() => {
    const apply = () => {
      const h = new Date().getHours()
      const resolved = theme === 'auto' ? (h >= 20 || h < 6 ? 'midnight' : 'dark') : theme
      document.documentElement.dataset.theme = resolved
    }
    apply()
    if (theme !== 'auto') return
    const id = setInterval(apply, 60_000)
    return () => clearInterval(id)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.glow = glow
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full'
  }, [glow, reduceMotion])

  return null
}

function BootScreen() {
  return (
    <div className="grid min-h-svh place-items-center bg-ink-900">
      <LogoMark className="size-12 animate-pulse text-[40px]" />
    </div>
  )
}

export default function App() {
  const reduceMotion = useSettings((s) => s.reduceMotion)
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <ThemeController />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app/*"
          element={
            <Suspense fallback={<BootScreen />}>
              <AppRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </MotionConfig>
  )
}
