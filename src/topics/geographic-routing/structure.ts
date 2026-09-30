// SPEC.md §7.3 Protocol spec for §10.5, from references/en/Week-3-Broadcast-Multicast-Geographic.md §3.3.
import { dist } from '@/lib/sim/geometry'
import type { StructureSpec } from '@/types/step-engine'
import type { GeoSnapshot } from './types'

export const geoStructure: StructureSpec<GeoSnapshot> = {
  adt: {
    name: 'Geographic routing: greedy and perimeter',
    summary:
      'A node forwards a packet to the neighbor closest to the destination, using positions instead of a routing table, and walks around a void on a planar graph when no neighbor is closer (Misra pp. 157-165).',
    operations: [
      {
        name: 'Beacon',
        signature: 'BEACON(id, position)',
        cost: '',
        note: 'Periodic beacons tell a node where its neighbors are (Misra pp. 157-158).',
      },
      {
        name: 'Data',
        signature: 'DATA(dst, dst_position, payload)',
        cost: '',
        note: 'The source writes the destination’s position in the header, so every node on the way knows it (Misra pp. 154-155).',
        operationIds: ['route'],
      },
    ],
    invariants: [
      'Greedy mode moves the packet only to a neighbor closer to the destination, so the distance shrinks at every hop and the packet cannot loop (Misra pp. 158-159).',
      'Greedy mode resumes once the packet reaches a node closer to the destination than the node where the void occurred (Misra pp. 161-165).',
      'A wireless graph has to be planarized before the perimeter walk, for example with the Gabriel graph (Misra pp. 161-165).',
      'This demo sweeps clockwise from the direction of the destination, or of the previous node, and takes the first planar link.',
      'Perimeter mode follows the edges of a face with the right-hand rule, so the live field shows it as mode = face (Misra pp. 161-165).',
    ],
  },
  representations: {
    default: {
      label: 'Neighbor table',
      declaration: [
        'class Node:',
        '    position: tuple  # (x, y) from GPS or localization',
        '    neighbors: dict  # {id: (x, y)} from beacons',
      ],
      fields: [
        { name: 'position', type: 'tuple', role: 'the node’s own coordinates, from GPS or localization (Misra pp. 154-155)' },
        { name: 'neighbors', type: 'dict', role: 'neighbor positions; no routing table is needed (Misra pp. 153-154)' },
      ],
      invariants: ['A topology change matters only if the sender’s neighbors change (Misra pp. 153-154).'],
    },
  },
  liveFields: (s) => {
    const byId = new Map(s.nodes.map((n) => [n.id, n]))
    const at = s.flow ? byId.get(s.flow.at) : undefined
    const dst = s.flow ? byId.get(s.flow.dst) : undefined
    return {
      hops: s.hops,
      mode: s.mode === 'perimeter' ? 'face' : 'greedy',
      voids: s.voids,
      dist: at && dst ? dist(at, dst).toFixed(2) : 'none',
    }
  },
}
