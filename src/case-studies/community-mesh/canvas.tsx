// SPEC.md §19.3 canvas: Links (each link's ETX, and its delivery ratio on hover), Route (the route in use, with
// every candidate listed under it), and Trust (each router's watchdog failures; flagged routers filled).
import { FocusCaption } from '@/components/case-study/FocusCaption'
import { MetricsBars } from '@/components/visualizer/canvas/MetricsBars'
import { NetworkCanvas, type NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey, listIds } from '@/lib/net'
import { useFollowedView } from '@/lib/use-followed-view'
import { etxOf, tree } from './operations'
import type { Focus, MeshSnapshot } from './types'

const PARTS: { key: Focus; label: string }[] = [
  { key: 'links', label: 'Links' },
  { key: 'route', label: 'Route' },
  { key: 'trust', label: 'Trust' },
]

export function MeshCanvas({ snapshot }: { snapshot: MeshSnapshot; variant?: string }) {
  const [view, setView] = useFollowedView<Focus>(snapshot.focus)
  if (snapshot.metrics) return <MetricsBars result={snapshot.metrics} />
  const own = view === snapshot.focus ? snapshot.highlight : undefined
  let shown: MeshSnapshot = { ...snapshot, highlight: own }
  let labels: Record<string, NodeCaption> | undefined
  let note = 'Delivery ratios are example values; hover a router for the ratios of its links.'
  if (view === 'links') {
    shown = {
      ...shown,
      linkLabels: Object.fromEntries(snapshot.links.map((l) => [linkKey(l.a, l.b), `ETX ${etxOf(l).toFixed(2)}`])),
    }
  } else if (view === 'route') {
    const r = snapshot.route
    if (!own && r) shown = { ...shown, highlight: { links: tree(r), path: r } }
    if (snapshot.candidates.length)
      note = `Candidates: ${snapshot.candidates.map((c) => `${listIds(c.route)} (ETX ${c.etx.toFixed(2)})`).join('; ')}.`
  } else {
    if (!own) shown = { ...shown, highlight: { nodes: Object.fromEntries(snapshot.flagged.map((n) => [n, 'flagged' as const])) } }
    labels = Object.fromEntries(
      Object.entries(snapshot.failures).map(([n, f]) => [
        n,
        { lines: [snapshot.flagged.includes(n) ? `${f} failures, flagged` : `${f} failures`], spoken: `${f} watchdog failures` },
      ]),
    )
  }
  return (
    <div>
      <FocusCaption parts={PARTS} focus={snapshot.focus} view={view} onSelect={setView} />
      <NetworkCanvas snapshot={shown} nodeLabels={labels} />
      <p className="min-h-8 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
