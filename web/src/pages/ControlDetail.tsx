import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Control, Objective, Status, Business } from '../types'
import { controlContribution, controlWeight } from '../scoring'
import { useBusinessContext } from '../context/BusinessContext'
import { EvidenceUploader } from '../components/EvidenceUpload'
import { doc, runTransaction } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'


export default function ControlDetail({
  allControls,
  onUpdateControl,
  readOnly = false,
}: {
  allControls: Control[]
  onUpdateControl: (control: Control) => void
  readOnly?: boolean
}) {
  const { selectedBusinessId } = useBusinessContext()
  const { id: raw } = useParams()
  const id = useMemo(() => (raw ? decodeURIComponent(raw) : ''), [raw])
  const navigate = useNavigate()

  const sourceControl = useMemo(
    () => allControls.find(control => control.id === id) ?? null,
    [allControls, id],
  )
  const [local, setLocal] = useState<Control | null>(sourceControl)

  useEffect(() => {
    setLocal(sourceControl)
  }, [sourceControl])

  if (!local) {
    return (
      <>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate(-1)}>{'<' } Back</button>
          <h1 style={{ marginLeft: 12 }}>Control</h1>
        </div>
        <div className="card card--padded">
          <p>We could not find that control.</p>
          <p style={{ color: 'var(--muted)' }}>ID tried: <code>{id}</code></p>
        </div>
      </>
    )
  }

  function setStatus(status: Status | undefined) {
    if (!local || readOnly) return
    const next: Control = { ...local, status }
    setLocal(next)
    void onUpdateControl(next)
  }

  function toggleObjective(objective: Objective) {
    if (!local || readOnly) return
    const nextObjectives = (local.objectives ?? []).map(obj => (obj.id === objective.id ? { ...obj, done: !obj.done } : obj))
    const next: Control = { ...local, objectives: nextObjectives }
    setLocal(next)
    void onUpdateControl(next)
  }

  function updateComment(value: string) {
    if (!local || readOnly) return
    const next: Control = { ...local, comment: value }
    setLocal(next)
    void onUpdateControl(next)
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={() => navigate(-1)}>{'<' } Back</button>
        <h1 style={{ marginLeft: 12 }}>{local.code}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={local.status} />
        </div>
      </div>

      <div className="card card--padded" style={{ display: 'grid', gap: '1rem' }}>
        <header>
          <h2 style={{ margin: 0 }}>{local.title}</h2>
          <div style={{ color: 'var(--muted)' }}>
            <strong>Family:</strong> {local.family ?? '-'} | <strong>Code:</strong> {local.code}
          </div>
        </header>

        {readOnly && (
          <div style={{ background: 'rgba(148, 163, 184, 0.2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '.9rem', color: 'var(--muted)' }}>
            You have read-only access to this company. Ask an administrator for editor rights to update control answers.
          </div>
        )}

        <ScoreLine allControls={allControls} control={local} />

        <Section title="Status">
          <select
            value={local.status ?? ''}
            onChange={(event) => setStatus((event.target.value || undefined) as Status | undefined)}
            disabled={readOnly}
          >
            <option value="">unanswered</option>
            <option value="not_implemented">not_implemented</option>
            <option value="partially_implemented">partially_implemented</option>
            <option value="fully_implemented">fully_implemented</option>
          </select>
        </Section>

        <Section title="Description">
          <p>{local.description ?? '-'}</p>
        </Section>

        <Section title="Assessment Objectives">
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {local.objectives.length ? (
              local.objectives.map(objective => (
                <li key={objective.id} style={{ marginBottom: 6 }}>
                  <label>
                    <input type="checkbox" checked={objective.done} onChange={() => toggleObjective(objective)} disabled={readOnly} /> {objective.text}
                  </label>
                </li>
              ))
            ) : (
              <li>-</li>
            )}
          </ul>
        </Section>

  <Section title="Evidence">
    <EvidenceUploader
      businessId={selectedBusinessId}
      controlId={local.id}
      disabled={readOnly}
    />
    <EvidenceList controlId={local.id} />
  </Section>

        <Section title="Comments / Answer">
          <textarea
            placeholder="Write your answer or notes here"
            value={local.comment ?? ''}
            onChange={(event) => updateComment(event.target.value)}
            rows={6}
            style={{ width: '100%' }}
            disabled={readOnly}

          />
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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

  const className = !status
    ? 'badge--muted'
    : status === 'fully_implemented'
    ? 'badge--ok'
    : status === 'partially_implemented'
    ? 'badge--warn'
    : status === 'not_implemented'
    ? 'badge--bad'
    : 'badge--muted'

  return <span className={`badge ${className}`}>{label}</span>
}

function ScoreLine({ allControls, control }: { allControls: Control[]; control: Control }) {
  const weight = controlWeight(allControls, control)
  const contribution = controlContribution(control, weight)
  const color = contribution > 0 ? '#2e7d32' : contribution < 0 ? '#c62828' : '#9e9e9e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#555' }}>
      <span>Weighted score:</span>
      <span style={{ fontWeight: 600, color }}>{contribution.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: '#777' }}>(weight {weight}, Fully=+w, Partial=+w*0.5, Not/Unanswered=-w)</span>
    </div>
  )
}

// upload evidence for a given controlId section --------------------------

// lists uploaded evidence for a given controlId
// handles the delete and download actions aswell as displaying the list
function EvidenceList({ controlId }: { controlId: string }) {
  const { selectedBusiness, currentUserId, canManageSelected } = useBusinessContext()
  const [loading, setLoading] = useState(false)
  const items = (selectedBusiness?.evidence ?? []).filter((e: any) => e.controlId === controlId || e.path?.includes(controlId))

  // delete evidence item
  async function handleDelete(evidenceItem: any) {        //may change the uploaded by to user_name instead of user_id
    if (!selectedBusiness) return
    if (!currentUserId) return
    const isUploader = evidenceItem.uploadedBy === currentUserId
    if (!isUploader && !canManageSelected) return

    setLoading(true)
    try {
      // delete storage object first if path exists
      if (evidenceItem.path) {
        try {
          const objRef = storageRef(storage!, evidenceItem.path)
          await deleteObject(objRef)
        } catch (err) {
          console.warn('Failed to delete storage object (may not exist or permissions), continuing to remove metadata', err)
        }
      }
      const businessRef = doc(db!, 'businesses', selectedBusiness.id)
      await runTransaction(db!, async (tx) => {
        const snap = await tx.get(businessRef)
        if (!snap.exists()) throw new Error('Business not found')
        const data = snap.data() as any
        const newEvidence = (data.evidence ?? []).filter((it: any) => it.id !== evidenceItem.id)
        tx.update(businessRef, { evidence: newEvidence })
      })
    } catch (err) {
      console.error('Failed to remove evidence', err)
    } finally {
      setLoading(false)
    }
  }
// download evidence item
// if item has a url, open in new tab
// if item has a path, get download url and open
  async function handleDownload(item: any) {
    try {
      if (item.url) {
        window.open(item.url, '_blank')
        return
      }
      if (!item.path) return
      const ref = storageRef(storage!, item.path)
      const url = await getDownloadURL(ref)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Failed to get download URL', err)
    }
  }

  if (!selectedBusiness || items.length === 0) {
    return <div style={{ color: 'var(--muted)' }}>No evidence uploaded yet.</div>
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((item: any) => (
        <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid var(--border)', padding: 8, borderRadius: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{item.name || item.filename}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Uploaded by {item.uploadedBy} • {new Date(item.uploadedAt).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => handleDownload(item)} style={{ padding: '6px 8px' }}>Download</button>
            {(item.uploadedBy === currentUserId || canManageSelected) && (
              <button type="button" onClick={() => handleDelete(item)} disabled={loading} style={{ padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca' }}>Remove</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
