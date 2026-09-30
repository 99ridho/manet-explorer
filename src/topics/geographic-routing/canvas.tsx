// SPEC.md §10.5 canvas: every node shows its position and distance to the destination; at rest,
// the path of the last packet stays drawn.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import { geoLabels } from './operations'
import type { GeoSnapshot } from './types'

export function GeoCanvas({ snapshot }: { snapshot: GeoSnapshot; variant?: string }) {
  const labels = geoLabels(snapshot)
  if (snapshot.highlight || snapshot.path.length < 2) return <NetworkCanvas snapshot={snapshot} nodeLabels={labels} />
  const p = snapshot.path
  const links = Object.fromEntries(p.slice(1).map((n, i) => [linkKey(p[i], n), 'tree' as const]))
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { links, path: p } }} nodeLabels={labels} />
}
