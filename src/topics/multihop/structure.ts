// SPEC.md §7.3 Protocol spec for §10.1, from references/en/Week-1-Introduction.md.
// Multihop links exchange no named messages, so every operation is an algorithm over the network.
import type { StructureSpec } from '@/types/step-engine'
import type { MultihopSnapshot } from './types'

export const multihopStructure: StructureSpec<MultihopSnapshot> = {
  adt: {
    name: 'Multihop links',
    summary:
      'There is no protocol message here: every node is both host and router (Loo p. 5), and these operations decide which nodes can hear each other and which links the network cannot lose.',
    operations: [],
    invariants: [
      'Under the unit disk rule a link exists when two nodes are within range and not otherwise, a rough approximation of path loss (Misra pp. 8-9).',
      'Under shadowing a normally distributed fade is added, so a near node can miss a packet and a far one can still connect (Misra pp. 8-9).',
      'A bridge is a link whose removal increases the number of components; an articulation point is a node whose removal does the same (Misra Definition 1.4).',
      'ETX, the expected number of transmissions, is 1 divided by w(p,q) times w(q,p) (Misra Definitions 1.5 and 1.6).',
    ],
  },
  representations: {
    disk: {
      label: 'Unit disk links',
      declaration: [
        'class Network:',
        '    nodes: list        # id, x, y for every node, in tie-break order',
        '    links: set         # pairs within range, each stored once',
        '    radio_range: float',
        'def linked(d, radio_range):',
        '    return d <= radio_range',
      ],
      fields: [
        { name: 'nodes', type: 'list', role: 'every node with its position, in the order ties are broken' },
        { name: 'links', type: 'set', role: 'the pairs that can hear each other, each stored once' },
        { name: 'radio_range', type: 'float', role: 'the radius of every node, 2 on the seed' },
      ],
    },
    shadowing: {
      label: 'Shadowing links',
      declaration: [
        'class Network:',
        '    nodes: list        # id, x, y for every node',
        '    links: set         # pairs whose margin is at least 0 dB',
        '    radio_range: float # distance where the mean margin is 0 dB',
        '    seed: int          # the fades repeat for the same seed',
        'def linked(d, radio_range, n=2, sigma=4):  # n = 2 is free space; sigma is this demo value',
        '    fade = rng.gauss(0, sigma)',
        '    return 10 * n * log10(radio_range / d) + fade >= 0',
      ],
      fields: [
        { name: 'nodes', type: 'list', role: 'every node with its position' },
        { name: 'links', type: 'set', role: 'the pairs whose margin came out at least 0 dB' },
        { name: 'radio_range', type: 'float', role: 'the distance where the margin is 0 dB before the fade' },
        { name: 'seed', type: 'int', role: 'the random stream; the same seed gives the same fades' },
      ],
      invariants: [
        'The spread of 4 dB is a demo value: the Week 5 slide gives the Gaussian term without a number.',
      ],
    },
  },
  algorithms: ['build-links', 'find-bridges', 'link-etx'],
  liveFields: (s) => ({
    nodes: s.nodes.filter((n) => !n.down).length,
    links: s.links.filter((l) => !l.virtual && !l.broken).length,
    range: s.range,
    bridges: s.analyzed ? s.bridges.length : '?',
    cuts: s.analyzed ? s.cuts.length : '?',
  }),
}
