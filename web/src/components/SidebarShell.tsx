import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'

export default function SidebarShell({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="app--with-sidebar">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand__mark">C</div>
          <div className="brand__name">Chiron</div>
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
            <NavLink to="/spr" className={({isActive})=> isActive ? 'active' : ''}>SPR Score</NavLink>
            <NavLink to="/poams" className={({isActive})=> isActive ? 'active' : ''}>POAMs</NavLink>
            <NavLink to="/policies" className={({isActive})=> isActive ? 'active' : ''}>Policies</NavLink>
            <NavLink to="/audit" className={({isActive})=> isActive ? 'active' : ''}>Audit Hub</NavLink>
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
          <span style={{color:'var(--muted)', fontSize:'.9rem'}}>Administrator</span>
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
