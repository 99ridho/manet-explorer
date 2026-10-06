// SPEC.md §7.3 Protocol spec for §10.2, from references/en/Week-2-Routing.md §3.2.
import type { StructureSpec } from '@/types/step-engine'
import type { DsdvSnapshot } from './types'

const declaration = [
  'class Route:',
  '    next: str     # the neighbor to forward to',
  '    metric: int   # hops to the destination',
  '    seq: int      # created by the destination; newer wins',
  'class Node:',
  '    seq: int      # its own sequence number',
  '    table: dict   # {dest: Route}, one row per destination',
]

const fields = [
  { name: 'seq', type: 'int', role: 'the sequence number this node puts on its own row' },
  { name: 'table', type: 'dict', role: 'a route to every destination at all times, with hop count and sequence number' },
]

export const proactiveStructure: StructureSpec<DsdvSnapshot> = {
  adt: {
    name: 'DSDV',
    summary:
      'Bellman-Ford adapted to MANETs: every node keeps every destination, and a sequence number created by the destination decides which route is newer (Misra pp. 66-67).',
    operations: [
      {
        name: 'Update',
        signature: 'Update(rows)  # each row: dest, metric, seq',
        cost: {
          incremental:
            'Only the changed entries are sent; under high mobility the update swells toward the size of an NPDU (Misra p. 66).',
          full: 'The whole table is sent, which is expensive in bandwidth (Misra p. 66).',
        },
        note: 'Tables are sent periodically, and sent at once when something important changes.',
        operationIds: ['advertise', 'move'],
      },
    ],
    invariants: [
      'A route with a newer sequence number replaces an older one, which prevents loops and stale routes (Misra pp. 66-67).',
      'With the same sequence number, the route with fewer hops wins.',
      'The overhead is large, so DSDV does not suit large networks, and it works only with two-way links (Loo p. 28).',
      'This demo raises a moved node’s own sequence number by 1; the course reference does not fix the step.',
      'In this demo a new neighbor sends the moved node its whole table once, so an incremental update does not hide routes that did not change; the slides do not describe this case.',
    ],
  },
  representations: {
    incremental: {
      label: 'Incremental updates',
      declaration,
      fields,
      invariants: ['An advertisement carries only the rows marked changed, then clears the marks.'],
    },
    full: {
      label: 'Full dumps',
      declaration,
      fields,
      invariants: ['An advertisement carries every row of the table.'],
    },
  },
  liveFields: (s) => ({ nodes: s.nodes.length, updates: s.updates, rowsSent: s.rowsSent }),
}
