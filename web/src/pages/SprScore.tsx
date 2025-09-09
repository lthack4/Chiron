import type { Control } from '../types'
import { buildWeightMap, controlContribution, parseCodeRank } from '../scoring'

export default function SprScore({ controls }: { controls: Control[] }) {
  const model = buildWeightedModel(controls)
  const pct = model.max > 0 ? Math.round((model.total / model.max) * 100) : 0

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>SPR Score (Weighted, Prototype)</h2>
      <p style={{ color: '#555' }}>
        Weighted scoring using magnitudes 5/3/1 per practice. Rule: within each family, the first two practices are worth 5,
        the next two are worth 3, the rest are worth 1. Status contributes: Fully = +weight, Partially = +weight×0.5, Not/Unanswered = −weight.
        Replace this with the official DoD SPR(S) weights when available.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreBadge score={model.total} max={model.max} min={-model.max} pct={pct} />
        <ul style={{ margin: 0 }}>
          <li>Total controls: {model.totalControls}</li>
          <li>Weighted max: {model.max}</li>
          <li>Weighted min: {-model.max}</li>
          <li>Positives: {model.positives.toFixed(1)} | Negatives: {model.negatives.toFixed(1)}</li>
        </ul>
      </div>

      <section>
        <h3>By Family (Weighted)</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {Object.entries(model.byFamily).map(([fam, t]) => (
            <div key={fam} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <strong style={{ width: 40 }}>{fam}</strong>
              <ProgressBarWeighted pos={t.positive} neg={t.negative} max={t.max} />
              <span style={{ color: '#666' }}>{t.positive.toFixed(1)} / {t.max.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

type FamAgg = { max: number, positive: number, negative: number }

function buildWeightedModel(controls: Control[]) {
  // Build ordering within each family to assign default weights: idx 0-1:5, idx 2-3:3, rest:1
  const famBuckets: Record<string, Control[]> = {}
  for (const c of controls) (famBuckets[c.family] ||= []).push(c)
  for (const f of Object.keys(famBuckets)) famBuckets[f].sort((a,b)=>parseCodeRank(a.code)-parseCodeRank(b.code))

  const weightMap = buildWeightMap(controls)

  let total = 0
  let positives = 0
  let negatives = 0
  let max = 0
  const byFamily: Record<string, FamAgg> = {}

  for (const c of controls) {
    const w = weightMap.get(c.code) ?? 1
    max += w
    const contrib = controlContribution(c, w)

    total += contrib
    if (contrib >= 0) positives += contrib
    else negatives += contrib

    const fam = c.family
    if (!byFamily[fam]) byFamily[fam] = { max: 0, positive: 0, negative: 0 }
    byFamily[fam].max += w
    if (contrib >= 0) byFamily[fam].positive += contrib
    else byFamily[fam].negative += contrib
  }

  return { totalControls: controls.length, total, positives, negatives, max, byFamily }
}

function ScoreBadge({ score, max, min, pct }: { score: number, max: number, min: number, pct: number }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: '12px 16px', minWidth: 220 }}>
      <div style={{ fontSize: 12, color: '#666' }}>Weighted Score</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{score.toFixed(1)} (range {min}…{max})</div>
      <div style={{ color: '#555' }}>{pct}% of max</div>
    </div>
  )
}

function ProgressBarWeighted({ pos, neg, max }: { pos: number, neg: number, max: number }) {
  const posPct = max ? Math.min(100, Math.max(0, (pos / max) * 100)) : 0
  const negPct = max ? Math.min(100, Math.max(0, (-neg / max) * 100)) : 0
  return (
    <div style={{ height: 10, width: 260, background: '#eee', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
      <div style={{ width: `${posPct}%`, background: '#2e7d32' }} />
      <div style={{ width: `${negPct}%`, background: '#c62828' }} />
    </div>
  )
}
