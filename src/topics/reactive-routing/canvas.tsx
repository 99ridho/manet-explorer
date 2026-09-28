// SPEC.md §10.3 canvas: at rest, the route of the last discovery stays drawn.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { linkKey } from '@/lib/net'
import { currentRoute } from './operations'
import type { ReactiveSnapshot } from './types'

export function ReactiveCanvas({ snapshot }: { snapshot: ReactiveSnapshot; variant?: string }) {
  if (snapshot.highlight || !snapshot.flow) return <NetworkCanvas snapshot={snapshot} />
  const route = currentRoute(snapshot, snapshot.flow.src, snapshot.flow.dst)
  if (!route) return <NetworkCanvas snapshot={snapshot} />
  const links = Object.fromEntries(route.slice(1).map((n, i) => [linkKey(route[i], n), 'tree' as const]))
  return <NetworkCanvas snapshot={{ ...snapshot, highlight: { links, path: route } }} />
}
