// SPEC.md §10.1 listings in the §7.1 Python style. highlightLine values in operations.ts index these arrays.
export const multihopPseudocode: Record<string, string[]> = {
  'build-links': [
    'def build_links(net, radio_range):',
    '    links = set()',
    '    for p, q in combinations(net.nodes, 2):',
    '        d = dist(p, q)',
    '        if linked(d, radio_range):',
    '            links.add((p, q))',
    '    return links',
  ],
  'find-bridges': [
    'def find_bridges(net):',
    '    for v in net.nodes:',
    '        if v not in disc:',
    '            dfs(net, v, parent=None)',
    'def dfs(net, v, parent):',
    '    disc[v] = low[v] = next(clock)',
    '    children = 0',
    '    for w in net.neighbors(v):',
    '        if w not in disc:',
    '            children += 1',
    '            dfs(net, w, parent=v)',
    '            low[v] = min(low[v], low[w])',
    '            if low[w] > disc[v]:',
    '                bridges.add((v, w))',
    '            if parent is not None and low[w] >= disc[v]:',
    '                cut_points.add(v)',
    '        elif w != parent:',
    '            low[v] = min(low[v], disc[w])',
    '    if parent is None and children > 1:',
    '        cut_points.add(v)',
  ],
  'link-etx': [
    'def link_etx(net, p, q, w_pq, w_qp):',
    '    if not net.has_link(p, q):',
    '        return None',
    '    cycle = w_pq * w_qp  # the frame and its ACK both arrive',
    '    etx = 1 / cycle',
    '    net.link(p, q).etx = etx',
    '    return etx',
  ],
}

/** Line numbers the operations highlight, named so a listing change is one edit here. */
export const L = {
  build: { test: 5, add: 6, done: 7 },
  bridges: { outer: 2, enter: 6, tree: 11, back_from_child: 12, bridge: 14, cut: 16, back_link: 18, root_cut: 20 },
  etx: { def: 1, no_link: 3, cycle: 4, etx: 5, store: 6 },
} as const
