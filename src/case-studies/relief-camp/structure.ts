// SPEC.md §7.3 Protocol spec for the §19.2 simulator, quoting Weeks 4 to 6.
import type { StructureSpec } from '@/types/step-engine'
import type { CampSnapshot } from './types'

const declaration = [
  'class Volunteer:',
  '    address: int    # from a neighbor’s pool, Buddy',
  '    pool: list      # address ranges it can hand out',
  '    head: str       # its cluster head; itself for a head',
  '    group: Team     # RPGM only: the team it moves with',
]

const fields = [
  { name: 'address', type: 'int', role: 'unique without a server, taken from half of a neighbor’s pool' },
  { name: 'pool', type: 'list', role: 'the ranges this volunteer can split for a newcomer' },
  { name: 'head', type: 'str', role: 'the cluster head it hears; the highest id wins' },
]

export const campStructure: StructureSpec<CampSnapshot> = {
  adt: {
    name: 'Relief camp network',
    summary:
      'Volunteers get unique addresses from each other, group themselves around cluster heads, and keep the clusters together while the teams move (Misra pp. 31-32, 244-245, and 338-339).',
    operations: [
      {
        name: 'Address request',
        signature: 'join_buddy(new, via)',
        cost: { rpgm: '', rwp: '' },
        note: 'The neighbor a newcomer contacts gives it half of its address pool, and no other node is asked (Misra pp. 338-339).',
        operationIds: ['join'],
      },
    ],
    invariants: [
      'Buddy uses the address space unevenly when many newcomers join in one small area (Misra pp. 338-339).',
      'The node with the highest id among its undecided neighbors becomes a cluster head, and a node that hears two or more heads becomes a gateway (Misra pp. 31-32).',
      'In RPGM each member moves within a disc around its team’s reference point, which follows a fixed path (Misra pp. 244-245).',
      'The 256-address space, the range of 3, the loop of side 2 at 0.5 units per tick, the disc of 0.8, and the speeds of 0.3 to 0.8 are this demo’s choices.',
      'The metrics run sends one packet per tick on four flows for 30 ticks over AODV-style routes; the numbers are this simulator’s.',
    ],
  },
  representations: {
    rpgm: { label: 'Teams move together (RPGM)', declaration, fields },
    rwp: { label: 'Everyone moves alone (RWP)', declaration, fields },
  },
  algorithms: ['elect', 'advance', 'metrics'],
  liveFields: (s) => ({
    tick: s.tick,
    heads: s.nodes.filter((n) => s.head[n.id] === n.id).length,
    elections: s.elections,
    free: s.space - s.nodes.filter((n) => s.address[n.id] != null).length,
  }),
}
