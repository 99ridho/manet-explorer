// SPEC.md §10.5: greedy forwarding with an optional perimeter walk around voids.
import { cloneNet, linkKey, makeLink, neighbors, parseIds, plural, recorder } from '@/lib/net'
import { dist } from '@/lib/sim/geometry'
import { connectedUnitDisk, farthestPair } from '@/lib/sim/placement'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import type { HighlightKind, NetNode } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { GeoSnapshot, GeoState, Recovery } from './types'

type Result = OperationResult<GeoSnapshot>

const RANGE = 1.6

/** SPEC §10.5 seed: Week 3, "Saat greedy buntu, paket memutari void" (Misra 7.3.2). */
export function seedNetwork(recovery: Recovery = 'perimeter'): GeoSnapshot {
  const nodes: NetNode[] = [
    { id: 'S', x: 2, y: 2, roles: ['source'] },
    { id: 'F', x: 1.2, y: 2.6, roles: [] },
    { id: 'A', x: 1.4, y: 1, roles: [] },
    { id: 'B', x: 2.2, y: 0.2, roles: [] },
    { id: 'C', x: 3.4, y: 0.3, roles: [] },
    { id: 'E', x: 4.3, y: 1.1, roles: [] },
    { id: 'D', x: 4, y: 2, roles: ['dest'] },
  ]
  const links = [
    ['S', 'F'],
    ['S', 'A'],
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'E'],
    ['E', 'D'],
  ].map(([a, b]) => makeLink(a, b))
  return withDirection(
    { nodes, links, range: RANGE, packets: [], recovery, mode: 'greedy', hops: 0, voids: 0, flow: null, path: [] },
    'S',
    'D',
  )
}

/** 8 to 10 nodes in a 6 × 4 area, connected; the two most distant become S and D. */
export function randomNetwork(recovery: Recovery, seed: number): GeoSnapshot {
  const rng = mulberry32(seed)
  const temp = Array.from({ length: randInt(rng, 8, 10) }, (_, i) => `n${i}`)
  const placed = connectedUnitDisk(rng, temp, 6, 4, RANGE, 200)
  if (!placed) return seedNetwork(recovery)
  const [s, d] = farthestPair(placed.nodes)
  const letters = 'ABCEFGHI'.split('')
  const rename = new Map([
    [s.id, 'S'],
    [d.id, 'D'],
  ])
  for (const n of placed.nodes) if (!rename.has(n.id)) rename.set(n.id, letters.shift()!)
  const order = (id: string) => (id === 'S' ? '0' : id === 'D' ? '2' : `1${id}`)
  const nodes = placed.nodes
    .map((n) => ({ ...n, id: rename.get(n.id)!, roles: [] as NetNode['roles'] }))
    .sort((a, b) => order(a.id).localeCompare(order(b.id)))
  const links = placed.links.map((l) => makeLink(rename.get(l.a)!, rename.get(l.b)!))
  return withDirection({ ...seedNetwork(recovery), nodes, links }, 'S', 'D')
}

/** Marks src and dst and redraws the dotted "toward" line from src to dst the slide shows. */
function withDirection(s: GeoSnapshot, src: string, dst: string): GeoSnapshot {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'source' && r !== 'dest')
    if (n.id === src) n.roles.push('source')
    if (n.id === dst) n.roles.push('dest')
  }
  s.links = s.links.filter((l) => !l.virtual)
  s.links.push(makeLink(src, dst, { virtual: true }))
  s.linkLabels = { [linkKey(src, dst)]: `toward ${dst}` }
  return s
}

const fmt = (d: number) => d.toFixed(2)

/**
 * Each node's position, and its distance to the destination on a second line. At rest every caption
 * waits for hover or focus; on a step the node deciding the next hop and its neighbors show theirs.
 */
export function geoLabels(s: GeoSnapshot): Record<string, NodeCaption> {
  const dst = s.nodes.find((n) => n.roles.includes('dest'))
  const anchor = s.highlight ? (s.packets[0]?.from ?? s.flow?.at) : undefined
  const shown = new Set(anchor ? [anchor, ...neighbors(s, anchor)] : [])
  // Boxes in slide units: 11px mono text is 0.11 wide per character plus 0.04 of halo, a line is
  // 0.22 tall, the first line starts 0.38 from the node's center, and a node's circle has radius 0.25.
  type Box = { x0: number; x1: number; y0: number; y1: number }
  const overlap = (a: Box, b: Box) =>
    Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
  const byId = new Map(s.nodes.map((n) => [n.id, n]))
  const fixed: Box[] = s.nodes.map((n) => ({ x0: n.x - 0.25, x1: n.x + 0.25, y0: n.y - 0.25, y1: n.y + 0.25 }))
  // A link label sits just above its link's midpoint.
  for (const l of s.links) {
    const text = s.linkLabels?.[linkKey(l.a, l.b)]
    const a = byId.get(l.a)
    const b = byId.get(l.b)
    if (!text || !a || !b) continue
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const half = (text.length * 0.11) / 2 + 0.04
    fixed.push({ x0: mx - half, x1: mx + half, y0: my + 0.1, y1: my + 0.3 })
  }
  const captions = s.nodes.map((n): NodeCaption => {
    const at = `${n.x}, ${n.y}`
    const hover = shown.has(n.id) ? {} : { hover: true }
    if (!dst || n.id === dst.id) return { lines: [`(${at})`], spoken: `at ${at}`, ...hover }
    const d = fmt(dist(n, dst))
    return { lines: [`(${at})`, `${d} to ${dst.id}`], spoken: `at ${at}, ${d} from ${dst.id}`, ...hover }
  })
  const sides = s.nodes.map((n, i) => {
    const half = (Math.max(...captions[i].lines.map((l) => l.length)) * 0.11) / 2 + 0.04
    const height = 0.22 * (captions[i].lines.length - 1) + 0.18
    const below = { x0: n.x - half, x1: n.x + half, y0: n.y - 0.38 - height, y1: n.y - 0.38 }
    return { below, above: { ...below, y0: n.y + 0.38, y1: n.y + 0.38 + height } }
  })
  // In node order, a caption moves above when that overlaps less. Only captions on screen count,
  // and one not yet placed counts as below.
  const placed = sides.map((b) => b.below)
  const out: Record<string, NodeCaption> = {}
  s.nodes.forEach((n, i) => {
    const others = [...fixed, ...placed.filter((_, j) => j !== i && shown.has(s.nodes[j].id))]
    const crowd = (b: Box) => others.reduce((sum, t) => sum + overlap(t, b), 0)
    const useAbove = crowd(sides[i].above) < crowd(sides[i].below)
    if (useAbove) placed[i] = sides[i].above
    out[n.id] = useAbove ? { ...captions[i], place: 'above' } : captions[i]
  })
  return out
}

/** Gabriel graph: keep u-v when no other node lies strictly inside the circle with diameter u-v. */
export function gabriel(s: GeoSnapshot): Set<string> {
  const byId = new Map(s.nodes.map((n) => [n.id, n]))
  const kept = new Set<string>()
  for (const l of s.links) {
    if (l.virtual || l.broken) continue
    const a = byId.get(l.a)!
    const b = byId.get(l.b)!
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const r = dist(a, b) / 2
    if (!s.nodes.some((w) => w.id !== a.id && w.id !== b.id && dist(w, mid) < r - 1e-9)) kept.add(linkKey(l.a, l.b))
  }
  return kept
}

/** The first planar neighbor clockwise from the direction of `prev` (or of dst); prev itself comes last. */
export function nextClockwise(s: GeoSnapshot, planar: Set<string>, v: string, prev: string | null, dst: string): string | null {
  const byId = new Map(s.nodes.map((n) => [n.id, n]))
  const p = byId.get(v)!
  const ref = byId.get(prev ?? dst)!
  const refAngle = Math.atan2(ref.y - p.y, ref.x - p.x)
  let best: string | null = null
  let bestTurn = Infinity
  for (const n of neighbors(s, v)) {
    if (!planar.has(linkKey(v, n))) continue
    const q = byId.get(n)!
    let turn = (refAngle - Math.atan2(q.y - p.y, q.x - p.x)) % (2 * Math.PI)
    if (turn <= 1e-9) turn += 2 * Math.PI
    if (turn < bestTurn) {
      bestTurn = turn
      best = n
    }
  }
  return best
}

type Pt = { x: number; y: number }

/** Where segment p1-p2 crosses segment q1-q2, ignoring a touch at p1; null when they do not cross. */
function crossing(p1: Pt, p2: Pt, q1: Pt, q2: Pt): Pt | null {
  const rx = p2.x - p1.x
  const ry = p2.y - p1.y
  const sx = q2.x - q1.x
  const sy = q2.y - q1.y
  const den = rx * sy - ry * sx
  if (Math.abs(den) < 1e-12) return null
  const t = ((q1.x - p1.x) * sy - (q1.y - p1.y) * sx) / den
  const u = ((q1.x - p1.x) * ry - (q1.y - p1.y) * rx) / den
  if (t <= 1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null
  return { x: p1.x + t * rx, y: p1.y + t * ry }
}

export function runRoute(state: GeoState, input: unknown): Result {
  const R = L.route
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const ids = parseIds(input)
  const known = new Set(work.nodes.map((n) => n.id))
  if (ids.length !== 2 || ids[0] === ids[1] || !ids.every((id) => known.has(id))) {
    push('Type a source and a destination, such as S D.', R.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const [src, dst] = ids
  withDirection(work, src, dst)
  const byId = new Map(work.nodes.map((n) => [n.id, n]))
  const dTo = (id: string) => dist(byId.get(id)!, byId.get(dst)!)
  work.flow = { src, dst, at: src }
  work.mode = 'greedy'
  work.hops = 0
  work.path = [src]
  const vars = () => ({ dist: fmt(dTo(work.flow!.at)) })

  const planar = gabriel(work)
  const radio = work.links.filter((l) => !l.virtual && !l.broken)
  const removed = Object.fromEntries(
    radio.filter((l) => !planar.has(linkKey(l.a, l.b))).map((l) => [linkKey(l.a, l.b), 'dropped' as HighlightKind]),
  )
  push(
    Object.keys(removed).length === 0
      ? 'The perimeter walk uses the Gabriel graph: every link stays.'
      : `The perimeter walk uses the Gabriel graph: ${planar.size} of ${plural(radio.length, 'link')} stay.`,
    R.planarize,
    { nodes: { [src]: 'current' }, links: removed },
    [],
    vars(),
  )

  const walked: Record<string, HighlightKind> = {}
  const hop = (from: string, to: string) => {
    walked[linkKey(from, to)] = 'tree'
    work.hops += 1
    work.path.push(to)
    work.flow = { src, dst, at: to }
  }
  const view = (v: string, kind: HighlightKind = 'current') => ({
    nodes: { [v]: kind },
    links: { ...walked },
    path: [...work.path],
  })
  let v = src
  let stuck = src
  let prev: string | null = null
  let walkHops = 0
  let firstHop: string | null = null
  let lastCross: { x: number; y: number } = byId.get(src)!
  const maxWalk = 2 * radio.length + 2
  while (v !== dst) {
    if (work.mode === 'greedy') {
      const nbrs = neighbors(work, v)
      const n = nbrs.reduce<string | null>((best, m) => (best === null || dTo(m) < dTo(best) - 1e-9 ? m : best), null)
      if (n !== null && dTo(n) < dTo(v) - 1e-9) {
        const dv = dTo(v)
        hop(v, n)
        push(
          `${n} is the neighbor closest to ${dst}: ${fmt(dTo(n))} against ${fmt(dv)}, so the packet moves to ${n}.`,
          R.greedy,
          view(n),
          [{ kind: 'DATA', from: v, to: n }],
          vars(),
        )
        v = n
        continue
      }
      work.voids += 1
      if (work.recovery === 'perimeter') {
        work.mode = 'perimeter'
        stuck = v
        prev = null
        walkHops = 0
        firstHop = null
        lastCross = byId.get(v)!
        push(
          `No neighbor of ${v} is closer to ${dst} than ${v} itself (${fmt(dTo(v))}), so the packet switches to perimeter mode.`,
          R.void,
          view(v, 'flagged'),
          [],
          vars(),
        )
        continue
      }
      push(`No neighbor of ${v} is closer to ${dst} than ${v} itself, so greedy forwarding drops the packet.`, R.drop, view(v, 'dropped'), [], vars())
      return { steps, finalSnapshot: cloneNet(work) }
    }
    // GPSR face change: an edge that crosses the line from stuck to dst nearer dst than the last crossing
    // is skipped, and the sweep continues past it onto the next face.
    let n = nextClockwise(work, planar, v, prev, dst)
    let skipped: string | null = null
    for (let turns = 0; n !== null && turns < 8; turns++) {
      const x = crossing(byId.get(v)!, byId.get(n)!, byId.get(stuck)!, byId.get(dst)!)
      if (!x || dist(x, byId.get(dst)!) >= dist(lastCross, byId.get(dst)!) - 1e-9) break
      lastCross = x
      skipped = n
      n = nextClockwise(work, planar, v, n, dst)
    }
    const again = n !== null && v === stuck && n === firstHop
    if (n === null || again || walkHops >= maxWalk) {
      push(`The perimeter walk came back to ${stuck} without getting closer, so ${dst} is unreachable.`, R.stuck, view(v, 'dropped'), [], vars())
      return { steps, finalSnapshot: cloneNet(work) }
    }
    if (walkHops === 0) firstHop = n
    hop(v, n)
    walkHops += 1
    push(
      skipped
        ? `Sweeping clockwise at ${v}, the link to ${skipped} crosses the line to ${dst}, so the walk changes face and takes the link to ${n}.`
        : `Sweeping clockwise at ${v}, the first link leads to ${n}.`,
      R.perimeter,
      view(n),
      [{ kind: 'DATA', from: v, to: n }],
      vars(),
    )
    prev = v
    v = n
    if (v !== dst && dTo(v) < dTo(stuck) - 1e-9) {
      work.mode = 'greedy'
      push(`${v} is ${fmt(dTo(v))} from ${dst}, closer than ${stuck} was, so the packet returns to greedy mode.`, R.resume, view(v), [], vars())
    }
  }
  work.mode = 'greedy'
  push(`The packet reaches ${dst} after ${plural(work.hops, 'hop')}.`, R.deliver, { nodes: { [dst]: 'found' }, links: { ...walked }, path: [...work.path] }, [], vars())
  return { steps, finalSnapshot: cloneNet(work) }
}

export const geoOperations: OperationDefinition<GeoState, unknown, GeoSnapshot>[] = [
  { id: 'route', label: 'Route', inputKind: 'text', placeholder: 'Source and destination, e.g. S D', run: runRoute },
]
