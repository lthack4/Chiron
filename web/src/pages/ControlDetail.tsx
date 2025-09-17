import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Control } from '../types'

export default function ControlDetail({ controls }: { controls: Control[] }) {
  const { id: raw } = useParams()
  const id = useMemo(() => (raw ? decodeURIComponent(raw) : ''), [raw])
  const navigate = useNavigate()

  const control = useMemo(
    () => controls.find(c => c.id === id) ?? null,
    [controls, id]
  )

  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={() => navigate(-1)}>{'‹'} Back</button>
        <h1 style={{ marginLeft: 12 }}>{control ? control.code : 'Control'}</h1>
        <div style={{ marginLeft: 'auto' }}>
          {control && <StatusBadge status={control.status} />}
        </div>
      </div>

      <div className="card card--padded" style={{ display: 'grid', gap: '1rem' }}>
        {!control ? (
          <div>
            <p>We couldn’t find that control.</p>
            <p style={{ color: 'var(--muted)' }}>ID tried: <code>{id}</code></p>
          </div>
        ) : (
          <>
            <h2 style={{ margin: 0 }}>{control.title}</h2>
            <div style={{ color: 'var(--muted)' }}>
              <strong>Family:</strong> {control.family ?? '—'} •{' '}
              <strong>Code:</strong> {control.code}
            </div>

            <Section title="Description">
              <p>{control.description ?? '—'}</p>
            </Section>

            <Section title="Assessment Objectives">
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {(control.objectives ?? []).length
                  ? control.objectives!.map((o, i) => <li key={i}>{o}</li>)
                  : <li>—</li>}
              </ul>
            </Section>

            <Section title="Implementation Notes">
              <p>{control.implementation ?? '—'}</p>
            </Section>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--primary">Edit</button>
              <button className="btn">Add evidence</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
      <h3 style={{ margin: 0, marginBottom: '.25rem' }}>{title}</h3>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: Control['status'] }) {
  const label = !status
    ? 'unanswered'
    : status === 'fully_implemented'
    ? 'fully implemented'
    : status === 'partially_implemented'
    ? 'partially implemented'
    : status === 'not_implemented'
    ? 'not implemented'
    : 'unanswered'

  const cls = !status
    ? 'badge--muted'
    : status === 'fully_implemented'
    ? 'badge--ok'
    : status === 'partially_implemented'
    ? 'badge--warn'
    : status === 'not_implemented'
    ? 'badge--bad'
    : 'badge--muted'

  return <span className={`badge ${cls}`}>{label}</span>
}
