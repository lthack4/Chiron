import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'
import { useBusinessContext } from '../context/BusinessContext'

export default function SidebarShell({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { selectedBusiness, membershipForSelected, isPlatformAdmin, canManageSelected } = useBusinessContext()

  const roleLabel = membershipForSelected
    ? normalizeRole(membershipForSelected.role)
    : isPlatformAdmin
    ? 'Admin'
    : 'Guest'
  const capabilityLabel = canManageSelected ? 'Can edit' : 'Read only'

  return (
    <div className="app--with-sidebar">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src="/ChironLogo-removebg.png" alt="Chiron logo" className="brand__logo" />
          <div className="brand__name">Chiron</div>
          {selectedBusiness && (
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>
              {selectedBusiness.name}
            </div>
          )}
        </div>

        <div className="nav-group">
          <div className="nav-label">Quick Start</div>
          <nav className="sidenav">
            <NavLink to="/" className={({isActive})=> isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/tasks" className={({isActive})=> isActive ? 'active' : ''}>Tasks</NavLink>
          </nav>
        </div>

        <div className="nav-group">
          <div className="nav-label">Compliance</div>
          <nav className="sidenav">
            <NavLink to="/controls" className={({isActive})=> isActive ? 'active' : ''}>Controls</NavLink>
            <NavLink to="/spr" className={({isActive})=> isActive ? 'active' : ''}>SPRS Score</NavLink>
            <NavLink to="/poams" className={({isActive})=> isActive ? 'active' : ''}>POAMs</NavLink>
            <NavLink to="/policies" className={({isActive})=> isActive ? 'active' : ''}>Policies</NavLink>
            <NavLink to="/evidence" className={({isActive})=> isActive ? 'active' : ''}>Evidence Library</NavLink>
          </nav>
        </div>

        <div className="nav-group">
          <div className="nav-label">Additional</div>
          <nav className="sidenav">
            <NavLink to="/support" className={({isActive})=> isActive ? 'active' : ''}>Support</NavLink>
            <NavLink to="/settings" className={({isActive})=> isActive ? 'active' : ''}>Settings</NavLink>
          </nav>
        </div>
      </aside>

      {/* Top bar */}
      <header className="topbar">
        <h2 style={{margin:0}}>{title ?? 'Overview'}</h2>
        <div className="topbar__right">
          {actions}
          <span style={{color:'var(--muted)', fontSize:'.85rem', display: 'grid', justifyItems: 'end', lineHeight: 1.2}}>
            <span>{roleLabel}</span>
            <span style={{ fontSize: '.75rem' }}>{capabilityLabel}</span>
          </span>
          <div className="avatar" />
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {children}
      </main>
    </div>
  )
}

function normalizeRole(role: string) {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  if (role === 'editor') return 'Editor'
  if (role === 'viewer') return 'Viewer'
  return role
}
