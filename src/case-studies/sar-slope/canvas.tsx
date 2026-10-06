// SPEC.md §19.1 canvas: Topology (bridges dashed, articulation points marked), Broadcast (each
// radio's transmissions and duplicates), and Route, under a view switch that follows the step.
import { FocusCaption } from '@/components/case-study/FocusCaption'
import { MetricsBars } from '@/components/visualizer/canvas/MetricsBars'
import { NetworkCanvas, type NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import { useFollowedView } from '@/lib/use-followed-view'
import { currentRoute, routeLinks } from './operations'
import type { Focus, SarSnapshot } from './types'

const PARTS: { key: Focus; label: string }[] = [
  { key: 'topology', label: 'Topology' },
  { key: 'broadcast', label: 'Broadcast' },
  { key: 'route', label: 'Route' },
]

export function SarCanvas({ snapshot }: { snapshot: SarSnapshot; variant?: string }) {
  const [view, setView] = useFollowedView<Focus>(snapshot.focus)
  if (snapshot.metrics) return <MetricsBars result={snapshot.metrics} />
  const own = view === snapshot.focus && snapshot.highlight
  let shown: SarSnapshot = snapshot
  let labels: Record<string, NodeCaption> | undefined
  if (view === 'topology') {
    const bridges = new Set(snapshot.bridges)
    shown = {
      ...snapshot,
      links: snapshot.links.map((l) => (bridges.has(linkKey(l.a, l.b)) ? { ...l, broken: true } : l)),
      highlight: own ? snapshot.highlight : { nodes: Object.fromEntries(snapshot.cuts.map((c) => [c, 'flagged' as const])) },
    }
    labels = Object.fromEntries(snapshot.cuts.map((c) => [c, { lines: ['cut'], spoken: 'articulation point' }]))
  } else if (view === 'broadcast') {
    labels = Object.fromEntries(
      snapshot.nodes
        .filter((n) => snapshot.txBy[n.id] || snapshot.dupBy[n.id])
        .map((n) => {
          const tx = snapshot.txBy[n.id] ?? 0
          const dup = snapshot.dupBy[n.id] ?? 0
          return [n.id, { lines: [`tx ${tx} dup ${dup}`], spoken: `${tx} transmissions, ${dup} duplicates` }]
        }),
    )
  } else if (!own) {
    const route = currentRoute(snapshot, snapshot.flow)
    shown = { ...snapshot, highlight: route ? { links: routeLinks(route), path: route } : undefined }
  }
  if (view !== snapshot.focus && view !== 'route' && view !== 'topology') shown = { ...shown, highlight: undefined }
  return (
    <div>
      <FocusCaption parts={PARTS} focus={snapshot.focus} view={view} onSelect={setView} />
      <NetworkCanvas snapshot={shown} nodeLabels={labels} />
    </div>
  )
}
