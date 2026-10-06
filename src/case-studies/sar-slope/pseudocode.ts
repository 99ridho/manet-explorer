// SPEC.md §19.1 listings in the §7.1 Python style. The two Discover listings differ only at line 19.
import { metricsListing, ML } from '@/lib/sim/metrics'

const discover = (relays: string) => [
  'def discover(net, src, gateway):',
  '    queue = deque([(src, None)])',
  '    seen = {src}',
  '    while queue:',
  '        v, heard_from = queue.popleft()',
  '        if v == gateway:',
  '            continue  # the gateway answers; it does not relay',
  '        if v != src and not relays(v, heard_from):',
  '            continue  # v stays silent',
  '        v.broadcast(RREQ(src, gateway))',
  '        for n in v.neighbors():',
  '            if n in seen:',
  '                continue  # n drops a duplicate',
  '            seen.add(n)',
  '            n.reverse[src] = v  # the reverse path',
  '            queue.append((n, v))',
  '    send_along(reverse_path(gateway, src), RREP(gateway))',
  'def relays(v, heard_from):',
  relays,
]

export const sarPseudocode: Record<string, string[]> = {
  'discover-mpr': discover('    return v in heard_from.mpr  # relay only for the node that chose you'),
  'discover-flooding': discover('    return True  # blind flooding: every node relays once'),
  send: [
    'def send(src, dst, payload):',
    '    if dst not in src.route:',
    '        return False  # run discover(src, dst) first',
    '    v = src',
    '    while v != dst:',
    '        nxt = v.route[dst]  # each node looks up its own table',
    '        v.send(DATA(dst, payload), to=nxt)',
    '        v = nxt',
    '    return True',
  ],
  'walk-away': [
    'def walk_away(net, u):',
    '    net.move_out_of_range(u)',
    '    if u in net.route:',
    '        for node in rerr_path(u):  # from the radios next to u toward each route end',
    '            node.delete_routes_through(u)',
    '    if not net.reaches(team, gateway):',
    '        return False  # u was an articulation point between the team and G',
    '    return True  # another path exists; discover again',
  ],
  metrics: metricsListing,
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  discover: { def: 1, start: 2, silent: 9, transmit: 10, dup: 13, first: 15, rrep: 17 },
  send: { def: 1, noRoute: 3, lookup: 6, forward: 7, done: 9 },
  walk: { def: 1, move: 2, rerr: 4, remove: 5, cut: 7, ok: 8 },
  metrics: ML,
} as const
