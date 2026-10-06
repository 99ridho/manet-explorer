// SPEC.md §10.11 listings in the §7.1 Python style.
export const attacksPseudocode: Record<string, string[]> = {
  discover: [
    'def discover(net, src, dst):',
    '    heard = [(src, [src])]',
    '    while heard:',
    '        heard = flood_tick(heard)  # each node forwards its first copy and adds itself to the record',
    '        for n, record in heard:',
    '            if n.black_hole:',
    '                n.send(RREP(record + [dst]), to=src)  # a route n does not have',
    '            if n.tunnel_end:',
    '                heard.append((n.far_end, record + [n.far_end]))  # replayed in the same tick',
    '            if n == dst:',
    '                send_along(reversed(record), RREP(record))',
    '        for route in src.rreps_arrived():',
    '            src.routes.append(route)  # every route is kept, in order of arrival',
    '    return src.routes[0]  # the first RREP to arrive wins',
  ],
  send: [
    'def send(net, route, k):',
    '    for p in range(1, k + 1):',
    '        delivered = True',
    '        for v, nxt in zip(route, route[1:]):',
    '            if v.black_hole:',
    '                delivered = False  # v drops p without a trace',
    '                break',
    '            v.send(DATA(p), to=nxt)  # through the tunnel if this link is one',
    '        net.count(p, delivered)',
  ],
  watchdog: [
    'def send_watched(net, src, route, k):',
    '    for p in range(1, k + 1):',
    '        for v, nxt in zip(route, route[1:]):',
    '            v.send(DATA(p), to=nxt)  # v keeps a copy and listens to nxt',
    '            if nxt == route[-1] or v.overhears(nxt, p):',
    '                continue  # delivered, or passed on',
    '            failures[nxt] += 1',
    '            if failures[nxt] > 3:  # the threshold',
    '                src.report(nxt)  # the pathrater avoids nxt from now on',
    '                route = best_route_without(src.routes, nxt)',
    '            break  # p is lost at nxt',
  ],
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  discover: { def: 1, tick: 4, blackHole: 7, tunnel: 9, dest: 11, arrival: 13, pick: 14 },
  send: { def: 1, drop: 6, tunnel: 8, done: 9 },
  watchdog: { def: 1, heard: 5, silence: 7, report: 9, reroute: 10 },
} as const
