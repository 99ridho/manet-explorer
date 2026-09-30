// SPEC.md §10.4 canvas: at rest under MPR relaying, the source's MPRs wear the MPR ring.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { sourceOf } from './operations'
import type { BroadcastSnapshot } from './types'

export function BroadcastCanvas({ snapshot }: { snapshot: BroadcastSnapshot; variant?: string }) {
  const src = sourceOf(snapshot)
  if (snapshot.relay !== 'mpr' || !src) return <NetworkCanvas snapshot={snapshot} />
  const mprs = new Set(snapshot.mpr[src] ?? [])
  const nodes = snapshot.nodes.map((n) => (mprs.has(n.id) ? { ...n, roles: [...n.roles, 'mpr' as const] } : n))
  return <NetworkCanvas snapshot={{ ...snapshot, nodes }} />
}
