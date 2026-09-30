// SPEC.md §10.5 canvas: at rest, the path of the last packet stays drawn.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import type { GeoSnapshot } from './types'

export function GeoCanvas({ snapshot }: { snapshot: GeoSnapshot; variant?: string }) {
  if (snapshot.highlight || snapshot.path.length < 2) return <NetworkCanvas snapshot={snapshot} />
  const p = snapshot.path
  const links = Object.fromEntries(p.slice(1).map((n, i) => [linkKey(p[i], n), 'tree' as const]))
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { links, path: p } }} />
}
