// SPEC.md §10.7: Buddy pool splitting and query-based DAD, with a crash leak and a partition merge.
import { cloneNet, linkKey, listIds, makeLink, neighbors, parseIds, plural, recorder, removeNode } from '@/lib/net'
import { dist } from '@/lib/sim/geometry'
import { mulberry32, randInt, type Rng } from '@/lib/sim/rng'
import type { NodeCaption } from '@/components/visualizer/canvas/NetworkCanvas'
import type { HighlightKind, NetNode } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { AddressSnapshot, AddressState, Range, Scheme } from './types'

type Result = OperationResult<AddressSnapshot>
type Push = ReturnType<typeof recorder<AddressSnapshot>>['push']

const SPACE = 16
const QDAD_TRIES = 3
const QDAD_SEED = 7

/** SPEC §10.7 seed: A, B, C in a line, and the partition P, Q out of range to the right. */
export function seedNetwork(scheme: Scheme = 'buddy'): AddressSnapshot {
  const buddy = scheme === 'buddy'
  const nodes: NetNode[] = [
    { id: 'A', x: 0, y: 0, roles: [] },
    { id: 'B', x: 1, y: 0, roles: [] },
    { id: 'C', x: 2, y: 0, roles: [] },
  ]
  return {
    nodes,
    links: [makeLink('A', 'B'), makeLink('B', 'C')],
    range: 1.5,
    packets: [],
    scheme,
    space: SPACE,
    address: buddy ? { A: 1, B: 9, C: 13 } : { A: 5, B: 11, C: 2 },
    pool: buddy ? { A: [[1, 8]], B: [[9, 12]], C: [[13, 16]] } : { A: [], B: [], C: [] },
    leaked: 0,
    control: 0,
    conflicts: 0,
    partition: {
      nodes: [
        { id: 'P', x: 4, y: 0, roles: [] },
        { id: 'Q', x: 5, y: 0, roles: [] },
      ],
      links: [makeLink('P', 'Q')],
      address: buddy ? { P: 1, Q: 9 } : { P: 11, Q: 3 },
      pool: buddy ? { P: [[1, 8]], Q: [[9, 16]] } : { P: [], Q: [] },
    },
    merged: false,
    seed: QDAD_SEED,
  }
}

/** Replays 3 to 6 random joins from a single first node A, with the seed's partition to the right. */
export function randomNetwork(scheme: Scheme, seed: number): AddressSnapshot {
  const rng = mulberry32(seed)
  const base = seedNetwork(scheme)
  let s: AddressSnapshot = {
    ...base,
    nodes: [{ id: 'A', x: 0, y: 0, roles: [] }],
    links: [],
    address: { A: scheme === 'buddy' ? 1 : randInt(rng, 1, SPACE) },
    pool: { A: scheme === 'buddy' ? [[1, SPACE]] : [] },
    seed: Math.floor(rng() * 1_000_000) + 1,
  }
  const joins = randInt(rng, 3, 6)
  for (const id of 'BCDEFG'.slice(0, joins)) {
    const vias = s.nodes.map((n) => n.id).filter((v) => scheme === 'qdad' || largest(s.pool[v] ?? []) > 1)
    if (vias.length === 0) break
    const via = vias[randInt(rng, 0, vias.length - 1)]
    s = (scheme === 'buddy' ? runJoinBuddy : runJoinQdad)(s, `${id} ${via}`).finalSnapshot
  }
  const right = Math.max(...s.nodes.map((n) => n.x))
  s.partition.nodes = s.partition.nodes.map((n, i) => ({ ...n, x: Math.round((right + 2 + i) * 10) / 10, y: 0 }))
  s.control = 0
  return s
}

const size = (r: Range) => r[1] - r[0] + 1
const largest = (pool: Range[]) => pool.reduce((m, r) => Math.max(m, size(r)), 0)
const rangeText = (r: Range) => (r[0] === r[1] ? `${r[0]}` : `${r[0]} to ${r[1]}`)
const rangesText = (pool: Range[]) => pool.map(rangeText).join(', ')

/** Sorted, with ranges that touch or overlap joined into one. */
function mergeTouching(pool: Range[]): Range[] {
  const sorted = [...pool].sort((a, b) => a[0] - b[0])
  const out: Range[] = []
  for (const r of sorted) {
    const last = out.at(-1)
    if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1])
    else out.push([r[0], r[1]])
  }
  return out
}

/** The address under each node, and under Buddy its pool on a second line; the en dash marks a numeric range. */
export function addressLabels(s: AddressSnapshot): Record<string, NodeCaption> {
  const caption = (addr: number | null | undefined, pool: Range[] | undefined): NodeCaption => {
    if (addr == null) return { lines: ['none'], spoken: 'no address' }
    if (s.scheme === 'qdad' || !pool?.length) return { lines: [`${addr}`], spoken: `address ${addr}` }
    return {
      lines: [`${addr}`, pool.map((r) => (r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`)).join(',')],
      spoken: `address ${addr}, pool ${rangesText(pool)}`,
    }
  }
  const out: Record<string, NodeCaption> = {}
  for (const n of s.nodes) out[n.id] = caption(s.address[n.id], s.pool[n.id])
  if (!s.merged) for (const n of s.partition.nodes) out[n.id] = caption(s.partition.address[n.id], s.partition.pool[n.id])
  return out
}

/** Next to `via`, nudged right until no node sits within 0.4. */
function placeNear(s: AddressSnapshot, via: NetNode): { x: number; y: number } {
  const others = [...s.nodes, ...(s.merged ? [] : s.partition.nodes)]
  const p = { x: via.x + 0.5, y: via.y - 0.8 }
  while (others.some((n) => dist(n, p) < 0.4)) p.x = Math.round((p.x + 0.6) * 10) / 10
  return p
}

/** Parses "D C" into a new id and an existing configured node; null on anything else. */
function parseJoin(s: AddressSnapshot, input: unknown): { fresh: string; via: string } | null {
  const ids = parseIds(input)
  if (ids.length !== 2 || !/^[A-Z]\d?$/.test(ids[0])) return null
  const [fresh, via] = ids
  const taken = new Set([...s.nodes, ...s.partition.nodes].map((n) => n.id))
  if (taken.has(fresh) || !s.nodes.some((n) => n.id === via) || s.address[via] == null) return null
  return { fresh, via }
}

function addNode(s: AddressSnapshot, fresh: string, via: string) {
  const p = placeNear(s, s.nodes.find((n) => n.id === via)!)
  s.nodes.push({ id: fresh, x: p.x, y: p.y, roles: [] })
  s.links.push(makeLink(fresh, via))
  s.address[fresh] = null
  s.pool[fresh] = []
}

/** The Buddy split of lines 2 to 8; `x` already sits in the network, linked to `via`. */
function buddySplit(work: AddressSnapshot, push: Push, x: string, via: string, line?: number): boolean {
  const J = L.joinBuddy
  const hl = (kind: HighlightKind) => ({ nodes: { [via]: 'current' as HighlightKind, [x]: kind }, links: { [linkKey(x, via)]: 'active' as HighlightKind } })
  const pool = work.pool[via]
  if (largest(pool) <= 1) {
    push(`${via} has no range left to split, so ${x} cannot join through it.`, line ?? J.full, hl('dropped'))
    return false
  }
  const target = pool.reduce((best, r) => (size(r) > size(best) ? r : best))
  const [lo, hi] = target
  push(`${via} splits ${rangeText(target)} in half.`, line ?? J.split, hl('new'))
  const mid = Math.floor((lo + hi) / 2)
  let keep: Range = [lo, mid]
  let give: Range = [mid + 1, hi]
  const own = work.address[via]
  if (own != null && own > mid && own <= hi) [keep, give] = [give, keep]
  work.pool[via] = pool.map((r) => (r === target ? keep : r))
  work.pool[x] = [give]
  push(`${via} keeps ${rangeText(keep)} and gives ${rangeText(give)} to ${x}.`, line ?? J.hand, hl('new'))
  work.address[x] = give[0]
  push(`${x} takes address ${give[0]} without asking any other node.`, line ?? J.address, { nodes: { [x]: 'found' } })
  return true
}

/** Nodes x can reach in the main network, in node order, with their hop counts from x. */
function reach(work: AddressSnapshot, x: string): Map<string, number> {
  const hops = new Map([[x, 0]])
  const queue = [x]
  while (queue.length) {
    const v = queue.shift()!
    for (const n of neighbors(work, v)) {
      if (hops.has(n)) continue
      hops.set(n, hops.get(v)! + 1)
      queue.push(n)
    }
  }
  return hops
}

/** The QDAD loop of lines 2 to 13 for node x, drawing addresses from `rng`. */
function qdadPick(work: AddressSnapshot, push: Push, x: string, rng: Rng, line?: number) {
  const Q = L.joinQdad
  let a = randInt(rng, 1, SPACE)
  push(`${x} picks address ${a} at random.`, line ?? Q.pick, { nodes: { [x]: 'current' } })
  let tries = 0
  for (let picks = 0; tries < QDAD_TRIES && picks < 50; ) {
    const hops = reach(work, x)
    work.control += hops.size
    push(`${x} floods AREQ ${a} (try ${tries + 1} of ${QDAD_TRIES}).`, line ?? Q.flood, { nodes: { [x]: 'current' } }, [
      { kind: 'AREQ', from: x, to: '*', label: `${a}` },
    ])
    const owner = work.nodes.map((n) => n.id).find((n) => n !== x && hops.has(n) && work.address[n] === a)
    if (owner) {
      work.control += hops.get(owner)!
      push(`${owner} already uses ${a}, so it answers with an AREP and ${x} picks again.`, line ?? Q.owner, {
        nodes: { [x]: 'current', [owner]: 'flagged' },
      })
      a = randInt(rng, 1, SPACE)
      picks += 1
      tries = 0
      push(`${x} picks address ${a} at random.`, line ?? Q.repick, { nodes: { [x]: 'current' } })
    } else {
      tries += 1
      push(`Nobody answers try ${tries}.`, line ?? Q.silence, { nodes: { [x]: 'current' } })
    }
  }
  work.address[x] = a
  push(`Three AREQs got no answer, so ${x} takes address ${a}.`, line ?? Q.take, { nodes: { [x]: 'found' } })
}

export function runJoinBuddy(state: AddressState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const parsed = parseJoin(work, input)
  if (!parsed) {
    push('Type a new node id and a configured neighbor, such as D C.', L.joinBuddy.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  if (largest(work.pool[parsed.via]) <= 1) {
    push(`${parsed.via} has no range left to split, so ${parsed.fresh} cannot join through it.`, L.joinBuddy.full, {
      nodes: { [parsed.via]: 'current' },
    })
    return { steps, finalSnapshot: cloneNet(work) }
  }
  addNode(work, parsed.fresh, parsed.via)
  buddySplit(work, push, parsed.fresh, parsed.via)
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runJoinQdad(state: AddressState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const parsed = parseJoin(work, input)
  if (!parsed) {
    push('Type a new node id and a configured neighbor, such as D C.', L.joinQdad.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  addNode(work, parsed.fresh, parsed.via)
  const rng = mulberry32(work.seed)
  qdadPick(work, push, parsed.fresh, rng)
  work.seed = Math.floor(rng() * 1_000_000) + 1
  return { steps, finalSnapshot: cloneNet(work) }
}

function oneNode(s: AddressSnapshot, input: unknown): string | null {
  const ids = parseIds(input)
  return ids.length === 1 && s.nodes.some((n) => n.id === ids[0]) ? ids[0] : null
}

export function runLeaveBuddy(state: AddressState, input: unknown): Result {
  const V = L.leaveBuddy
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const u = oneNode(work, input)
  if (!u) {
    push('Type a node id, such as C.', V.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const nbrs = neighbors(work, u)
  if (nbrs.length === 0) {
    push(`${u} has no neighbor to take its ranges, so it cannot hand them over.`, V.buddy, { nodes: { [u]: 'dropped' } })
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const mine = work.pool[u]
  const touches = (other: Range[]) => other.some((r) => mine.some((m) => r[1] + 1 === m[0] || m[1] + 1 === r[0]))
  const b = nbrs.find((n) => touches(work.pool[n])) ?? nbrs[0]
  const hl = { nodes: { [u]: 'current' as HighlightKind, [b]: 'new' as HighlightKind }, links: { [linkKey(u, b)]: 'active' as HighlightKind } }
  push(`${u} says goodbye and hands ${mine.length ? rangesText(mine) : 'no range'} to ${b}.`, V.hand, hl, [
    { kind: 'BYE', from: u, to: b },
  ])
  work.pool[b] = mergeTouching([...work.pool[b], ...mine])
  push(`${b} now holds ${rangesText(work.pool[b])}.`, V.hand, hl)
  removeNode(work, u)
  delete work.address[u]
  delete work.pool[u]
  push(`${u} leaves.`, V.remove, { nodes: { [b]: 'found' } })
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runCrashBuddy(state: AddressState, input: unknown): Result {
  const C = L.crash
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const u = oneNode(work, input)
  if (!u) {
    push('Type a node id, such as C.', C.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const lost = work.pool[u].reduce((t, r) => t + size(r), 0)
  const nbrs = neighbors(work, u)
  removeNode(work, u)
  delete work.address[u]
  delete work.pool[u]
  push(`${u} disappears without a goodbye.`, C.remove)
  work.leaked += lost
  push(`${plural(lost, 'address', 'addresses')} went with ${u}, and no node knows ${lost === 1 ? 'it is' : 'they are'} free.`, C.leak, {
    nodes: Object.fromEntries(nbrs.map((n) => [n, 'flagged' as HighlightKind])),
  })
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runMerge(state: AddressState): Result {
  const M = L.merge
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  if (work.merged || work.partition.nodes.length === 0 || work.nodes.length === 0) {
    push('The partition has already merged.', M.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const part = work.partition
  const first = part.nodes[0]
  const nearest = work.nodes.reduce((best, n) => (dist(n, first) < dist(best, first) ? n : best))
  work.nodes.push(...part.nodes.map((n) => ({ ...n, roles: [] })))
  work.links.push(...part.links, makeLink(nearest.id, first.id))
  for (const n of part.nodes) {
    work.address[n.id] = part.address[n.id]
    work.pool[n.id] = part.pool[n.id] ?? []
  }
  const ids = part.nodes.map((n) => n.id)
  work.merged = true
  work.partition = { nodes: [], links: [], address: {}, pool: {} }
  push(`The partition with ${listIds(ids)} comes into range: ${nearest.id} links to ${first.id}.`, M.link, {
    nodes: Object.fromEntries(ids.map((id) => [id, 'new' as HighlightKind])),
    links: { [linkKey(nearest.id, first.id)]: 'new' },
  })

  const pairs: { a: number; x: string; y: string }[] = []
  for (const x of ids) {
    const a = work.address[x]
    const y = work.nodes.find((n) => !ids.includes(n.id) && work.address[n.id] === a)
    if (a != null && y) pairs.push({ a, x, y: y.id })
  }
  pairs.sort((p, q) => p.a - q.a)
  const pending = new Set(pairs.map((p) => p.x))
  const rng = mulberry32(work.seed)
  for (const { a, x, y } of pairs) {
    work.conflicts += 1
    push(`${y} and ${x} both use address ${a}.`, M.conflict, { nodes: { [x]: 'flagged', [y]: 'flagged' } })
    work.pool[x] = []
    work.address[x] = null
    pending.delete(x)
    const via = neighbors(work, x).find((n) => !pending.has(n) && work.address[n] != null)
    if (!via) {
      push(`${x} has no configured neighbor to join through.`, M.rejoin, { nodes: { [x]: 'dropped' } })
      continue
    }
    if (work.scheme === 'buddy') buddySplit(work, push, x, via, M.rejoin)
    else qdadPick(work, push, x, rng, M.rejoin)
  }
  work.seed = Math.floor(rng() * 1_000_000) + 1
  push(
    pairs.length ? `${plural(pairs.length, 'conflict was', 'conflicts were')} found and resolved.` : 'No address is used twice.',
    M.done,
  )
  return { steps, finalSnapshot: cloneNet(work) }
}

const JOIN_PLACEHOLDER = 'New node and the node it meets, e.g. D C'

export const addressOperations: OperationDefinition<AddressState, unknown, AddressSnapshot>[] = [
  { id: 'join-buddy', label: 'Join', inputKind: 'text', placeholder: JOIN_PLACEHOLDER, variants: ['buddy'], run: runJoinBuddy },
  { id: 'join-qdad', label: 'Join', inputKind: 'text', placeholder: JOIN_PLACEHOLDER, variants: ['qdad'], run: runJoinQdad },
  { id: 'leave-buddy', label: 'Leave', inputKind: 'text', placeholder: 'Node, e.g. C', variants: ['buddy'], run: runLeaveBuddy },
  { id: 'crash-buddy', label: 'Crash', inputKind: 'text', placeholder: 'Node, e.g. C', variants: ['buddy'], run: runCrashBuddy },
  { id: 'merge', label: 'Merge partition', inputKind: 'none', run: runMerge },
]
