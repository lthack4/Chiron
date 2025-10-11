import type { Business, BusinessInviteSummary } from '../types'

interface BusinessSelectorProps {
  open: boolean
  loading: boolean
  error?: Error | null
  currentUserId: string | null
  memberBusinesses: Business[]
  discoverableBusinesses: Business[]
  pendingInvites: BusinessInviteSummary[]
  isPlatformAdmin: boolean
  canCreateBusiness: boolean
  selectedId: string | null
  onSelect: (businessId: string) => void
  onClose: () => void
}

export default function BusinessSelector({
  open,
  loading,
  error,
  currentUserId,
  memberBusinesses,
  discoverableBusinesses,
  pendingInvites,
  isPlatformAdmin,
  canCreateBusiness,
  selectedId,
  onSelect,
  onClose,
}: BusinessSelectorProps) {
  if (!open) return null

  const canClose = Boolean(selectedId)
  const hasMemberCompanies = memberBusinesses.length > 0
  const hasDiscoverable = isPlatformAdmin && discoverableBusinesses.length > 0
  const hasInvites = isPlatformAdmin && pendingInvites.length > 0
  const nothingToShow = !loading && !error && !hasMemberCompanies && !hasDiscoverable

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        zIndex: 20,
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: 'min(720px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.25)',
          padding: '2rem',
          display: 'grid',
          gap: '1.5rem',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Select a company</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)' }}>
              Your evidence, POAMs, and control answers live inside the company workspace you choose.
            </p>
            <p style={{ margin: '0.15rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
              Signed in as <code>{currentUserId ?? 'unknown-user'}</code>{' '}
              {isPlatformAdmin ? (
                <span style={{ color: 'var(--accent, #2563eb)' }}>• admin access</span>
              ) : (
                <span>• member access only</span>
              )}
            </p>
          </div>
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
              aria-label="Close company selector"
            >
              ×
            </button>
          )}
        </header>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading companies…</p>
        ) : error ? (
          <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.75rem 1rem', borderRadius: 8 }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Could not load companies</strong>
            <span style={{ fontSize: '.85rem' }}>{error.message}</span>
          </div>
        ) : nothingToShow ? (
          <div style={{ color: 'var(--muted)' }}>
            <p style={{ marginTop: 0 }}>You do not have access to any companies yet.</p>
            <p style={{ marginBottom: 0 }}>Ask an administrator to invite you or provision a workspace.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {hasMemberCompanies && (
              <section style={{ display: 'grid', gap: '0.75rem' }}>
                <header>
                  <h3 style={{ margin: 0 }}>Your companies</h3>
                  <p style={{ margin: '.15rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
                    Workspaces you belong to directly.
                  </p>
                </header>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {memberBusinesses.map(business => renderBusinessCard({ business, selectedId, onSelect }))}
                </div>
              </section>
            )}

            {hasDiscoverable && (
              <section style={{ display: 'grid', gap: '0.75rem' }}>
                <header>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    All companies
                    <span style={{ fontSize: '.75rem', color: 'var(--accent, #2563eb)', textTransform: 'uppercase', letterSpacing: '.02em' }}>
                      admin
                    </span>
                  </h3>
                  <p style={{ margin: '.15rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
                    You can open any workspace even if you are not on the member list.
                  </p>
                </header>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {discoverableBusinesses.map(business => renderBusinessCard({ business, selectedId, onSelect }))}
                </div>
              </section>
            )}

            {hasInvites && (
              <section style={{ display: 'grid', gap: '0.75rem' }}>
                <header>
                  <h3 style={{ margin: 0 }}>Pending invitations</h3>
                  <p style={{ margin: '.15rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
                    Manage outstanding invites before rolling access to teammates.
                  </p>
                </header>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                    <thead style={{ background: 'rgba(37,99,235,0.04)', textAlign: 'left' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Role</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Company</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Invited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInvites.map((invite, index) => (
                        <tr key={`${invite.businessId}-${invite.email}-${index}`} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{invite.email}</td>
                          <td style={{ padding: '0.5rem 0.75rem', textTransform: 'capitalize' }}>{invite.role}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{invite.businessName}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{invite.invitedAt ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '.5rem' }}>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
            Companies are invite-only. Ask an admin to add teammates or promote them to admin to create workspaces.
          </div>
          <button
            type="button"
            disabled={!canCreateBusiness}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: canCreateBusiness ? 'var(--accent, #2563eb)' : 'rgba(148, 163, 184, 0.2)',
              color: canCreateBusiness ? '#fff' : 'var(--muted)',
              cursor: canCreateBusiness ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
            title={canCreateBusiness ? 'Creating companies will tie into Firebase shortly.' : 'Only admins can create companies.'}
            onClick={canCreateBusiness ? () => console.info('TODO: integrate create-company flow with Firebase backend') : undefined}
          >
            Create company
          </button>
        </footer>
      </div>
    </div>
  )
}

function renderBusinessCard({
  business,
  selectedId,
  onSelect,
}: {
  business: Business
  selectedId: string | null
  onSelect: (businessId: string) => void
}) {
  const isSelected = business.id === selectedId
  return (
    <button
      key={business.id}
      type="button"
      onClick={() => onSelect(business.id)}
      style={{
        textAlign: 'left',
        padding: '1.25rem',
        borderRadius: 10,
        border: isSelected ? '2px solid var(--accent, #2563eb)' : '1px solid var(--border)',
        background: isSelected ? 'rgba(37, 99, 235, 0.08)' : '#fff',
        cursor: 'pointer',
        display: 'grid',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
        <strong style={{ fontSize: '1.1rem' }}>{business.name}</strong>
        {isSelected && <span style={{ color: 'var(--accent, #2563eb)', fontSize: '.9rem' }}>Current</span>}
      </div>
      {business.description && (
        <p style={{ margin: 0, color: 'var(--muted)' }}>{business.description}</p>
      )}
      {business.members?.length ? (
        <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--muted)' }}>
          Team: {business.members.slice(0, 3).map(member => member.displayName ?? member.email ?? member.uid).join(', ')}
          {business.members.length > 3 ? ` +${business.members.length - 3}` : ''}
        </p>
      ) : null}
    </button>
  )
}
