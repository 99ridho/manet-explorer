// SPEC.md §10.11: DSR-style discovery under a black hole or a wormhole, sending, and the watchdog.
import { floodRreq } from '@/lib/dsr-flood'
import { cloneNet, findLink, linkKey, listIds, makeLink, neighbors, pyList, recorder } from '@/lib/net'
import { dist, unitDiskLinked } from '@/lib/sim/geometry'
import { unitDiskLinks } from '@/lib/sim/mobility'
import { MIN_GAP, namedNetwork } from '@/lib/sim/placement'
import { mulberry32, randInt, type Rng } from '@/lib/sim/rng'
import type { HighlightKind, NetNode } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { AttackSnapshot, AttackState, Attacker } from './types'
import { WHY } from './why'

type Result = OperationResult<AttackSnapshot>

export const SRC = 'S'
export const DST = 'D'
/** A count past this is reported: this demo's value; Week 8 says only "a threshold". */
export const THRESHOLD = 3

const empty = { packets: [], route: null, routes: [], sent: 0, delivered: 0, dropped: 0, tunneled: 0, failures: {}, flagged: [] }

/** SPEC §10.11 seeds: Week 8's black hole (Misra Figure 18.2) and wormhole (Misra Figure 18.3) slides. */
export function seedNetwork(attacker: Attacker = 'blackhole'): AttackSnapshot {
  if (attacker === 'wormhole') {
    const at: [string, number, number][] = [
      ['S', 0, 1],
      ['A', 1, 0],
      ['M1', 1, 2],
      ['B', 2, 0],
      ['C', 3, 0],
      ['M2', 3, 2],
      ['D', 4, 1],
    ]
    const nodes = at.map(([id, x, y]) => ({
      id,
      x,
      y,
      roles: id === 'S' ? ['source' as const] : id === 'D' ? ['dest' as const] : id.startsWith('M') ? ['malicious' as const] : [],
    }))
    const links = [
      makeLink('S', 'A'),
      makeLink('A', 'B'),
      makeLink('B', 'C'),
      makeLink('C', 'D'),
      makeLink('S', 'M1'),
      makeLink('M2', 'D'),
      makeLink('M1', 'M2', { virtual: true }),
    ]
    return { nodes, links, range: 1.5, attacker, ...structuredClone(empty), linkLabels: { 'M1-M2': 'tunnel' } }
  }
  const at: [string, number, number][] = [
    ['S', 0, 1],
    ['A', 1, 0],
    ['M', 1, 2],
    ['B', 2, 0],
    ['D', 3, 1],
  ]
  const black = attacker === 'blackhole'
  const nodes = at.map(([id, x, y]) => ({
    id,
    x,
    y,
    roles: id === 'S' ? ['source' as const] : id === 'D' ? ['dest' as const] : id === 'M' && black ? ['malicious' as const] : [],
  }))
  const links = [makeLink('S', 'A'), makeLink('S', 'M'), makeLink('A', 'B'), makeLink('B', 'D')]
  // The link M claims, drawn dashed as on the slide; it carries no radio traffic.
  if (black) links.push(makeLink('M', 'D', { virtual: true, broken: true }))
  return { nodes, links, range: 1.5, attacker, ...structuredClone(empty), linkLabels: black ? { 'D-M': 'claimed' } : undefined }
}

/** A spot 0.8 to 1.4 from `near`, `MIN_GAP` clear of every node and out of range of every node in `far`; null after 30 draws. */
function attackerSpot(rng: Rng, nodes: NetNode[], near: NetNode, far: NetNode[], range: number): { x: number; y: number } | null {
  for (let t = 0; t < 30; t++) {
    const a = rng() * 2 * Math.PI
    const d = 0.8 + rng() * 0.6
    const p = { x: Math.round((near.x + d * Math.cos(a)) * 10) / 10, y: Math.round((near.y + d * Math.sin(a)) * 10) / 10 }
    if (nodes.every((n) => dist(n, p) >= MIN_GAP) && far.every((n) => !unitDiskLinked(dist(n, p), range))) return p
  }
  return null
}

/** Hops on the shortest radio path, or Infinity. */
function hops(s: Pick<AttackSnapshot, 'nodes' | 'links'>, from: string, to: string): number {
  const depth = new Map([[from, 0]])
  const queue = [from]
  while (queue.length) {
    const v = queue.shift()!
    if (v === to) return depth.get(v)!
    for (const w of neighbors(s, v))
      if (!depth.has(w)) {
        depth.set(w, depth.get(v)! + 1)
        queue.push(w)
      }
  }
  return Infinity
}

/**
 * Honest nodes S, A, B, … D in a connected unit disk network, S and D the farthest pair, and the
 * variant's attackers placed by the scene's rules: M next to S and out of D's range; M1 next to S and
 * M2 next to D, out of range of each other and of the far end, with S at least 4 honest hops from D.
 */
export function randomNetwork(attacker: Attacker, seed: number): AttackSnapshot {
  const rng = mulberry32(seed)
  const range = 1.5
  const worm = attacker === 'wormhole'
  const others = 'ABCEFG'.split('').slice(0, randInt(rng, 3, worm ? 6 : 5))
  for (let tries = 0; tries < 100; tries++) {
    const placed = namedNetwork(rng, [SRC, DST], others, worm ? 6 : 4.5, worm ? 2.5 : 3, range)
    if (!placed || hops(placed, SRC, DST) < (worm ? 4 : 2)) continue
    const [src, dst] = [placed.nodes[0], placed.nodes[placed.nodes.length - 1]]
    const bad: NetNode[] = []
    for (const [id, near, far] of worm
      ? ([['M1', src, [dst]], ['M2', dst, [src]]] as const)
      : ([['M', src, [dst]]] as const)) {
      const p = attackerSpot(rng, [...placed.nodes, ...bad], near, [...far, ...bad], range)
      if (!p) break
      bad.push({ id, ...p, roles: [] })
    }
    if (bad.length !== (worm ? 2 : 1)) continue
    const nodes = [...placed.nodes.slice(0, -1), ...bad, dst].map((n) => ({
      ...n,
      roles: n.id === SRC ? ['source' as const] : n.id === DST ? ['dest' as const] : n.id.startsWith('M') && attacker !== 'none' ? ['malicious' as const] : [],
    }))
    const links = unitDiskLinks(nodes, range).map((l) => makeLink(l.a, l.b))
    if (worm) links.push(makeLink('M1', 'M2', { virtual: true }))
    // The link M claims, drawn dashed as on the slide; it carries no radio traffic.
    else if (attacker === 'blackhole') links.push(makeLink('M', DST, { virtual: true, broken: true }))
    const linkLabels = worm ? { 'M1-M2': 'tunnel' } : attacker === 'blackhole' ? { [linkKey('M', DST)]: 'claimed' } : undefined
    return { nodes, links, range, attacker, ...structuredClone(empty), linkLabels }
  }
  return seedNetwork(attacker)
}

const isBlackHole = (s: AttackSnapshot, id: string) => s.attacker === 'blackhole' && id === 'M'
const farEnd = (s: AttackSnapshot, id: string) => (s.attacker !== 'wormhole' ? null : id === 'M1' ? 'M2' : id === 'M2' ? 'M1' : null)
const tree = (route: string[]) => Object.fromEntries(route.slice(1).map((n, i) => [linkKey(route[i], n), 'tree' as HighlightKind]))

export function runDiscover(state: AttackState): Result {
  const D = L.discover
  const work = cloneNet(state)
  work.routes = []
  work.route = null
  const { steps, push, why } = recorder(work, { src: SRC, dst: DST })
  const rules = { blackHole: (id: string) => isBlackHole(work, id), farEnd: (id: string) => farEnd(work, id) }
  work.routes = floodRreq(work, SRC, DST, rules, push, why, D).routes
  if (work.routes.length === 0) {
    push(`No RREP reached ${SRC}, so there is no route to ${DST}.`, D.pick)
    why(WHY.noAnswer())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  work.route = work.routes[0]
  push(`${SRC} uses the first route to arrive: ${listIds(work.route)}.`, D.pick, { links: tree(work.route), path: work.route }, [], {
    route: pyList(work.route),
  })
  why(WHY.pick())
  return { steps, finalSnapshot: cloneNet(work) }
}

function packetsFrom(input: unknown): number | null {
  const k = Number(input)
  return Number.isInteger(k) && k >= 1 && k <= 20 ? k : null
}

const isTunnel = (s: AttackSnapshot, a: string, b: string) => !!findLink(s, a, b)?.virtual && farEnd(s, a) === b

export function runSend(state: AttackState, input: unknown): Result {
  const S = L.send
  const work = cloneNet(state)
  const k = packetsFrom(input)
  const { steps, push, why } = recorder(work, { route: work.route ? pyList(work.route) : 'None', k: k ?? 'None' })
  if (k === null) {
    push('Type a number of packets from 1 to 20.', S.def)
    why(WHY.packets())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const route = work.route
  if (!route) {
    push('There is no route yet. Run Discover route first.', S.def)
    why(WHY.noRoute())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (let i = 0; i < k; i++) {
    const p = work.sent + 1
    work.sent = p
    let lostAt: string | null = null
    for (let h = 0; h + 1 < route.length; h++) {
      const [v, nxt] = [route[h], route[h + 1]]
      if (isBlackHole(work, v)) {
        lostAt = v
        work.dropped += 1
        push(`${v} drops packet ${p} without a trace.`, S.drop, { nodes: { [v]: 'dropped' }, links: tree(route) }, [], { p, v, nxt, delivered: 'False' })
        why(WHY.drop(v))
        break
      }
      const packets = [{ kind: 'DATA', from: v, to: nxt, label: `${p}` }]
      if (isTunnel(work, v, nxt)) {
        work.tunneled += 1
        push(`Packet ${p} crosses the tunnel from ${v} to ${nxt}.`, S.hop, { links: { ...tree(route), [linkKey(v, nxt)]: 'active' } }, packets, {
          p,
          v,
          nxt,
          delivered: 'True',
        })
        why(WHY.tunnel())
        continue
      }
      push(`${v} sends packet ${p} to ${nxt}.`, S.hop, { nodes: { [nxt]: 'current' }, links: tree(route) }, packets, { p, v, nxt, delivered: 'True' })
      why(WHY.hop(nxt))
    }
    if (lostAt) {
      push(`Packet ${p} never reaches ${DST}.`, S.done, { nodes: { [lostAt]: 'dropped' }, links: tree(route) }, [], { p, delivered: 'False' })
      why(WHY.lost(lostAt))
      continue
    }
    work.delivered += 1
    push(`Packet ${p} reaches ${DST}.`, S.done, { nodes: { [DST]: 'found' }, links: tree(route), path: route }, [], { p, delivered: 'True' })
    why(WHY.delivered())
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runWatchdog(state: AttackState, input: unknown): Result {
  const W = L.watchdog
  const work = cloneNet(state)
  const k = packetsFrom(input)
  const { steps, push, why } = recorder(work, { src: SRC, route: work.route ? pyList(work.route) : 'None', k: k ?? 'None' })
  if (k === null) {
    push('Type a number of packets from 1 to 20.', W.def)
    why(WHY.packets())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  if (!work.route) {
    push('There is no route yet. Run Discover route first.', W.def)
    why(WHY.noRoute())
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (let i = 0; i < k && work.route; i++) {
    const route: string[] = work.route
    const p = work.sent + 1
    work.sent = p
    for (let h = 0; h + 1 < route.length; h++) {
      const [v, nxt] = [route[h], route[h + 1]]
      const packets = [{ kind: 'DATA', from: v, to: nxt, label: `${p}` }]
      if (isTunnel(work, v, nxt)) {
        work.tunneled += 1
        push(`Packet ${p} crosses the tunnel from ${v} to ${nxt}.`, W.send, { links: { ...tree(route), [linkKey(v, nxt)]: 'active' } }, packets, { p, v, nxt })
        why(WHY.tunnel())
      } else {
        push(`${v} sends packet ${p} to ${nxt} and listens.`, W.send, { nodes: { [nxt]: 'current' }, links: tree(route) }, packets, { p, v, nxt })
        why(WHY.watchSend(v, nxt))
      }
      if (nxt === DST) {
        work.delivered += 1
        push(`Packet ${p} reaches ${DST}.`, W.heard, { nodes: { [DST]: 'found' }, links: tree(route), path: route }, [], { p, v, nxt })
        why(WHY.delivered())
        break
      }
      // This demo counts a forward into the tunnel as heard; a black hole forwards nothing.
      if (!isBlackHole(work, nxt)) {
        push(`${v} hears ${nxt} forward packet ${p}.`, W.heard, { nodes: { [v]: 'current' }, links: { ...tree(route), [linkKey(nxt, route[h + 2])]: 'active' } }, [], {
          p,
          v,
          nxt,
        })
        why(WHY.heard(v, nxt))
        continue
      }
      work.dropped += 1
      const f = (work.failures[nxt] ?? 0) + 1
      work.failures = { ...work.failures, [nxt]: f }
      push(
        `${v} never hears ${nxt} forward packet ${p}: ${f} ${f === 1 ? 'failure' : 'failures'} for ${nxt}.`,
        W.silence,
        { nodes: { [nxt]: 'flagged' } },
        [],
        { p, v, nxt },
      )
      why(WHY.silence(v, nxt))
      if (f <= THRESHOLD) {
        push(`${nxt} has ${f} ${f === 1 ? 'failure' : 'failures'}, not past the threshold of ${THRESHOLD}, so ${v} does not report it yet.`, W.threshold, { nodes: { [nxt]: 'flagged' } }, [], {
          p,
          v,
          nxt,
        })
        why(WHY.below(nxt))
      } else {
        work.flagged = [...work.flagged, nxt]
        push(`${nxt} passed the threshold of ${THRESHOLD}, so ${v} reports it${v === SRC ? '' : ` to ${SRC}`}.`, W.report, { nodes: { [nxt]: 'flagged' } }, [], { nxt })
        why(WHY.report(v, nxt))
        const other = work.routes.find((r) => !r.includes(nxt)) ?? null
        work.route = other
        push(
          other
            ? `The pathrater avoids ${nxt}: ${SRC} switches to ${listIds(other)}.`
            : `The pathrater avoids ${nxt}, but ${SRC} has no other route.`,
          W.reroute,
          other ? { links: tree(other), path: other } : { nodes: { [nxt]: 'flagged' } },
          [],
          { nxt },
        )
        why(other ? WHY.reroute(nxt) : WHY.noOther())
      }
      break
    }
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

const PACKETS = 'Packets, from 1 to 20'

export const attacksOperations: OperationDefinition<AttackState, unknown, AttackSnapshot>[] = [
  { id: 'discover', label: 'Discover route', inputKind: 'none', run: runDiscover },
  { id: 'send', label: 'Send packets', inputKind: 'key', placeholder: PACKETS, run: runSend },
  { id: 'watchdog', label: 'Send with watchdog', inputKind: 'key', placeholder: PACKETS, run: runWatchdog },
]
