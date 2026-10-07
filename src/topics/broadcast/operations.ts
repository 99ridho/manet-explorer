// SPEC.md §10.4: MPR selection, broadcast by blind flooding or MPR relaying, and link removal.
import { cloneNet, findLink, linkKey, listIds, makeLink, neighbors, parseIds, plural, pySet, recorder } from '@/lib/net'
import { connectedUnitDisk } from '@/lib/sim/placement'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { HighlightKind, NetSnapshot } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { BroadcastSnapshot, BroadcastState, Relay } from './types'
import { WHY } from './why'

type Result = OperationResult<BroadcastSnapshot>

/** SPEC §10.4 seed: Week 3, "MPR dipilih dengan set cover serakah" (Misra pp. 126-127, Figure 6.2). */
export function seedNetwork(relay: Relay = 'mpr'): BroadcastSnapshot {
  const nodes = [
    { id: 'A', x: 1, y: 1, roles: ['source' as const] },
    { id: 'B', x: 0, y: 0, roles: [] },
    { id: 'D', x: 2, y: 0, roles: [] },
    { id: 'E', x: 2, y: 2, roles: [] },
    { id: 'C', x: 0, y: -1, roles: [] },
    { id: 'G', x: 3, y: -1, roles: [] },
    { id: 'F', x: 3, y: 1, roles: [] },
  ]
  const links = [
    ['A', 'B'],
    ['A', 'D'],
    ['A', 'E'],
    ['B', 'C'],
    ['D', 'G'],
    ['D', 'F'],
    ['E', 'F'],
  ].map(([a, b]) => makeLink(a, b))
  const snap: BroadcastSnapshot = { nodes, links, range: 1.5, packets: [], relay, mpr: {}, tx: 0, dups: 0, reached: 0 }
  snap.mpr = allMpr(snap)
  return snap
}

/** 7 to 10 nodes, connected under the unit disk rule, named A, B, C … in placement order; A is the source. */
export function randomNetwork(relay: Relay, seed: number): BroadcastSnapshot {
  const rng = mulberry32(seed)
  const ids = 'ABCDEFGHIJ'.slice(0, randInt(rng, 7, 10)).split('')
  const placed = connectedUnitDisk(rng, ids, 4.5, 3, 1.5)
  if (!placed) return seedNetwork(relay)
  const nodes = placed.nodes.map((n, i) => ({ ...n, roles: i === 0 ? ['source' as const] : [] }))
  const snap: BroadcastSnapshot = {
    ...seedNetwork(relay),
    nodes,
    links: placed.links.map((l) => makeLink(l.a, l.b)),
  }
  snap.mpr = allMpr(snap)
  return snap
}

export function sourceOf(s: BroadcastSnapshot): string | undefined {
  return s.nodes.find((n) => n.roles.includes('source'))?.id
}

interface MprTrace {
  n1: string[]
  n2: string[]
  unique: { c: string; n: string }[] // line 8, one per MPR it fixes
  coveredAfterUnique: string[]
  greedy: { n: string; k: number }[] // line 12
  mpr: string[] // node order
}

/** Greedy set cover of Misra pp. 126-127: unique ways in first, then the neighbor covering the most. */
export function selectMpr(s: Pick<NetSnapshot, 'nodes' | 'links'>, u: string): MprTrace {
  const n1 = neighbors(s, u)
  const adj = new Map(s.nodes.map((n) => [n.id, new Set(neighbors(s, n.id))]))
  const n2 = s.nodes
    .map((n) => n.id)
    .filter((id) => id !== u && !n1.includes(id) && n1.some((m) => adj.get(m)!.has(id)))
  const mpr = new Set<string>()
  const unique: MprTrace['unique'] = []
  for (const c of n2) {
    const via = n1.filter((m) => adj.get(m)!.has(c))
    if (via.length === 1 && !mpr.has(via[0])) {
      mpr.add(via[0])
      unique.push({ c, n: via[0] })
    }
  }
  const coveredBy = (set: Iterable<string>) => {
    const out = new Set<string>()
    for (const m of set) for (const c of n2) if (adj.get(m)!.has(c)) out.add(c)
    return out
  }
  const covered = coveredBy(mpr)
  const coveredAfterUnique = n2.filter((c) => covered.has(c))
  const greedy: MprTrace['greedy'] = []
  while (covered.size < n2.length) {
    let best: string | null = null
    let bestK = 0
    for (const m of n1) {
      if (mpr.has(m)) continue
      const k = n2.filter((c) => !covered.has(c) && adj.get(m)!.has(c)).length
      if (k > bestK) {
        best = m
        bestK = k
      }
    }
    if (!best) break
    mpr.add(best)
    greedy.push({ n: best, k: bestK })
    for (const c of coveredBy([best])) covered.add(c)
  }
  return { n1, n2, unique, coveredAfterUnique, greedy, mpr: n1.filter((m) => mpr.has(m)) }
}

function allMpr(s: Pick<NetSnapshot, 'nodes' | 'links'>): Record<string, string[]> {
  return Object.fromEntries(s.nodes.map((n) => [n.id, selectMpr(s, n.id).mpr]))
}

function oneNode(s: BroadcastSnapshot, input: unknown): string | null {
  const ids = parseIds(input)
  return ids.length === 1 && s.nodes.some((n) => n.id === ids[0]) ? ids[0] : null
}

const marks = (ids: string[], kind: HighlightKind) => Object.fromEntries(ids.map((id) => [id, kind]))

export function runSelectMpr(state: BroadcastState, input: unknown): Result {
  const S = L.select
  const work = cloneNet(state)
  const u = oneNode(work, input)
  const { steps, push, why } = recorder(work, { u: u ?? 'None' })
  if (!u) {
    push('Type a node id, such as A.', S.def)
    why(WHY.needNode())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const t = selectMpr(work, u)
  if (t.n1.length === 0) {
    push(`${u} has no neighbors, so it needs no MPR.`, S.sets, { nodes: { [u]: 'current' } }, [], { n1: pySet([]) })
    why(WHY.alone(u))
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const sets = { ...marks(t.n1, 'current'), ...marks(t.n2, 'visited') }
  if (t.n2.length === 0) {
    push(`${u} has one-hop neighbors ${listIds(t.n1)} and no two-hop neighbors.`, S.sets, { nodes: sets }, [], { n1: pySet(t.n1), n2: pySet([]) })
    why(WHY.noTwoHop(u))
    push(`${u} needs no MPR: every node it can reach is one hop away.`, S.done, undefined, [], { mpr: pySet([]) })
    why(WHY.noMpr())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  push(`${u} has one-hop neighbors ${listIds(t.n1)} and two-hop neighbors ${listIds(t.n2)}.`, S.sets, { nodes: sets }, [], {
    n1: pySet(t.n1),
    n2: pySet(t.n2),
  })
  why(WHY.sets(u))
  const chosen: string[] = []
  for (const { c, n } of t.unique) {
    chosen.push(n)
    push(
      `${c} is reachable only through ${n}, so ${n} becomes an MPR.`,
      S.unique,
      { nodes: { ...marks(t.n2, 'visited'), [c]: 'current', ...marks(chosen, 'found') } },
      [],
      { c, via: pySet([n]) },
    )
    why(WHY.unique(u, c, n))
  }
  push(
    t.coveredAfterUnique.length
      ? `The MPRs so far cover ${listIds(t.coveredAfterUnique)}.`
      : 'No two-hop neighbor has a single way in, so no MPR is fixed yet.',
    S.covered,
    { nodes: { ...marks(t.coveredAfterUnique, 'visited'), ...marks(chosen, 'found') } },
    [],
    { covered: pySet(t.coveredAfterUnique) },
  )
  why(t.coveredAfterUnique.length ? WHY.covered() : WHY.noneFixed())
  for (const { n, k } of t.greedy) {
    chosen.push(n)
    push(`${n} covers ${k} of the uncovered two-hop neighbors, the most, so it becomes an MPR.`, S.pick, { nodes: marks(chosen, 'found') }, [], { n })
    why(WHY.greedy())
  }
  const rest = t.n1.filter((m) => !t.mpr.includes(m))
  push(
    `Every two-hop neighbor is covered. The MPR set of ${u} is ${listIds(t.mpr)}` +
      (rest.length ? `; ${listIds(rest)} ${rest.length === 1 ? 'stays' : 'stay'} silent.` : '; every neighbor is needed.'),
    S.done,
    { nodes: marks(t.mpr, 'found') },
    [],
    { mpr: pySet(t.mpr) },
  )
  why(rest.length ? WHY.done() : WHY.allNeeded())
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runBroadcast(state: BroadcastState, input: unknown): Result {
  const B = L.broadcast
  const work = cloneNet(state)
  const src = oneNode(work, input)
  const { steps, push, why } = recorder(work, { src: src ?? 'None', packet: 'PKT' })
  if (!src) {
    push('Type a source node, such as A.', B.def)
    why(WHY.needSource())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (const n of work.nodes) {
    n.roles = n.roles.filter((r) => r !== 'source')
    if (n.id === src) n.roles.push('source')
  }
  work.tx = 0
  work.dups = 0
  work.reached = 0
  const mprRelay = work.relay === 'mpr'
  const got: Record<string, HighlightKind> = { [src]: 'visited' }
  const tree: Record<string, HighlightKind> = {}
  const seen = new Set([src])
  const queue: [string, string | null][] = [[src, null]]
  while (queue.length) {
    const [v, heardFrom] = queue.shift()!
    if (heardFrom && mprRelay && !work.mpr[heardFrom]?.includes(v)) {
      push(`${v} is not an MPR of ${heardFrom}, so it does not relay.`, B.silent, { nodes: { ...got }, links: { ...tree } }, [], {
        v,
        heard_from: heardFrom,
      })
      why(WHY.silent(v, heardFrom))
      continue
    }
    const nbrs = neighbors(work, v)
    work.tx += 1
    push(
      nbrs.length ? `${v} transmits the packet to ${listIds(nbrs)}.` : `${v} transmits the packet, but no neighbor is in range.`,
      B.transmit,
      { nodes: { ...got, [v]: 'current' }, links: { ...tree } },
      [{ kind: 'PKT', from: v, to: '*' }],
      { v, heard_from: heardFrom ?? 'None' },
    )
    why(!nbrs.length ? WHY.noNeighbor(v) : v === src ? WHY.source(v) : mprRelay ? WHY.relayMpr(v) : WHY.relayFlood(v))
    for (const n of nbrs) {
      if (seen.has(n)) {
        work.dups += 1
        push(`${n} already has the packet, so this copy is a duplicate.`, B.dup, { nodes: { ...got, [n]: 'dropped' }, links: { ...tree } }, [], { v, n })
        why(WHY.dup(n))
        continue
      }
      seen.add(n)
      work.reached += 1
      tree[linkKey(v, n)] = 'tree'
      push(`${n} receives the packet for the first time.`, B.first, {
        nodes: { ...got, [n]: 'new' },
        links: { ...tree, [linkKey(v, n)]: 'new' },
      }, [], { v, n })
      why(WHY.first(n))
      got[n] = 'visited'
      queue.push([n, v])
    }
  }
  push(
    `${work.reached} of ${plural(work.nodes.length - 1, 'other node')} received the packet with ${plural(work.tx, 'transmission')} and ${plural(work.dups, 'duplicate')}.`,
    B.loop,
    { nodes: { ...got }, links: { ...tree } },
  )
  why(WHY.total())
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runRemoveLink(state: BroadcastState, input: unknown): Result {
  const R = L.remove
  const work = cloneNet(state)
  const ids = parseIds(input)
  const { steps, push, why } = recorder(work, ids.length === 2 ? { u: ids[0], v: ids[1] } : { u: 'None', v: 'None' })
  if (ids.length !== 2) {
    push('Type a link, such as D F.', R.def)
    why(WHY.needLink())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const [u, v] = ids
  const link = findLink(work, u, v)
  if (!link) {
    push(`There is no link ${u}-${v}.`, R.def)
    why(WHY.noLink())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  work.links = work.links.filter((l) => l !== link)
  const old = work.mpr
  work.mpr = allMpr(work)
  push(`Link ${u}-${v} is gone.`, R.remove, { nodes: { [u]: 'current', [v]: 'current' } })
  why(WHY.linkGone())
  const changed = work.nodes.map((n) => n.id).filter((w) => old[w]?.join() !== work.mpr[w].join())
  if (changed.length === 0) {
    push("No node's MPR set changes.", R.loop)
    why(WHY.unchanged())
  }
  const show = (set: string[] | undefined) => (set?.length ? listIds(set) : 'none')
  for (const w of changed) {
    push(
      `${w}'s MPR set changes from ${show(old[w])} to ${show(work.mpr[w])}.`,
      R.recompute,
      { nodes: { [w]: 'current', ...marks(work.mpr[w], 'found') } },
      [],
      { w },
    )
    why(WHY.changed(w))
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export const broadcastOperations: OperationDefinition<BroadcastState, unknown, BroadcastSnapshot>[] = [
  { id: 'select-mpr', label: 'Select MPRs', inputKind: 'text', placeholder: 'Node, e.g. A', variants: ['mpr'], run: runSelectMpr },
  { id: 'broadcast-mpr', label: 'Broadcast', inputKind: 'text', placeholder: 'Source, e.g. A', variants: ['mpr'], run: runBroadcast },
  { id: 'broadcast-flooding', label: 'Broadcast', inputKind: 'text', placeholder: 'Source, e.g. A', variants: ['flooding'], run: runBroadcast },
  { id: 'remove-link', label: 'Remove link', inputKind: 'text', placeholder: 'Link, e.g. D F', run: runRemoveLink },
]
