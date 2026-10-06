// SPEC.md §7.3 Protocol spec for §10.9, from references/en/Week-6-Modeling-Simulation.md §3.1 and §3.3.
// A graph model sends no messages, so every operation is an algorithm over the network.
import type { StructureSpec } from '@/types/step-engine'
import type { EvaluationSnapshot } from './types'

export const evaluationStructure: StructureSpec<EvaluationSnapshot> = {
  adt: {
    name: 'Network models and evaluation',
    summary:
      'There is no protocol message here: a graph model decides which links exist, and an evaluation reports metrics with their spread over several seeds (Loo 3.2.1, pp. 40-43; Misra pp. 272-273).',
    operations: [],
    invariants: [
      'In a unit disk graph two nodes are linked when they are at most the radius apart; even a small obstacle breaks the model (Loo pp. 40-41).',
      'In a quasi UDG a link always exists below q, may or may not exist between q and the radius, and never exists beyond it; q = 1 is a UDG again (Loo pp. 41-42).',
      'q = 0.8 and a draw below 0.5 for the band between q and the radius are this demo’s values; the course reference leaves both open.',
      'Wu’s algorithm marks a node that has two neighbors that are not neighbors of each other (Loo pp. 45-46).',
      'Pruning rule 1 unmarks a node whose closed neighborhood is covered by a marked neighbor with a larger id (Misra pp. 128-129).',
      'Metrics over seeds places 10 nodes in a 6 by 4 area with a radius of 2 and runs three flows of ten packets per seed over AODV-style routes; all of these are this simulator’s choices.',
      'A report gives metrics with their spread, not only means, and the number of replications and the seeds (Loo pp. 60 and 81-82; Misra pp. 22 and 272-273).',
    ],
  },
  representations: {
    udg: {
      label: 'Unit disk graph',
      declaration: ['def linked(d, radio_range):', '    return d <= radio_range'],
      fields: [{ name: 'radio_range', type: 'float', role: 'the radius of every node, 1.2 on the seed' }],
    },
    qudg: {
      label: 'Quasi unit disk graph',
      declaration: [
        'def linked(d, radio_range, q=0.8):  # q is this demo value',
        '    if d <= q * radio_range:',
        '        return True',
        '    if d > radio_range:',
        '        return False',
        '    return rng.random() < 0.5  # the probabilistic band',
      ],
      fields: [
        { name: 'q', type: 'float', role: 'the share of the radius below which a link always exists' },
        { name: 'seed', type: 'int', role: 'the draws repeat for the same seed' },
      ],
    },
  },
  algorithms: ['build-links', 'cds', 'metrics'],
  liveFields: (s) => ({ nodes: s.nodes.length, links: s.links.length, marked: s.marked.length, cds: s.cds.length }),
}
