// Helpers over NetSnapshot (SPEC.md §7.2). Every step gets a fresh copy, so snapshots stay immutable values.
import type { HighlightKind, InFlight, NetHighlight, NetLink, NetSnapshot } from '@/types/net'
import type { Step } from '@/types/step-engine'

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

/** Collects steps over a working copy: each push freezes `work` as it is now into a step snapshot. */
export function recorder<T extends NetSnapshot>(work: T) {
  const steps: Step<T>[] = []
  const push = (
    description: string,
    highlightLine: number,
    highlight?: NetHighlight,
    packets: InFlight[] = [],
    variables?: Record<string, string | number>,
  ) => steps.push({ id: steps.length, description, highlightLine, snapshot: frame(work, highlight, packets), variables })
  return { steps, push, why: explainer(steps) }
}

/** Sets the plain-words reason (SPEC.md §20) on the step pushed last. */
export function explainer<T>(steps: Step<T>[]) {
  return (why: string) => {
    steps[steps.length - 1].why = why
  }
}

/** Whitespace- or comma-separated ids, upper-cased: "a, c" gives ["A", "C"]. */
export function parseIds(input: unknown): string[] {
  return String(input ?? '')
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => t.toUpperCase())
}

/** Removes a node and every link that touches it. */
export function removeNode<T extends NetSnapshot>(snap: T, id: string) {
  snap.nodes = snap.nodes.filter((n) => n.id !== id)
  snap.links = snap.links.filter((l) => l.a !== id && l.b !== id)
}
