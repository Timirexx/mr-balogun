import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './AppLayout'
import { NAV } from './nav'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Files from './pages/Files'
import Home from './pages/Home'
import Memory from './pages/Memory'
import Projects from './pages/Projects'
import Research from './pages/Research'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import ToolRunner from './pages/ToolRunner'
import Tools from './pages/Tools'

function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const item = [...NAV].reverse().find((n) => pathname.startsWith(n.to))
    document.title = `${item?.label ?? 'Dashboard'} · Catt`
  }, [pathname])
}

export default function AppRoutes() {
  useDocumentTitle()
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:id" element={<Chat />} />
        <Route path="memory" element={<Memory />} />
        <Route path="projects" element={<Projects />} />
        <Route path="files" element={<Files />} />
        <Route path="skills" element={<Tools />} />
        <Route path="skills/:toolId" element={<ToolRunner />} />
        <Route path="research" element={<Research />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
        {/* previous paths */}
        <Route path="tools" element={<Navigate to="/app/skills" replace />} />
        <Route path="tools/:toolId" element={<LegacyToolRedirect />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  )
}

function LegacyToolRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={pathname.replace('/app/tools', '/app/skills')} replace />
}
