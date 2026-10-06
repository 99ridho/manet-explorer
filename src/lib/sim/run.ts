// SPEC.md §9.1: the tick model behind every metrics run. One tick moves every message in flight
// across one link. No MAC, no queues, no collisions: a teaching model, not the books' numbers.
import type { NetLink, NetNode } from '@/types/net'

export interface Topology {
  nodes: NetNode[]
  links: NetLink[]
}

export interface Flow {
  src: string
  dst: string
  packets: number // one data packet per tick, from tick 0
}

/** Whether `v`, having first heard the RREQ from `from`, rebroadcasts it. Blind flooding says yes. */
export type RelayRule = (net: Topology, v: string, from: string) => boolean

export interface RunOptions {
  ticks: number // the horizon; packets still queued or in flight then are lost
  topologyAt: (t: number) => Topology
  relays?: RelayRule
  retryAfter?: number // ticks before a failed discovery is tried again
}

export interface FlowRun {
  flow: Flow
  sent: number
  delivered: number
  delays: number[] // ticks from send to delivery, discovery wait included, delivered packets only
  control: number // RREQ, RREP, and RERR transmissions
  lastTick: number // the tick the last packet arrived, or the horizon
}

/** This simulator's choice: a discovery that finds no route is tried again 2 ticks later. */
export const RETRY_AFTER = 2

function adjacency(net: Topology): Map<string, string[]> {
  const live = net.nodes.filter((n) => !n.down)
  const linked = new Map<string, Set<string>>(live.map((n) => [n.id, new Set()]))
  for (const l of net.links) {
    if (l.broken || l.virtual) continue
    linked.get(l.a)?.add(l.b)
    linked.get(l.b)?.add(l.a)
  }
  // Neighbors in node order, the tie-break order of SPEC §7.2.
  return new Map(live.map((n) => [n.id, live.filter((m) => linked.get(n.id)!.has(m.id)).map((m) => m.id)]))
}

const linked = (net: Topology, a: string, b: string) =>
  net.links.some((l) => !l.broken && !l.virtual && ((l.a === a && l.b === b) || (l.a === b && l.b === a)))

/**
 * An AODV-style flood from src: every node that relays transmits once, the first copy sets the
 * reverse pointer, and dst answers instead of relaying. Returns the route and the RREQ count.
 */
export function flood(net: Topology, src: string, dst: string, relays: RelayRule = () => true): { route: string[] | null; rreq: number } {
  const adj = adjacency(net)
  if (!adj.has(src)) return { route: null, rreq: 0 }
  const reverse = new Map<string, string>()
  const seen = new Set([src])
  const queue: [string, string | null][] = [[src, null]]
  let rreq = 0
  while (queue.length) {
    const [v, from] = queue.shift()!
    if (v === dst) continue
    if (from !== null && !relays(net, v, from)) continue
    rreq += 1
    for (const n of adj.get(v)!) {
      if (seen.has(n)) continue
      seen.add(n)
      reverse.set(n, v)
      queue.push([n, v])
    }
  }
  if (!reverse.has(dst)) return { route: null, rreq }
  const route = [dst]
  while (route[0] !== src) route.unshift(reverse.get(route[0])!)
  return { route, rreq }
}

interface Packet {
  born: number
  at: number // index into the route it travels
  route: string[]
}

export function runFlow(flow: Flow, opts: RunOptions): FlowRun {
  const retry = opts.retryAfter ?? RETRY_AFTER
  const run: FlowRun = { flow, sent: 0, delivered: 0, delays: [], control: 0, lastTick: opts.ticks }
  const queue: number[] = [] // birth ticks of packets waiting for a route
  let inFlight: Packet[] = []
  let route: string[] | null = null
  let readyAt = Infinity
  let nextTry = 0
  let lastArrival = -1

  for (let t = 0; t < opts.ticks; t++) {
    const net = opts.topologyAt(t)
    if (t < flow.packets) {
      queue.push(t)
      run.sent += 1
    }
    // Packets already on their way cross one link each.
    const still: Packet[] = []
    for (const p of inFlight) {
      const [v, nxt] = [p.route[p.at], p.route[p.at + 1]]
      if (!linked(net, v, nxt)) {
        if (route === p.route) {
          run.control += p.at // the RERR travels from v back to the source
          route = null
          readyAt = Infinity
          nextTry = t
        }
        continue
      }
      p.at += 1
      if (p.at === p.route.length - 1) {
        run.delivered += 1
        run.delays.push(t - p.born)
        lastArrival = t
      } else still.push(p)
    }
    inFlight = still

    if (!route && queue.length && t >= nextTry) {
      const found = flood(net, flow.src, flow.dst, opts.relays)
      run.control += found.rreq
      if (found.route) {
        const hops = found.route.length - 1
        route = found.route
        run.control += hops // the RREP retraces the route
        readyAt = t + 2 * hops
      } else nextTry = t + retry
    }
    if (route && t >= readyAt) for (const born of queue.splice(0)) inFlight.push({ born, at: 0, route })
  }
  if (lastArrival >= 0) run.lastTick = lastArrival
  return run
}
