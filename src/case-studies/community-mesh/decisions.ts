// SPEC.md §19.3 reasoning rows. Costs are quoted from the week reference each row names.
import type { DecisionRow } from '@/types/case-study'

export const meshDecisions: DecisionRow[] = [
  {
    requirement: 'Choose between a short route over weak links and a long route over strong ones.',
    chosen: {
      name: 'ETX',
      cost: 'fewer hops mean longer, weaker hops; ETX routes get better TCP throughput (Week 7, Misra pp. 368-369)',
      reason: 'On this mesh the four strong links cost ETX 4.43 against 8.00 for the two weak ones.',
      topicSlug: 'qos-routing',
    },
    rejected: [
      {
        name: 'Hop count',
        cost: 'every link counts the same (Week 7, Misra pp. 368-369)',
        reason: 'It picks S, X, D, where packets are lost when a hop fails all its tries.',
        topicSlug: 'qos-routing',
      },
    ],
  },
  {
    requirement: 'Keep delivering when a router lies about its routes.',
    chosen: {
      name: 'Watchdog and pathrater',
      cost: 'overhear the next hop and report it past a threshold (Week 8, Misra pp. 444-445)',
      reason: 'S notices that M never forwards, reports it after the fourth failure, and switches to the strong route.',
      topicSlug: 'routing-attacks',
    },
    rejected: [
      {
        name: 'Trusting every RREP',
        cost: 'the black hole attracts the route and drops everything (Week 8, Misra pp. 460-461)',
        reason: 'M’s claimed link wins under either metric, and nothing ever arrives.',
        topicSlug: 'routing-attacks',
      },
    ],
  },
  {
    requirement: 'Let the source see the whole path the watchdog checks.',
    chosen: {
      name: 'DSR-style source routing',
      cost: 'the watchdog suits only source routing protocols (Week 8, Misra pp. 444-445)',
      reason: 'S holds every candidate route, so it can avoid M as soon as M is reported.',
      topicSlug: 'reactive-routing',
    },
    rejected: [
      {
        name: 'AODV next-hop tables',
        cost: 'each node keeps only the next hop toward each destination (Week 2, Loo p. 20)',
        reason: 'S would know only its next hop, not the routers after it.',
        topicSlug: 'reactive-routing',
      },
    ],
  },
  {
    requirement: 'Judge the mesh by what the household gets.',
    chosen: {
      name: 'Packet delivery ratio, delay, and overhead',
      cost: 'the three most used metrics (Week 6, Misra pp. 86-87)',
      reason: 'They count the packets that arrive, not the route that looks shortest.',
      topicSlug: 'evaluation',
    },
    rejected: [
      {
        name: 'Route length alone',
        cost: 'fewer hops mean longer, weaker hops (Week 7, Misra pp. 368-369)',
        reason: 'The two shortest routes here are the weak one and the one through M.',
        topicSlug: 'qos-routing',
      },
    ],
  },
]
