// SPEC.md §10.9: UDG and quasi UDG links, Wu's connected dominating set, and metrics over seeds.
import { cloneNet, listIds, makeLink, neighbors, plural, recorder } from '@/lib/net'
import { dist, unitDiskLinked } from '@/lib/sim/geometry'
import { fmtDelay, fmtOverhead, fmtPdr, mean, ML, std, summarize, type Summary } from '@/lib/sim/metrics'
import { spread, uniform } from '@/lib/sim/placement'
import { mulberry32, randInt, type Rng } from '@/lib/sim/rng'
import { runFlow, type Flow } from '@/lib/sim/run'
import type { HighlightKind, NetLink, NetNode } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { EvaluationSnapshot, EvaluationState, Graph } from './types'
import { WHY } from './why'

type Result = OperationResult<EvaluationSnapshot>

/** The QUDG inner radius as a share of the range: this demo's value, named in the Protocol tab. */
export const Q = 0.8
const RANGE = 1.2
export const GRAPH_LABEL: Record<Graph, string> = { udg: 'UDG', qudg: 'QUDG' }
const f2 = (n: number) => n.toFixed(2)
const short = (n: number) => String(Number(n.toFixed(2)))

type Decision = { linked: boolean; band: 'inside' | 'between' | 'beyond' }

/**
 * SPEC §7.2 rules. Under QUDG a pair between q·range and range takes one draw from `rng`, linked
 * when it is below 0.5 (Loo pp. 41-42 leave the probability open; 0.5 is this simulator's).
 */
export function decide(graph: Graph, d: number, range: number, rng: Rng): Decision {
  if (graph === 'udg' || unitDiskLinked(d, Q * range)) return { linked: unitDiskLinked(d, range), band: unitDiskLinked(d, range) ? 'inside' : 'beyond' }
  if (!unitDiskLinked(d, range)) return { linked: false, band: 'beyond' }
  return { linked: rng() < 0.5, band: 'between' }
}

export function linksFor(graph: Graph, nodes: NetNode[], range: number, seed: number): NetLink[] {
  const rng = mulberry32(seed)
  const links: NetLink[] = []
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (decide(graph, dist(nodes[i], nodes[j]), range, rng).linked) links.push(makeLink(nodes[i].id, nodes[j].id))
  return links
}

/** SPEC §10.9 seed: this spec's, chosen so both steps of Wu's algorithm change the result. */
export function seedNetwork(graph: Graph = 'udg', seed = 1): EvaluationSnapshot {
  const at: [string, number, number][] = [
    ['A', 0, 0],
    ['B', 1, 0.6],
    ['C', 1, -0.6],
    ['D', 2, 0],
    ['E', 3, 0],
    ['F', 4, 0.6],
    ['G', 4, -0.6],
    ['H', 5, 0],
  ]
  const nodes = at.map(([id, x, y]) => ({ id, x, y, roles: [] }))
  return { nodes, links: linksFor(graph, nodes, RANGE, seed), range: RANGE, packets: [], graph, seed, marked: [], cds: [] }
}

/** 8 to 10 nodes in a 6 × 4 area, linked by the active rule, with a fresh seed. */
export function randomNetwork(graph: Graph, seed: number): EvaluationSnapshot {
  const rng = mulberry32(seed)
  const ids = 'ABCDEFGHIJ'.slice(0, randInt(rng, 8, 10)).split('')
  const nodes = spread(rng, ids, 6, 4)
  return { nodes, links: linksFor(graph, nodes, RANGE, seed), range: RANGE, packets: [], graph, seed, marked: [], cds: [] }
}

export function runBuildLinks(state: EvaluationState): Result {
  const B = L.build
  const work = cloneNet(state)
  delete work.metrics
  work.links = []
  work.marked = []
  work.cds = []
  const { steps, push, why } = recorder(work)
  const rng = mulberry32(work.seed)
  const range = short(work.range)
  const inner = short(Q * work.range)
  const ns = work.nodes
  for (let i = 0; i < ns.length; i++)
    for (let j = i + 1; j < ns.length; j++) {
      const [p, q] = [ns[i].id, ns[j].id]
      const d = dist(ns[i], ns[j])
      const { linked, band } = decide(work.graph, d, work.range, rng)
      const pair = { nodes: { [p]: 'current' as HighlightKind, [q]: 'current' as HighlightKind } }
      if (linked) {
        work.links.push(makeLink(p, q))
        const key = `${p < q ? p : q}-${p < q ? q : p}`
        const hl = { ...pair, links: { [key]: 'new' as HighlightKind } }
        if (band === 'between') {
          push(`${p} and ${q} are ${f2(d)} apart, between ${inner} and ${range}, and the draw says yes: link ${p}-${q}.`, B.linked, hl)
          why(WHY.between())
        } else {
          push(`${p} and ${q} are ${f2(d)} apart, within range ${range}: link ${p}-${q}.`, B.linked, hl)
          why(WHY.linked(p, q))
        }
      } else if (band === 'between') {
        push(`${p} and ${q} are ${f2(d)} apart, between ${inner} and ${range}, and the draw says no: no link.`, B.notLinked, pair)
        why(WHY.between())
      } else {
        push(`${p} and ${q} are ${f2(d)} apart, beyond range ${range}, so they cannot hear each other.`, B.notLinked, pair)
        why(WHY.apart())
      }
    }
  push(`Build links made ${plural(work.links.length, 'link')} among ${plural(ns.length, 'node')}.`, B.result)
  why(WHY.built())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** The first two neighbors of v, in node order, that are not neighbors of each other. */
function unlinkedPair(s: EvaluationSnapshot, v: string): [string, string] | null {
  const nbrs = neighbors(s, v)
  for (let i = 0; i < nbrs.length; i++)
    for (let j = i + 1; j < nbrs.length; j++) if (!neighbors(s, nbrs[i]).includes(nbrs[j])) return [nbrs[i], nbrs[j]]
  return null
}

const closed = (s: EvaluationSnapshot, v: string) => new Set([v, ...neighbors(s, v)])

/** A marked neighbor with a larger id whose closed neighborhood holds v's; the first in node order. */
function largerCover(s: EvaluationSnapshot, v: string, marked: string[]): string | null {
  const mine = closed(s, v)
  for (const u of neighbors(s, v)) {
    if (!marked.includes(u) || u <= v) continue
    const theirs = closed(s, u)
    if ([...mine].every((x) => theirs.has(x))) return u
  }
  return null
}

export function runCds(state: EvaluationState): Result {
  const C = L.cds
  const work = cloneNet(state)
  delete work.metrics
  work.marked = []
  work.cds = []
  const { steps, push, why } = recorder(work)
  const marks: Record<string, HighlightKind> = {}
  for (const v of work.nodes.map((n) => n.id)) {
    const pair = unlinkedPair(work, v)
    if (pair) {
      work.marked.push(v)
      marks[v] = 'found'
      push(`${pair[0]} and ${pair[1]} are neighbors of ${v} but not of each other, so ${v} is marked.`, C.marked, { nodes: { ...marks } })
      why(WHY.marked(v))
    } else {
      marks[v] = 'visited'
      push(`Every two neighbors of ${v} are neighbors of each other, so ${v} is not marked.`, C.notMarked, { nodes: { ...marks } })
      why(WHY.notMarked(v))
    }
  }
  const kept = new Set(work.marked)
  for (const v of work.marked) {
    const u = largerCover(work, v, work.marked)
    if (u === null) {
      marks[v] = 'found'
      push(`No marked neighbor with a larger id covers all of ${v}'s neighbors, so ${v} stays.`, C.kept, { nodes: { ...marks, [v]: 'current' } })
      why(WHY.kept(v))
      continue
    }
    kept.delete(v)
    marks[v] = 'dropped'
    push(`${u} has a larger id and covers ${v} and all its neighbors, so ${v} is unmarked.`, C.pruned, { nodes: { ...marks } })
    why(WHY.pruned(v, u))
  }
  work.cds = work.marked.filter((v) => kept.has(v))
  push(
    `The connected dominating set is ${listIds(work.cds)}: ${work.cds.length} of ${plural(work.nodes.length, 'node')}.`,
    C.result,
    { nodes: Object.fromEntries(work.cds.map((v) => [v, 'tree' as HighlightKind])) },
  )
  why(WHY.result())
  return { steps, finalSnapshot: cloneNet(work) }
}

/** Three flows of ten packets between distinct random pairs, drawn from the seed. */
function seedFlows(rng: Rng, ids: string[]): Flow[] {
  const flows: Flow[] = []
  while (flows.length < 3) {
    const src = ids[Math.floor(rng() * ids.length)]
    const dst = ids[Math.floor(rng() * ids.length)]
    if (src !== dst && !flows.some((f) => f.src === src && f.dst === dst)) flows.push({ src, dst, packets: 10 })
  }
  return flows
}

const PLACE_IDS = 'ABCDEFGHIJ'.split('')
const HORIZON = 40
/** The radius for the metrics placement: this demo's, so 10 nodes in 6 × 4 are mostly connected. */
export const METRICS_RANGE = 2

/** One seed of the metrics run: 10 nodes in a 6 × 4 area, linked by `graph`, three flows. */
export function seedRun(graph: Graph, s: number) {
  const rng = mulberry32(s)
  const nodes = uniform(rng, PLACE_IDS, 6, 4)
  const flows = seedFlows(rng, PLACE_IDS)
  const net = { nodes, links: linksFor(graph, nodes, METRICS_RANGE, s) }
  return summarize(flows.map((f) => runFlow(f, { ticks: HORIZON, topologyAt: () => net })))
}

export function runMetrics(state: EvaluationState, input: unknown): Result {
  const work = cloneNet(state)
  delete work.metrics
  const { steps, push, why } = recorder(work)
  const k = Number(input)
  if (!Number.isInteger(k) || k < 1 || k > 10) {
    push('Type a number of seeds from 1 to 10.', ML.def)
    why(WHY.seeds())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const order: Graph[] = work.graph === 'udg' ? ['udg', 'qudg'] : ['qudg', 'udg']
  const per = order.map((g) => {
    const runs = []
    for (let s = 1; s <= k; s++) {
      const r = seedRun(g, s)
      runs.push(r)
      push(`${GRAPH_LABEL[g]}, seed ${s}: ${fmtPdr(r.pdr)} % delivered.`, ML.flow, undefined, [], {
        pdr: fmtPdr(r.pdr),
        delay: fmtDelay(r.delay),
        overhead: fmtOverhead(r.overhead),
      })
      why(WHY.seed())
    }
    return runs
  })
  const stat = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x !== null)
    return v.length ? { m: mean(v), s: std(v) } : null
  }
  const picks: [string, (r: Summary) => number | null, number][] = [
    ['Packet delivery ratio (%)', (r) => r.pdr, 1],
    ['Mean delay (ticks)', (r) => r.delay, 1],
    ['Control overhead (per delivered packet)', (r) => r.overhead, 2],
  ]
  const groups = picks.map(([name, pick, dp]) => {
    const st = per.map((runs) => stat(runs.map((r) => pick(r))))
    return {
      name,
      values: st.map((x) => (x ? x.m : null)),
      labels: st.map((x) => (x ? x.m.toFixed(dp) : 'none')),
      spread: st.map((x) => (x ? x.s : null)),
    }
  })
  const pdr = groups[0]
  work.metrics = { caption: `Computed by this simulator on seeds 1 to ${k}; whiskers show one standard deviation.`, designs: order.map((g) => GRAPH_LABEL[g]), groups }
  const [a, b] = order.map((g) => GRAPH_LABEL[g])
  const sd = (i: number) => (pdr.spread[i] ?? 0).toFixed(1)
  push(
    `Over ${plural(k, 'seed')}, ${a} delivers ${pdr.labels[0]} % (standard deviation ${sd(0)}) and ${b} ${pdr.labels[1]} % (standard deviation ${sd(1)}).`,
    ML.result,
  )
  why(WHY.spread())
  delete work.metrics
  return { steps, finalSnapshot: cloneNet(work) }
}

export const evaluationOperations: OperationDefinition<EvaluationState, unknown, EvaluationSnapshot>[] = [
  { id: 'build-links', label: 'Build links', inputKind: 'none', run: runBuildLinks },
  { id: 'cds', label: 'Connected dominating set', inputKind: 'none', run: runCds },
  { id: 'metrics', label: 'Metrics over seeds', inputKind: 'key', placeholder: 'Seeds, from 1 to 10', run: runMetrics },
]
