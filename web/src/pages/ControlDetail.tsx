import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Control, Objective, Status } from '../types'
import { controlContribution, controlWeight } from '../scoring'

export default function ControlDetail({ allControls, onUpdateLocal }: { allControls: Control[], onUpdateLocal: (c: Control[]) => void }) {
  const { id } = useParams()
  const control = useMemo(() => allControls.find(c => c.id === id), [allControls, id])
  const [local, setLocal] = useState<Control | null>(control ?? null)

  if (!local) return (
    <div>
      <p>Control not found.</p>
      <Link to="/">Back</Link>
    </div>
  )

  function setStatus(status: Status | undefined) {
    const next = { ...local, status }
    setLocal(next)
    onUpdateLocal(allControls.map(c => c.id === next.id ? next : c))
  }

  function toggleObjective(obj: Objective) {
    const nextObjs = local.objectives.map(o => o.id === obj.id ? { ...o, done: !o.done } : o)
    const next = { ...local, objectives: nextObjs }
    setLocal(next)
    onUpdateLocal(allControls.map(c => c.id === next.id ? next : c))
  }

  function updateComment(v: string) {
    const next = { ...local, comment: v }
    setLocal(next)
    onUpdateLocal(allControls.map(c => c.id === next.id ? next : c))
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <Link to="/controls">← Back</Link>
      </div>
      <h2>{local.code}: {local.title}</h2>
      {local.description && (
        <p style={{ color: '#444', marginTop: 4 }}>{local.description}</p>
      )}
      <ScoreLine allControls={allControls} control={local} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>Status:</span>
        <select value={local.status ?? ''} onChange={e => setStatus((e.target.value || undefined) as any)}>
          <option value="">unanswered</option>
          <option value="not_implemented">not_implemented</option>
          <option value="partially_implemented">partially_implemented</option>
          <option value="fully_implemented">fully_implemented</option>
        </select>
      </div>

      <section>
        <h3>Objectives</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {local.objectives.map(o => (
            <li key={o.id} style={{ marginBottom: 6 }}>
              <label>
                <input type="checkbox" checked={o.done} onChange={() => toggleObjective(o)} /> {o.text}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Evidence</h3>
        <p>Stub: integrate Firebase Storage upload next.</p>
        <input type="file" disabled title="Configure Firebase to enable uploads" />
      </section>

      <section>
        <h3>Comments / Answer</h3>
        <textarea
          placeholder="Write your answer/notes here"
          value={local.comment ?? ''}
          onChange={e => updateComment(e.target.value)}
          rows={6}
          style={{ width: '100%' }}
        />
      </section>
    </div>
  )
}

function ScoreLine({ allControls, control }: { allControls: Control[], control: Control }) {
  const w = controlWeight(allControls, control)
  const contrib = controlContribution(control, w)
  const color = contrib > 0 ? '#2e7d32' : contrib < 0 ? '#c62828' : '#9e9e9e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span>Weighted score:</span>
      <span style={{ fontWeight: 600, color }}>{contrib.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: '#777' }}>(weight {w}, Fully=+w, Partial=+w×0.5, Not/Unanswered=−w)</span>
    </div>
  )
}
