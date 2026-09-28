// SPEC.md §7.3 Protocol spec for §10.3, from references/en/Week-2-Routing.md §3.3.
import type { StructureSpec } from '@/types/step-engine'
import { currentRoute } from './operations'
import type { ReactiveSnapshot } from './types'

export const reactiveStructure: StructureSpec<ReactiveSnapshot> = {
  adt: {
    name: 'Reactive routing: AODV and DSR',
    summary:
      'A source looks for a route only when it has data, so the cost moves from periodic messages to a discovery delay (Loo pp. 20-22).',
    operations: [
      {
        name: 'RREQ',
        signature: 'RREQ(src, request_id, dst)',
        cost: {
          aodv: 'Reactive protocols have low communication overhead (Loo Table 2.1, p. 23).',
          dsr: 'Flooded, and RREQ flooding can reach every node (Loo p. 25).',
        },
        note: 'A node forwards the first copy of a request and drops the later ones; DSR also adds its address to the route record.',
        operationIds: ['discover-aodv', 'discover-dsr'],
      },
      {
        name: 'RREP',
        signature: 'RREP(dst)',
        cost: '',
        note: 'The destination answers as unicast along the reverse path (AODV) or the reversed route record (DSR), at the end of Discover route.',
      },
      {
        name: 'RERR',
        signature: 'RERR(unreachable_dst)',
        cost: '',
        note: 'The nodes at both ends of a broken link send it toward the route ends, and the entries that used the link are deleted (Loo p. 23).',
        operationIds: ['break-link'],
      },
      {
        name: 'Data',
        signature: 'DATA(dst, payload)',
        cost: {
          aodv: '',
          dsr: 'The header holds the full route, so it grows with the route length (Loo p. 25).',
        },
        note: 'A data packet follows the route the last discovery found.',
        operationIds: ['send-aodv', 'send-dsr'],
      },
    ],
    invariants: [
      'A node forwards only the first copy of an RREQ; later copies are dropped, and the first one sets the reverse path.',
      'The source starts a new discovery with a new request id; AODV does not repair a broken route locally (Loo p. 23).',
      'AODV uses the destination sequence number to pick the most recent route; this demo does not model it.',
    ],
  },
  representations: {
    aodv: {
      label: 'AODV next-hop table',
      declaration: [
        'class Node:',
        '    reverse: dict  # {src: neighbor the first RREQ came from}',
        '    route: dict    # {dst: next hop}, set by the RREP',
        '    seen: set      # {(src, request_id)} already forwarded',
      ],
      fields: [
        { name: 'reverse', type: 'dict', role: 'the way back to each source, recorded from the first RREQ copy' },
        { name: 'route', type: 'dict', role: 'the next hop toward each destination; unused entries expire on a timer (Loo p. 23)' },
        { name: 'seen', type: 'set', role: 'requests already forwarded, so later copies are dropped' },
      ],
      invariants: ['Every node on a route keeps only the next hop, never the whole path.'],
    },
    dsr: {
      label: 'DSR route cache',
      declaration: [
        'class Node:',
        "    cache: dict    # {dst: full route}, e.g. {'D': ['S', 'A', 'C', 'D']}",
        '    seen: set      # {(src, request_id)} already forwarded',
      ],
      fields: [
        { name: 'cache', type: 'dict', role: 'full routes the node has learned, which reduces repeated flooding' },
        { name: 'seen', type: 'set', role: 'requests already forwarded, so later copies are dropped' },
      ],
      invariants: [
        'A node processes an RREQ only if it has not processed it before and its address is not already in the route record.',
      ],
    },
  },
  liveFields: (s, variant) => {
    const route = s.flow ? currentRoute(s, s.flow.src, s.flow.dst) : null
    const fields: Record<string, string | number> = {
      rreqTx: s.rreqTx,
      control: s.control,
      hops: route ? route.length - 1 : 'none',
      requestId: s.requestId,
    }
    if ((variant ?? s.protocol) === 'dsr') fields.header = route ? route.length : 'none'
    return fields
  },
}
