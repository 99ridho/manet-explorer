// SPEC.md §10.11 Discover, shared with §19.3: a DSR-style RREQ flood in ticks, one event per step
// (ADR-018). Each node forwards its first copy and adds itself to the record, the destination answers
// every copy, a black hole answers at once with a route it does not have, and a tunnel end replays the
// request at its far end. An RREP moves one hop per tick, starting in the tick after it was sent.
import type { HighlightKind, InFlight, NetHighlight, NetSnapshot } from '@/types/net'
import { linkKey, listIds, neighbors, pyList } from './net'

type Push = (description: string, line: number, highlight?: NetHighlight, packets?: InFlight[], variables?: Record<string, string | number>) => void

export interface FloodRules {
  blackHole: (id: string) => boolean
  farEnd: (id: string) => string | null
}

export interface FloodLines {
  hop: number
  arrival: number
  silent: number
  broadcast: number
  duplicate: number
  dest: number
  first: number
  blackHole: number
  tunnel: number
}

/** Every route an RREP brought to `src`, in order of arrival, and the RREQ transmissions it took. */
export function floodRreq(
  s: NetSnapshot,
  src: string,
  dst: string,
  rules: FloodRules,
  push: Push,
  why: (text: string) => void, // SPEC.md §20: the reason for the step pushed last
  lines: FloodLines,
): { routes: string[][]; rreq: number } {
  const routes: string[][] = []
  let rreq = 0
  const seen = new Set([src])
  let heard: [string, string[]][] = [[src, [src]]]
  // `at` is the index in `route` of the node holding the RREP.
  let replies: { route: string[]; at: number }[] = []
  for (let t = 1; heard.length || replies.length; t++) {
    for (const r of replies) {
      const [w, prev] = [r.route[r.at], r.route[r.at - 1]]
      r.at -= 1
      const packets: InFlight[] = [{ kind: 'RREP', from: w, to: prev }]
      if (r.at > 0) {
        push(`Tick ${t}: the RREP with ${listIds(r.route)} moves from ${w} to ${prev}.`, lines.hop, { nodes: { [prev]: 'current' } }, packets, {
          route: pyList(r.route),
        })
        why('The answer travels back along the recorded route, one hop per tick.')
        continue
      }
      routes.push(r.route)
      push(`An RREP with ${listIds(r.route)} reaches ${src} at tick ${t}.`, lines.arrival, { nodes: { [src]: 'current' } }, packets, {
        route: pyList(r.route),
      })
      why(`${src} keeps every route an answer brings, in order of arrival. A route that looks shorter answers sooner.`)
    }
    replies = replies.filter((r) => r.at > 0)
    const sending = heard
    heard = []
    for (const [v, record] of sending) {
      if (rules.blackHole(v)) {
        push(`${v} heard the RREQ but passes nothing on.`, lines.silent, { nodes: { [v]: 'flagged' } }, [], { v, record: pyList(record) })
        why(`${v} already answered with its fake route, so it has no reason to help the request reach ${dst}.`)
        continue
      }
      rreq += 1
      const around = neighbors(s, v)
      push(
        `Tick ${t}: ${v} broadcasts the RREQ with the record ${listIds(record)}.`,
        lines.broadcast,
        { nodes: { [v]: 'current' } },
        around.map((n) => ({ kind: 'RREQ', from: v, to: n })),
        { v, record: pyList(record) },
      )
      why(`${v} passes on the first copy it heard, so every neighbor gets a copy at once.`)
      for (const n of around) {
        const packets: InFlight[] = [{ kind: 'RREQ', from: v, to: n }]
        if (n !== dst && seen.has(n)) {
          push(`${n} already has this RREQ, so it drops the copy from ${v}.`, lines.duplicate, { nodes: { [n]: 'dropped' } }, packets, {
            v,
            n,
            record: pyList(record),
          })
          why(`${n} forwarded this request already. Dropping later copies stops the flood from circling back.`)
          continue
        }
        seen.add(n)
        const recordN = [...record, n]
        if (n === dst) {
          replies.push({ route: recordN, at: recordN.length - 1 })
          push(`${dst} receives the record ${listIds(recordN)} and answers.`, lines.dest, { nodes: { [dst]: 'found' } }, packets, {
            v,
            n,
            record: pyList(record),
          })
          why(`Each copy reached ${dst} along a different chain of nodes, and ${dst} answers every one so the source can choose.`)
          continue
        }
        heard.push([n, recordN])
        push(`${n} hears its first copy from ${v} and adds itself: ${listIds(recordN)}.`, lines.first, { nodes: { [n]: 'new' } }, packets, {
          v,
          n,
          record: pyList(record),
        })
        why(`The record lists every node the request crossed, so the answer can come back along the same chain.`)
        if (rules.blackHole(n)) {
          const fake = [...recordN, dst]
          replies.push({ route: fake, at: recordN.length - 1 })
          push(`${n} answers at once, claiming a route ${listIds(fake)} it does not have.`, lines.blackHole, { nodes: { [n]: 'flagged' } }, [], {
            v,
            n,
            record: pyList(record),
          })
          why(`${n} wants to sit on the route, so it answers at once with a short route it does not have. A quick, short answer looks attractive to the source.`)
        }
        const far = rules.farEnd(n)
        if (far && !seen.has(far)) {
          seen.add(far)
          heard.push([far, [...recordN, far]])
          push(
            `${n} passes the RREQ through the tunnel, and ${far} replays it next to ${listIds(neighbors(s, far))}.`,
            lines.tunnel,
            { links: { [linkKey(n, far)]: 'active' as HighlightKind } },
            [{ kind: 'RREQ', from: n, to: far }],
            { v, n, record: pyList(record) },
          )
          why('The two attackers carry the request over a hidden link, so it reaches the far side sooner and in fewer apparent hops than over the real path.')
        }
      }
    }
  }
  return { routes, rreq }
}
