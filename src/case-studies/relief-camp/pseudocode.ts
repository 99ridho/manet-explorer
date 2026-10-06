// SPEC.md §19.2 listings in the §7.1 Python style; Elect is the §10.6 listing.
import { metricsListing, ML } from '@/lib/sim/metrics'

export const campPseudocode: Record<string, string[]> = {
  join: [
    'def join(net, u, near):',
    '    net.place_next_to(u, near)  # linked by range',
    '    for n in sorted(u.neighbors(), key=dist_to(u)):  # nearest first',
    '        if not has_spare(n):',
    '            continue  # u asks the next neighbor',
    '        join_buddy(u, via=n)',
    '        break',
    '    if u.address is None:',
    '        return  # u waits and joins no cluster',
    '    cluster_join(u)  # the best head it hears, or u leads its own cluster',
  ],
  elect: [
    'def elect(net, rank):',
    '    undecided = net.nodes_without_head()',
    '    while undecided:',
    '        v = best_local(undecided, rank)  # ranks first among its undecided neighbors',
    '        v.head = v',
    '        undecided.discard(v)',
    '        for n in v.neighbors():',
    '            if n in undecided:',
    '                n.head = v  # n joins the cluster of v',
    '                undecided.discard(n)',
    '    for n in net.members():',
    '        if len(n.heads_in_range()) >= 2:',
    '            n.gateway = True',
  ],
  advance: [
    'def advance(net, ticks):',
    '    for t in range(ticks):',
    '        move_all(net.nodes)  # RPGM or RWP, by variant',
    '        net.links = unit_disk(net.nodes, net.range)',
    '        for v in net.members():',
    '            if v.head in v.neighbors():',
    '                continue  # v still hears its head',
    '            heads = v.heads_in_range()',
    '            if heads:',
    '                v.head = min(heads, key=rank)  # the best-ranked head it hears',
    '            else:',
    '                v.head = v  # v becomes a head',
    '                net.elections += 1',
    '    return net.elections',
  ],
  metrics: metricsListing,
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  join: { def: 1, place: 2, skip: 5, buddy: 6, wait: 9, cluster: 10 },
  elect: { def: 1, none: 2, head: 5, member: 9, done: 11, gateway: 13 },
  advance: { def: 1, calm: 4, changes: 5, done: 14 },
  metrics: ML,
} as const
