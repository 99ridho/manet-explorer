// Seeded node placement for randomize() (SPEC.md §7.2, §10).
import type { NetLink, NetNode } from '@/types/net'
import { dist, unitDiskLinked } from './geometry'
import type { Rng } from './rng'

/** Round to one decimal so positions print cleanly in narration and aria labels. */
const r1 = (v: number) => Math.round(v * 10) / 10

export function uniform(rng: Rng, ids: string[], w: number, h: number): NetNode[] {
  return ids.map((id) => ({ id, x: r1(rng() * w), y: r1(rng() * h), roles: [] }))
}

/** Smallest distance between node centres: room for a 0.5-unit circle beside a node with an MPR or head ring. */
export const MIN_GAP = 0.8

/** Like `uniform`, but each node redraws up to 30 times to sit `gap` from those already placed; the last resort is the roomiest draw. */
export function spread(rng: Rng, ids: string[], w: number, h: number, gap = MIN_GAP): NetNode[] {
  const placed: NetNode[] = []
  for (const id of ids) {
    let best = { x: 0, y: 0 }
    let room = -1
    for (let t = 0; t < 30 && room < gap; t++) {
      const p = { x: r1(rng() * w), y: r1(rng() * h) }
      const near = placed.length ? Math.min(...placed.map((n) => dist(n, p))) : Infinity
      if (near > room) {
        room = near
        best = p
      }
    }
    placed.push({ id, ...best, roles: [] })
  }
  return placed
}

/** Distance between two nodes drawn as vertical strips reaching `below` units under them, for nodes with captions. */
function stripGap(p: Pick<NetNode, 'x' | 'y'>, q: Pick<NetNode, 'x' | 'y'>, below: number): number {
  const dy = Math.max(0, Math.abs(p.y - q.y) - below)
  return Math.hypot(p.x - q.x, dy)
}

/** `preferred` if it is clear of every node, else the first clear spot on rings of 12 around `anchor`, 0.8 units out and growing by 0.4. */
export function freeSpot(
  nodes: Pick<NetNode, 'x' | 'y'>[],
  preferred: { x: number; y: number },
  anchor: { x: number; y: number },
  opts: { gap?: number; below?: number } = {},
): { x: number; y: number } {
  const gap = opts.gap ?? MIN_GAP
  const clear = (p: { x: number; y: number }) => nodes.every((n) => stripGap(n, p, opts.below ?? 0) >= gap - 1e-9)
  const at = { x: r1(preferred.x), y: r1(preferred.y) }
  if (clear(at)) return at
  for (let r = 0.8; ; r += 0.4)
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6
      const p = { x: r1(anchor.x + r * Math.cos(a)), y: r1(anchor.y + r * Math.sin(a)) }
      if (clear(p)) return p
    }
}

export function isConnected(nodes: NetNode[], links: NetLink[]): boolean {
  const alive = nodes.filter((n) => !n.down)
  if (alive.length === 0) return true
  const adj = new Map<string, string[]>(alive.map((n) => [n.id, []]))
  for (const l of links) {
    if (l.broken || l.virtual) continue
    adj.get(l.a)?.push(l.b)
    adj.get(l.b)?.push(l.a)
  }
  const seen = new Set([alive[0].id])
  const stack = [alive[0].id]
  while (stack.length) {
    for (const n of adj.get(stack.pop()!) ?? []) {
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(n)
      }
    }
  }
  return seen.size === alive.length
}

/** Spaced placement retried until the unit disk links connect every node; null after `tries` misses. */
export function connectedUnitDisk(
  rng: Rng,
  ids: string[],
  w: number,
  h: number,
  range: number,
  tries = 20,
): { nodes: NetNode[]; links: NetLink[] } | null {
  for (let t = 0; t < tries; t++) {
    const nodes = spread(rng, ids, w, h)
    const links: NetLink[] = []
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        if (unitDiskLinked(dist(nodes[i], nodes[j]), range)) {
          const [a, b] = [nodes[i].id, nodes[j].id].sort()
          links.push({ a, b })
        }
    if (isConnected(nodes, links)) return { nodes, links }
  }
  return null
}

/** The two nodes farthest apart, first found in node order on a tie. */
export function farthestPair(nodes: NetNode[]): [NetNode, NetNode] {
  let best: [NetNode, NetNode] = [nodes[0], nodes[1]]
  let d = -1
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const e = dist(nodes[i], nodes[j])
      if (e > d) {
        d = e
        best = [nodes[i], nodes[j]]
      }
    }
  return best
}
