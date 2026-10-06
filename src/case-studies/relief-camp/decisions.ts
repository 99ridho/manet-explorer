// SPEC.md §19.2 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const campDecisions: DecisionRow[] = [
  {
    requirement: 'Every radio needs a unique address, and there is no server.',
    chosen: {
      name: 'Buddy allocation',
      cost: 'a node hands half its pool to the newcomer without asking anyone; the space is used unevenly when many join in one area (Week 4, Misra pp. 338-339)',
      reason: 'A join needs only the neighbor the newcomer meets, which still works when a team is out of range of the rest.',
      topicSlug: 'address-allocation',
    },
    rejected: [
      {
        name: 'MANETconf',
        cost: 'the initiator asks every node for permission (Week 4, Misra pp. 337-338)',
        reason: 'Every join would wait for the whole camp to answer.',
        topicSlug: 'address-allocation',
      },
      {
        name: 'Query-based DAD',
        cost: 'fails if the delay is unbounded during a partition (Week 4, Misra pp. 337-341)',
        reason: 'Teams that walk out of range split the camp, which is exactly when the query cannot be trusted.',
        topicSlug: 'address-allocation',
      },
    ],
  },
  {
    requirement: 'Organize the radios so control traffic does not reach everyone.',
    chosen: {
      name: 'Highest-ID clustering (LCA)',
      cost: 'the highest id among undecided neighbors becomes a head; a node hearing two heads becomes a gateway (Week 4, Misra pp. 31-32)',
      reason: 'Each neighborhood gets one head, and gateways join the clusters without involving everyone.',
      topicSlug: 'clustering',
    },
    rejected: [
      {
        name: 'A flat network',
        cost: 'simpler, but scalability drops as the node count grows (Week 1, Loo pp. 12-14)',
        reason: 'Control messages would spread through the whole camp.',
        topicSlug: 'multihop',
      },
    ],
  },
  {
    requirement: 'Test the camp with movement that looks like the camp.',
    chosen: {
      name: 'RPGM',
      cost: 'group models fit real groups such as SAR teams (Week 5, Misra pp. 244-245)',
      reason: 'Members stay near their team, so the test sees the clusters the camp would really have.',
      topicSlug: 'mobility',
    },
    rejected: [
      {
        name: 'Random waypoint',
        cost: 'easy to use, but hard to match to a real scenario (Week 5, Misra pp. 244-245)',
        reason: 'Volunteers would wander alone, which the camp does not do.',
        topicSlug: 'mobility',
      },
    ],
  },
  {
    requirement: 'Report the result so someone else can check it.',
    chosen: {
      name: 'The seed, the parameters, and the spread',
      cost: 'a report gives the scenario, every parameter, the seeds, and metrics with their spread (Week 6, Loo pp. 60 and 81-82; Misra pp. 22 and 272-273)',
      reason: 'Another student can rerun the same seed and get the same numbers.',
      topicSlug: 'evaluation',
    },
    rejected: [
      {
        name: 'A single mean from one run',
        cost: 'results need their spread, not only means (Week 6, Misra pp. 272-273)',
        reason: 'One run cannot show whether a difference is the design or the luck of the seed.',
        topicSlug: 'evaluation',
      },
    ],
  },
]
