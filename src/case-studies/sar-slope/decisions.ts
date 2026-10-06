// SPEC.md §19.1 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const sarDecisions: DecisionRow[] = [
  {
    requirement: 'Radios must pass traffic for each other; there is no infrastructure on the slope.',
    chosen: {
      name: 'Multihop ad hoc relaying',
      cost: 'every node is both host and router (Week 1, Loo p. 5)',
      reason: 'A relay forwards a report the team radio cannot deliver itself, and no access point is needed.',
      topicSlug: 'multihop',
    },
    rejected: [
      {
        name: 'A single-hop network',
        cost: 'every node is in range of every other (Week 1, Loo pp. 11-12)',
        reason: 'On a slope the team and the base camp are far out of each other’s range.',
        topicSlug: 'multihop',
      },
    ],
  },
  {
    requirement: 'Find a route only when someone has a report to send.',
    chosen: {
      name: 'Reactive discovery (AODV)',
      cost: 'low communication overhead, a discovery delay before the first packet (Week 2, Loo Table 2.1, p. 23)',
      reason: 'Reports are occasional, so paying for a route only when one is needed costs less than keeping every route fresh.',
      topicSlug: 'reactive-routing',
    },
    rejected: [
      {
        name: 'Proactive DSDV',
        cost: 'the overhead is large, so DSDV does not suit large networks (Week 2, Loo p. 28)',
        reason: 'Its control messages keep running even while nobody sends a report.',
        topicSlug: 'proactive-routing',
      },
    ],
  },
  {
    requirement: 'Spread the route request without a broadcast storm.',
    chosen: {
      name: 'MPR relays',
      cost: 'only the MPRs forward a node’s broadcasts, which cuts retransmissions (Week 3, Misra pp. 126-127; Loo p. 28)',
      reason: 'On this slope MPR relaying makes 6 transmissions instead of 8 and 9 duplicates instead of 15.',
      topicSlug: 'broadcast',
    },
    rejected: [
      {
        name: 'Blind flooding',
        cost: 'redundant rebroadcasts, contention, and collisions; more reliable because every node repeats the packet (Week 3, Misra pp. 122-123 and 139-142)',
        reason: 'Every radio repeats the request, which wastes the shared channel the reports need.',
        topicSlug: 'broadcast',
      },
    ],
  },
  {
    requirement: 'Know which relay the team cannot lose.',
    chosen: {
      name: 'Bridges and articulation points',
      cost: 'a bridge or an articulation point is the only way between two parts (Week 1, Misra Definition 1.4)',
      reason: 'The search names R1, R4, and R5 directly, so the team knows which relays to guard.',
      topicSlug: 'multihop',
    },
    rejected: [
      {
        name: 'Counting neighbors per radio',
        cost: 'a node of degree one is a pendant vertex, and removing it does not split the network (Week 1, Misra Definition 1.4)',
        reason: 'R4 has three neighbors and is still an articulation point.',
        topicSlug: 'multihop',
      },
    ],
  },
]
