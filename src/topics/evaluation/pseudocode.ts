// SPEC.md §10.9 listings in the §7.1 Python style. Metrics over seeds is the §9.1 listing.
import { metricsListing, ML } from '@/lib/sim/metrics'

export const evaluationPseudocode: Record<string, string[]> = {
  'build-links': [
    'def build_links(net, radio_range):',
    '    links = set()',
    '    for p, q in combinations(net.nodes, 2):',
    '        d = dist(p, q)',
    '        if linked(d, radio_range):',
    '            links.add((p, q))',
    '    return links',
  ],
  cds: [
    'def cds(net):',
    '    marked = []',
    "    for v in net.nodes:  # Wu's marking process",
    '        if has_unlinked_pair(v.neighbors()):  # two neighbors that cannot hear each other',
    '            marked.append(v)',
    '    kept = set(marked)',
    '    for v in marked:  # pruning rule 1',
    '        u = larger_cover(v, marked)  # a marked neighbor with a larger id that covers v and its neighbors',
    '        if u is None:',
    '            continue  # v stays',
    '        kept.discard(v)',
    '    return kept',
  ],
  metrics: metricsListing,
}

/** Line numbers the operations highlight, per listing. */
export const L = {
  build: { def: 1, notLinked: 5, linked: 6, result: 7 },
  cds: { def: 1, notMarked: 4, marked: 5, kept: 10, pruned: 11, result: 12 },
  metrics: ML,
} as const
