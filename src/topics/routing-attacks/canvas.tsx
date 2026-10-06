// SPEC.md §10.11 canvas: the malicious nodes filled, the tunnel and the claimed link labeled, and at
// rest the route in use drawn with every flagged node marked.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import type { AttackSnapshot } from './types'

export function AttacksCanvas({ snapshot }: { snapshot: AttackSnapshot; variant?: string }) {
  if (snapshot.highlight) return <NetworkCanvas snapshot={snapshot} />
  const r = snapshot.route
  const links = r ? Object.fromEntries(r.slice(1).map((n, i) => [linkKey(r[i], n), 'tree' as const])) : {}
  const nodes = Object.fromEntries(snapshot.flagged.map((n) => [n, 'flagged' as const]))
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { nodes, links, path: r ?? undefined } }} />
}
