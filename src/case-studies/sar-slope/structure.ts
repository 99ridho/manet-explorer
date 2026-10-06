// SPEC.md §7.3 Protocol spec for the §19.1 simulator, quoting Weeks 1 to 3.
import type { StructureSpec } from '@/types/step-engine'
import { currentRoute } from './operations'
import type { SarSnapshot } from './types'

const declaration = [
  'class Radio:',
  '    reverse: dict  # {src: neighbor the first RREQ came from}',
  '    route: dict    # {dst: next hop}, set by the RREP',
  '    mpr: list      # neighbors that relay for this radio',
]

export const sarStructure: StructureSpec<SarSnapshot> = {
  adt: {
    name: 'SAR relay network',
    summary:
      'Team radios and trail relays pass reports to the base camp gateway on their own: AODV finds a route on demand, and MPR relays keep its flood small (Loo pp. 8-9 and 20-22; Misra pp. 126-127).',
    operations: [
      {
        name: 'RREQ',
        signature: 'RREQ(src, gateway)',
        cost: {
          mpr: 'Only the MPRs forward a node’s broadcasts, which cuts retransmissions (Loo p. 28).',
          flooding: 'Redundant rebroadcasts, medium contention, and collisions (Misra pp. 122-123).',
        },
        note: 'The first copy a radio hears sets its way back to the source.',
        operationIds: ['discover-mpr', 'discover-flooding'],
      },
      {
        name: 'RREP',
        signature: 'RREP(gateway)',
        cost: { mpr: '', flooding: '' },
        note: 'G answers along the reverse path, and every radio on it learns its next hop toward G.',
      },
      {
        name: 'RERR',
        signature: 'RERR(gateway)',
        cost: { mpr: '', flooding: '' },
        note: 'When a radio on the route walks away, the radios before it delete their route to G.',
        operationIds: ['walk-away'],
      },
      {
        name: 'Data',
        signature: 'DATA(gateway, report)',
        cost: { mpr: '', flooding: '' },
        note: 'A report follows the next hops the RREP set.',
        operationIds: ['send'],
      },
    ],
    invariants: [
      'Every radio is both host and router (Loo p. 5).',
      'A radio relays an RREQ only once; under MPR relaying it relays only for a neighbor that chose it as an MPR.',
      'Blind flooding is more reliable precisely because every node repeats the packet (Misra pp. 139-142).',
      'A bridge or an articulation point is the only way between two parts of the network (Misra Definition 1.4).',
      'The metrics run sends 5 reports from each team radio on the tick model; nothing in it is random, and the numbers are this simulator’s.',
    ],
  },
  representations: {
    mpr: { label: 'MPR relays', declaration, fields: [{ name: 'mpr', type: 'list', role: 'the neighbors that relay this radio’s broadcasts' }] },
    flooding: { label: 'Blind flooding', declaration, fields: [{ name: 'reverse', type: 'dict', role: 'the way back to each source; every radio relays once' }] },
  },
  algorithms: ['metrics'],
  liveFields: (s) => {
    const route = currentRoute(s, s.flow)
    return { tx: s.tx, dupes: s.dupes, hops: route ? route.length - 1 : 'none', bridges: s.bridges.length }
  },
}
