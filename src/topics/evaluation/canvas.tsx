// SPEC.md §10.9 canvas: at rest the connected dominating set stays ringed; the result step of a
// metrics run shows the bars with their spread instead.
import { MetricsBars } from '@/components/visualizer/canvas/MetricsBars'
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import type { EvaluationSnapshot } from './types'

export function EvaluationCanvas({ snapshot }: { snapshot: EvaluationSnapshot; variant?: string }) {
  if (snapshot.metrics) return <MetricsBars result={snapshot.metrics} />
  if (snapshot.highlight || snapshot.cds.length === 0) return <NetworkCanvas snapshot={snapshot} />
  const nodes = Object.fromEntries(snapshot.cds.map((v) => [v, 'tree' as const]))
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { nodes } }} />
}
