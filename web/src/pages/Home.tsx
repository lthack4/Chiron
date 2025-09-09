import type { Control, Status } from '../types'

type Slice = { label: string; value: number; color: string }

export default function Home({ controls }: { controls: Control[] }) {
  const counts = summarize(controls)
  const slices: Slice[] = [
    { label: 'not implemented', value: counts.notImplemented, color: '#c62828' },
    { label: 'partially implemented', value: counts.partiallyImplemented, color: '#f9a825' },
    { label: 'implemented', value: counts.implemented, color: '#2e7d32' },
    { label: 'unanswered', value: counts.unanswered, color: '#9e9e9e' },
  ]
  const total = slices.reduce((a, b) => a + b.value, 0)

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2>Overview</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <PieChart slices={slices} size={240} innerRadius={70} />
        <Legend slices={slices} total={total} />
      </div>
    </div>
  )
}

function summarize(controls: Control[]) {
  let unanswered = 0, notImplemented = 0, partiallyImplemented = 0, implemented = 0
  for (const c of controls) {
    const s = c.status as Status | undefined
    if (!s) unanswered++
    else if (s === 'fully_implemented') implemented++
    else if (s === 'partially_implemented') partiallyImplemented++
    else if (s === 'not_implemented') notImplemented++
  }
  return { unanswered, notImplemented, partiallyImplemented, implemented }
}

function Legend({ slices, total }: { slices: Slice[]; total: number }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {slices.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, background: s.color, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ minWidth: 140 }}>{s.label}</span>
          <strong>{s.value}</strong>
          <span style={{ color: '#666' }}>({total ? Math.round((s.value / total) * 100) : 0}%)</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ slices, size = 200, innerRadius = 0 }: { slices: Slice[]; size?: number; innerRadius?: number }) {
  const radius = size / 2
  const total = slices.reduce((a, b) => a + b.value, 0)
  let angle = -Math.PI / 2 // start at top

  const paths = total === 0 ? [
    <circle key="empty" cx={radius} cy={radius} r={radius} fill="#eee" />
  ] : []

  for (const s of slices) {
    if (s.value === 0) continue
    const sliceAngle = (s.value / total) * Math.PI * 2
    const path = describeArc(radius, radius, radius, angle, angle + sliceAngle, innerRadius)
    paths.push(<path key={s.label} d={path} fill={s.color} stroke="#fff" strokeWidth={1} />)
    angle += sliceAngle
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      {innerRadius > 0 && (
        <circle cx={radius} cy={radius} r={innerRadius} fill="#fff" />
      )}
    </svg>
  )
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, innerR = 0) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'

  if (!innerR) {
    return [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ')
  }

  const iStart = polarToCartesian(cx, cy, innerR, endAngle)
  const iEnd = polarToCartesian(cx, cy, innerR, startAngle)

  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'L', iEnd.x, iEnd.y,
    'A', innerR, innerR, 0, largeArcFlag, 1, iStart.x, iStart.y,
    'Z'
  ].join(' ')
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  }
}

