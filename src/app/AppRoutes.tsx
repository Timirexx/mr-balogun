import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './AppLayout'
import { NAV } from './nav'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Files from './pages/Files'
import Home from './pages/Home'
import Memory from './pages/Memory'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import ToolRunner from './pages/ToolRunner'
import Tools from './pages/Tools'

function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const item = [...NAV].reverse().find((n) => pathname.startsWith(n.to))
    document.title = `${item?.label ?? 'Home'} · CATT`
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
        <Route path="tasks" element={<Tasks />} />
        <Route path="files" element={<Files />} />
        <Route path="memory" element={<Memory />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/:toolId" element={<ToolRunner />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  )
}
