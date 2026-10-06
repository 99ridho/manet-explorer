// SPEC.md §10.8: random waypoint and RPGM in ticks, where nodes spend their time, and a metrics run.
import { cloneNet, linkKey, plural, recorder } from '@/lib/net'
import { pushMetricsSteps } from '@/lib/sim/metrics'
import {
  initMotion,
  meanDuration,
  moveAll,
  pathAvailability,
  pointIn,
  pointWithin,
  recordLinks,
  tickRng,
  unitDiskLinks,
  type Group,
  type MobilityParams,
} from '@/lib/sim/mobility'
import { mulberry32 } from '@/lib/sim/rng'
import { runFlow, type Flow, type Topology } from '@/lib/sim/run'
import type { HighlightKind } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { MobilitySnapshot, MobilityState, Model } from './types'
import { WHY } from './why'

type Result = OperationResult<MobilitySnapshot>

/** This demo's parameters (SPEC §10.8), shown in the Protocol tab. */
export const PARAMS: MobilityParams = { area: { w: 10, h: 6 }, speed: [0.3, 1.0], pause: [0, 2], groupSpeed: 1, radius: 1 }
export const SEED = 5
const IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const RANGE = 2.5
export const MODEL_LABEL: Record<Model, string> = { rwp: 'Random waypoint', rpgm: 'Group (RPGM)' }

/** Two groups of four; each reference point walks the four corners, group 2 from the opposite one. */
function groupsFor(): Group[] {
  const path = [
    { x: 1, y: 1 },
    { x: 9, y: 1 },
    { x: 9, y: 5 },
    { x: 1, y: 5 },
  ]
  return [
    { ref: { ...path[0] }, path, step: 1, members: IDS.slice(0, 4) },
    { ref: { ...path[2] }, path, step: 3, members: IDS.slice(4) },
  ]
}

export function seedNetwork(model: Model = 'rwp', seed = SEED): MobilitySnapshot {
  const rng = mulberry32(seed)
  const groups = model === 'rpgm' ? groupsFor() : undefined
  const nodes = IDS.map((id) => {
    const g = groups?.find((g) => g.members.includes(id))
    const p = g ? pointWithin(rng, g.ref, PARAMS.radius, PARAMS) : pointIn(rng, PARAMS)
    return { id, x: p.x, y: p.y, roles: [] }
  })
  const motion = initMotion(rng, nodes, PARAMS, groups)
  const links = unitDiskLinks(nodes, RANGE)
  return {
    nodes,
    links,
    range: RANGE,
    packets: [],
    model,
    seed,
    tick: 0,
    area: PARAMS.area,
    motion,
    groups,
    linkChanges: 0,
    linkAge: Object.fromEntries(links.map((l) => [linkKey(l.a, l.b), 0])),
    closedDurations: [],
    pairsConnected: 0,
    pairsTotal: 0,
    history: [],
  }
}

/** One tick in place; returns the links that appeared and broke. */
export function tickOnce(s: MobilitySnapshot): { up: number; down: number; fresh: string[] } {
  const before = s.links
  moveAll(tickRng(s.seed, s.tick), s.nodes, s.motion, PARAMS, s.groups)
  s.links = unitDiskLinks(s.nodes, s.range)
  const was = new Set(before.map((l) => linkKey(l.a, l.b)))
  const fresh = s.links.map((l) => linkKey(l.a, l.b)).filter((k) => !was.has(k))
  const { up, down } = recordLinks(s, before, s.links, s.nodes)
  for (const n of s.nodes) s.history.push({ x: n.x, y: n.y })
  s.tick += 1
  return { up, down, fresh }
}

const one = (v: number | null) => (v === null ? null : v.toFixed(1))

export function runAdvance(state: MobilityState, input: unknown): Result {
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push, why } = recorder(work)
  const ticks = Number(input)
  if (!Number.isInteger(ticks) || ticks < 1 || ticks > 40) {
    push('Type a number of ticks from 1 to 40.', L.advance.def)
    why(WHY.ticks())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (let i = 0; i < ticks; i++) {
    const { up, down, fresh } = tickOnce(work)
    const links: Record<string, HighlightKind> = Object.fromEntries(fresh.map((k) => [k, 'new' as const]))
    push(
      `Tick ${work.tick}: ${plural(up, 'link')} appeared and ${down} broke, ${plural(work.links.length, 'link')} now.`,
      L.advance.tick,
      { links },
    )
    why(work.model === 'rpgm' ? WHY.tickRpgm() : WHY.tickRwp())
  }
  const d = one(meanDuration(work))
  push(
    `After ${plural(work.tick, 'tick')} the links changed ${plural(work.linkChanges, 'time')}, ${
      d === null ? 'no link has broken yet' : `a link lasts ${d} ticks on average`
    }, and ${one(pathAvailability(work))} % of node pairs had a path.`,
    L.advance.done,
  )
  why(WHY.done())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** The middle half of both width and height: the centre quarter of the area. */
export function inMiddleHalf(p: { x: number; y: number }, area: { w: number; h: number }): boolean {
  return p.x >= area.w / 4 && p.x <= (3 * area.w) / 4 && p.y >= area.h / 4 && p.y <= (3 * area.h) / 4
}

export function runDensity(state: MobilityState): Result {
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push, why } = recorder(work)
  const n = work.history.length
  if (n === 0) {
    push('Advance the nodes first: no positions are recorded yet.', L.density.empty)
    why(WHY.empty())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const k = work.history.filter((p) => inMiddleHalf(p, work.area)).length
  push(`${k} of ${n} recorded positions fall in the centre quarter of the area.`, L.density.count)
  why(WHY.count())
  push(
    `The centre quarter holds ${((100 * k) / n).toFixed(1)} % of the time spent, against 25 % for an even spread.`,
    L.density.share,
  )
  why(WHY.share())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** Four flows between random pairs, drawn from the seed alone so both models carry the same ones. */
export function metricsFlows(seed: number, ids: string[], count: number, packets: number): Flow[] {
  const rng = mulberry32((seed ^ 0x5eed) >>> 0)
  const flows: Flow[] = []
  while (flows.length < count) {
    const src = ids[Math.floor(rng() * ids.length)]
    const dst = ids[Math.floor(rng() * ids.length)]
    if (src !== dst && !flows.some((f) => f.src === src && f.dst === dst)) flows.push({ src, dst, packets })
  }
  return flows
}

export const METRICS_TICKS = 30

/** The topology at every tick of a fresh run of `model` on `seed`. */
export function trajectory(model: Model, seed: number, ticks: number): Topology[] {
  const s = seedNetwork(model, seed)
  const topo: Topology[] = []
  for (let t = 0; t < ticks; t++) {
    topo.push({ nodes: s.nodes.map((n) => ({ ...n })), links: s.links.map((l) => ({ ...l })) })
    tickOnce(s)
  }
  return topo
}

export function runMetrics(state: MobilityState): Result {
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push, why } = recorder(work)
  const flows = metricsFlows(work.seed, IDS, 4, METRICS_TICKS)
  const order: Model[] = work.model === 'rwp' ? ['rwp', 'rpgm'] : ['rpgm', 'rwp']
  const designs = order.map((m) => {
    const topo = trajectory(m, work.seed, METRICS_TICKS)
    return { label: MODEL_LABEL[m], runs: flows.map((f) => runFlow(f, { ticks: METRICS_TICKS, topologyAt: (t) => topo[t] })) }
  })
  pushMetricsSteps(push, `seed ${work.seed}`, designs, (r) => {
    if (r) work.metrics = r
    else delete work.metrics
  }, why)
  return { steps, finalSnapshot: cloneNet(work) }
}

const TICKS = 'Ticks, from 1 to 40'

export const mobilityOperations: OperationDefinition<MobilityState, unknown, MobilitySnapshot>[] = [
  { id: 'advance-rwp', label: 'Advance', inputKind: 'key', placeholder: TICKS, variants: ['rwp'], run: runAdvance },
  { id: 'advance-rpgm', label: 'Advance', inputKind: 'key', placeholder: TICKS, variants: ['rpgm'], run: runAdvance },
  { id: 'density', label: 'Where nodes spend time', inputKind: 'none', run: runDensity },
  { id: 'metrics', label: 'Metrics run', inputKind: 'none', run: runMetrics },
]
