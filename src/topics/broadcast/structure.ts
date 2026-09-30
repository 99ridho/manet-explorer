// SPEC.md §7.3 Protocol spec for §10.4, from references/en/Week-3-Broadcast-Multicast-Geographic.md §3.1.
import type { StructureSpec } from '@/types/step-engine'
import { sourceOf } from './operations'
import type { BroadcastSnapshot } from './types'

export const broadcastStructure: StructureSpec<BroadcastSnapshot> = {
  adt: {
    name: 'Broadcast: blind flooding and MPR',
    summary:
      'A packet reaches nodes beyond the source’s range only when other nodes forward it, and the relay rule decides how many copies that costs (Misra pp. 122-127).',
    operations: [
      {
        name: 'Broadcast packet',
        signature: 'PKT(src, payload)',
        cost: {
          flooding:
            'Every node that receives the packet for the first time rebroadcasts it, so neighbors get redundant copies (Misra pp. 122-123).',
          mpr: 'Only the MPRs of the node a copy came from forward it (Misra pp. 126-127).',
        },
        note: 'One transmission reaches every neighbor in range at once.',
        operationIds: ['broadcast-flooding', 'broadcast-mpr'],
      },
      {
        name: 'HELLO',
        signature: 'HELLO(sender, neighbors)',
        cost: '',
        note: 'Two-hop information comes from beacons (Misra p. 125); this demo recomputes every MPR set as soon as a link changes.',
        operationIds: ['remove-link'],
      },
    ],
    invariants: [
      'A node transmits a broadcast packet at most once; every later copy it hears is a duplicate.',
      'Every two-hop neighbor of a node is a neighbor of at least one of its MPRs.',
      'MPR selection depends on the source, so a relay has to know who broadcast before it (Misra p. 128).',
    ],
  },
  representations: {
    mpr: {
      label: 'MPR set per node',
      declaration: [
        'class Node:',
        '    mpr: set   # neighbors chosen to relay my broadcasts',
        '    seen: set  # packets already received',
      ],
      fields: [
        { name: 'mpr', type: 'set', role: 'chosen by greedy set cover so that every two-hop neighbor is covered' },
        { name: 'seen', type: 'set', role: 'packets already received, so later copies are duplicates' },
      ],
      invariants: ['Finding the smallest forwarding set is minimum set cover, which is NP-complete, so a greedy heuristic is used (Misra pp. 125-126).'],
    },
    flooding: {
      label: 'Blind flooding',
      declaration: ['class Node:', '    seen: set  # packets already received'],
      fields: [{ name: 'seen', type: 'set', role: 'packets already received; the first copy is rebroadcast at once' }],
      invariants: ['Blind flooding is wasteful but the most reliable, because every node repeats the packet (Misra pp. 139-142).'],
    },
  },
  algorithms: ['select-mpr'],
  liveFields: (s, variant) => {
    const fields: Record<string, string | number> = { tx: s.tx, dups: s.dups, reached: s.reached }
    const src = sourceOf(s)
    if ((variant ?? s.relay) === 'mpr') fields.mprs = src ? (s.mpr[src]?.length ?? 0) : 'none'
    return fields
  },
}
