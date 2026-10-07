// SPEC.md §10.1: Build links, Find bridges, and Link ETX. Each run() emits the §10.1 step table.
import { cloneNet, explainer, findLink, frame, linkKey, makeLink, neighbors, plural } from '@/lib/net'
import { dist, SHADOWING_SIGMA, shadowingMargin, unitDiskLinked } from '@/lib/sim/geometry'
import { isConnected, spread } from '@/lib/sim/placement'
import { mulberry32, normal, randInt } from '@/lib/sim/rng'
import type { HighlightKind, NetLink } from '@/types/net'
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { L } from './pseudocode'
import type { LinkModel, MultihopSnapshot, MultihopState } from './types'
import { WHY } from './why'

type Result = OperationResult<MultihopSnapshot>

const f2 = (n: number) => n.toFixed(2)
/** 2.5 rather than 2.50, 0.4 rather than 0.40: the slide's own notation. */
const short = (n: number) => String(Number(n.toFixed(2)))

/** SPEC §10.1 seed: Week 1, "Bridge dan articulation point" (Misra Definition 1.4). */
export function seedNetwork(model: LinkModel = 'disk'): MultihopSnapshot {
  const nodes = [
    { id: 'A', x: 0, y: 1 },
    { id: 'B', x: 0, y: -1 },
    { id: 'C', x: 1, y: 0 },
    { id: 'D', x: 3, y: 0 },
    { id: 'E', x: 4, y: 1 },
    { id: 'F', x: 4, y: -1 },
  ].map((n) => ({ ...n, roles: [] }))
  const links = [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'C'],
    ['C', 'D'],
    ['D', 'E'],
    ['D', 'F'],
    ['E', 'F'],
  ].map(([a, b]) => makeLink(a, b))
  return { nodes, links, range: 2, packets: [], model, seed: 1, analyzed: false, bridges: [], cuts: [], etx: {} }
}

/** Decides every pair with the model's rule. Shared by Build links and Randomize. */
function decidePairs(snap: MultihopSnapshot) {
  const rng = mulberry32(snap.seed)
  const out: { p: string; q: string; d: number; x: number; margin: number; linked: boolean }[] = []
  for (let i = 0; i < snap.nodes.length; i++) {
    for (let j = i + 1; j < snap.nodes.length; j++) {
      const p = snap.nodes[i]
      const q = snap.nodes[j]
      const d = dist(p, q)
      if (snap.model === 'disk') {
        out.push({ p: p.id, q: q.id, d, x: 0, margin: 0, linked: unitDiskLinked(d, snap.range) })
      } else {
        const x = normal(rng) * SHADOWING_SIGMA
        const margin = shadowingMargin(d, snap.range, x)
        out.push({ p: p.id, q: q.id, d, x, margin, linked: margin >= 0 })
      }
    }
  }
  return out
}

function withEtxLabels(snap: MultihopSnapshot): MultihopSnapshot {
  const labels: Record<string, string> = {}
  for (const [key, v] of Object.entries(snap.etx)) labels[key] = `ETX ${short(v)}`
  snap.linkLabels = labels
  return snap
}

export function randomNetwork(model: LinkModel, seed: number): MultihopSnapshot {
  // One seed stream drives the node count, the positions, and each redraw.
  const rng = mulberry32(seed)
  const count = randInt(rng, 6, 8)
  const ids = 'ABCDEFGH'.slice(0, count).split('')
  let attempt: MultihopSnapshot = seedNetwork(model)
  for (let tries = 0; tries < 20; tries++) {
    attempt = { ...seedNetwork(model), nodes: spread(rng, ids, 6, 4), seed: seed + tries }
    attempt.links = decidePairs(attempt)
      .filter((p) => p.linked)
      .map((p) => makeLink(p.p, p.q))
    if (isConnected(attempt.nodes, attempt.links)) break
  }
  return attempt
}

export function runBuildLinks(state: MultihopState): Result {
  const steps: Step<MultihopSnapshot>[] = []
  const why = explainer(steps)
  const work: MultihopSnapshot = { ...cloneNet(state), links: [], analyzed: false, bridges: [], cuts: [] }
  const range = f2(work.range)

  for (const pair of decidePairs(work)) {
    const key = linkKey(pair.p, pair.q)
    let description: string
    let kind: HighlightKind
    let shown: NetLink
    if (pair.linked) {
      work.links.push(makeLink(pair.p, pair.q))
      shown = makeLink(pair.p, pair.q)
      kind = 'new'
      description =
        work.model === 'disk'
          ? `${pair.p} and ${pair.q} are ${f2(pair.d)} apart, within range ${range}: link ${pair.p}-${pair.q}.`
          : `${pair.p} and ${pair.q} are ${f2(pair.d)} apart and the random fade adds ${f2(pair.x)} dB, so the margin is ${f2(pair.margin)} dB: link ${pair.p}-${pair.q}.`
    } else {
      shown = makeLink(pair.p, pair.q, { virtual: true })
      kind = 'dropped'
      description =
        work.model === 'disk'
          ? `${pair.p} and ${pair.q} are ${f2(pair.d)} apart, beyond range ${range}, so they cannot hear each other.`
          : `${pair.p} and ${pair.q} are ${f2(pair.d)} apart and the random fade adds ${f2(pair.x)} dB, so the margin is ${f2(pair.margin)} dB: no link.`
    }
    const snap = frame(work, { nodes: { [pair.p]: 'current', [pair.q]: 'current' }, links: { [key]: kind } })
    if (!pair.linked) snap.links.push(shown)
    const variables: Record<string, string | number> = { d: f2(pair.d) }
    if (work.model === 'shadowing') variables.margin = `${f2(pair.margin)} dB`
    steps.push({ id: steps.length, description, highlightLine: pair.linked ? L.build.add : L.build.test, snapshot: snap, variables })
    if (work.model === 'disk') why(pair.linked ? WHY.linkedDisk(pair.p, pair.q) : WHY.apartDisk(pair.p, pair.q))
    else why(pair.linked ? WHY.linkedShadow() : WHY.apartShadow(pair.p, pair.q))
  }

  // ETX values survive only on links that still exist.
  const keep = new Set(work.links.map((l) => linkKey(l.a, l.b)))
  work.etx = Object.fromEntries(Object.entries(work.etx).filter(([k]) => keep.has(k)))
  withEtxLabels(work)
  steps.push({
    id: steps.length,
    description: `Build links made ${plural(work.links.length, 'link')} among ${plural(work.nodes.length, 'node')}.`,
    highlightLine: L.build.done,
    snapshot: frame(work),
  })
  why(WHY.built())
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runFindBridges(state: MultihopState): Result {
  const steps: Step<MultihopSnapshot>[] = []
  const why = explainer(steps)
  // The live fields count bridges and cuts as the search finds them.
  const work: MultihopSnapshot = { ...cloneNet(state), analyzed: true, bridges: [], cuts: [] }
  const disc: Record<string, number> = {}
  const low: Record<string, number> = {}
  const bridges = work.bridges
  const cuts = work.cuts
  let time = 0

  const table = (m: Record<string, number>) =>
    work.nodes
      .filter((n) => m[n.id] !== undefined)
      .map((n) => `${n.id}:${m[n.id]}`)
      .join(' ')
  const push = (
    description: string,
    highlightLine: number,
    nodes: Record<string, HighlightKind> = {},
    links: Record<string, HighlightKind> = {},
  ) => {
    const marks = {
      nodes: { ...Object.fromEntries(cuts.map((c) => [c, 'flagged' as const])), ...nodes },
      links: { ...Object.fromEntries(bridges.map((b) => [b, 'flagged' as const])), ...links },
    }
    steps.push({
      id: steps.length,
      description,
      highlightLine,
      snapshot: frame(work, marks),
      variables: { disc: table(disc), low: table(low) },
    })
  }
  const markCut = (v: string) => {
    if (!cuts.includes(v)) cuts.push(v)
  }

  const dfs = (v: string, parent: string | null) => {
    time += 1
    disc[v] = time
    low[v] = time
    push(`Visiting ${v}: disc = low = ${time}.`, L.bridges.enter, { [v]: 'current' })
    why(WHY.enter(v))
    let children = 0
    for (const w of neighbors(work, v)) {
      const key = linkKey(v, w)
      if (disc[w] === undefined) {
        children += 1
        push(`${w} is unvisited, so the search goes from ${v} to ${w}.`, L.bridges.tree, { [v]: 'current' }, { [key]: 'active' })
        why(WHY.tree(v, w))
        dfs(w, v)
        low[v] = Math.min(low[v], low[w])
        push(`Back at ${v} from ${w}: low[${v}] = ${low[v]}.`, L.bridges.back_from_child, { [v]: 'current' })
        why(WHY.backFromChild(v, w))
        if (low[w] > disc[v]) {
          bridges.push(key)
          push(
            `low[${w}] = ${low[w]} is greater than disc[${v}] = ${disc[v]}, so ${v}-${w} is a bridge: it is the only way between the two parts.`,
            L.bridges.bridge,
          )
          why(WHY.bridge(v, w))
        }
        if (parent !== null && low[w] >= disc[v] && !cuts.includes(v)) {
          markCut(v)
          push(
            `low[${w}] = ${low[w]} is not less than disc[${v}] = ${disc[v]}, so removing ${v} cuts ${w} off: ${v} is an articulation point.`,
            L.bridges.cut,
          )
          why(WHY.cut(v, w))
        }
      } else if (w !== parent) {
        low[v] = Math.min(low[v], disc[w])
        push(`${w} was visited earlier and is not the parent, so low[${v}] = ${low[v]}.`, L.bridges.back_link, { [v]: 'current' }, { [key]: 'active' })
        why(WHY.backLink(v, w))
      }
    }
    if (parent === null && children > 1) {
      markCut(v)
      push(`${v} started the search and has ${children} children, so it is an articulation point.`, L.bridges.root_cut)
      why(WHY.rootCut(v))
    }
  }

  for (const n of work.nodes) if (!n.down && disc[n.id] === undefined) dfs(n.id, null)

  const b = bridges.length === 0 ? 'no bridges' : plural(bridges.length, 'bridge')
  const a = cuts.length === 0 ? 'no articulation points' : plural(cuts.length, 'articulation point')
  push(`Found ${b} and ${a}.`, L.bridges.outer)
  why(bridges.length + cuts.length > 0 ? WHY.resultWeak() : WHY.resultNone())

  return { steps, finalSnapshot: cloneNet(work) }
}

const ETX_INPUT = /^([A-Za-z0-9]+)\s+([A-Za-z0-9]+)\s+(\d*\.?\d+)\s+(\d*\.?\d+)$/

export function runLinkEtx(state: MultihopState, input: string): Result {
  const steps: Step<MultihopSnapshot>[] = []
  const work = cloneNet(state)
  const push = (description: string, highlightLine: number, links: Record<string, HighlightKind> = {}) =>
    steps.push({ id: steps.length, description, highlightLine, snapshot: frame(work, { links }) })
  const why = explainer(steps)

  const m = ETX_INPUT.exec(String(input ?? '').trim())
  const wpq = m ? Number(m[3]) : NaN
  const wqp = m ? Number(m[4]) : NaN
  if (!m || !(wpq >= 0 && wpq <= 1) || !(wqp >= 0 && wqp <= 1)) {
    push('Type two linked nodes and two delivery ratios from 0 to 1, such as C D 0.8 0.5.', L.etx.def)
    why(WHY.etxInput())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const p = m[1].toUpperCase()
  const q = m[2].toUpperCase()
  const link = findLink(work, p, q)
  if (!link || link.virtual || link.broken) {
    push(`${p} and ${q} share no link, so there is no ETX to compute.`, L.etx.no_link)
    why(WHY.etxNoLink(p, q))
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const key = linkKey(p, q)
  const cycle = wpq * wqp
  push(`A full cycle succeeds with probability ${short(wpq)} × ${short(wqp)} = ${short(cycle)}.`, L.etx.cycle, { [key]: 'active' })
  why(WHY.etxCycle())
  if (cycle === 0) {
    push('The cycle never succeeds, so the expected number of transmissions has no bound.', L.etx.etx, { [key]: 'dropped' })
    why(WHY.etxZero())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const etx = 1 / cycle
  push(`ETX = 1 / ${short(cycle)} = ${short(etx)} expected transmissions.`, L.etx.etx, { [key]: 'active' })
  why(WHY.etx())
  // quality is the a-to-b direction of the stored link.
  link.quality = link.a === p ? wpq : wqp
  link.qualityBack = link.a === p ? wqp : wpq
  work.etx = { ...work.etx, [key]: etx }
  withEtxLabels(work)
  push(`Link ${p}-${q} now shows ETX ${short(etx)}.`, L.etx.store, { [key]: 'found' })
  why(WHY.etxStore(p, q))
  return { steps, finalSnapshot: cloneNet(work) }
}

export const multihopOperations: OperationDefinition<MultihopState, unknown, MultihopSnapshot>[] = [
  { id: 'build-links', label: 'Build links', inputKind: 'none', run: (s) => runBuildLinks(s) },
  { id: 'find-bridges', label: 'Find bridges', inputKind: 'none', run: (s) => runFindBridges(s) },
  {
    id: 'link-etx',
    label: 'Link ETX',
    inputKind: 'text',
    placeholder: 'Link and delivery ratios, e.g. C D 0.8 0.5',
    run: (s, input) => runLinkEtx(s, String(input)),
  },
]
