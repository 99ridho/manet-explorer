// SPEC.md §10.6: LCA cluster election by ID rule, with nodes leaving and joining.
import { cloneNet, linkKey, listIds, makeLink, neighbors, parseIds, plural, pyList, recorder, removeNode } from '@/lib/net'
import { connectedUnitDisk, freeSpot } from '@/lib/sim/placement'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { HighlightKind, NetHighlight, NetNode } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { ClusterSnapshot, ClusterState, Rule } from './types'
import { WHY } from './why'

type Result = OperationResult<ClusterSnapshot>
type Push = ReturnType<typeof recorder<ClusterSnapshot>>['push']
type Why = ReturnType<typeof recorder<ClusterSnapshot>>['why']

/** SPEC §10.6 seed: Week 4, "ID tertinggi di sekitarnya jadi cluster head" (Misra pp. 31-32). */
export function seedNetwork(rule: Rule = 'highest'): ClusterSnapshot {
  const nodes: NetNode[] = [
    { id: '9', x: 1, y: 1, roles: [] },
    { id: '4', x: 0, y: 0, roles: [] },
    { id: '2', x: 0, y: 2, roles: [] },
    { id: '6', x: 2, y: 1, roles: [] },
    { id: '8', x: 3, y: 1, roles: [] },
    { id: '3', x: 4, y: 0, roles: [] },
    { id: '5', x: 4, y: 2, roles: [] },
  ]
  const links = [
    ['9', '4'],
    ['9', '2'],
    ['9', '6'],
    ['6', '8'],
    ['8', '3'],
    ['8', '5'],
  ].map(([a, b]) => makeLink(a, b))
  return {
    nodes,
    links,
    range: 1.5,
    packets: [],
    rule,
    head: Object.fromEntries(nodes.map((n) => [n.id, null])),
    gateways: [],
    elections: 0,
  }
}

/** 7 to 10 nodes with distinct ids from 1 to 20, connected under the unit disk rule, all undecided. */
export function randomNetwork(rule: Rule, seed: number): ClusterSnapshot {
  const rng = mulberry32(seed)
  const pool = Array.from({ length: 20 }, (_, i) => String(i + 1))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const placed = connectedUnitDisk(rng, pool.slice(0, randInt(rng, 7, 10)), 4.5, 3, 1.5, 200)
  if (!placed) return seedNetwork(rule)
  return {
    ...seedNetwork(rule),
    nodes: placed.nodes,
    links: placed.links.map((l) => makeLink(l.a, l.b)),
    head: Object.fromEntries(placed.nodes.map((n) => [n.id, null])),
  }
}

/** True when `a` ranks before `b` under the rule. */
const ranksFirst = (rule: Rule, a: string, b: string) => (rule === 'highest' ? Number(a) > Number(b) : Number(a) < Number(b))
const best = (rule: Rule, ids: string[]) => ids.reduce((x, y) => (ranksFirst(rule, y, x) ? y : x))

const headsInRange = (s: ClusterSnapshot, n: string) => neighbors(s, n).filter((m) => s.head[m] === m)

/** Keeps the head and gateway roles on the nodes in step with `head` and `gateways`. */
function syncRoles(s: ClusterSnapshot) {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'head' && r !== 'gateway')
    if (s.head[n.id] === n.id) n.roles.push('head')
    if (s.gateways.includes(n.id)) n.roles.push('gateway')
  }
}

/** Member-to-head links drawn as the cluster structure. */
export function clusterLinks(s: ClusterSnapshot): Record<string, HighlightKind> {
  const out: Record<string, HighlightKind> = {}
  for (const n of s.nodes) {
    const h = s.head[n.id]
    if (h && h !== n.id) out[linkKey(n.id, h)] = 'tree'
  }
  return out
}

const view = (s: ClusterSnapshot, nodes: Record<string, HighlightKind> = {}, links: Record<string, HighlightKind> = {}): NetHighlight => ({
  nodes,
  links: { ...clusterLinks(s), ...links },
})

/** Lines 3 to 10 of elect over the undecided nodes; returns how many heads it made. `vars` binds v and n (not in leave's listing). */
function electUndecided(work: ClusterSnapshot, push: Push, why: Why, lines: { head: number; member: number }, vars = true): number {
  const rule = work.rule
  const word = rule === 'highest' ? 'highest' : 'lowest'
  const undecided = new Set(work.nodes.filter((n) => work.head[n.id] === null).map((n) => n.id))
  let made = 0
  while (undecided.size) {
    const candidates = work.nodes
      .map((n) => n.id)
      .filter((v) => undecided.has(v) && neighbors(work, v).every((m) => !undecided.has(m) || ranksFirst(rule, v, m)))
    const v = best(rule, candidates)
    const open = neighbors(work, v).filter((m) => undecided.has(m))
    work.head[v] = v
    undecided.delete(v)
    made += 1
    syncRoles(work)
    push(
      open.length
        ? `${v} has the ${word} id among its undecided neighbors, so it becomes a cluster head.`
        : `${v} has no undecided neighbor left, so it becomes a cluster head of its own.`,
      lines.head,
      view(work, { [v]: 'found' }),
      [],
      vars ? { v } : {},
    )
    why(open.length ? WHY.head(v, rule) : WHY.headAlone(v))
    for (const n of open) {
      work.head[n] = v
      undecided.delete(n)
      push(`${n} joins cluster head ${v}.`, lines.member, view(work, { [v]: 'found', [n]: 'new' }, { [linkKey(n, v)]: 'new' }), [], vars ? { v, n } : {})
      why(WHY.member(n, v))
    }
  }
  return made
}

function computeGateways(s: ClusterSnapshot): string[] {
  return s.nodes.map((n) => n.id).filter((n) => s.head[n] !== null && s.head[n] !== n && headsInRange(s, n).length >= 2)
}

function gatewaysStep(work: ClusterSnapshot, push: Push, why: Why, line: number) {
  work.gateways = computeGateways(work)
  syncRoles(work)
  push(
    work.gateways.length ? `Gateways are now ${listIds(work.gateways)}.` : 'No node is a gateway now.',
    line,
    view(work, Object.fromEntries(work.gateways.map((g) => [g, 'new' as HighlightKind]))),
  )
  why(WHY.gateways())
}

export function runElect(state: ClusterState): Result {
  const E = L.elect
  const work = cloneNet(state)
  const { steps, push, why } = recorder(work, { rank: work.rule })
  if (work.nodes.every((n) => work.head[n.id] !== null)) {
    push('Every node already has a cluster head.', E.none)
    why(WHY.allPlaced())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  electUndecided(work, push, why, E)
  work.gateways = []
  for (const n of computeGateways(work)) {
    work.gateways.push(n)
    syncRoles(work)
    push(`${n} neighbors cluster heads ${listIds(headsInRange(work, n))}, so it becomes a gateway.`, E.gateway, view(work, { [n]: 'new' }), [], { n })
    why(WHY.gateway(n))
  }
  const heads = work.nodes.filter((n) => work.head[n.id] === n.id).length
  push(`${plural(heads, 'cluster head')} and ${plural(work.gateways.length, 'gateway')}.`, E.done, view(work))
  why(WHY.done())
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runLeave(state: ClusterState, input: unknown): Result {
  const V = L.leave
  const work = cloneNet(state)
  const ids = parseIds(input)
  const u = ids.length === 1 ? ids[0] : null
  const { steps, push, why } = recorder(work, { u: u ?? 'None', rank: work.rule })
  if (!u || !work.nodes.some((n) => n.id === u)) {
    push(u ? `There is no node ${u}.` : 'Type a node id, such as 9.', V.def)
    why(WHY.needNode())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const wasHead = work.head[u] === u
  const members = work.nodes.map((n) => n.id).filter((n) => n !== u && work.head[n] === u)
  removeNode(work, u)
  delete work.head[u]
  work.gateways = work.gateways.filter((g) => g !== u)
  syncRoles(work)
  push(`${u} leaves the network.`, V.remove, view(work))
  why(WHY.left(u))
  if (wasHead) {
    for (const n of members) {
      const heads = headsInRange(work, n)
      if (heads.length) {
        const h = best(work.rule, heads)
        work.head[n] = h
        push(`${n} joins cluster head ${h}, which it can still hear.`, V.rejoin, view(work, { [n]: 'new', [h]: 'found' }), [], { n, heads: pyList(heads) })
        why(WHY.rejoin(n, h))
      } else {
        work.head[n] = null
        push(`${n} hears no cluster head, so it is undecided again.`, V.orphan, view(work, { [n]: 'dropped' }), [], { n })
        why(WHY.orphan(n))
      }
    }
    work.elections += electUndecided(work, push, why, { head: V.elect, member: V.elect }, false)
  }
  gatewaysStep(work, push, why, V.gateways)
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runJoin(state: ClusterState, input: unknown): Result {
  const J = L.join
  const work = cloneNet(state)
  const ids = parseIds(input)
  const byId = new Map(work.nodes.map((n) => [n.id, n]))
  const [u, ...nbrs] = ids
  const { steps, push, why } = recorder(work, { u: u ?? 'None', links: nbrs.length ? pyList([...new Set(nbrs)]) : 'None', rank: work.rule })
  if (!u || !/^\d{1,2}$/.test(u) || nbrs.length === 0) {
    push('Type a new id and its neighbors, such as 7 6 8.', J.def)
    why(WHY.joinInput())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  if (byId.has(u)) {
    push(`Node ${u} already exists.`, J.def)
    why(WHY.exists())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const missing = nbrs.find((x) => !byId.has(x))
  if (missing) {
    push(`There is no node ${missing} to link to.`, J.def)
    why(WHY.missing())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const unique = [...new Set(nbrs)]
  const cx = unique.reduce((t, x) => t + byId.get(x)!.x, 0) / unique.length
  const cy = unique.reduce((t, x) => t + byId.get(x)!.y, 0) / unique.length
  // A gap of 1 leaves room for the two head rings around a neighbor.
  const spot = freeSpot(work.nodes, { x: cx + 0.3, y: cy + 0.3 }, { x: cx, y: cy }, { gap: 1 })
  work.nodes.push({ id: u, ...spot, roles: [] })
  for (const x of unique) work.links.push(makeLink(u, x))
  work.head[u] = null
  push(`${u} joins the network with links to ${listIds(unique)}.`, J.add, view(work, { [u]: 'new' }))
  why(WHY.added(u))
  const heads = headsInRange(work, u)
  if (heads.length) {
    const h = best(work.rule, heads)
    work.head[u] = h
    push(`${u} joins cluster head ${h}, which it can hear.`, J.joins, view(work, { [u]: 'new', [h]: 'found' }), [], { heads: pyList(heads) })
    why(WHY.joins(u, h))
  } else {
    work.head[u] = u
    work.elections += 1
    syncRoles(work)
    push(`${u} hears no cluster head, so it becomes one.`, J.head, view(work, { [u]: 'found' }))
    why(WHY.newHead(u))
  }
  gatewaysStep(work, push, why, J.gateways)
  return { steps, finalSnapshot: cloneNet(work) }
}

export const clusterOperations: OperationDefinition<ClusterState, unknown, ClusterSnapshot>[] = [
  { id: 'elect', label: 'Elect', inputKind: 'none', run: runElect },
  { id: 'leave', label: 'Node leaves', inputKind: 'text', placeholder: 'Node, e.g. 9', run: runLeave },
  { id: 'join', label: 'Node joins', inputKind: 'text', placeholder: 'New id and its neighbors, e.g. 7 6 8', run: runJoin },
]
