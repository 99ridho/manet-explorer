// SPEC.md §7.3 Protocol spec for §10.6, from references/en/Week-4-Self-Organization.md §3.1.
import type { StructureSpec } from '@/types/step-engine'
import type { ClusterSnapshot } from './types'

const declaration = [
  'class Node:',
  '    id: int',
  '    head: Node     # itself for a cluster head, None while undecided',
  '    gateway: bool  # hears two or more cluster heads',
]

const fields = [
  { name: 'head', type: 'Node', role: 'the cluster head one hop away; ordinary nodes talk through it' },
  { name: 'gateway', type: 'bool', role: 'set on a node connected to two or more cluster heads (Misra pp. 31-32)' },
]

export const clusterStructure: StructureSpec<ClusterSnapshot> = {
  adt: {
    name: 'LCA clustering',
    summary:
      'Nodes elect cluster heads by an ID rule and join one a hop away, so the network gets a two-level structure without a center (Misra pp. 31-32).',
    operations: [],
    invariants: [
      'Every ordinary node is one hop from its cluster head.',
      'A node connected to two or more cluster heads becomes a gateway (Misra pp. 31-32).',
      'Choosing the minimum number of cluster heads is NP-hard, which is why the ID rule is used (Misra pp. 31-32).',
      'LCA periodically discards its topology information and rebuilds from scratch (Misra pp. 31-32); this demo repairs only the clusters a leaving or joining node touches.',
    ],
  },
  representations: {
    highest: {
      label: 'Highest-ID rule',
      declaration,
      fields,
      invariants: [
        'The node with the highest ID among its neighbors that do not yet have a cluster head declares itself a cluster head (Misra pp. 31-32).',
      ],
    },
    lowest: {
      label: 'Lowest-ID rule',
      declaration,
      fields,
      invariants: ['Variations use the lowest ID or the node with the most neighbors (Misra pp. 31-32).'],
    },
  },
  algorithms: ['elect', 'leave', 'join'],
  liveFields: (s) => ({
    nodes: s.nodes.length,
    heads: s.nodes.filter((n) => s.head[n.id] === n.id).length,
    gateways: s.gateways.length,
    elections: s.elections,
  }),
}
