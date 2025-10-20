import { useBusinessContext } from '../context/BusinessContext'

export default function Poams() {
  const { selectedBusiness } = useBusinessContext()

  // No business selected yet
  if (!selectedBusiness) {
    return (
      <section className="card card--padded" style={{ margin: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>POAMs</h2>
        <p>Select a company to review its Plans of Action &amp; Milestones.</p>
      </section>
    )
  }

  const poams = selectedBusiness.poams ?? []

  // Empty state
  if (poams.length === 0) {
    return (
      <section className="card card--padded" style={{ margin: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>POAMs</h2>
        <p>No POAMs yet for <strong>{selectedBusiness.name}</strong>.</p>
        <p>Add one from the Controls page or create a new action item here.</p>
      </section>
    )
  }

  // Normal table
  return (
    <section style={{ padding: '1rem' }}>
      <div
        className="card"
        style={{
          overflow: 'hidden',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--layer-1)',
        }}
      >
        <div style={{ padding: '1rem 1rem 0.5rem' }}>
          <h2 style={{ margin: 0 }}>POAMs</h2>
          <p style={{ margin: '0.25rem 0 0.75rem', opacity: 0.8 }}>
            Plans of Action &amp; Milestones for <strong>{selectedBusiness.name}</strong>
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Title</th>
              <th style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>Control</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Owner</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Risk</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {poams.map((poam: any) => (
              <tr key={poam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{poam.title}</td>
                <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                  {poam.controlId ?? '—'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {poam.owner ?? 'Unassigned'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>
                  {typeof poam.status === 'string'
                    ? poam.status.replace(/_/g, ' ')
                    : '—'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>
                  {poam.riskLevel ?? '—'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {poam.dueDate ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
