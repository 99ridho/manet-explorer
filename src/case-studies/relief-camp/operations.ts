// SPEC.md §19.2: volunteers join with Buddy addresses, elect cluster heads by highest ID, and move
// through the day as teams (RPGM) or alone (RWP); the metrics run compares the two.
import { cloneNet, linkKey, listIds, makeLink, neighbors, plural, recorder } from '@/lib/net'
import { dist } from '@/lib/sim/geometry'
import { freeSpot } from '@/lib/sim/placement'
import { pushMetricsSteps } from '@/lib/sim/metrics'
import { initMotion, moveAll, recordLinks, tickRng, unitDiskLinks, type Group, type MobilityParams } from '@/lib/sim/mobility'
import { mulberry32 } from '@/lib/sim/rng'
import { runFlow, type Topology } from '@/lib/sim/run'
import type { HighlightKind, NetHighlight } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { CampSnapshot, CampState, Focus, Mobility, Range } from './types'
import { WHY } from './why'

type Result = OperationResult<CampSnapshot>
type Push = ReturnType<typeof recorder<CampSnapshot>>['push']
type Why = ReturnType<typeof recorder<CampSnapshot>>['why']

/** This demo's parameters (SPEC §19.2), shown in the Protocol tab. */
export const PARAMS: MobilityParams = { area: { w: 12, h: 8 }, speed: [0.3, 0.8], pause: [0, 2], groupSpeed: 0.5, radius: 0.8 }
export const SPACE = 256
const RANGE = 3
const SEED = 9
export const TEAMS = [
  ['9', '4', '2'],
  ['8', '6', '3'],
  ['7', '5', '1'],
]
const JOIN_ORDER = ['9', '4', '2', '6', '8', '3', '5', '7', '1']
/** Short enough for the variant tabs at 400px; the Protocol tab gives the full names. */
export const MOBILITY_LABEL: Record<Mobility, string> = { rpgm: 'Teams (RPGM)', rwp: 'Alone (RWP)' }
const RUN_LABEL: Record<Mobility, string> = { rpgm: 'RPGM', rwp: 'RWP' }

const size = (r: Range) => r[1] - r[0] + 1
const largest = (pool: Range[]) => pool.reduce((m, r) => Math.max(m, size(r)), 0)
const rangeText = (r: Range) => (r[0] === r[1] ? `${r[0]}` : `${r[0]} to ${r[1]}`)
const byId = (s: CampSnapshot, id: string) => s.nodes.find((n) => n.id === id)!
const isHead = (s: CampSnapshot, id: string) => s.head[id] === id
const headsInRange = (s: CampSnapshot, id: string) => neighbors(s, id).filter((m) => isHead(s, m))
/** Highest ID first. */
const best = (ids: string[]) => ids.reduce((a, b) => (Number(b) > Number(a) ? b : a))

/** The Buddy split of SPEC §10.7, without steps; returns the ranges for the step text. */
function split(s: CampSnapshot, via: string, u: string): { whole: Range; keep: Range; give: Range } {
  const pool = s.pool[via]
  const whole = pool.reduce((b, r) => (size(r) > size(b) ? r : b))
  const mid = Math.floor((whole[0] + whole[1]) / 2)
  let keep: Range = [whole[0], mid]
  let give: Range = [mid + 1, whole[1]]
  const own = s.address[via]
  if (own != null && own > mid && own <= whole[1]) [keep, give] = [give, keep]
  s.pool = { ...s.pool, [via]: pool.map((r) => (r === whole ? keep : r)), [u]: [give] }
  s.address = { ...s.address, [u]: give[0] }
  return { whole, keep, give }
}

function syncRoles(s: CampSnapshot) {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'head' && r !== 'gateway')
    if (isHead(s, n.id)) n.roles.push('head')
    if (s.gateways.includes(n.id)) n.roles.push('gateway')
  }
}

function computeGateways(s: CampSnapshot) {
  s.gateways = s.nodes.map((n) => n.id).filter((n) => s.head[n] && !isHead(s, n) && headsInRange(s, n).length >= 2)
  syncRoles(s)
}

export function clusterLinks(s: CampSnapshot): Record<string, HighlightKind> {
  const out: Record<string, HighlightKind> = {}
  for (const n of s.nodes) {
    const h = s.head[n.id]
    if (h && h !== n.id && neighbors(s, n.id).includes(h)) out[linkKey(n.id, h)] = 'tree'
  }
  return out
}

const view = (s: CampSnapshot, nodes: Record<string, HighlightKind> = {}, links: Record<string, HighlightKind> = {}): NetHighlight => ({
  nodes,
  links: { ...clusterLinks(s), ...links },
})

/** Lines 2 to 13 of Elect over the nodes with an address and no head. */
function elect(s: CampSnapshot, push?: Push, why?: Why) {
  const undecided = new Set(s.nodes.filter((n) => s.address[n.id] != null && s.head[n.id] == null).map((n) => n.id))
  while (undecided.size) {
    const candidates = s.nodes
      .map((n) => n.id)
      .filter((v) => undecided.has(v) && neighbors(s, v).every((m) => !undecided.has(m) || Number(v) > Number(m)))
    const v = best(candidates)
    const open = neighbors(s, v).filter((m) => undecided.has(m))
    s.head = { ...s.head, [v]: v }
    undecided.delete(v)
    syncRoles(s)
    push?.(
      open.length
        ? `${v} has the highest id among its undecided neighbors, so it becomes a cluster head.`
        : `${v} has no undecided neighbor left, so it becomes a cluster head of its own.`,
      L.elect.head,
      view(s, { [v]: 'found' }),
      [],
      { v },
    )
    why?.(open.length ? WHY.head(v) : WHY.headAlone(v))
    for (const n of open) {
      s.head = { ...s.head, [n]: v }
      undecided.delete(n)
      push?.(`${n} joins cluster head ${v}.`, L.elect.member, view(s, { [v]: 'found', [n]: 'new' }, { [linkKey(n, v)]: 'new' }), [], { v, n })
      why?.(WHY.member(n, v))
    }
  }
}

/** SPEC §19.2 seed: three teams of three, addresses from Buddy joins, heads from Elect. */
export function seedNetwork(mobility: Mobility = 'rpgm', seed = SEED): CampSnapshot {
  const at: [string, number, number][] = [
    ['9', 3, 3],
    ['4', 2.4, 3.5],
    ['2', 3.5, 2.4],
    ['8', 6, 5],
    ['6', 5.4, 4.4],
    ['3', 6.6, 5.5],
    ['7', 9, 3],
    ['5', 8.4, 3.6],
    ['1', 9.5, 2.4],
  ]
  const nodes = at.map(([id, x, y]) => ({ id, x, y, roles: [] }))
  const groups: Group[] | undefined =
    mobility === 'rpgm'
      ? TEAMS.map((members) => {
          const { x, y } = nodes.find((n) => n.id === members[0])!
          const path = [
            { x, y },
            { x: x + 2, y },
            { x: x + 2, y: y + 2 },
            { x, y: y + 2 },
          ]
          return { ref: { x, y }, path, step: 1, members: [...members] }
        })
      : undefined
  const links = unitDiskLinks(nodes, RANGE)
  const s: CampSnapshot = {
    nodes,
    links,
    range: RANGE,
    packets: [],
    mobility,
    focus: 'clusters',
    space: SPACE,
    address: {},
    pool: {},
    head: {},
    gateways: [],
    elections: 0,
    seed,
    tick: 0,
    area: PARAMS.area,
    motion: initMotion(mulberry32(seed), nodes, PARAMS, groups),
    groups,
    history: [],
    linkChanges: 0,
    linkAge: Object.fromEntries(links.map((l) => [linkKey(l.a, l.b), 0])),
    closedDurations: [],
    pairsConnected: 0,
    pairsTotal: 0,
  }
  // Buddy joins in the SPEC's order, each through its nearest configured neighbor.
  for (const id of JOIN_ORDER) {
    if (id === JOIN_ORDER[0]) {
      s.pool[id] = [[1, SPACE]]
      s.address[id] = 1
      continue
    }
    const near = neighbors(s, id)
      .filter((n) => s.address[n] != null && largest(s.pool[n]) > 1)
      .sort((a, b) => dist(byId(s, id), byId(s, a)) - dist(byId(s, id), byId(s, b)))
    if (near.length) split(s, near[0], id)
  }
  elect(s)
  computeGateways(s)
  return s
}

const nearestFirst = (s: CampSnapshot, u: string) =>
  neighbors(s, u)
    .map((n, i) => ({ n, i, d: dist(byId(s, u), byId(s, n)) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .map((x) => x.n)

export function runJoin(state: CampState, input: unknown): Result {
  const J = L.join
  const work = cloneNet(state)
  delete work.metrics
  const at = (f: Focus) => (work.focus = f)
  const parts = String(input ?? '').trim().split(/[\s,]+/).filter(Boolean)
  const [u, near] = parts
  const valid = parts.length === 2 && /^\d{1,3}$/.test(u) && !work.nodes.some((n) => n.id === u) && work.nodes.some((n) => n.id === near && !n.down)
  const { steps, push, why } = recorder(work, { u: valid ? u : 'None', near: valid ? near : 'None' })
  if (!valid) {
    at('addresses')
    push('Type a new id and a nearby volunteer, such as 10 7.', J.def)
    why(WHY.joinInput())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const anchor = byId(work, near)
  const p = freeSpot(work.nodes, { x: anchor.x + 0.5, y: anchor.y - 0.5 }, anchor)
  work.nodes.push({ id: u, x: p.x, y: p.y, roles: [] })
  for (const n of work.nodes) if (n.id !== u && !n.down && dist(n, p) <= work.range + 1e-9) work.links.push(makeLink(u, n.id))
  work.address = { ...work.address, [u]: null }
  work.head = { ...work.head, [u]: null }
  work.motion = { ...work.motion, [u]: { tx: p.x, ty: p.y, speed: PARAMS.speed[0], pause: 0 } }
  const g = work.groups?.find((g) => g.members.includes(near))
  if (g) g.members.push(u)
  const order = nearestFirst(work, u)
  at('addresses')
  push(`${u} arrives next to ${near} and hears ${order.length ? listIds(order) : 'no one'}.`, J.place, { nodes: { [u]: 'new' } })
  why(WHY.arrive(u))

  let via: string | null = null
  for (const n of order) {
    if (work.address[n] == null || largest(work.pool[n] ?? []) <= 1) {
      push(`${n} has no spare address, so ${u} asks the next neighbor.`, J.skip, { nodes: { [n]: 'dropped', [u]: 'current' } }, [], { n })
      why(WHY.skip(n))
      continue
    }
    via = n
    break
  }
  if (!via) {
    push(`No neighbor of ${u} has a spare address, so ${u} cannot join yet.`, J.wait, { nodes: { [u]: 'dropped' } })
    why(WHY.wait(u))
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const hl = { nodes: { [via]: 'current' as HighlightKind, [u]: 'new' as HighlightKind }, links: { [linkKey(u, via)]: 'active' as HighlightKind } }
  const whole = work.pool[via].reduce((b, r) => (size(r) > size(b) ? r : b))
  push(`${via} splits ${rangeText(whole)} in half.`, J.buddy, hl, [], { n: via })
  why(WHY.split(via))
  const { keep, give } = split(work, via, u)
  push(`${via} keeps ${rangeText(keep)} and gives ${rangeText(give)} to ${u}.`, J.buddy, hl, [], { n: via })
  why(WHY.hand(via))
  push(`${u} takes address ${give[0]} without asking any other node.`, J.buddy, { nodes: { [u]: 'found' } }, [], { n: via })
  why(WHY.address(u))

  at('clusters')
  const heads = headsInRange(work, u)
  if (heads.length) {
    const h = best(heads)
    work.head = { ...work.head, [u]: h }
    computeGateways(work)
    push(`${u} joins cluster head ${h}, which it can hear.`, J.cluster, view(work, { [u]: 'new', [h]: 'found' }))
    why(WHY.joinsHead(u, h))
  } else {
    work.head = { ...work.head, [u]: u }
    work.elections += 1
    computeGateways(work)
    push(`${u} hears no cluster head, so it becomes one.`, J.cluster, view(work, { [u]: 'found' }))
    why(WHY.newHead(u))
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runElect(state: CampState): Result {
  const E = L.elect
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'clusters'
  const { steps, push, why } = recorder(work, { rank: 'highest' })
  work.head = Object.fromEntries(work.nodes.map((n) => [n.id, null]))
  work.gateways = []
  syncRoles(work)
  if (!work.nodes.some((n) => work.address[n.id] != null)) {
    push('Every node already has a cluster head.', E.none)
    why(WHY.noneToElect())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  elect(work, push, why)
  for (const n of work.nodes.map((x) => x.id).filter((n) => work.head[n] && !isHead(work, n) && headsInRange(work, n).length >= 2)) {
    work.gateways = [...work.gateways, n]
    syncRoles(work)
    push(`${n} neighbors cluster heads ${listIds(headsInRange(work, n))}, so it becomes a gateway.`, E.gateway, view(work, { [n]: 'new' }), [], { n })
    why(WHY.gateway(n))
  }
  const heads = work.nodes.filter((n) => isHead(work, n.id)).length
  push(`${plural(heads, 'cluster head')} and ${plural(work.gateways.length, 'gateway')}.`, E.done, view(work))
  why(WHY.elected())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** One tick in place: move, relink, and let every member that lost its head find another. */
export function tickCamp(s: CampSnapshot): { lost: number; joined: number; became: number } {
  const before = s.links
  moveAll(tickRng(s.seed, s.tick), s.nodes, s.motion, PARAMS, s.groups)
  s.links = unitDiskLinks(s.nodes, s.range)
  recordLinks(s, before, s.links, s.nodes)
  for (const n of s.nodes) s.history.push({ x: n.x, y: n.y })
  s.tick += 1
  let lost = 0
  let joined = 0
  let became = 0
  for (const v of s.nodes.map((n) => n.id)) {
    const h = s.head[v]
    if (!h || h === v) continue
    if (neighbors(s, v).includes(h)) continue
    lost += 1
    const heads = headsInRange(s, v)
    if (heads.length) {
      s.head = { ...s.head, [v]: best(heads) }
      joined += 1
    } else {
      s.head = { ...s.head, [v]: v }
      s.elections += 1
      became += 1
    }
  }
  computeGateways(s)
  return { lost, joined, became }
}

export function runAdvance(state: CampState, input: unknown): Result {
  const A = L.advance
  const work = cloneNet(state)
  delete work.metrics
  const ticks = Number(input)
  const valid = Number.isInteger(ticks) && ticks >= 1 && ticks <= 30
  const { steps, push, why } = recorder(work, { ticks: valid ? ticks : 'None' })
  if (!valid) {
    work.focus = 'movement'
    push('Type a number of ticks from 1 to 30.', A.def)
    why(WHY.ticks())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const start = work.elections
  for (let i = 0; i < ticks; i++) {
    const { lost, joined, became } = tickCamp(work)
    if (lost === 0) {
      work.focus = 'movement'
      push(`Tick ${work.tick}: ${plural(work.links.length, 'link')}, and every member still hears its head.`, A.calm, view(work), [], { t: i })
      why(WHY.calm())
    } else {
      work.focus = 'clusters'
      push(
        `Tick ${work.tick}: ${plural(lost, 'volunteer')} lost their head; ${joined} joined another head and ${became} became heads.`,
        A.changes,
        view(work),
        [],
        { t: i },
      )
      why(WHY.changes())
    }
  }
  work.focus = 'clusters'
  push(`After ${plural(ticks, 'tick')} the camp elected ${plural(work.elections - start, 'new head')}.`, A.done, view(work))
  why(WHY.done())
  return { steps, finalSnapshot: cloneNet(work) }
}

export const METRICS_TICKS = 30
export const METRICS_FLOWS = [
  { src: '2', dst: '4' },
  { src: '3', dst: '6' },
  { src: '1', dst: '5' },
  { src: '2', dst: '1' },
]

/** The topology at every tick of a fresh camp on `seed` under `mobility`. */
export function campTrajectory(mobility: Mobility, seed: number, ticks: number): Topology[] {
  const s = seedNetwork(mobility, seed)
  const topo: Topology[] = []
  for (let t = 0; t < ticks; t++) {
    topo.push({ nodes: s.nodes.map((n) => ({ ...n })), links: s.links.map((l) => ({ ...l })) })
    tickCamp(s)
  }
  return topo
}

export function runMetrics(state: CampState): Result {
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'movement'
  const { steps, push, why } = recorder(work, { seed: work.seed })
  const order: Mobility[] = work.mobility === 'rpgm' ? ['rpgm', 'rwp'] : ['rwp', 'rpgm']
  const designs = order.map((m) => {
    const topo = campTrajectory(m, work.seed, METRICS_TICKS)
    return {
      label: RUN_LABEL[m],
      runs: METRICS_FLOWS.map((f) => runFlow({ ...f, packets: METRICS_TICKS }, { ticks: METRICS_TICKS, topologyAt: (t) => topo[t] })),
    }
  })
  pushMetricsSteps(push, `seed ${work.seed}`, designs, (r) => {
    if (r) work.metrics = r
    else delete work.metrics
  }, why)
  return { steps, finalSnapshot: cloneNet(work) }
}

export const campOperations: OperationDefinition<CampState, unknown, CampSnapshot>[] = [
  { id: 'join', label: 'Volunteer joins', inputKind: 'text', placeholder: 'New id and a nearby volunteer, e.g. 10 7', run: runJoin },
  { id: 'elect', label: 'Elect cluster heads', inputKind: 'none', run: runElect },
  { id: 'advance', label: 'Advance the day', inputKind: 'key', placeholder: 'Ticks, from 1 to 30', run: runAdvance },
  { id: 'metrics', label: 'Metrics run', inputKind: 'none', run: runMetrics },
]
