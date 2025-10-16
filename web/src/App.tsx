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
import ResetPassword from './pages/ResetPassword' 
import AuthRoute, { getCurrentUserID, logout } from './context/AuthRoute'
import { useBusinessContext } from './context/BusinessContext'
import BusinessSelector from './components/BusinessSelector'


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
  const {
    loading,
    error,
    currentUserId,
    isPlatformAdmin,
    memberBusinesses,
    discoverableBusinesses,
    controls,
    selectedBusiness,
    selectBusiness,
    clearSelectedBusiness,
    updateControl,
    canCreateBusiness,
    canManageSelected,
    pendingInvites,
  } = useBusinessContext()

  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [showBusinessPicker, setShowBusinessPicker] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const sortedControls = useMemo(() => sortControls(controls), [controls])

  const handleControlUpdate = (control: Control) => {
    const userId = getCurrentUserID() ?? currentUserId ?? 'local-user'
    const timestamp = new Date().toISOString()
    updateControl({ ...control, updatedBy: userId, updatedAt: timestamp }, { updatedBy: userId, updatedAt: timestamp })
  }

  const statusFilter: FilterStatus = (searchParams.get('status') as FilterStatus) || null
  const filtered = useMemo(() => {
    if (!statusFilter) return sortedControls
    if (statusFilter === 'unanswered') return sortedControls.filter(c => !c.status)
    return sortedControls.filter(c => c.status === statusFilter)
  }, [sortedControls, statusFilter])


  useEffect(() => {
    setAccountMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/login') {
      setShowBusinessPicker(false)
      return
    }

    if (!loading && !selectedBusiness) {
      setShowBusinessPicker(true)
    }
  }, [loading, location.pathname, selectedBusiness])

  const routes = (
    <Routes>
      <Route path="/" element={<AuthRoute><Home controls={sortedControls} /></AuthRoute>} />
      <Route path="/controls" element={<AuthRoute><ControlsList controls={filtered} /></AuthRoute>} />
      <Route
        path="/controls/:id"
        element={(
          <AuthRoute>
            <ControlDetail
              allControls={sortedControls}
              onUpdateControl={handleControlUpdate}
              readOnly={!canManageSelected}
            />
          </AuthRoute>
        )}
      />
      <Route path="/spr" element={<AuthRoute><SprScore controls={sortedControls} /></AuthRoute>} />
      <Route path="/poams" element={<AuthRoute><Poams /></AuthRoute>} />
      <Route path="/policies" element={<AuthRoute><Policies /></AuthRoute>} />
      <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      {!isLoginRoute && selectedBusiness && (
        <button
          type="button"
          onClick={() => setShowBusinessPicker(true)}
          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', cursor: 'pointer' }}
        >
          {selectedBusiness.name}
        </button>
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

            clearSelectedBusiness()
            setAccountMenuOpen(false)
            setShowBusinessPicker(true)
          }}
          disabled={!selectedBusiness}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '6px 12px',
            cursor: selectedBusiness ? 'pointer' : 'not-allowed',
            opacity: selectedBusiness ? 1 : 0.6,
          }}
        >
          Switch company
        </button>
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
      <BusinessSelector
        open={showBusinessPicker}
        memberBusinesses={memberBusinesses}
        discoverableBusinesses={discoverableBusinesses}
        loading={loading}
        error={error}
        selectedId={selectedBusiness?.id ?? null}
        isPlatformAdmin={isPlatformAdmin}
        canCreateBusiness={canCreateBusiness}
        pendingInvites={pendingInvites}
        currentUserId={currentUserId}
        onSelect={(businessId) => {
          selectBusiness(businessId)
          setShowBusinessPicker(false)
        }}
        onClose={() => {
          if (!selectedBusiness) return
          setShowBusinessPicker(false)
        }}
      />

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
