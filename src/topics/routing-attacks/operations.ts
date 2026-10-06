// SPEC.md §10.11: DSR-style discovery under a black hole or a wormhole, sending, and the watchdog.
import { cloneNet, findLink, linkKey, listIds, makeLink, neighbors, recorder } from '@/lib/net'
import type { HighlightKind } from '@/types/net'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { AttackSnapshot, AttackState, Attacker } from './types'

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

const isBlackHole = (s: AttackSnapshot, id: string) => s.attacker === 'blackhole' && id === 'M'
const farEnd = (s: AttackSnapshot, id: string) => (s.attacker !== 'wormhole' ? null : id === 'M1' ? 'M2' : id === 'M2' ? 'M1' : null)
const tree = (route: string[]) => Object.fromEntries(route.slice(1).map((n, i) => [linkKey(route[i], n), 'tree' as HighlightKind]))
const hearVerb = (ids: string[]) => (ids.length === 1 ? 'hears' : 'hear')

export function runDiscover(state: AttackState): Result {
  const D = L.discover
  const work = cloneNet(state)
  work.routes = []
  work.route = null
  const { steps, push } = recorder(work)
  const seen = new Set([SRC])
  let heard: [string, string[]][] = [[SRC, [SRC]]]
  const pending: { at: number; route: string[] }[] = []
  for (let t = 1; heard.length || pending.length; t++) {
    const next: [string, string[]][] = []
    const copies: [string, string[]][] = [] // copies that reach the destination this tick
    for (const [v, record] of heard) {
      if (v === DST || isBlackHole(work, v)) continue
      for (const n of neighbors(work, v)) {
        if (n === DST) copies.push([n, [...record, n]])
        else if (!seen.has(n)) {
          seen.add(n)
          next.push([n, [...record, n]])
        }
      }
    }
    const acting = [...next, ...copies]
    if (acting.length) {
      const ids = [...new Set(acting.map(([n]) => n))]
      push(`Tick ${t}: ${listIds(ids)} ${hearVerb(ids)} the RREQ.`, D.tick, {
        nodes: Object.fromEntries(ids.map((n) => [n, 'current' as HighlightKind])),
      })
    }
    for (const [n, record] of next) {
      if (isBlackHole(work, n)) {
        const fake = [...record, DST]
        pending.push({ at: t + record.length - 1, route: fake })
        push(`${n} answers at once, claiming a route ${listIds(fake)} it does not have.`, D.blackHole, { nodes: { [n]: 'flagged' } }, [
          { kind: 'RREP', from: n, to: record[record.length - 2] },
        ])
      }
      const far = farEnd(work, n)
      if (far && !seen.has(far)) {
        seen.add(far)
        next.push([far, [...record, far]])
        push(
          `${n} passes the RREQ through the tunnel, and ${far} replays it next to ${listIds(neighbors(work, far))}.`,
          D.tunnel,
          { links: { [linkKey(n, far)]: 'active' } },
          [{ kind: 'RREQ', from: n, to: far }],
        )
      }
    }
    for (const [, record] of copies) {
      pending.push({ at: t + record.length - 1, route: record })
      push(`${DST} receives the record ${listIds(record)} and answers.`, D.dest, { nodes: { [DST]: 'found' } })
    }
    for (const r of pending.filter((p) => p.at === t)) {
      work.routes.push(r.route)
      push(`An RREP with ${listIds(r.route)} reaches ${SRC} at tick ${t}.`, D.arrival, { nodes: { [SRC]: 'current' } }, [
        { kind: 'RREP', from: r.route[1], to: SRC },
      ])
    }
    for (let i = pending.length - 1; i >= 0; i--) if (pending[i].at === t) pending.splice(i, 1)
    heard = next
  }
  if (work.routes.length === 0) {
    push(`No RREP reached ${SRC}, so there is no route to ${DST}.`, D.pick)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  work.route = work.routes[0]
  push(`${SRC} uses the first route to arrive: ${listIds(work.route)}.`, D.pick, { links: tree(work.route), path: work.route })
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
  const { steps, push } = recorder(work)
  const k = packetsFrom(input)
  if (k === null) {
    push('Type a number of packets from 1 to 20.', S.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const route = work.route
  if (!route) {
    push('There is no route yet. Run Discover route first.', S.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (let i = 0; i < k; i++) {
    const p = work.sent + 1
    work.sent = p
    let delivered = true
    for (let h = 0; h + 1 < route.length; h++) {
      const [v, nxt] = [route[h], route[h + 1]]
      if (isBlackHole(work, v)) {
        delivered = false
        work.dropped += 1
        push(`${v} drops packet ${p} without a trace.`, S.drop, { nodes: { [v]: 'dropped' }, links: tree(route) })
        break
      }
      if (isTunnel(work, v, nxt)) {
        work.tunneled += 1
        push(`Packet ${p} crosses the tunnel from ${v} to ${nxt}.`, S.tunnel, { links: { ...tree(route), [linkKey(v, nxt)]: 'active' } }, [
          { kind: 'DATA', from: v, to: nxt, label: `${p}` },
        ])
      }
    }
    if (delivered) {
      work.delivered += 1
      push(`Packet ${p} reaches ${DST}.`, S.done, { nodes: { [DST]: 'found' }, links: tree(route), path: route }, [
        { kind: 'DATA', from: route[route.length - 2], to: DST, label: `${p}` },
      ])
    }
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runWatchdog(state: AttackState, input: unknown): Result {
  const W = L.watchdog
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const k = packetsFrom(input)
  if (k === null) {
    push('Type a number of packets from 1 to 20.', W.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  if (!work.route) {
    push('There is no route yet. Run Discover route first.', W.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  for (let i = 0; i < k && work.route; i++) {
    const route: string[] = work.route
    const p = work.sent + 1
    work.sent = p
    for (let h = 0; h + 1 < route.length; h++) {
      const [v, nxt] = [route[h], route[h + 1]]
      if (isTunnel(work, v, nxt)) work.tunneled += 1
      if (nxt === DST) {
        work.delivered += 1
        push(`Packet ${p} reaches ${DST}.`, W.heard, { nodes: { [DST]: 'found' }, links: tree(route), path: route }, [
          { kind: 'DATA', from: v, to: nxt, label: `${p}` },
        ])
        break
      }
      // This demo counts a forward into the tunnel as heard; a black hole forwards nothing.
      if (!isBlackHole(work, nxt)) {
        push(`${v} hears ${nxt} forward packet ${p}.`, W.heard, { links: { [linkKey(v, nxt)]: 'tree' } }, [
          { kind: 'DATA', from: v, to: nxt, label: `${p}` },
        ])
        continue
      }
      work.dropped += 1
      const f = (work.failures[nxt] ?? 0) + 1
      work.failures = { ...work.failures, [nxt]: f }
      push(`${v} never hears ${nxt} forward packet ${p}: ${f} ${f === 1 ? 'failure' : 'failures'} for ${nxt}.`, W.silence, {
        nodes: { [nxt]: 'flagged' },
      })
      if (f > THRESHOLD && !work.flagged.includes(nxt)) {
        work.flagged = [...work.flagged, nxt]
        push(`${nxt} passed the threshold of ${THRESHOLD}, so ${v} reports it${v === SRC ? '' : ` to ${SRC}`}.`, W.report, { nodes: { [nxt]: 'flagged' } })
        const other = work.routes.find((r) => !r.includes(nxt)) ?? null
        work.route = other
        push(
          other
            ? `The pathrater avoids ${nxt}: ${SRC} switches to ${listIds(other)}.`
            : `The pathrater avoids ${nxt}, but ${SRC} has no other route.`,
          W.reroute,
          other ? { links: tree(other), path: other } : { nodes: { [nxt]: 'flagged' } },
        )
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
