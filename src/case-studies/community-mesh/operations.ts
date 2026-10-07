// SPEC.md §19.3: a household picks a route to the gateway by hop count or ETX, a router that lies
// about a link joins, and packets cross weak links with retries while the watchdog listens.
import { floodRreq } from '@/lib/dsr-flood'
import { cloneNet, findLink, linkKey, listIds, makeLink, pyList, recorder } from '@/lib/net'
import { pushMetricsSteps } from '@/lib/sim/metrics'
import { mulberry32 } from '@/lib/sim/rng'
import type { FlowRun } from '@/lib/sim/run'
import type { HighlightKind, NetLink } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { Candidate, MeshSnapshot, MeshState, Routing } from './types'
import { WHY } from './why'

type Result = OperationResult<MeshSnapshot>
type Push = ReturnType<typeof recorder<MeshSnapshot>>['push']
type Why = ReturnType<typeof recorder<MeshSnapshot>>['why']

export const SRC = 'S'
export const DST = 'D'
export const MALLORY = 'M'
const TRIES = 4
const THRESHOLD = 3
const SEED = 3
export const ROUTING_LABEL: Record<Routing, string> = { 'etx-watchdog': 'ETX with watchdog', hop: 'Hop count' }

/** SPEC §19.3 seed: an illustrative mesh; the delivery ratios are example values, captioned so. */
export function seedNetwork(routing: Routing = 'etx-watchdog', seed = SEED): MeshSnapshot {
  const at: [string, number, number][] = [
    ['S', 0, 1],
    ['A', 1, 0],
    ['B', 2, 0],
    ['C', 3, 0],
    ['X', 1.5, 2],
    ['D', 4, 1],
  ]
  const nodes = at.map(([id, x, y]) => ({ id, x, y, roles: id === SRC ? ['source' as const] : id === DST ? ['dest' as const] : [] }))
  const links = (
    [
      ['S', 'A', 0.95],
      ['A', 'B', 0.95],
      ['B', 'C', 0.95],
      ['C', 'D', 0.95],
      ['S', 'X', 0.5],
      ['X', 'D', 0.5],
    ] as const
  ).map(([a, b, w]) => makeLink(a, b, { quality: w, qualityBack: w }))
  return {
    nodes,
    links,
    range: 2.5,
    packets: [],
    routing,
    focus: 'links',
    seed,
    joined: false,
    route: null,
    candidates: [],
    sent: 0,
    delivered: 0,
    dropped: 0,
    failures: {},
    flagged: [],
    transmissions: [],
    tries: 0,
    control: 0,
  }
}

export const etxOf = (l: NetLink) => 1 / ((l.quality ?? 1) * (l.qualityBack ?? l.quality ?? 1))
export const routeEtx = (s: MeshSnapshot, route: string[]) => route.slice(1).reduce((c, n, i) => c + etxOf(findLink(s, route[i], n)!), 0)
const f2 = (n: number) => n.toFixed(2)
export const tree = (route: string[]) => Object.fromEntries(route.slice(1).map((n, i) => [linkKey(route[i], n), 'tree' as HighlightKind]))
const isBlackHole = (s: MeshSnapshot, id: string) => s.joined && id === MALLORY

function pick(s: MeshSnapshot, candidates: Candidate[]): Candidate | null {
  if (!candidates.length) return null
  // reduce keeps the earlier candidate on a tie, so the first to arrive wins.
  return s.routing === 'hop'
    ? candidates.reduce((b, c) => (c.hops < b.hops ? c : b))
    : candidates.reduce((b, c) => (c.etx < b.etx - 1e-9 ? c : b))
}

export function runFindRoute(state: MeshState): Result {
  const R = L.route
  const work = cloneNet(state)
  delete work.metrics
  work.route = null
  work.candidates = []
  work.focus = 'route'
  const { steps, push, why } = recorder(work, { src: SRC, dst: DST, routing: work.routing === 'hop' ? "'hop'" : "'etx'" })
  const lines = { tick: R.flood, blackHole: R.flood, tunnel: R.flood, dest: R.flood, arrival: R.flood }
  // The flood runs inside flood_rreq() here, so its record and route variables stay off the call's line.
  const flat: typeof push = (d, l, h, p) => push(d, l, h, p)
  const { routes, rreq } = floodRreq(work, SRC, DST, { blackHole: (id) => isBlackHole(work, id), farEnd: () => null }, flat, why, lines)
  work.control += rreq + routes.reduce((c, r) => c + r.length - 1, 0)
  work.candidates = routes.map((route) => ({ route, hops: route.length - 1, etx: routeEtx(work, route) }))
  for (const c of work.candidates) {
    push(`Candidate ${listIds(c.route)}: ${c.hops} hops, ETX ${f2(c.etx)}.`, R.flood, { links: tree(c.route), path: c.route })
    why(WHY.candidate())
  }
  const best = pick(work, work.candidates)
  if (!best) {
    push(`No RREP reached ${SRC}, so there is no route to ${DST}.`, R.flood)
    why(WHY.noAnswer())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  work.route = best.route
  push(
    work.routing === 'hop'
      ? `${listIds(best.route)} has the fewest hops, so S uses it.`
      : `${listIds(best.route)} has the smallest ETX, ${f2(best.etx)}, so S uses it.`,
    work.routing === 'hop' ? R.hop : R.etx,
    { links: tree(best.route), path: best.route },
  )
  why(work.routing === 'hop' ? WHY.pickHop() : WHY.pickEtx())
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runJoinM(state: MeshState): Result {
  const J = L.join
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'links'
  const { steps, push, why } = recorder(work)
  if (work.joined) {
    push('M has already joined.', J.def)
    why(WHY.joined())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  work.joined = true
  work.nodes.push({ id: MALLORY, x: 0.8, y: 1.8, roles: [] })
  work.links.push(makeLink(SRC, MALLORY, { quality: 0.95, qualityBack: 0.95 }))
  push('A new router M appears next to S.', J.add, { nodes: { [MALLORY]: 'new' }, links: { [linkKey(SRC, MALLORY)]: 'new' } })
  why(WHY.appears())
  // The claimed link carries no radio traffic; it is drawn dashed and only M's RREP uses it.
  work.links.push(makeLink(MALLORY, DST, { quality: 1, qualityBack: 1, virtual: true, broken: true }))
  push('M advertises a link to D that does not exist.', J.advertise, { nodes: { [MALLORY]: 'current' }, links: { [linkKey(MALLORY, DST)]: 'active' } })
  why(WHY.advertise())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** One packet along the route; `push` is absent in the metrics run. Returns the transmissions it took. */
function deliverOne(work: MeshSnapshot, p: number, push?: Push, why?: Why) {
  const D = L.deliver
  const route = work.route!
  const rng = mulberry32((Math.imul(work.seed, 7919) + p) >>> 0)
  let tries = 0
  work.sent += 1
  for (let h = 0; h + 1 < route.length; h++) {
    const [v, nxt] = [route[h], route[h + 1]]
    if (isBlackHole(work, v)) {
      work.dropped += 1
      work.focus = 'route'
      push?.(`M drops packet ${p} without a trace.`, D.drop, { nodes: { [v]: 'dropped' }, links: tree(route) }, [], { p, v })
      why?.(WHY.drop())
      return
    }
    const link = findLink(work, v, nxt)!
    const ok = (link.quality ?? 1) * (link.qualityBack ?? 1)
    let sent = false
    for (let t = 0; t < TRIES && !sent; t++) {
      tries += 1
      work.tries += 1
      sent = rng() < ok
    }
    if (!sent) {
      work.dropped += 1
      work.focus = 'links'
      push?.(
        `${v} tried 4 times to reach ${nxt} and got no ACK, so packet ${p} is lost.`,
        D.lost,
        { nodes: { [v]: 'current' }, links: { [linkKey(v, nxt)]: 'dropped' } },
        [],
        { p, v, nxt },
      )
      why?.(WHY.lost(v, nxt))
      return
    }
    if (work.routing === 'etx-watchdog' && isBlackHole(work, nxt)) watch(work, v, nxt, p, push, why)
  }
  work.delivered += 1
  work.transmissions = [...work.transmissions, tries]
  work.focus = 'route'
  push?.(`Packet ${p} reaches D after ${tries} transmissions.`, D.delivered, { nodes: { [DST]: 'found' }, links: tree(route), path: route }, [
    { kind: 'DATA', from: route[route.length - 2], to: DST, label: `${p}` },
  ], { p, delivered: 'True' })
  why?.(WHY.delivered())
}

/** SPEC §10.11 lines 7 to 10: v never hears nxt forward p. */
function watch(work: MeshSnapshot, v: string, nxt: string, p: number, push?: Push, why?: Why) {
  const D = L.deliver
  const at = { p, v, nxt }
  const f = (work.failures[nxt] ?? 0) + 1
  work.failures = { ...work.failures, [nxt]: f }
  work.focus = 'trust'
  push?.(`${v} never hears ${nxt} forward packet ${p}: ${f} ${f === 1 ? 'failure' : 'failures'} for ${nxt}.`, D.watch, { nodes: { [nxt]: 'flagged' } }, [], at)
  why?.(WHY.silence(v))
  if (f <= THRESHOLD || work.flagged.includes(nxt)) return
  work.flagged = [...work.flagged, nxt]
  work.control += 1
  push?.(`${nxt} passed the threshold of ${THRESHOLD}, so ${v} reports it${v === SRC ? '' : ` to ${SRC}`}.`, D.watch, { nodes: { [nxt]: 'flagged' } }, [], at)
  why?.(WHY.report(v))
  const others = work.candidates.filter((c) => !c.route.includes(nxt))
  const next = others.length ? others.reduce((b, c) => (c.etx < b.etx - 1e-9 ? c : b)) : null
  if (next) {
    push?.(`The pathrater avoids ${nxt}: ${SRC} switches to ${listIds(next.route)}.`, D.watch, { links: tree(next.route), path: next.route }, [], at)
    why?.(WHY.reroute())
    work.route = next.route
  } else {
    push?.(`The pathrater avoids ${nxt}, but ${SRC} has no other route.`, D.watch, { nodes: { [nxt]: 'flagged' } }, [], at)
    why?.(WHY.noOther())
  }
}

export function runDeliver(state: MeshState, input: unknown): Result {
  const D = L.deliver
  const work = cloneNet(state)
  delete work.metrics
  const k = Number(input)
  const valid = Number.isInteger(k) && k >= 1 && k <= 30
  const { steps, push, why } = recorder(work, {
    route: work.route ? pyList(work.route) : 'None',
    k: valid ? k : 'None',
    watchdog: work.routing === 'etx-watchdog' ? 'True' : 'False',
  })
  if (!valid) {
    push('Type a number of packets from 1 to 30.', D.def)
    why(WHY.packets())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  if (!work.route) {
    push('There is no route yet. Run Find route first.', D.def)
    why(WHY.noRoute())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const before = work.delivered
  for (let i = 0; i < k; i++) deliverOne(work, work.sent + 1, push, why)
  const d = work.delivered - before
  work.focus = 'route'
  push(`${d} of ${k} packets reached D: ${((100 * d) / k).toFixed(1)} %.`, D.done)
  why(WHY.total())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** Join M, find a route, and send `k` packets without steps: one design's metrics run. */
export function meshRun(routing: Routing, seed: number, k: number): FlowRun {
  let s = runJoinM(seedNetwork(routing, seed)).finalSnapshot
  s = runFindRoute(s).finalSnapshot
  for (let p = 1; p <= k && s.route; p++) deliverOne(s, p)
  return {
    flow: { src: SRC, dst: DST, packets: k },
    sent: s.sent,
    delivered: s.delivered,
    delays: s.transmissions,
    control: s.control,
    lastTick: s.tries, // one try per tick, packets sent one after another
  }
}

export function runMetrics(state: MeshState): Result {
  const work = cloneNet(state)
  delete work.metrics
  work.focus = 'route'
  const { steps, push, why } = recorder(work, { seed: work.seed })
  const order: Routing[] = work.routing === 'etx-watchdog' ? ['etx-watchdog', 'hop'] : ['hop', 'etx-watchdog']
  const designs = order.map((r) => ({ label: ROUTING_LABEL[r], runs: [meshRun(r, work.seed, 30)] }))
  pushMetricsSteps(push, `seed ${work.seed}, with M joined`, designs, (r) => {
    if (r) work.metrics = r
    else delete work.metrics
  }, why)
  return { steps, finalSnapshot: cloneNet(work) }
}

export const meshOperations: OperationDefinition<MeshState, unknown, MeshSnapshot>[] = [
  { id: 'route', label: 'Find route', inputKind: 'none', run: runFindRoute },
  { id: 'join-m', label: 'Router M joins', inputKind: 'none', run: runJoinM },
  { id: 'deliver', label: 'Deliver packets', inputKind: 'key', placeholder: 'Packets, from 1 to 30', run: runDeliver },
  { id: 'metrics', label: 'Metrics run', inputKind: 'none', run: runMetrics },
]
