// SPEC.md §10.10 canvas: each metric labels what it uses (Mbps on links for bandwidth, ETX on links
// for ETX, batteries under nodes for energy; batteries show on hover otherwise), and at rest the
// path found last stays drawn. All of these are example values, and the caption says so.
import { NetworkCanvas, type NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import { etxOf } from './operations'
import type { QosSnapshot } from './types'

export function QosCanvas({ snapshot }: { snapshot: QosSnapshot; variant?: string }) {
  const m = snapshot.metric
  // The top row captions above, so a caption never sits on the links that leave a node downward.
  const top = Math.max(...snapshot.nodes.map((n) => n.y))
  const labels: Record<string, NodeCaption> = Object.fromEntries(
    snapshot.nodes.map((n) => [
      n.id,
      { lines: [`${n.battery} units`], spoken: `battery ${n.battery} units`, hover: m !== 'energy', place: n.y === top ? 'above' : undefined },
    ]),
  )
  const links = m === 'bandwidth' ? snapshot.links : snapshot.links.map(({ bandwidth: _, ...l }) => l)
  const linkLabels = m === 'etx' ? Object.fromEntries(snapshot.links.map((l) => [linkKey(l.a, l.b), `ETX ${etxOf(l).toFixed(2)}`])) : undefined
  const p = snapshot.path
  const highlight =
    snapshot.highlight ??
    (p ? { links: Object.fromEntries(p.slice(1).map((n, i) => [linkKey(p[i], n), 'tree' as const])), path: p } : undefined)
  return (
    <div>
      <NetworkCanvas snapshot={{ ...snapshot, links, linkLabels, highlight }} nodeLabels={labels} />
      <p className="text-xs text-muted-foreground">
        Bandwidths, delivery ratios, and batteries are example values; hover a node for its battery and its links’ delivery ratios.
      </p>
    </div>
  )
}
