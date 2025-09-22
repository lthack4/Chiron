import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Control, Status } from './types'
import SidebarShell from './components/SidebarShell'
import ControlsList from './pages/ControlsList'
import ControlDetail from './pages/ControlDetail'
import Home from './pages/Home'
import Poams from './pages/Poams'
import Policies from './pages/Policies'
import Settings from './pages/Settings'
import SprScore from './pages/SprScore'
import Login from './pages/Login'
import AuthRoute, { logout } from './context/AuthRoute'


function sortControls(arr: Control[]): Control[] {
  const familyOrder = ['AC', 'AT', 'AU', 'CM', 'IA', 'IR', 'MA', 'MP', 'PS', 'PE', 'RA', 'CA', 'SC', 'SI']
  function familyIndex(f?: string) {
    const idx = f ? familyOrder.indexOf(f) : -1
    return idx === -1 ? 999 : idx
  }
  function parseParts(code: string) {
    const match = code.match(/(\d+)\.(\d+)\.(\d+)/)
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [999, 999, 999]
  }
  return [...arr].sort((a, b) => {
    const fa = familyIndex(a.family)
    const fb = familyIndex(b.family)
    if (fa !== fb) return fa - fb
    const [a1, a2, a3] = parseParts(a.code)
    const [b1, b2, b3] = parseParts(b.code)
    if (a1 !== b1) return a1 - b1
    if (a2 !== b2) return a2 - b2
    if (a3 !== b3) return a3 - b3
    return a.code.localeCompare(b.code)
  })
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith('/controls/')) return 'Control Detail'
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/controls': 'Controls',
    '/spr': 'SPR Score',
    '/poams': 'POAMs',
    '/policies': 'Policies',
    '/settings': 'Settings',
  }
  return titles[pathname] ?? 'Overview'
}

type FilterStatus = Status | 'unanswered' | null

export default function App() {
  const [searchParams] = useSearchParams()
  const [controls, setControls] = useState<Control[]>([])
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/data/cmmc-l2.controls.json')
      const data: Control[] = await res.json()
      setControls(sortControls(data))
    }
    load().catch(err => console.error('Failed to load local CMMC controls:', err))
  }, [])

  const statusFilter: FilterStatus = (searchParams.get('status') as FilterStatus) || null
  const filtered = useMemo(() => {
    if (!statusFilter) return controls
    if (statusFilter === 'unanswered') return controls.filter(c => !c.status)
    return controls.filter(c => c.status === statusFilter)
  }, [controls, statusFilter])

  useEffect(() => {
    setAccountMenuOpen(false)
  }, [location.pathname])

  const routes = (
    <Routes>
      <Route path="/" element={<AuthRoute><Home controls={controls} /></AuthRoute>} />
      <Route path="/controls" element={<AuthRoute><ControlsList controls={filtered} /></AuthRoute>} />
      <Route path="/controls/:id" element={<AuthRoute><ControlDetail allControls={controls} onUpdateLocal={setControls} /></AuthRoute>} />
      <Route path="/spr" element={<AuthRoute><SprScore controls={controls} /></AuthRoute>} />
      <Route path="/poams" element={<AuthRoute><Poams /></AuthRoute>} />
      <Route path="/policies" element={<AuthRoute><Policies /></AuthRoute>} />
      <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )

  const isLoginRoute = location.pathname === '/login'

  const shellActions = (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {location.pathname === '/controls' && (
        <StatusFilters
          selected={statusFilter}
          onSelect={(value) => navigate(value ? `/controls?status=${value}` : '/controls')}
        />
      )}
      {!isLoginRoute && (
        <button
          type="button"
          onClick={() => setAccountMenuOpen(true)}
          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', cursor: 'pointer' }}
        >
          Account
        </button>
      )}
    </div>
  )

  const accountMenu = accountMenuOpen && !isLoginRoute ? (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      onClick={() => setAccountMenuOpen(false)}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        style={{ position: 'absolute', top: 72, right: 24, width: 220, background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,0.15)', padding: 16, display: 'grid', gap: 8 }}
      >
        <strong>Account</strong>
        <Link to="/settings" onClick={() => setAccountMenuOpen(false)}>Settings</Link>
        <button
          type="button"
          onClick={() => {
            setAccountMenuOpen(false)
            logout()
          }}
          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </aside>
    </div>
  ) : null

  if (isLoginRoute) {
    return routes
  }

  return (
    <>
      <SidebarShell title={resolveTitle(location.pathname)} actions={shellActions}>
        {routes}
      </SidebarShell>
      {accountMenu}
    </>
  )
}

function StatusFilters({ selected, onSelect }: { selected: FilterStatus; onSelect: (value: FilterStatus) => void }) {
  const options: FilterStatus[] = [null, 'unanswered', 'not_implemented', 'partially_implemented', 'fully_implemented']
  return (
    <select
      value={selected ?? ''}
      onChange={(event) => onSelect((event.target.value || null) as FilterStatus)}
      style={{ padding: '6px 8px' }}
      aria-label="Filter controls by status"
    >
      {options.map(option => (
        <option key={option ?? 'all'} value={option ?? ''}>{option ?? 'all'}</option>
      ))}
    </select>
  )
}
