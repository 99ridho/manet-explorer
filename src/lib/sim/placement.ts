// Seeded node placement for randomize() (SPEC.md §7.2, §10).
import type { NetLink, NetNode } from '@/types/net'
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
