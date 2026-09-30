// Seeded node placement for randomize() (SPEC.md §7.2, §10).
import type { NetLink, NetNode } from '@/types/net'
import { dist, unitDiskLinked } from './geometry'
import type { Rng } from './rng'

/** Round to one decimal so positions print cleanly in narration and aria labels. */
const r1 = (v: number) => Math.round(v * 10) / 10

export function uniform(rng: Rng, ids: string[], w: number, h: number): NetNode[] {
  return ids.map((id) => ({ id, x: r1(rng() * w), y: r1(rng() * h), roles: [] }))
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

/** Uniform placement retried until the unit disk links connect every node; null after `tries` misses. */
export function connectedUnitDisk(
  rng: Rng,
  ids: string[],
  w: number,
  h: number,
  range: number,
  tries = 20,
): { nodes: NetNode[]; links: NetLink[] } | null {
  for (let t = 0; t < tries; t++) {
    const nodes = uniform(rng, ids, w, h)
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
