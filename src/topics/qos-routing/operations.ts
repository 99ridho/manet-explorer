// SPEC.md §10.10: one Find path per metric (hop count, bandwidth, ETX, energy) and Send packets.
import { cloneNet, findLink, linkKey, listIds, makeLink, neighbors, plural, recorder } from '@/lib/net'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { HighlightKind, NetLink } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { Metric, QosSnapshot, QosState } from './types'

type Result = OperationResult<QosSnapshot>
type Push = ReturnType<typeof recorder<QosSnapshot>>['push']

/**
 * SPEC §10.10 seed: Week 7, "Jalur terpendek belum tentu memenuhi syarat" (Misra 12.8). The slide
 * gives the topology and the 3 Mbps request; the link values and batteries are this spec's examples.
 */
export function seedNetwork(metric: Metric = 'bandwidth'): QosSnapshot {
  const nodes = [
    { id: 'A', x: 0, y: 1, roles: ['source' as const], battery: 100 },
    { id: 'B', x: 1, y: 2, roles: [], battery: 20 },
    { id: 'C', x: 2, y: 2, roles: [], battery: 60 },
    { id: 'D', x: 1, y: 0, roles: [], battery: 80 },
    { id: 'E', x: 3, y: 1, roles: ['dest' as const], battery: 100 },
  ]
  const links = (
    [
      ['A', 'B', 4, 0.9],
      ['B', 'C', 5, 0.9],
      ['C', 'E', 4, 0.9],
      ['A', 'D', 2, 0.5],
      ['D', 'E', 6, 0.6],
    ] as const
  ).map(([a, b, bandwidth, w]) => makeLink(a, b, { bandwidth, quality: w, qualityBack: w }))
  return { nodes, links, range: 1.5, packets: [], metric, path: null, sent: 0, firstDown: null }
}

/** The same topology with new link values and batteries. */
export function randomNetwork(metric: Metric, seed: number): QosSnapshot {
  const rng = mulberry32(seed)
  const s = seedNetwork(metric)
  for (const l of s.links) {
    const w = randInt(rng, 4, 10) / 10
    Object.assign(l, { bandwidth: randInt(rng, 1, 6), quality: w, qualityBack: w })
  }
  for (const n of s.nodes) n.battery = randInt(rng, 2, 10) * 10
  return s
}

export const etxOf = (l: NetLink) => 1 / ((l.quality ?? 1) * (l.qualityBack ?? l.quality ?? 1))
const f2 = (n: number) => n.toFixed(2)
const battery = (s: QosSnapshot, id: string) => s.nodes.find((n) => n.id === id)?.battery ?? 0

export function pathEtx(s: QosSnapshot, path: string[]): number {
  return path.slice(1).reduce((c, n, i) => c + etxOf(findLink(s, path[i], n)!), 0)
}

/** The weakest relay on a path (src and dst excluded), or null for a direct link. */
export function weakestRelay(s: QosSnapshot, path: string[]): number | null {
  const relays = path.slice(1, -1)
  return relays.length ? Math.min(...relays.map((r) => battery(s, r))) : null
}

export function minBandwidth(s: QosSnapshot, path: string[]): number {
  return Math.min(...path.slice(1).map((n, i) => findLink(s, path[i], n)!.bandwidth ?? 0))
}

function pathTo(dst: string, prev: Map<string, string | null>): string[] {
  const path = [dst]
  while (prev.get(path[0])) path.unshift(prev.get(path[0])!)
  return path
}

const treeOf = (path: string[]) => Object.fromEntries(path.slice(1).map((n, i) => [linkKey(path[i], n), 'tree' as HighlightKind]))

function parse(s: QosSnapshot, input: unknown, withNeed: boolean): { src: string; dst: string; need: number } | null {
  const parts = String(input ?? '').trim().split(/[\s,]+/).filter(Boolean)
  if (parts.length !== (withNeed ? 3 : 2)) return null
  const [src, dst] = parts.slice(0, 2).map((p) => p.toUpperCase())
  const need = withNeed ? Number(parts[2]) : 0
  const ids = new Set(s.nodes.map((n) => n.id))
  if (src === dst || !ids.has(src) || !ids.has(dst) || !Number.isFinite(need) || need <= 0 && withNeed) return null
  return { src, dst, need }
}

function withEnds(s: QosSnapshot, src: string, dst: string) {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'source' && r !== 'dest')
    if (n.id === src) n.roles.push('source')
    if (n.id === dst) n.roles.push('dest')
  }
}

/** Hop count and bandwidth: breadth first over the usable links. */
function findBfs(work: QosSnapshot, push: Push, src: string, dst: string, need: number | null) {
  const B = L.bfs
  const pruned: Record<string, HighlightKind> = {}
  const usable = work.links.filter((l) => {
    if (need === null || (l.bandwidth ?? 0) >= need) return true
    pruned[linkKey(l.a, l.b)] = 'dropped'
    push(`Link ${l.a}-${l.b} offers ${l.bandwidth} Mbps, less than ${need}, so it is not used.`, B.prune, { links: { ...pruned } })
    return false
  })
  const net = { nodes: work.nodes, links: usable }
  const prev = new Map<string, string | null>([[src, null]])
  const hops = new Map([[src, 0]])
  const frontier = [src]
  while (frontier.length) {
    const v = frontier.shift()!
    push(`${v} is next: ${plural(hops.get(v)!, 'hop')} from ${src}.`, B.settle, { nodes: { [v]: 'current' }, links: { ...pruned } })
    if (v === dst) {
      const path = pathTo(dst, prev)
      work.path = path
      const summary = need === null ? 'the fewest hops' : `every link offers at least ${need} Mbps`
      push(`Path ${listIds(path)}: ${plural(path.length - 1, 'hop')}, ${summary}.`, B.found, { links: treeOf(path), path })
      return
    }
    for (const n of neighbors(net, v)) {
      if (prev.has(n)) {
        push(`Going through ${v} does not improve ${n}.`, B.same, { nodes: { [v]: 'current' }, links: { ...pruned } })
        continue
      }
      prev.set(n, v)
      hops.set(n, hops.get(v)! + 1)
      frontier.push(n)
      push(`${n} is reached through ${v}: ${plural(hops.get(n)!, 'hop')} from ${src}.`, B.improved, {
        nodes: { [v]: 'current', [n]: 'new' },
        links: { ...pruned, [linkKey(v, n)]: 'active' },
      })
    }
  }
  work.path = null
  push(`No path from ${src} to ${dst} meets the request.`, B.none, { links: { ...pruned } })
}

/** ETX (smallest sum) and energy (largest weakest relay): a label-setting search. */
function findBest(work: QosSnapshot, push: Push, src: string, dst: string, energy: boolean) {
  const B = L.best
  const order = work.nodes.map((n) => n.id)
  const value = new Map<string, number>([[src, energy ? Infinity : 0]])
  const hops = new Map([[src, 0]])
  const prev = new Map<string, string | null>([[src, null]])
  const done = new Set<string>()
  const say = (v: string, x: number) =>
    energy
      ? x === Infinity
        ? v === src
          ? 'it is the source, with no relay yet'
          : 'there is no relay on the way'
        : `the weakest relay on the way has ${x} units`
      : `ETX ${f2(x)} from ${src}`
  while ([...value.keys()].some((k) => !done.has(k))) {
    const open = order.filter((k) => value.has(k) && !done.has(k))
    // ETX: smallest cost, ties to node order. Energy: largest weakest relay, fewer hops, then node order.
    const v = open.reduce((best, k) => {
      const [a, b] = [value.get(k)!, value.get(best)!]
      if (energy) return a > b || (a === b && hops.get(k)! < hops.get(best)!) ? k : best
      return a < b ? k : best
    })
    done.add(v)
    push(`${v} is next: ${say(v, value.get(v)!)}.`, B.settle, { nodes: { [v]: 'current' } })
    if (v === dst) {
      const path = pathTo(dst, prev)
      work.path = path
      const summary = energy ? `weakest relay ${weakestRelay(work, path) ?? 'none'} units` : `total ETX ${f2(pathEtx(work, path))}`
      push(`Path ${listIds(path)}: ${plural(path.length - 1, 'hop')}, ${summary}.`, B.found, { links: treeOf(path), path })
      return
    }
    for (const n of neighbors(work, v)) {
      if (done.has(n)) continue
      const x = energy
        ? n === dst
          ? value.get(v)!
          : Math.min(value.get(v)!, battery(work, n))
        : value.get(v)! + etxOf(findLink(work, v, n)!)
      const better = !value.has(n) || (energy ? x > value.get(n)! : x < value.get(n)!)
      if (!better) {
        push(`Going through ${v} does not improve ${n}.`, B.same, { nodes: { [v]: 'current' } })
        continue
      }
      value.set(n, x)
      prev.set(n, v)
      hops.set(n, hops.get(v)! + 1)
      push(`${n} is reached through ${v}: ${say(n, x)}.`, B.improved, {
        nodes: { [v]: 'current', [n]: 'new' },
        links: { [linkKey(v, n)]: 'active' },
      })
    }
  }
  work.path = null
  push(`No path from ${src} to ${dst} meets the request.`, B.none)
}

export function runFindPath(state: QosState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const bw = work.metric === 'bandwidth'
  const req = parse(work, input, bw)
  if (!req) {
    push(
      bw ? 'Type a source and a destination, and a bandwidth in Mbps, such as A E 3.' : 'Type a source and a destination, such as A E.',
      L.bfs.def,
    )
    return { steps, finalSnapshot: cloneNet(work) }
  }
  withEnds(work, req.src, req.dst)
  if (work.metric === 'hop' || bw) findBfs(work, push, req.src, req.dst, bw ? req.need : null)
  else findBest(work, push, req.src, req.dst, work.metric === 'energy')
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runSend(state: QosState, input: unknown): Result {
  const S = L.send
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const k = Number(input)
  if (!Number.isInteger(k) || k < 1 || k > 50) {
    push('Type a number of packets from 1 to 50.', S.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const path = work.path
  if (!path) {
    push('There is no path yet. Run Find path first.', S.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const relays = path.slice(1, -1)
  const dst = path[path.length - 1]
  for (let i = 0; i < k; i++) {
    if (relays.some((r) => work.nodes.find((n) => n.id === r)!.down)) {
      push('The path is broken. Find a new path first.', S.stop, { links: treeOf(path) })
      break
    }
    const p = work.sent + 1
    work.sent = p
    const out: string[] = []
    for (const r of relays) {
      const node = work.nodes.find((n) => n.id === r)!
      node.battery = (node.battery ?? 0) - 1
      if (node.battery === 0) {
        node.down = true
        out.push(r)
      }
    }
    push(
      relays.length
        ? `Packet ${p} reaches ${dst}; relays have ${relays.map((r) => `${r} ${battery(work, r)}`).join(', ')} left.`
        : `Packet ${p} reaches ${dst}; there is no relay on this path.`,
      S.packet,
      { links: treeOf(path), path },
      [{ kind: 'DATA', from: path[path.length - 2], to: dst, label: `${p}` }],
    )
    for (const r of out) {
      if (work.firstDown === null) work.firstDown = p
      push(`${r} runs out of battery after packet ${p}, so the path breaks.`, S.down, { nodes: { [r]: 'dropped' } })
    }
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

const PAIR = 'Source and destination, e.g. A E'

export const qosOperations: OperationDefinition<QosState, unknown, QosSnapshot>[] = [
  { id: 'path-bandwidth', label: 'Find path', inputKind: 'text', placeholder: 'Source, destination, Mbps, e.g. A E 3', variants: ['bandwidth'], run: runFindPath },
  { id: 'path-etx', label: 'Find path', inputKind: 'text', placeholder: PAIR, variants: ['etx'], run: runFindPath },
  { id: 'path-energy', label: 'Find path', inputKind: 'text', placeholder: PAIR, variants: ['energy'], run: runFindPath },
  { id: 'path-hop', label: 'Find path', inputKind: 'text', placeholder: PAIR, variants: ['hop'], run: runFindPath },
  { id: 'send', label: 'Send packets', inputKind: 'key', placeholder: 'Packets, from 1 to 50', run: runSend },
]
