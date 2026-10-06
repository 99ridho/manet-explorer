// SPEC.md §7.3 Protocol spec for §10.11, from references/en/Week-8-Security-Trust.md.
import type { StructureSpec } from '@/types/step-engine'
import type { AttackSnapshot } from './types'

const node = [
  'class Node:',
  '    routes: list     # every route an RREP brought, in order of arrival',
  '    failures: dict   # {neighbor: packets it never forwarded}',
  '    flagged: set     # neighbors reported past the threshold',
]

const fields = [
  { name: 'routes', type: 'list', role: 'the routes the source learned; the first to arrive is used' },
  { name: 'failures', type: 'dict', role: 'the watchdog’s count of packets each next hop never forwarded' },
  { name: 'flagged', type: 'set', role: 'nodes reported to the source, which the pathrater avoids' },
]

export const attacksStructure: StructureSpec<AttackSnapshot> = {
  adt: {
    name: 'Routing attacks and the watchdog',
    summary:
      'An attacker who answers or relays route requests faster than honest nodes ends up on the route; the watchdog listens to the next hop and reports a node that drops what it should forward (Misra pp. 444-445 and 460-462).',
    operations: [
      {
        name: 'RREQ',
        signature: 'RREQ(src, dst, record)',
        cost: '',
        note: 'Discovery is DSR-style, because the watchdog suits source routing (Misra pp. 444-445).',
        operationIds: ['discover'],
      },
      {
        name: 'RREP',
        signature: 'RREP(route)',
        cost: '',
        note: 'The source keeps every route an RREP brings and uses the first to arrive, which is what a black hole exploits.',
      },
      {
        name: 'Data',
        signature: 'DATA(p)',
        cost: '',
        note: 'A data packet follows the route the source picked, through the tunnel if the route crosses one.',
        operationIds: ['send'],
      },
    ],
    invariants: [
      'A black hole claims a route to D, so S sends its data through it, and it drops every packet without a trace (Misra pp. 460-461).',
      'A wormhole tunnels routing messages between two areas, so the route through it looks shortest; encryption does not prevent it (Misra pp. 461-462).',
      'The watchdog keeps a copy of a packet, listens for the next node to forward it, and reports a node whose failures pass a threshold (Misra pp. 444-445).',
      'The threshold of 3 is this demo’s, and a forward into the tunnel counts as heard; the watchdog cannot detect collaborative attacks (Misra pp. 444-445).',
    ],
  },
  representations: {
    blackhole: { label: 'Black hole', declaration: node, fields },
    wormhole: { label: 'Wormhole', declaration: node, fields },
    none: { label: 'No attacker', declaration: node, fields },
  },
  algorithms: ['watchdog'],
  liveFields: (s) => {
    const fields: Record<string, string | number> = {
      sent: s.sent,
      delivered: s.delivered,
      dropped: s.dropped,
      pdr: s.sent ? `${Math.round((100 * s.delivered) / s.sent)}%` : 'none',
    }
    if (s.attacker === 'wormhole') fields.tunneled = s.tunneled
    else fields.flagged = s.flagged.length ? s.flagged.join(' ') : 0
    return fields
  },
}
