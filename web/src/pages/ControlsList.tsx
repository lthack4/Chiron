import { Link } from 'react-router-dom'
import type { Control } from '../types'

export default function ControlsList({ controls }: { controls: Control[] }) {
  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {controls.map((c) => (
          <li key={c.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontWeight: 600, minWidth: 160 }}>{c.code}</span>
              <span style={{ flex: 1 }}>{c.title}</span>
              <StatusBadge status={c.status} />
              <Link to={`/controls/${encodeURIComponent(c.id)}`}>Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusBadge({ status }: { status: Control['status'] }) {
  const label = status ?? 'unanswered'
  const color = !status ? '#9e9e9e' : status === 'fully_implemented' ? '#2e7d32' : status === 'partially_implemented' ? '#f9a825' : '#c62828'
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, background: color, color: 'white', fontSize: 12 }}>
      {label}
    </span>
  )
}
