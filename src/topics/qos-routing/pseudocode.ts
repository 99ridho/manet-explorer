// SPEC.md §10.10 listings in the §7.1 Python style. The hop and bandwidth listings number their
// lines alike, and so do the ETX and energy listings.
const bfs = (def: string, usable: string) => [
  def,
  usable,
  '    frontier, prev = deque([src]), {src: None}',
  '    while frontier:',
  '        v = frontier.popleft()',
  '        if v == dst:',
  '            return path_to(dst, prev)',
  '        for n in v.neighbors(usable):',
  '            if n not in prev:',
  '                prev[n] = v',
  '                frontier.append(n)',
  '    return None  # no path meets the request',
]

export const qosPseudocode: Record<string, string[]> = {
  'path-hop': bfs('def find_path(net, src, dst):', '    usable = net.links  # every link counts'),
  'path-bandwidth': bfs('def find_path(net, src, dst, need):', '    usable = net.links_at_least(need)  # bandwidth in Mbps'),
  'path-etx': [
    'def find_path(net, src, dst):',
    '    cost, prev, done = {src: 0}, {src: None}, set()',
    '    while set(cost) - done:',
    '        v = min(set(cost) - done, key=cost.get)  # ties go to node order',
    '        done.add(v)',
    '        if v == dst:',
    '            return path_to(dst, prev)',
    '        for n in v.neighbors():',
    '            if n in done:',
    '                continue',
    '            c = cost[v] + 1 / (w(v, n) * w(n, v))  # the ETX of the link',
    '            if n not in cost or c < cost[n]:',
    '                cost[n], prev[n] = c, v',
    '    return None  # dst is unreachable',
  ],
  'path-energy': [
    'def find_path(net, src, dst):',
    "    weakest, prev, done = {src: float('inf')}, {src: None}, set()",
    '    while set(weakest) - done:',
    '        v = max(set(weakest) - done, key=weakest.get)  # fewer hops on a tie',
    '        done.add(v)',
    '        if v == dst:',
    '            return path_to(dst, prev)',
    '        for n in v.neighbors():',
    '            if n in done:',
    '                continue',
    '            b = weakest[v] if n == dst else min(weakest[v], n.battery)',
    '            if n not in weakest or b > weakest[n]:',
    '                weakest[n], prev[n] = b, v',
    '    return None  # dst is unreachable',
  ],
  send: [
    'def send(net, path, k):',
    '    for p in range(1, k + 1):',
    '        if has_down_relay(path):',
    '            return  # the path is broken; find a new path first',
    '        send_along(path, DATA(p))',
    '        for r in path[1:-1]:  # the relays, not src or dst',
    '            r.battery -= 1',
    '            if r.battery == 0:',
    '                r.down = True',
  ],
}

/** Line numbers the operations highlight, per listing family. */
export const L = {
  bfs: { def: 1, prune: 2, settle: 5, found: 7, same: 9, improved: 10, none: 12 },
  best: { def: 1, settle: 5, found: 7, same: 12, improved: 13, none: 14 },
  send: { def: 1, stop: 4, packet: 5, down: 9 },
} as const
