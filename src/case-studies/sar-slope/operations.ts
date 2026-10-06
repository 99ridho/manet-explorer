// SPEC.md §19.1: route discovery to the base camp by MPR relays or blind flooding, sending a report,
// a radio that walks away, and the metrics run.
import { bridgesAndCuts, reaches } from '@/lib/graph'
import { cloneNet, linkKey, listIds, makeLink, neighbors, parseIds, plural, recorder } from '@/lib/net'
import { dist, unitDiskLinked } from '@/lib/sim/geometry'
import { pushMetricsSteps } from '@/lib/sim/metrics'
import { mulberry32 } from '@/lib/sim/rng'
import { runFlow, type RelayRule } from '@/lib/sim/run'
import { selectMpr } from '@/topics/broadcast/operations'
import type { HighlightKind, NetSnapshot } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { Focus, Relay, SarSnapshot, SarState } from './types'

type Result = OperationResult<SarSnapshot>

export const GATEWAY = 'G'
export const TEAM = ['T1', 'T2', 'T3']
export const RELAY_LABEL: Record<Relay, string> = { mpr: 'MPR relays', flooding: 'Blind flooding' }
/** The metrics narration names the design as an activity, so the verb agrees: "MPR relaying delivers". */
const RUN_LABEL: Record<Relay, string> = { mpr: 'MPR relaying', flooding: 'Blind flooding' }

function allMpr(s: Pick<NetSnapshot, 'nodes' | 'links'>): Record<string, string[]> {
  return Object.fromEntries(s.nodes.map((n) => [n.id, selectMpr(s, n.id).mpr]))
}

/** Recomputes what follows from the links alone: MPR sets, bridges, and articulation points. */
function settle(s: SarSnapshot): SarSnapshot {
  const { bridges, cuts } = bridgesAndCuts(s)
  return Object.assign(s, { mpr: allMpr(s), bridges, cuts })
}

/** SPEC §19.1 seed: an illustrative slope, set by Week 1's emergency-response example (Loo pp. 8-9). */
export function seedNetwork(relay: Relay = 'mpr'): SarSnapshot {
  const at: [string, number, number][] = [
    ['T1', 0, 4],
    ['T2', 1, 4.6],
    ['T3', 1, 3.4],
    ['R1', 2, 4],
    ['R2', 3, 3.4],
    ['R3', 3, 4.6],
    ['R4', 4, 4],
    ['R5', 5, 3],
    ['G', 6, 2],
  ]
  const nodes = at.map(([id, x, y]) => ({ id, x, y, roles: id === GATEWAY ? ['dest' as const] : [] }))
  const links = (
    [
      ['T1', 'T2'],
      ['T1', 'T3'],
      ['T2', 'T3'],
      ['T2', 'R1'],
      ['T3', 'R1'],
      ['R1', 'R2'],
      ['R1', 'R3'],
      ['R2', 'R3'],
      ['R2', 'R4'],
      ['R3', 'R4'],
      ['R4', 'R5'],
      ['R5', 'G'],
    ] as const
  ).map(([a, b]) => makeLink(a, b))
  const s: SarSnapshot = {
    nodes,
    links,
    range: 1.5,
    packets: [],
    relay,
    focus: 'topology',
    mpr: {},
    reverse: {},
    route: {},
    flow: null,
    tx: 0,
    dupes: 0,
    txBy: {},
    dupBy: {},
    bridges: [],
    cuts: [],
  }
  return settle(s)
}

/** The team moves to new spots within 1.5 of R1; its links follow the unit disk rule. */
export function randomNetwork(relay: Relay, seed: number): SarSnapshot {
  const rng = mulberry32(seed)
  const s = seedNetwork(relay)
  const r1 = s.nodes.find((n) => n.id === 'R1')!
  for (const t of s.nodes.filter((n) => TEAM.includes(n.id))) {
    const a = rng() * 2 * Math.PI
    const d = 0.6 + rng() * 0.9
    t.x = Math.round((r1.x + d * Math.cos(a)) * 10) / 10
    t.y = Math.round((r1.y + d * Math.sin(a)) * 10) / 10
  }
  s.links = s.links.filter((l) => !TEAM.includes(l.a) && !TEAM.includes(l.b))
  for (const t of TEAM)
    for (const n of s.nodes) {
      const p = s.nodes.find((x) => x.id === t)!
      if (n.id !== t && !(TEAM.includes(n.id) && n.id < t) && unitDiskLinked(dist(p, n), s.range)) s.links.push(makeLink(t, n.id))
    }
  return settle(s)
}

/** The route from `src` to G that the next-hop tables hold, or null. */
export function currentRoute(s: SarSnapshot, src: string | null): string[] | null {
  if (!src) return null
  const path = [src]
  while (path[path.length - 1] !== GATEWAY) {
    const nxt = s.route[path[path.length - 1]]
    if (!nxt || path.includes(nxt)) return null
    path.push(nxt)
  }
  return path
}

export const routeLinks = (path: string[]) => Object.fromEntries(path.slice(1).map((n, i) => [linkKey(path[i], n), 'tree' as HighlightKind]))

function teamRadio(s: SarSnapshot, input: unknown): string | null {
  const ids = parseIds(input)
  return ids.length === 1 && TEAM.includes(ids[0]) && s.nodes.some((n) => n.id === ids[0] && !n.down) ? ids[0] : null
}

function withSource(s: SarSnapshot, src: string) {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'source')
    if (n.id === src) n.roles.push('source')
  }
}

export function runDiscover(state: SarState, input: unknown): Result {
  const D = L.discover
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push } = recorder(work)
  const at = (focus: Focus) => (work.focus = focus)
  const src = teamRadio(work, input)
  if (!src) {
    at('topology')
    push('Type a team radio: T1, T2, or T3.', D.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  settle(work)
  withSource(work, src)
  Object.assign(work, { reverse: {}, route: {}, flow: src, tx: 0, dupes: 0, txBy: {}, dupBy: {} })
  at('topology')
  push(`${src} needs a route to G, so it starts a route discovery.`, D.start, { nodes: { [src]: 'current' } })

  at('broadcast')
  const mpr = work.relay === 'mpr'
  const got: Record<string, HighlightKind> = { [src]: 'visited' }
  const reached: Record<string, HighlightKind> = {}
  const seen = new Set([src])
  const queue: [string, string | null][] = [[src, null]]
  const vars = () => ({ tx: work.tx, dupes: work.dupes })
  while (queue.length) {
    const [v, from] = queue.shift()!
    if (v === GATEWAY) continue
    if (from !== null && mpr && !work.mpr[from]?.includes(v)) {
      push(`${v} is not an MPR of ${from}, so it does not relay.`, D.silent, { nodes: { ...got }, links: { ...reached } }, [], vars())
      continue
    }
    const nbrs = neighbors(work, v)
    work.tx += 1
    work.txBy = { ...work.txBy, [v]: (work.txBy[v] ?? 0) + 1 }
    push(`${v} transmits the RREQ to ${listIds(nbrs)}.`, D.transmit, { nodes: { ...got, [v]: 'current' }, links: { ...reached } }, [
      { kind: 'RREQ', from: v, to: '*' },
    ], vars())
    for (const n of nbrs) {
      if (seen.has(n)) {
        work.dupes += 1
        work.dupBy = { ...work.dupBy, [n]: (work.dupBy[n] ?? 0) + 1 }
        push(`${n} already has the RREQ, so this copy is a duplicate.`, D.dup, { nodes: { ...got, [n]: 'dropped' }, links: { ...reached } }, [], vars())
        continue
      }
      seen.add(n)
      work.reverse = { ...work.reverse, [n]: v }
      reached[linkKey(v, n)] = 'tree'
      push(`${n} records ${v} as its way back to ${src}.`, D.first, { nodes: { ...got, [n]: 'new' }, links: { ...reached, [linkKey(v, n)]: 'new' } }, [], vars())
      got[n] = 'visited'
      queue.push([n, v])
    }
  }

  at('route')
  if (!seen.has(GATEWAY)) {
    push(`The RREQ never reached G: there is no route from ${src}.`, D.rrep)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const rrep: Record<string, HighlightKind> = {}
  let w = GATEWAY
  while (w !== src) {
    const prev = work.reverse[w]
    work.route = { ...work.route, [prev]: w }
    rrep[linkKey(prev, w)] = 'tree'
    push(
      w === GATEWAY
        ? `The RREP goes from ${w} to ${prev}, so ${prev} now forwards straight to G.`
        : `The RREP goes from ${w} to ${prev}, so ${prev} now forwards to G through ${w}.`,
      D.rrep,
      { nodes: { [prev]: 'current' }, links: { ...rrep } },
      [{ kind: 'RREP', from: w, to: prev }],
    )
    w = prev
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runSend(state: SarState, input: unknown): Result {
  const S = L.send
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'route'
  const { steps, push } = recorder(work)
  const src = teamRadio(work, input)
  if (!src) {
    push('Type a team radio: T1, T2, or T3.', S.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const route = currentRoute(work, src)
  if (!route) {
    push(`${src} has no route to G. Run Discover route to base first.`, S.noRoute)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const done: Record<string, HighlightKind> = {}
  for (let i = 0; i + 1 < route.length; i++) {
    const [v, nxt] = [route[i], route[i + 1]]
    push(`${v} looks up G in its table: next hop ${nxt}.`, S.lookup, { nodes: { [v]: 'current' }, links: { ...done }, path: route })
    done[linkKey(v, nxt)] = 'tree'
    push(`The report moves from ${v} to ${nxt}.`, S.forward, { nodes: { [nxt]: 'current' }, links: { ...done }, path: route }, [
      { kind: 'DATA', from: v, to: nxt },
    ])
  }
  push(`The report reaches G after ${plural(route.length - 1, 'hop')}.`, S.done, { nodes: { [GATEWAY]: 'found' }, links: { ...done }, path: route })
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runWalkAway(state: SarState, input: unknown): Result {
  const W = L.walk
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push } = recorder(work)
  const ids = parseIds(input)
  const u = ids.length === 1 && ids[0] !== GATEWAY && work.nodes.some((n) => n.id === ids[0] && !n.down) ? ids[0] : null
  work.focus = 'topology'
  if (!u) {
    push('Type a radio on the slope, such as R2.', W.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  // Removals start before the removal: the radio is marked with its links still drawn.
  push(`${u} is about to walk out of range.`, W.move, { nodes: { [u]: 'current' } })
  const route = currentRoute(work, work.flow)
  const node = work.nodes.find((n) => n.id === u)!
  node.down = true
  work.links = work.links.filter((l) => l.a !== u && l.b !== u)
  settle(work)
  push(`${u} is out of range of every radio.`, W.move)

  const at = route ? route.indexOf(u) : -1
  if (route && at >= 0) {
    work.focus = 'route'
    const src = route[0]
    if (at > 0) {
      const up = route[at - 1]
      push(`${up} sends an RERR toward ${src}.`, W.rerr, { nodes: { [up]: 'current' } }, up === src ? [] : [{ kind: 'RERR', from: up, to: route[at - 2] }])
    }
    for (let i = at - 1; i >= 0; i--) {
      const n = route[i]
      push(`${n} deletes its route to G, which went through ${u}.`, W.remove, { nodes: { [n]: 'dropped' } })
      const next = { ...work.route }
      delete next[n]
      work.route = next
    }
    const nextR = { ...work.route }
    delete nextR[u]
    work.route = nextR
  }

  work.focus = 'topology'
  const team = TEAM.filter((t) => work.nodes.some((n) => n.id === t && !n.down))
  if (!team.some((t) => reaches(work, t, GATEWAY))) {
    push(`${u} was an articulation point: without it the team has no path to G.`, W.cut, { nodes: { [u]: 'flagged' } })
    return { steps, finalSnapshot: cloneNet(work) }
  }
  push('The team can still reach G another way. Run Discover route to base again.', W.ok)
  return { steps, finalSnapshot: cloneNet(work) }
}

/** MPR relaying for the metrics run: v relays only for a node that chose it. */
const mprRule: RelayRule = (net, v, from) => selectMpr(net, from).mpr.includes(v)

export function runMetrics(state: SarState): Result {
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'route'
  const { steps, push } = recorder(work)
  const net = { nodes: work.nodes, links: work.links }
  const order: Relay[] = work.relay === 'mpr' ? ['mpr', 'flooding'] : ['flooding', 'mpr']
  const flows = TEAM.filter((t) => work.nodes.some((n) => n.id === t && !n.down)).map((src) => ({ src, dst: GATEWAY, packets: 5 }))
  const designs = order.map((r) => ({
    label: RUN_LABEL[r],
    runs: flows.map((f) => runFlow(f, { ticks: 30, topologyAt: () => net, relays: r === 'mpr' ? mprRule : undefined })),
  }))
  pushMetricsSteps(push, 'the slope as it stands', designs, (r) => {
    if (r) work.metrics = r
    else delete work.metrics
  })
  return { steps, finalSnapshot: cloneNet(work) }
}

const RADIO = 'Team radio, e.g. T1'

export const sarOperations: OperationDefinition<SarState, unknown, SarSnapshot>[] = [
  { id: 'discover-mpr', label: 'Discover route to base', inputKind: 'text', placeholder: RADIO, variants: ['mpr'], run: runDiscover },
  { id: 'discover-flooding', label: 'Discover route to base', inputKind: 'text', placeholder: RADIO, variants: ['flooding'], run: runDiscover },
  { id: 'send', label: 'Send report', inputKind: 'text', placeholder: RADIO, run: runSend },
  { id: 'walk-away', label: 'Radio walks away', inputKind: 'text', placeholder: 'Radio, e.g. R2', run: runWalkAway },
  { id: 'metrics', label: 'Metrics run', inputKind: 'none', run: runMetrics },
]
