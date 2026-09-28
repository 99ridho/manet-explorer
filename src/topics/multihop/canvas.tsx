// SPEC.md §10.1 canvas: at rest, the bridges and articulation points from the last Find bridges stay marked.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import type { MultihopSnapshot } from './types'

export function MultihopCanvas({ snapshot }: { snapshot: MultihopSnapshot; variant?: string }) {
  const shown =
    snapshot.highlight || !snapshot.analyzed
      ? snapshot
      : {
          ...snapshot,
          highlight: {
            nodes: Object.fromEntries(snapshot.cuts.map((c) => [c, 'flagged' as const])),
            links: Object.fromEntries(snapshot.bridges.map((b) => [b, 'flagged' as const])),
          },
        }
  return <NetworkCanvas snapshot={shown} />
}
