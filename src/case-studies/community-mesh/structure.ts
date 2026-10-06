// SPEC.md §7.3 Protocol spec for the §19.3 simulator, quoting Weeks 1, 6, 7, and 8.
import type { StructureSpec } from '@/types/step-engine'
import type { MeshSnapshot } from './types'

const declaration = [
  'class Router:',
  '    w: dict          # {neighbor: delivery ratio}, from probe packets',
  '    routes: list     # every route an RREP brought, in order of arrival',
  '    failures: dict   # watchdog: packets a next hop never forwarded',
]

export const meshStructure: StructureSpec<MeshSnapshot> = {
  adt: {
    name: 'Community mesh',
    summary:
      'Rooftop routers pick a route to the gateway by link quality and keep an eye on the next hop, so a weak link or a lying router costs the household as little as possible (Misra pp. 368-369 and 444-445).',
    operations: [
      {
        name: 'RREQ',
        signature: 'RREQ(src, dst, record)',
        cost: { 'etx-watchdog': '', hop: '' },
        note: 'A DSR-style flood: the source keeps every route an RREP brings and picks one by its rule.',
        operationIds: ['route'],
      },
      {
        name: 'Advertisement',
        signature: 'advertise(link_to, w)',
        cost: { 'etx-watchdog': '', hop: '' },
        note: 'M claims a perfect link to D that does not exist, which attracts every route request.',
        operationIds: ['join-m'],
      },
      {
        name: 'Data',
        signature: 'DATA(p)',
        cost: {
          'etx-watchdog': 'Each node broadcasts probe packets periodically to measure its links (Misra pp. 368-369).',
          hop: '',
        },
        note: 'Each hop tries up to 4 times, and a try needs both the frame and its ACK.',
        operationIds: ['deliver'],
      },
    ],
    invariants: [
      'ETX is one divided by the product of the forward and reverse delivery ratios (Misra Definitions 1.5 and 1.6; pp. 368-369).',
      'Fewer hops means longer hops, and link quality falls with distance (Misra pp. 368-369).',
      'The watchdog reports a next hop whose failures pass a threshold; this demo’s threshold is 3 (Misra pp. 444-445).',
      'Week 3 gives 4 to 7 retransmissions before a timeout for 802.11 unicast; this demo uses 4 (Misra pp. 139-142).',
      'The delivery ratios are example values, and the metrics run counts one tick per try; the numbers are this simulator’s.',
    ],
  },
  representations: {
    'etx-watchdog': { label: 'ETX with watchdog', declaration, fields: [{ name: 'failures', type: 'dict', role: 'the watchdog’s count per next hop' }] },
    hop: { label: 'Hop count', declaration, fields: [{ name: 'routes', type: 'list', role: 'the routes learned; the fewest hops wins, the first to arrive on a tie' }] },
  },
  algorithms: ['metrics'],
  liveFields: (s) => ({
    sent: s.sent,
    delivered: s.delivered,
    dropped: s.dropped,
    pdr: s.sent ? `${Math.round((100 * s.delivered) / s.sent)}%` : 'none',
    flagged: s.flagged.length ? s.flagged.join(' ') : 0,
  }),
}
