// SPEC.md §10.3: route discovery, data forwarding, and link breaks for AODV and DSR.
import { cloneNet, findLink, frame, linkKey, listIds, makeLink, neighbors, plural } from '@/lib/net'
import { dist, unitDiskLinked } from '@/lib/sim/geometry'
import { isConnected, uniform } from '@/lib/sim/placement'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { HighlightKind, InFlight, NetHighlight } from '@/types/net'
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { L } from './pseudocode'
import type { Protocol, ReactiveSnapshot, ReactiveState } from './types'

type Result = OperationResult<ReactiveSnapshot>

/** SPEC §10.3 seed: Week 2, "RREQ menyebar dan mencatat jalur balik" (Misra Example 4.11). */
export function seedNetwork(protocol: Protocol = 'aodv'): ReactiveSnapshot {
  const nodes = [
    { id: 'S', x: 0, y: 1, roles: ['source' as const] },
    { id: 'A', x: 1, y: 0, roles: [] },
    { id: 'B', x: 1, y: 2, roles: [] },
    { id: 'C', x: 2, y: 0, roles: [] },
    { id: 'E', x: 2, y: 2, roles: [] },
    { id: 'D', x: 3, y: 1, roles: ['dest' as const] },
  ]
  const links = [
    ['S', 'A'],
    ['S', 'B'],
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'E'],
    ['C', 'D'],
    ['E', 'D'],
  ].map(([a, b]) => makeLink(a, b))
  return { nodes, links, range: 1.5, packets: [], protocol, route: {}, cache: {}, requestId: 0, rreqTx: 0, control: 0, flow: null }
}

/** 6 to 9 nodes, connected; the two most distant become S and D, the rest A, B, C, E, F … */
export function randomNetwork(protocol: Protocol, seed: number): ReactiveSnapshot {
  const rng = mulberry32(seed)
  const count = randInt(rng, 6, 9)
  const temp = Array.from({ length: count }, (_, i) => `n${i}`)
  const range = 1.5
  for (let tries = 0; tries < 20; tries++) {
    const placed = uniform(rng, temp, 4.5, 3)
    const links = []
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++)
        if (unitDiskLinked(dist(placed[i], placed[j]), range)) links.push({ a: placed[i].id, b: placed[j].id })
    if (!isConnected(placed, links) && tries < 19) continue
    let far: [string, string] = [placed[0].id, placed[1].id]
    let best = -1
    for (const p of placed)
      for (const q of placed) {
        const d = dist(p, q)
        if (d > best) {
          best = d
          far = [p.id, q.id]
        }
      }
    const letters = 'ABCEFGHI'.split('')
    const rename = new Map<string, string>([
      [far[0], 'S'],
      [far[1], 'D'],
    ])
    for (const p of placed) if (!rename.has(p.id)) rename.set(p.id, letters.shift()!)
    const nodes = placed
      .map((p) => ({
        ...p,
        id: rename.get(p.id)!,
        roles: p.id === far[0] ? ['source' as const] : p.id === far[1] ? ['dest' as const] : [],
      }))
      .sort((a, b) => (a.id === 'S' ? -1 : b.id === 'S' ? 1 : a.id === 'D' ? 1 : b.id === 'D' ? -1 : a.id.localeCompare(b.id)))
    return {
      ...seedNetwork(protocol),
      nodes,
      links: links.map((l) => makeLink(rename.get(l.a)!, rename.get(l.b)!)),
    }
  }
  return seedNetwork(protocol)
}

/** The route src currently holds to dst, or null. AODV follows next hops; DSR reads the cache. */
export function currentRoute(s: ReactiveSnapshot, src: string, dst: string): string[] | null {
  if (s.protocol === 'dsr') return s.cache[src]?.[dst] ?? null
  const path = [src]
  let v = src
  while (v !== dst) {
    const nxt = s.route[v]?.[dst]
    if (!nxt || path.includes(nxt)) return null
    path.push(nxt)
    v = nxt
  }
  return path
}

const PAIR = /^([A-Za-z0-9]+)\s*[\s,-]\s*([A-Za-z0-9]+)$/

function parsePair(s: ReactiveSnapshot, input: unknown): { a: string; b: string } | null {
  const m = PAIR.exec(String(input ?? '').trim())
  if (!m) return null
  const a = m[1].toUpperCase()
  const b = m[2].toUpperCase()
  const ids = new Set(s.nodes.map((n) => n.id))
  return a !== b && ids.has(a) && ids.has(b) ? { a, b } : null
}

function withRoles(s: ReactiveSnapshot, src: string, dst: string) {
  for (const n of s.nodes) {
    n.roles = n.roles.filter((r) => r !== 'source' && r !== 'dest')
    if (n.id === src) n.roles.push('source')
    if (n.id === dst) n.roles.push('dest')
  }
}

function recorder(work: ReactiveSnapshot) {
  const steps: Step<ReactiveSnapshot>[] = []
  const push = (
    description: string,
    highlightLine: number,
    highlight?: NetHighlight,
    packets: InFlight[] = [],
    variables?: Record<string, string | number>,
  ) => steps.push({ id: steps.length, description, highlightLine, snapshot: frame(work, highlight, packets), variables })
  return { steps, push }
}

export function runDiscover(state: ReactiveState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const pair = parsePair(work, input)
  if (!pair) {
    push('Type a source and a destination, such as S D.', L.discover.aodv.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const { a: src, b: dst } = pair
  withRoles(work, src, dst)
  work.flow = { src, dst }
  work.requestId += 1
  const id = work.requestId
  const had = currentRoute(work, src, dst) !== null
  const D = work.protocol === 'dsr' ? L.discover.dsr : L.discover.aodv
  push(
    had
      ? `${src} starts route discovery ${id} for ${dst}.`
      : `${src} has no route to ${dst}, so it starts route discovery ${id}.`,
    D.request,
    { nodes: { [src]: 'current' } },
  )

  // Links a first copy travelled, kept on screen as the flood grows.
  const reached: Record<string, HighlightKind> = {}
  const nodeMarks = (extra: Record<string, HighlightKind>) => ({ [src]: 'visited' as HighlightKind, ...extra })
  const dsr = work.protocol === 'dsr'
  const seen = new Set([src])
  const reverse: Record<string, string> = {}
  const candidates: string[][] = []
  const queue: [string, string[]][] = [[src, [src]]]
  let tx = 0

  while (queue.length) {
    const [v, record] = queue.shift()!
    const nbrs = neighbors(work, v)
    tx += 1
    work.rreqTx += 1
    work.control += 1
    push(
      dsr
        ? `${v} broadcasts the RREQ to ${listIds(nbrs)}, carrying the record ${listIds(record)}.`
        : `${v} broadcasts the RREQ to ${listIds(nbrs)}.`,
      D.broadcast,
      { nodes: nodeMarks({ [v]: 'current' }), links: { ...reached } },
      [{ kind: 'RREQ', from: v, to: '*', label: `${id}` }],
      { rreqTx: work.rreqTx },
    )
    for (const n of nbrs) {
      const key = linkKey(v, n)
      if (dsr && record.includes(n)) {
        push(`${n} is already in the record, so it drops this copy.`, D.drop, { nodes: nodeMarks({ [n]: 'dropped' }), links: { ...reached } })
        continue
      }
      if ((!dsr || n !== dst) && seen.has(n)) {
        push(`${n} has already seen request ${id}, so it drops this copy.`, D.drop, {
          nodes: nodeMarks({ [n]: 'dropped' }),
          links: { ...reached },
        })
        continue
      }
      const firstCopy = !seen.has(n)
      seen.add(n)
      const recordN = [...record, n]
      if (firstCopy) reached[key] = 'tree'
      if (dsr) {
        push(`${n} adds itself: the record is now ${listIds(recordN)}.`, D.first, {
          nodes: nodeMarks({ [n]: 'new' }),
          links: { ...reached, [key]: 'new' },
        })
      } else {
        reverse[n] = v
        push(`${n} hears the RREQ first from ${v}, so it records ${v} as its way back to ${src}.`, D.first, {
          nodes: nodeMarks({ [n]: 'new' }),
          links: { ...reached, [key]: 'new' },
        })
      }
      if (n === dst) {
        if (dsr) {
          candidates.push(recordN)
          push(`${dst} receives the record ${listIds(recordN)}.`, D.arrived, { nodes: nodeMarks({ [dst]: 'found' }), links: { ...reached } })
        } else {
          push(`The RREQ reaches ${dst} through ${v}.`, D.arrived, { nodes: nodeMarks({ [dst]: 'found' }), links: { ...reached } })
        }
      } else {
        queue.push([n, recordN])
      }
    }
  }

  const arrived = dsr ? candidates.length > 0 : reverse[dst] !== undefined
  if (!arrived) {
    push(`The RREQ never reached ${dst}: there is no route.`, D.loop)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  push(`The flood is over after ${plural(tx, 'RREQ transmission')}; ${dst} answers instead of forwarding.`, D.loop, {
    links: { ...reached },
  })

  if (dsr) {
    const route = candidates.reduce((best, c) => (c.length < best.length ? c : best))
    const pathLinks = Object.fromEntries(route.slice(1).map((n, i) => [linkKey(route[i], n), 'tree' as HighlightKind]))
    const hops = plural(route.length - 1, 'hop')
    push(
      candidates.length > 1
        ? `${dst} picks ${listIds(route)}: ${hops}, the first to arrive.`
        : `${dst} picks ${listIds(route)}: ${hops}, the only record that arrived.`,
      L.discover.dsr.pick,
      { links: pathLinks, path: route },
    )
    work.control += route.length - 1
    push(`The RREP carries ${listIds(route)} back to ${src}.`, L.discover.dsr.rrep, { links: pathLinks, path: route }, [
      { kind: 'RREP', from: dst, to: route[route.length - 2] },
    ])
    work.cache = { ...work.cache, [src]: { ...(work.cache[src] ?? {}), [dst]: route } }
    push(`${src} stores ${listIds(route)} in its route cache.`, L.discover.dsr.cache, { links: pathLinks, path: route })
  } else {
    const rrepLinks: Record<string, HighlightKind> = {}
    let w = dst
    while (w !== src) {
      const prev = reverse[w]
      work.route = { ...work.route, [prev]: { ...(work.route[prev] ?? {}), [dst]: w } }
      work.control += 1
      rrepLinks[linkKey(prev, w)] = 'tree'
      push(
        w === dst
          ? `The RREP goes from ${w} to ${prev}, so ${prev} now forwards straight to ${dst}.`
          : `The RREP goes from ${w} to ${prev}, so ${prev} now forwards to ${dst} through ${w}.`,
        L.discover.aodv.rrep,
        { nodes: { [prev]: 'current' }, links: { ...rrepLinks } },
        [{ kind: 'RREP', from: w, to: prev }],
      )
      w = prev
    }
  }
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runSend(state: ReactiveState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const pair = parsePair(work, input)
  if (!pair) {
    push('Type a source and a destination, such as S D.', L.send.aodv.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const { a: src, b: dst } = pair
  const S = work.protocol === 'dsr' ? L.send.dsr : L.send.aodv
  const route = currentRoute(work, src, dst)
  if (!route) {
    push(`${src} has no route to ${dst}. Run Discover route first.`, S.no_route)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const dsr = work.protocol === 'dsr'
  const header = dsr ? { header: route.length } : undefined
  const done: Record<string, HighlightKind> = {}
  for (let i = 0; i + 1 < route.length; i++) {
    const v = route[i]
    const nxt = route[i + 1]
    push(
      dsr
        ? `${v} reads the header route ${listIds(route)}: next hop ${nxt}.`
        : `${v} looks up ${dst} in its table: next hop ${nxt}.`,
      S.lookup,
      { nodes: { [v]: 'current' }, links: { ...done }, path: route },
      [],
      header,
    )
    const link = findLink(work, v, nxt)
    if (!link || link.broken) {
      push(`Link ${v}-${nxt} is broken, so the packet stops at ${v}.`, S.forward, { nodes: { [v]: 'dropped' }, links: { ...done } })
      return { steps, finalSnapshot: cloneNet(work) }
    }
    done[linkKey(v, nxt)] = 'tree'
    push(`The packet moves from ${v} to ${nxt}.`, S.forward, { nodes: { [nxt]: 'current' }, links: { ...done }, path: route }, [
      { kind: 'DATA', from: v, to: nxt },
    ], header)
  }
  push(`The packet reaches ${dst} after ${plural(route.length - 1, 'hop')}.`, S.done, {
    nodes: { [dst]: 'found' },
    links: { ...done },
    path: route,
  }, [], header)
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runBreakLink(state: ReactiveState, input: unknown): Result {
  const B = L.breakLink
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const pair = parsePair(work, input)
  const link = pair ? findLink(work, pair.a, pair.b) : undefined
  if (!pair || !link || link.broken || link.virtual) {
    const name = pair ? `${pair.a}-${pair.b}` : String(input ?? '').trim() || 'that'
    push(`There is no link ${name} to break.`, B.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  const { a: u, b: v } = pair
  const key = linkKey(u, v)
  link.broken = true
  push(`Link ${u}-${v} breaks.`, B.mark, { links: { [key]: 'dropped' } })

  const flow = work.flow
  const route = flow ? currentRoute(work, flow.src, flow.dst) : null
  const at = route ? route.findIndex((n, i) => i + 1 < route.length && linkKey(n, route[i + 1]) === key) : -1
  if (!flow || !route || at < 0) {
    push(`No route used ${u}-${v}, so no table changes.`, B.loop, { links: { [key]: 'dropped' } })
    return { steps, finalSnapshot: cloneNet(work) }
  }

  const { src, dst } = flow
  const up = route[at]
  const down = route[at + 1]
  // Upstream: the RERR travels from the break back to the source; each node it passes drops the route.
  work.control += at === 0 ? 0 : at
  push(
    at === 0 ? `${up} is the source itself, so no RERR has to travel on its side.` : `${up} sends an RERR toward ${src}.`,
    B.rerr,
    { nodes: { [up]: 'current' }, links: { [key]: 'dropped' } },
    at === 0 ? [] : [{ kind: 'RERR', from: up, to: route[at - 1] }],
  )
  if (work.protocol === 'dsr') {
    push(`${src} deletes the cached route ${listIds(route)}.`, B.remove, { nodes: { [src]: 'dropped' }, links: { [key]: 'dropped' } })
    const cache = { ...(work.cache[src] ?? {}) }
    delete cache[dst]
    work.cache = { ...work.cache, [src]: cache }
  } else {
    for (let i = at; i >= 0; i--) {
      const n = route[i]
      push(`${n} deletes its route to ${dst}, which used ${u}-${v}.`, B.remove, { nodes: { [n]: 'dropped' }, links: { [key]: 'dropped' } })
      const table = { ...(work.route[n] ?? {}) }
      delete table[dst]
      work.route = { ...work.route, [n]: table }
    }
  }
  work.control += 1
  push(`${down} also sends an RERR, since it sits at the other end of ${u}-${v}.`, B.rerr, {
    nodes: { [down]: 'current' },
    links: { [key]: 'dropped' },
  })
  push(`${src} has no route to ${dst} now; its next discovery uses request id ${work.requestId + 1}.`, B.done, {
    nodes: { [src]: 'current' },
    links: { [key]: 'dropped' },
  })
  return { steps, finalSnapshot: cloneNet(work) }
}

const PAIR_PLACEHOLDER = 'Source and destination, e.g. S D'

export const reactiveOperations: OperationDefinition<ReactiveState, unknown, ReactiveSnapshot>[] = [
  { id: 'discover-aodv', label: 'Discover route', inputKind: 'text', placeholder: PAIR_PLACEHOLDER, variants: ['aodv'], run: runDiscover },
  { id: 'discover-dsr', label: 'Discover route', inputKind: 'text', placeholder: PAIR_PLACEHOLDER, variants: ['dsr'], run: runDiscover },
  { id: 'send-aodv', label: 'Send data', inputKind: 'text', placeholder: PAIR_PLACEHOLDER, variants: ['aodv'], run: runSend },
  { id: 'send-dsr', label: 'Send data', inputKind: 'text', placeholder: PAIR_PLACEHOLDER, variants: ['dsr'], run: runSend },
  { id: 'break-link', label: 'Break link', inputKind: 'text', placeholder: 'Link, e.g. C D', run: runBreakLink },
]
