// SPEC.md §10.8 canvas: the area drawn at a fixed scale, each node with its last five positions as a
// trail; the result step of a metrics run shows the bars instead.
import { MetricsBars } from '@/components/visualizer/canvas/MetricsBars'
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { lastPositions } from '@/lib/sim/mobility'
import type { MobilitySnapshot } from './types'

export function MobilityCanvas({ snapshot }: { snapshot: MobilitySnapshot; variant?: string }) {
  if (snapshot.metrics) return <MetricsBars result={snapshot.metrics} />
  const ids = snapshot.nodes.map((n) => n.id)
  return <NetworkCanvas snapshot={snapshot} extent={snapshot.area} trails={lastPositions(snapshot.history, ids)} />
}
