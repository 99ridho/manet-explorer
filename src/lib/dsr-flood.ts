// SPEC.md §10.11 Discover, shared with §19.3: a DSR-style RREQ flood in ticks. Each node forwards
// its first copy and adds itself to the record, the destination answers every copy, a black hole
// answers at once with a route it does not have, and a tunnel end replays the request at its far end.
import type { HighlightKind, InFlight, NetHighlight, NetSnapshot } from '@/types/net'
import { linkKey, listIds, neighbors } from './net'

type Push = (description: string, line: number, highlight?: NetHighlight, packets?: InFlight[]) => void

export interface FloodRules {
  blackHole: (id: string) => boolean
  farEnd: (id: string) => string | null
}

export interface FloodLines {
  tick: number
  blackHole: number
  tunnel: number
  dest: number
  arrival: number
}

/** Every route an RREP brought to `src`, in order of arrival, and the RREQ transmissions it took. */
export function floodRreq(
  s: NetSnapshot,
  src: string,
  dst: string,
  rules: FloodRules,
  push: Push,
  lines: FloodLines,
): { routes: string[][]; rreq: number } {
  const routes: string[][] = []
  let rreq = 0
  const seen = new Set([src])
  let heard: [string, string[]][] = [[src, [src]]]
  const pending: { at: number; route: string[] }[] = []
  for (let t = 1; heard.length || pending.length; t++) {
    const next: [string, string[]][] = []
    const copies: string[][] = [] // records that reach the destination this tick
    for (const [v, record] of heard) {
      if (v === dst || rules.blackHole(v)) continue
      rreq += 1
      for (const n of neighbors(s, v)) {
        if (n === dst) copies.push([...record, n])
        else if (!seen.has(n)) {
          seen.add(n)
          next.push([n, [...record, n]])
        }
      }
    }
    const ids = [...new Set([...next.map(([n]) => n), ...(copies.length ? [dst] : [])])]
    if (ids.length)
      push(`Tick ${t}: ${listIds(ids)} ${ids.length === 1 ? 'hears' : 'hear'} the RREQ.`, lines.tick, {
        nodes: Object.fromEntries(ids.map((n) => [n, 'current' as HighlightKind])),
      })
    for (const [n, record] of next) {
      if (rules.blackHole(n)) {
        const fake = [...record, dst]
        pending.push({ at: t + record.length - 1, route: fake })
        push(`${n} answers at once, claiming a route ${listIds(fake)} it does not have.`, lines.blackHole, { nodes: { [n]: 'flagged' } }, [
          { kind: 'RREP', from: n, to: record[record.length - 2] },
        ])
      }
      const far = rules.farEnd(n)
      if (far && !seen.has(far)) {
        seen.add(far)
        next.push([far, [...record, far]])
        push(
          `${n} passes the RREQ through the tunnel, and ${far} replays it next to ${listIds(neighbors(s, far))}.`,
          lines.tunnel,
          { links: { [linkKey(n, far)]: 'active' } },
          [{ kind: 'RREQ', from: n, to: far }],
        )
      }
    }
    for (const record of copies) {
      pending.push({ at: t + record.length - 1, route: record })
      push(`${dst} receives the record ${listIds(record)} and answers.`, lines.dest, { nodes: { [dst]: 'found' } })
    }
    for (const r of pending.filter((p) => p.at === t)) {
      routes.push(r.route)
      push(`An RREP with ${listIds(r.route)} reaches ${src} at tick ${t}.`, lines.arrival, { nodes: { [src]: 'current' } }, [
        { kind: 'RREP', from: r.route[1], to: src },
      ])
    }
    for (let i = pending.length - 1; i >= 0; i--) if (pending[i].at === t) pending.splice(i, 1)
    heard = next
  }
  return { routes, rreq }
}
