// Helpers over NetSnapshot (SPEC.md §7.2). Every step gets a fresh copy, so snapshots stay immutable values.
import type { HighlightKind, NetHighlight, NetLink, NetSnapshot } from '@/types/net'

export function linkKey(a: string, b: string): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

export function makeLink(a: string, b: string, extra: Omit<NetLink, 'a' | 'b'> = {}): NetLink {
  return a < b ? { a, b, ...extra } : { a: b, b: a, ...extra }
}

export function findLink(snap: Pick<NetSnapshot, 'links'>, a: string, b: string): NetLink | undefined {
  const key = linkKey(a, b)
  return snap.links.find((l) => linkKey(l.a, l.b) === key)
}

/** Radio neighbors of `id` in `nodes` order (the tie-break order); broken and virtual links excluded. */
export function neighbors(snap: Pick<NetSnapshot, 'nodes' | 'links'>, id: string): string[] {
  const linked = new Set<string>()
  for (const l of snap.links) {
    if (l.broken || l.virtual) continue
    if (l.a === id) linked.add(l.b)
    else if (l.b === id) linked.add(l.a)
  }
  return snap.nodes.filter((n) => linked.has(n.id) && !n.down).map((n) => n.id)
}

/** A deep copy with the step-only fields (packets, highlight) cleared. */
export function cloneNet<T extends NetSnapshot>(snap: T): T {
  const copy = structuredClone(snap)
  copy.packets = []
  delete copy.highlight
  return copy
}

/** A step snapshot: a deep copy of `snap` carrying this step's highlight and packets. */
export function frame<T extends NetSnapshot>(snap: T, highlight?: NetHighlight, packets: NetSnapshot['packets'] = []): T {
  const copy = cloneNet(snap)
  if (highlight) copy.highlight = structuredClone(highlight)
  copy.packets = structuredClone(packets)
  return copy
}

export function hl(nodes?: Record<string, HighlightKind>, links?: Record<string, HighlightKind>, path?: string[]): NetHighlight {
  return { nodes, links, path }
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

/** "S, A, C, D" */
export function listIds(ids: string[]): string {
  return ids.join(', ')
}
