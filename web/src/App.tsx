import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { Control } from './types'

import SidebarShell from './components/SidebarShell'

import Home from './pages/Home'
import ControlsList from './pages/ControlsList'
import ControlDetail from './pages/ControlDetail'
import Poams from './pages/Poams'
import Policies from './pages/Policies'
import Settings from './pages/Settings'
import SprScore from './pages/SprScore'

function sortControls(list: Control[]) {
  return [...list].sort((a, b) => a.id.localeCompare(b.id))
}

export default function App() {
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/data/cmmc-l2.controls.json')
      const data: Control[] = await res.json()
      setControls(sortControls(data))
    }
    load()
  }, [])

  return (
    <SidebarShell>
      <Routes>
        <Route path="/" element={<Home controls={controls} />} />
        <Route path="/controls" element={<ControlsList controls={controls} />} />
        <Route path="/controls/:id" element={<ControlDetail controls={controls} />} />
        <Route path="/spr" element={<SprScore controls={controls} />} />
        <Route path="/poams" element={<Poams />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </SidebarShell>
  )
}
