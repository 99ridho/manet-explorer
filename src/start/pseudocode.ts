// SPEC.md §20: the Start here listings, in the §7.1 style.
export const introPseudocode: Record<string, string[]> = {
  send: [
    'def send(src, dst, message):',
    '    route = net.shortest_route(src, dst)  # fewest hops',
    '    if route is None:',
    '        return False  # no chain of neighbors reaches dst',
    '    for v, nxt in zip(route, route[1:]):',
    '        v.send(message, to=nxt)  # one hop',
    '    return True  # dst has the message',
  ],
  leave: [
    'def leave(net, v):',
    '    for n in net.neighbors(v):',
    '        net.remove_link(v, n)  # n can no longer hear v',
    '    v.down = True',
  ],
}

export const L = {
  send: { def: 1, route: 2, none: 4, hop: 6, done: 7 },
  leave: { def: 1, link: 3, down: 4 },
}
