// SPEC.md §10.2 listings in the §7.1 Python style.
export const proactivePseudocode: Record<string, string[]> = {
  advertise: [
    'def advertise(u, full_dump):',
    '    rows = u.table.rows() if full_dump else u.table.changed_rows()',
    '    for n in u.neighbors():',
    '        for r in rows:',
    '            old = n.table.get(r.dest)',
    '            if old is None or r.seq > old.seq:',
    '                n.table[r.dest] = Route(u, r.metric + 1, r.seq)  # a newer sequence number wins',
    '            elif r.seq == old.seq and r.metric + 1 < old.metric:',
    '                n.table[r.dest] = Route(u, r.metric + 1, r.seq)  # same sequence, fewer hops',
    '            else:',
    '                continue  # n keeps its route',
    '    u.table.mark_unchanged()',
  ],
  move: [
    'def move(net, u, near, full_dump):',
    '    lost, gained = net.place_next_to(u, near)  # the unit disk rule relinks u',
    '    for v in [u] + lost:',
    '        v.delete_stale_routes()  # the next hop is no longer a neighbor',
    "    u.seq += 1  # u's own row is now changed",
    '    for n in gained:',
    '        n.send(Update(n.table.rows()), to=u)  # u needs the whole table once',
    '    queue = deque([u])',
    '    while queue:',
    '        v = queue.popleft()',
    '        advertise(v, full_dump)  # triggered update',
    '        queue.extend(changed_neighbors(v, queue))  # tables that changed, not yet queued',
  ],
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  advertise: { def: 1, send: 2, newer: 7, fewer: 9, keep: 11, done: 12 },
  move: { def: 1, move: 2, stale: 4, seq: 5, full: 7, loop: 9, advertise: 11 },
} as const
