// SPEC.md §19.3 listings in the §7.1 Python style.
import { metricsListing, ML } from '@/lib/sim/metrics'

export const meshPseudocode: Record<string, string[]> = {
  route: [
    'def find_route(net, src, dst, routing):',
    '    candidates = flood_rreq(net, src, dst)  # every route an RREP brought back, in order of arrival',
    "    if routing == 'hop':",
    '        return min(candidates, key=len)  # the first to arrive wins a tie',
    '    return min(candidates, key=etx_sum)  # the smallest sum of link ETX',
  ],
  'join-m': [
    'def join_m(net):',
    "    m = net.add('M', links=['S'])",
    "    m.advertise(link_to='D', w=1.0)  # a link that does not exist",
  ],
  deliver: [
    'def deliver(net, route, k, watchdog):',
    '    for p in range(1, k + 1):',
    '        delivered = True',
    '        for v, nxt in zip(route, route[1:]):',
    '            if v.black_hole:',
    '                delivered = False  # v drops p without a trace',
    '                break',
    '            if not v.send_with_retries(DATA(p), to=nxt, tries=4):  # each try needs the frame and its ACK',
    '                delivered = False  # no ACK after 4 tries, so p is lost at v',
    '                break',
    '            if watchdog:',
    '                watch(v, nxt, p)  # Section 10.11 Send with watchdog, lines 4 to 10',
    '        net.count(p, delivered)',
    '    return net.delivered / k',
  ],
  metrics: metricsListing,
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  route: { def: 1, flood: 2, hop: 4, etx: 5 },
  join: { def: 1, add: 2, advertise: 3 },
  deliver: { def: 1, drop: 6, lost: 9, watch: 12, delivered: 13, done: 14 },
  metrics: ML,
} as const
