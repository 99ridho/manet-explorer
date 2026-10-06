// SPEC.md §19.2 canvas: Clusters (heads ringed, gateways dashed, member links drawn), Addresses (the
// 256-address bar and each radio's address), and Movement (each radio's last five positions).
// Every view keeps the bar's row, so switching views never changes the card's height. The drawing fits
// the radios rather than the whole 12 × 8 area, which would leave them too small to read.
import { FocusCaption } from '@/components/case-study/FocusCaption'
import { MetricsBars } from '@/components/visualizer/canvas/MetricsBars'
import { NetworkCanvas, type NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import { lastPositions } from '@/lib/sim/mobility'
import { useFollowedView } from '@/lib/use-followed-view'
import { clusterLinks } from './operations'
import type { CampSnapshot, Focus } from './types'

const PARTS: { key: Focus; label: string }[] = [
  { key: 'clusters', label: 'Clusters' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'movement', label: 'Movement' },
]

function AddressBar({ snapshot }: { snapshot: CampSnapshot }) {
  const owned = Object.entries(snapshot.pool)
    .flatMap(([id, ranges]) => ranges.map((r) => ({ id, r })))
    .sort((a, b) => a.r[0] - b.r[0])
  const text = owned.map(({ id, r }) => `${id} holds ${r[0] === r[1] ? r[0] : `${r[0]} to ${r[1]}`}`).join(', ')
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-sm border" role="img" aria-label={`Address space of ${snapshot.space}: ${text}`}>
      {owned.map(({ id, r }, i) => (
        <div
          key={`${id}-${r[0]}`}
          className={`flex min-w-0 items-center justify-center overflow-hidden font-mono text-[10px] ${i % 2 ? 'bg-muted' : 'bg-card'} border-r last:border-r-0`}
          style={{ width: `${(100 * (r[1] - r[0] + 1)) / snapshot.space}%` }}
          title={`${id}: ${r[0]} to ${r[1]}`}
        >
          {r[1] - r[0] + 1 >= 12 ? id : ''}
        </div>
      ))}
    </div>
  )
}

export function CampCanvas({ snapshot }: { snapshot: CampSnapshot; variant?: string }) {
  const [view, setView] = useFollowedView<Focus>(snapshot.focus)
  if (snapshot.metrics) return <MetricsBars result={snapshot.metrics} />
  const own = view === snapshot.focus ? snapshot.highlight : undefined
  const ids = snapshot.nodes.map((n) => n.id)
  let labels: Record<string, NodeCaption> | undefined
  let shown: CampSnapshot = { ...snapshot, highlight: own }
  if (view === 'clusters') {
    shown = { ...snapshot, highlight: own ?? { links: clusterLinks(snapshot) } }
    labels = Object.fromEntries(
      snapshot.nodes
        .filter((n) => snapshot.head[n.id] && snapshot.head[n.id] !== n.id)
        .map((n) => [n.id, { lines: [`head ${snapshot.head[n.id]}`], spoken: `cluster head ${snapshot.head[n.id]}`, hover: true }]),
    )
  } else if (view === 'addresses') {
    labels = Object.fromEntries(
      snapshot.nodes.map((n) => {
        const a = snapshot.address[n.id]
        return [n.id, a == null ? { lines: ['no address'], spoken: 'no address' } : { lines: [`${a}`], spoken: `address ${a}` }]
      }),
    )
  }
  return (
    <div>
      <FocusCaption parts={PARTS} focus={snapshot.focus} view={view} onSelect={setView} />
      <div className="mb-1 h-6">{view === 'addresses' && <AddressBar snapshot={snapshot} />}</div>
      <NetworkCanvas
        snapshot={shown}
        nodeLabels={labels}
        trails={view === 'movement' ? lastPositions(snapshot.history, ids) : undefined}
      />
    </div>
  )
}
