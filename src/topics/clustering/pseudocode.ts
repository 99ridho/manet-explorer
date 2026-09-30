// SPEC.md §10.6 listings in the §7.1 Python style. `rank` is the ID rule: highest or lowest first.
export const clusterPseudocode: Record<string, string[]> = {
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
  leave: [
    'def leave(net, u, rank):',
    '    net.remove(u)',
    '    if u.head == u:',
    '        for n in u.members():',
    '            heads = n.heads_in_range()',
    '            if heads:',
    '                n.head = min(heads, key=rank)  # a head it can still hear',
    '            else:',
    '                n.head = None  # undecided again',
    '        elect(net, rank)  # only the undecided nodes',
    '    net.recompute_gateways()',
  ],
  join: [
    'def join(net, u, links, rank):',
    '    net.add(u, links)',
    '    heads = u.heads_in_range()',
    '    if heads:',
    '        u.head = min(heads, key=rank)',
    '    else:',
    '        u.head = u  # no head in range, so u leads its own cluster',
    '    net.recompute_gateways()',
  ],
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  elect: { def: 1, none: 2, head: 5, member: 9, gateway: 13, done: 11 },
  leave: { def: 1, remove: 2, rejoin: 7, orphan: 9, elect: 10, gateways: 11 },
  join: { def: 1, add: 2, joins: 5, head: 7, gateways: 8 },
} as const
