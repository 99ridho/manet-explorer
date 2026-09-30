// SPEC.md §10.6 canvas: at rest, each member's link to its cluster head stays drawn.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { clusterLinks } from './operations'
import type { ClusterSnapshot } from './types'

export function ClusterCanvas({ snapshot }: { snapshot: ClusterSnapshot; variant?: string }) {
  if (snapshot.highlight) return <NetworkCanvas snapshot={snapshot} />
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { links: clusterLinks(snapshot) } }} />
}
