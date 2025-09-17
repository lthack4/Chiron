import type { Control } from '../types'
import { buildWeightMap, controlContribution, parseCodeRank } from '../scoring'

export default function SprScore({ controls }: { controls: Control[] }) {
  const model = buildWeightedModel(controls)
  const pct = model.max > 0 ? Math.round((model.total / model.max) * 100) : 0

  return (
    <>
      <div className="toolbar">
        <h1 style={{marginRight:'auto'}}>SPR Score (Weighted, Prototype)</h1>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'minmax(280px, 420px) 1fr',
        }}
      >
        <div className="card card--padded">
          <ScoreBadge score={model.total} max={model.max} min={-model.max} pct={pct} />
          <ul style={{ marginTop: '1rem', color: 'var(--muted)' }}>
            <li>Total controls: {model.totalControls}</li>
            <li>Weighted max: {model.max}</li>
            <li>Weighted min: {-model.max}</li>
            <li>
              Positives: {model.positives.toFixed(1)} | Negatives: {model.negatives.toFixed(1)}
            </li>
          </ul>
        </div>

        <div className="card card--padded">
          <h3 style={{ marginBottom: '.75rem' }}>By Family (Weighted)</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {model.byFamily.map((fam) => (
              <Bar key={fam.family} label={fam.family} value={fam.score} max={fam.max} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function ScoreBadge({ score, pct }: { score: number; pct: number }) {
  return (
    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: score >= 0 ? 'var(--success)' : 'var(--danger)' }}>
      {score.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>({pct}%)</span>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const barColor = value >= 0 ? 'var(--success)' : 'var(--danger)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <strong>{label}</strong>
        <span style={{ color: 'var(--muted)' }}>{value.toFixed(1)} / {max.toFixed(1)}</span>
      </div>
      <div style={{ height: 10, background: 'rgba(140,149,161,.25)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: barColor }} />
      </div>
    </div>
  )
}

function buildWeightedModel(controls: Control[]) {
  const weightMap = buildWeightMap(controls.map((c) => parseCodeRank(c.code)))
  let total = 0
  let positives = 0
  let negatives = 0
  const byFamily: { family: string; score: number; max: number }[] = []

  for (const family of Object.keys(weightMap)) {
    let famScore = 0
    let famMax = 0
    for (const c of controls.filter((c) => c.code.startsWith(family))) {
      const weight = weightMap[family][c.code] ?? 1
      famMax += weight
      const contrib = controlContribution(c.status, weight)
      famScore += contrib
      total += contrib
      if (contrib > 0) positives += contrib
      if (contrib < 0) negatives += contrib
    }
    byFamily.push({ family, score: famScore, max: famMax })
  }

  const max = Object.values(weightMap).reduce(
    (acc, fam) => acc + Object.values(fam).reduce((a, w) => a + w, 0),
    0,
  )

  return { total, positives, negatives, max, totalControls: controls.length, byFamily }
}
