// The live fields of SPEC.md §10.6: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { ClusterSnapshot } from './types'

export const clusterLiveFields: LiveFields<ClusterSnapshot> = (s) => ({
  nodes: s.nodes.length,
  heads: s.nodes.filter((n) => s.head[n.id] === n.id).length,
  gateways: s.gateways.length,
  elections: s.elections,
})
