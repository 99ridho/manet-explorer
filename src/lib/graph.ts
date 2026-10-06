// Plain graph checks over a snapshot, for canvases and case studies that need the answer without
// the step-by-step search (SPEC.md §19.1 runs the §10.1 algorithm on every state).
import type { NetSnapshot } from '@/types/net'
import { linkKey, neighbors } from './net'

/** Bridges (link keys) and articulation points of the live radio links, by Tarjan's low-link search. */
export function bridgesAndCuts(s: Pick<NetSnapshot, 'nodes' | 'links'>): { bridges: string[]; cuts: string[] } {
  const disc: Record<string, number> = {}
  const low: Record<string, number> = {}
  const bridges: string[] = []
  const cuts = new Set<string>()
  let time = 0
  const dfs = (v: string, parent: string | null) => {
    disc[v] = low[v] = ++time
    let children = 0
    for (const w of neighbors(s, v)) {
      if (disc[w] === undefined) {
        children += 1
        dfs(w, v)
        low[v] = Math.min(low[v], low[w])
        if (low[w] > disc[v]) bridges.push(linkKey(v, w))
        if (parent !== null && low[w] >= disc[v]) cuts.add(v)
      } else if (w !== parent) low[v] = Math.min(low[v], disc[w])
    }
    if (parent === null && children > 1) cuts.add(v)
  }
  for (const n of s.nodes) if (!n.down && disc[n.id] === undefined) dfs(n.id, null)
  return { bridges, cuts: s.nodes.map((n) => n.id).filter((id) => cuts.has(id)) }
}

/** Whether `to` can be reached from `from` over live radio links. */
export function reaches(s: Pick<NetSnapshot, 'nodes' | 'links'>, from: string, to: string): boolean {
  const seen = new Set([from])
  const stack = [from]
  while (stack.length) {
    const v = stack.pop()!
    if (v === to) return true
    for (const n of neighbors(s, v))
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(n)
      }
  }
  return false
}
