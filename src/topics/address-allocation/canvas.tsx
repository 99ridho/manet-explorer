// SPEC.md §10.7 canvas: every node shows its address (and its pool under Buddy); the partition
// is drawn faded, without its link, until Merge brings it into range.
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { addressLabels } from './operations'
import type { AddressSnapshot } from './types'

export function AddressCanvas({ snapshot }: { snapshot: AddressSnapshot; variant?: string }) {
  const faded = snapshot.merged ? [] : snapshot.partition.nodes.map((n) => ({ ...n, down: true }))
  return <NetworkCanvas snapshot={{ ...snapshot, nodes: [...snapshot.nodes, ...faded] }} nodeLabels={addressLabels(snapshot)} />
}
