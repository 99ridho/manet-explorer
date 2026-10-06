// SPEC.md §7.3 Protocol spec for §10.10, from references/en/Week-7-QoS-Congestion-Energy.md.
import type { StructureSpec } from '@/types/step-engine'
import { minBandwidth, pathEtx, weakestRelay } from './operations'
import type { QosSnapshot } from './types'

const node = ['class Node:', '    neighbors: dict  # {neighbor: Link}', '    battery: int     # units left; 0 takes the node down']

export const qosStructure: StructureSpec<QosSnapshot> = {
  adt: {
    name: 'QoS, ETX, and energy-aware routing',
    summary:
      'The route is the best feasible path for a metric, not always the shortest one: a bandwidth request, link quality, or the batteries of the relays decide it (Misra 12.8, p. 298; Loo p. 203).',
    operations: [
      {
        name: 'Data',
        signature: 'DATA(p)',
        cost: '',
        note: 'Every relay on the path spends one unit of battery per packet in this demo, and a relay at 0 goes down.',
        operationIds: ['send'],
      },
    ],
    invariants: [
      'QoS routing looks for the best feasible path that meets a set of constraints; for a 3 Mbps request from A to E it picks A-B-C-E over the shorter A-D-E (Misra 12.8, p. 298).',
      'ETX is one divided by the product of the forward and reverse delivery ratios; ETX routes take more, shorter hops and still get better TCP throughput (Misra pp. 368-369).',
      'Total energy and network lifetime are different goals: the path with the lowest total energy can drain one critical node faster (Loo p. 203).',
      'The bandwidths, delivery ratios, and batteries on the seed are example values; the slide gives only the topology and the request.',
    ],
  },
  representations: {
    bandwidth: {
      label: 'Bandwidth',
      declaration: [...node, 'class Link:', '    bandwidth: int   # Mbps, an example value'],
      fields: [{ name: 'bandwidth', type: 'int', role: 'the capacity a link offers; links below the request are pruned' }],
    },
    etx: {
      label: 'ETX',
      declaration: [...node, 'class Link:', '    w: float         # delivery ratio one way', '    w_back: float    # and the other'],
      fields: [
        { name: 'w', type: 'float', role: 'the forward delivery ratio, learned from probe packets' },
        { name: 'w_back', type: 'float', role: 'the reverse delivery ratio' },
      ],
    },
    energy: {
      label: 'Energy',
      declaration: [...node],
      fields: [{ name: 'battery', type: 'int', role: 'the units a relay has left; the path keeps the weakest relay as strong as possible' }],
    },
    hop: {
      label: 'Hop count',
      declaration: [...node],
      fields: [{ name: 'neighbors', type: 'dict', role: 'every link counts the same' }],
    },
  },
  algorithms: ['path-bandwidth', 'path-etx', 'path-energy', 'path-hop'],
  liveFields: (s) => {
    const p = s.path
    const weakest = p ? weakestRelay(s, p) : null
    const cost =
      !p ? 'none'
      : s.metric === 'etx' ? pathEtx(s, p).toFixed(2)
      : s.metric === 'energy' ? (weakest ?? 'none')
      : s.metric === 'bandwidth' ? `${minBandwidth(s, p)} Mbps`
      : p.length - 1
    return { hops: p ? p.length - 1 : 'none', cost, minBatt: weakest ?? 'n/a', sent: s.sent }
  },
}
