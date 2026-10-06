// SPEC.md §7.3 Protocol spec for §10.8, from references/en/Week-5-Mobility-Propagation.md §3.1.
// A mobility model sends no messages, so every operation is an algorithm over the network.
import { meanDuration, pathAvailability } from '@/lib/sim/mobility'
import type { StructureSpec } from '@/types/step-engine'
import type { MobilitySnapshot } from './types'

export const mobilityStructure: StructureSpec<MobilitySnapshot> = {
  adt: {
    name: 'Mobility models',
    summary:
      'There is no protocol message here: a mobility model moves the nodes, and the links follow from where they end up (Misra 10.2, pp. 238-240).',
    operations: [],
    invariants: [
      'In random waypoint a node picks a random destination and speed, pauses on arrival, then picks again (Misra pp. 240-241).',
      'Random waypoint puts nodes in the middle more often than at the edges (Misra p. 241).',
      'With vmin at zero the average speed keeps falling, so this demo draws speeds from 0.3 to 1.0 units per tick (Misra p. 241).',
      'In RPGM each member does random waypoint without pauses inside a disc around its group’s reference point, which moves along a fixed path (Misra pp. 244-245).',
      'The 8 nodes, the 10 by 6 area, the range of 2.5, the pauses of 0 to 2 ticks, and the two groups of four are this demo’s choices.',
      'The metrics run sends one packet per tick on an AODV-style route that is found again when it breaks; a failed discovery is retried 2 ticks later. These are this simulator’s rules, not the books’.',
    ],
  },
  representations: {
    rwp: {
      label: 'Random waypoint',
      declaration: [
        'class Node:',
        '    x: float',
        '    y: float',
        '    waypoint: tuple  # the destination it walks to',
        '    speed: float     # drawn from 0.3 to 1.0 per waypoint',
        '    pause: int       # ticks left to wait at the waypoint',
      ],
      fields: [
        { name: 'waypoint', type: 'tuple', role: 'a random point in the area' },
        { name: 'speed', type: 'float', role: 'units per tick until the waypoint' },
        { name: 'pause', type: 'int', role: 'ticks the node waits before it picks again' },
      ],
    },
    rpgm: {
      label: 'Group (RPGM)',
      declaration: [
        'class Group:',
        '    ref: tuple       # the reference point',
        '    path: list       # corners it walks, one unit per tick',
        'class Node:',
        '    group: Group',
        '    waypoint: tuple  # a point within 1 of group.ref',
        '    speed: float',
      ],
      fields: [
        { name: 'ref', type: 'tuple', role: 'the group center, moved along its path every tick' },
        { name: 'waypoint', type: 'tuple', role: 'a random point within 1 unit of the reference point' },
        { name: 'speed', type: 'float', role: 'units per tick until the waypoint; members do not pause' },
      ],
    },
  },
  algorithms: ['advance-rwp', 'advance-rpgm', 'density', 'metrics'],
  liveFields: (s) => {
    const d = meanDuration(s)
    const p = pathAvailability(s)
    return {
      tick: s.tick,
      links: s.links.length,
      changes: s.linkChanges,
      lasts: d === null ? 'none' : d.toFixed(1),
      paths: p === null ? 'none' : `${Math.round(p)}%`,
    }
  },
}
