// SPEC.md §10.4 listings in the §7.1 Python style. Blind flooding and MPR relaying differ only in
// relays(), but the listings differ, so each gets its own operation id.
const broadcastBody = [
  'def broadcast(src, packet):',
  '    queue = deque([(src, None)])',
  '    seen = {src}',
  '    while queue:',
  '        v, heard_from = queue.popleft()',
  '        if v != src and not relays(v, heard_from):',
  '            continue  # v stays silent',
  '        v.broadcast(packet)',
  '        for n in v.neighbors():',
  '            if n in seen:',
  '                continue  # n drops a duplicate',
  '            seen.add(n)',
  '            queue.append((n, v))',
  'def relays(v, heard_from):',
]

export const broadcastPseudocode: Record<string, string[]> = {
  'select-mpr': [
    'def select_mpr(u):',
    '    n1 = set(u.neighbors())',
    '    n2 = two_hop(u)  # neighbors of n1, minus n1 and u',
    '    mpr = set()',
    '    for c in n2:',
    '        via = n1 & set(c.neighbors())',
    '        if len(via) == 1:',
    '            mpr |= via  # the only way to c',
    '    covered = n2 & reach(mpr)',
    '    while covered != n2:',
    '        n = max(n1 - mpr, key=new_cover)  # ties go to node order',
    '        mpr.add(n)',
    '        covered |= n2 & reach({n})',
    '    return mpr',
  ],
  'broadcast-flooding': [...broadcastBody, '    return True  # blind flooding: every node relays once'],
  'broadcast-mpr': [...broadcastBody, '    return v in heard_from.mpr  # relay only for the node that chose you'],
  'remove-link': [
    'def remove_link(net, u, v):',
    '    net.links.remove((u, v))',
    '    for w in net.nodes:',
    '        w.mpr = select_mpr(w)  # from the new HELLO information',
  ],
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  select: { def: 1, sets: 3, unique: 8, covered: 9, pick: 12, done: 14 },
  broadcast: { def: 1, loop: 4, silent: 7, transmit: 8, dup: 11, first: 12 },
  remove: { def: 1, remove: 2, loop: 3, recompute: 4 },
} as const
