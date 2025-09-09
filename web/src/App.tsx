import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Control, Status } from './types'
import ControlsList from './pages/ControlsList'
import ControlDetail from './pages/ControlDetail'
import Home from './pages/Home'
import Poams from './pages/Poams'
import Policies from './pages/Policies'
import Settings from './pages/Settings'
import SprScore from './pages/SprScore'

function App() {
  const [searchParams] = useSearchParams()
  const [controls, setControls] = useState<Control[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Lazy load sample controls; Firestore to be wired later
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/data/cmmc-l2.controls.json')
      const data: Control[] = await res.json()
      setControls(sortControls(data))
    }
    load().catch((e) => console.error('Failed to load local CMMC controls:', e))
  }, [])

  // Removed placeholder filler; we rely on curated local dataset.

  function sortControls(arr: Control[]): Control[] {
    const familyOrder = ['AC','AT','AU','CM','IA','IR','MA','MP','PS','PE','RA','CA','SC','SI']
    function familyIndex(f?: string) {
      const idx = f ? familyOrder.indexOf(f) : -1
      return idx === -1 ? 999 : idx
    }
    function parseParts(code: string) {
      // Expect like AC.L2-3.1.1 or fallback L2-001
      const m = code.match(/(\d+)\.(\d+)\.(\d+)/)
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [999, 999, 999]
    }
    return [...arr].sort((a, b) => {
      const fa = familyIndex(a.family)
      const fb = familyIndex(b.family)
      if (fa !== fb) return fa - fb
      const [a1,a2,a3] = parseParts(a.code)
      const [b1,b2,b3] = parseParts(b.code)
      if (a1 !== b1) return a1 - b1
      if (a2 !== b2) return a2 - b2
      if (a3 !== b3) return a3 - b3
      return a.code.localeCompare(b.code)
    })
  }

  // Removed runtime fetch of OSCAL; we’ll use curated data aligned to the CMMC 2024 guide.

  type FilterStatus = Status | 'unanswered' | null
  const statusFilter = (searchParams.get('status') as FilterStatus) || null
  const filtered = useMemo(() => {
    if (!statusFilter) return controls
    if (statusFilter === 'unanswered') return controls.filter(c => !c.status)
    return controls.filter(c => c.status === statusFilter)
  }, [controls, statusFilter])

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <button aria-label="menu" onClick={() => setMenuOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>
          ☰
        </button>
        <h1 style={{ margin: 0 }}>Chiron</h1>
        {location.pathname === '/controls' && (
          <div style={{ marginLeft: 'auto' }}>
            <StatusFilters onSelect={(s) => navigate(s ? `/controls?status=${s}` : '/controls') } selected={statusFilter} />
          </div>
        )}
      </header>

      {/* Side menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMenuOpen(false)}>
          <aside onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, width: 260, height: '100%', background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.15)', padding: 12, display: 'grid', gap: 6 }}>
            <strong style={{ marginBottom: 4 }}>Menu</strong>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/controls" onClick={() => setMenuOpen(false)}>Controls</Link>
            <Link to="/spr" onClick={() => setMenuOpen(false)}>SPR Score</Link>
            <Link to="/poams" onClick={() => setMenuOpen(false)}>POAMs</Link>
            <Link to="/policies" onClick={() => setMenuOpen(false)}>Policies</Link>
            <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
          </aside>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home controls={controls} />} />
        <Route path="/controls" element={<ControlsList controls={filtered} />} />
        <Route path="/controls/:id" element={<ControlDetail allControls={controls} onUpdateLocal={setControls} />} />
        <Route path="/spr" element={<SprScore controls={controls} />} />
        <Route path="/poams" element={<Poams />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

function StatusFilters({ selected, onSelect }: { selected: (Status | 'unanswered' | null), onSelect: (s: Status | 'unanswered' | null) => void }) {
  const opts: (Status | 'unanswered' | null)[] = [null, 'unanswered', 'not_implemented', 'partially_implemented', 'fully_implemented']
  return (
    <select value={selected ?? ''} onChange={(e) => onSelect((e.target.value || null) as any)}>
      {opts.map(o => (
        <option key={o ?? 'all'} value={o ?? ''}>{o ?? 'all'}</option>
      ))}
    </select>
  )
}

export default App
