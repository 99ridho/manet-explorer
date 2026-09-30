// SPEC.md §7.3 Protocol spec for §10.7, from references/en/Week-4-Self-Organization.md §3.3.
import type { StructureSpec } from '@/types/step-engine'
import type { AddressSnapshot } from './types'

export const addressStructure: StructureSpec<AddressSnapshot> = {
  adt: {
    name: 'Address allocation: Buddy and query-based DAD',
    summary:
      'A new node gets a unique address without a DHCP server, either from half of a neighbor’s pool (Buddy) or by asking whether a random address is taken (QDAD) (Misra pp. 337-339).',
    operations: [
      {
        name: 'Pool split',
        signature: 'give_half(new, range)',
        cost: {
          buddy: 'The node a newcomer contacts gives it half of its pool, so no node needs permission (Misra pp. 338-339).',
          qdad: '',
        },
        note: 'Buddy only: the new node takes the first address of the half it receives.',
        operationIds: ['join-buddy'],
      },
      {
        name: 'Goodbye',
        signature: 'return_pool(neighbor, ranges)',
        cost: '',
        note: 'Buddy only: a node that leaves properly returns its pool to a neighbor to merge again (Misra pp. 338-339).',
        operationIds: ['leave-buddy'],
      },
      {
        name: 'AREQ',
        signature: 'AREQ(address)',
        cost: {
          buddy: '',
          qdad: 'QDAD repeats the AREQ up to a retry limit, and it fails if the delay is unbounded during a partition (Misra pp. 337-341).',
        },
        note: 'QDAD only: the new node floods it to ask whether any node already uses the address.',
        operationIds: ['join-qdad'],
      },
      {
        name: 'AREP',
        signature: 'AREP(address)',
        cost: '',
        note: 'QDAD only: the node that owns the address answers, so the new node picks again.',
      },
    ],
    invariants: [
      'No two nodes in one network use the same address; a conflict can appear only when two partitions merge.',
      'MANETconf gives each partition an ID so two nodes that meet can tell a merge is happening (Misra p. 338).',
      'The 16-address space and the limit of 3 AREQ tries are this demo’s choices.',
    ],
  },
  representations: {
    buddy: {
      label: 'Buddy address pool',
      declaration: [
        'class Node:',
        '    address: int',
        '    pool: list  # [(lo, hi)], the ranges this node may hand out',
      ],
      fields: [
        { name: 'address', type: 'int', role: 'the first address of the range the node received' },
        { name: 'pool', type: 'list', role: 'ranges the node holds; the address table is split among all nodes (Misra pp. 338-339)' },
      ],
      invariants: [
        'A node that vanishes suddenly takes its pool with it, so nodes need periodic synchronization (Misra pp. 338-339); this demo shows the leak only.',
      ],
    },
    qdad: {
      label: 'Query-based DAD',
      declaration: ['class Node:', '    address: int  # chosen at random, kept once no AREP comes back'],
      fields: [{ name: 'address', type: 'int', role: 'a random address that got no AREP after the tries' }],
      invariants: [
        'Strong DAD cannot be guaranteed when the delay between nodes is unbounded, which often happens when a network splits and merges (Misra pp. 341-343).',
      ],
    },
  },
  algorithms: ['crash-buddy', 'merge'],
  liveFields: (s, variant): Record<string, number> => {
    const nodes = s.nodes.length
    if ((variant ?? s.scheme) === 'qdad') return { nodes, control: s.control, conflicts: s.conflicts }
    const held = s.nodes.reduce((t, n) => t + (s.pool[n.id] ?? []).reduce((u, r) => u + r[1] - r[0] + 1, 0), 0)
    const used = s.nodes.filter((n) => s.address[n.id] != null).length
    return { nodes, free: held - used, leaked: s.leaked, conflicts: s.conflicts }
  },
}
