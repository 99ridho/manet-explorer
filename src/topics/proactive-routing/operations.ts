// SPEC.md §10.2: DSDV table advertisements and a node that moves.
import { cloneNet, linkKey, listIds, makeLink, neighbors, parseIds, plural, recorder } from '@/lib/net'
import { dist, unitDiskLinked } from '@/lib/sim/geometry'
import { connectedUnitDisk } from '@/lib/sim/placement'
import { mulberry32, randInt } from '@/lib/sim/rng'
import type { OperationDefinition, OperationResult } from '@/types/step-engine'
import { L } from './pseudocode'
import type { DsdvRow, DsdvSnapshot, DsdvState, Update } from './types'

type Result = OperationResult<DsdvSnapshot>
type Push = ReturnType<typeof recorder<DsdvSnapshot>>['push']

/** Shortest-hop tables for every node, each row carrying the destination's own sequence number. */
export function convergedTables(s: Pick<DsdvSnapshot, 'nodes' | 'links' | 'seqOf'>): Record<string, DsdvRow[]> {
  const tables: Record<string, DsdvRow[]> = Object.fromEntries(s.nodes.map((n) => [n.id, []]))
  for (const d of s.nodes) {
    const hops = new Map([[d.id, 0]])
    const queue = [d.id]
    while (queue.length) {
      const v = queue.shift()!
      for (const n of neighbors(s, v))
        if (!hops.has(n)) {
          hops.set(n, hops.get(v)! + 1)
          queue.push(n)
        }
    }
    for (const v of s.nodes) {
      const h = hops.get(v.id)
      if (h === undefined) continue
      // Ties go to node order, so the first neighbor one hop closer is the next hop.
      const next = h === 0 ? v.id : neighbors(s, v.id).find((n) => hops.get(n) === h - 1)!
      tables[v.id].push({ dest: d.id, next, metric: h, seq: s.seqOf[d.id], changed: false })
    }
  }
  for (const id of Object.keys(tables)) tables[id].sort((a, b) => a.dest.localeCompare(b.dest))
  return tables
}

/** SPEC §10.2 seed: Week 2, "Isi tabel penerusan node M2" (Misra Example 4.3). Positions are SPEC's. */
export function seedNetwork(update: Update = 'incremental'): DsdvSnapshot {
  const at: [string, number, number][] = [
    ['M1', 0, 1],
    ['M2', 1, 1],
    ['M3', 1, 2],
    ['M4', 2, 1],
    ['M5', 3, 0],
    ['M6', 3, 2],
  ]
  const nodes = at.map(([id, x, y]) => ({ id, x, y, roles: [] }))
  const links = [
    ['M1', 'M2'],
    ['M2', 'M3'],
    ['M2', 'M4'],
    ['M4', 'M5'],
    ['M4', 'M6'],
  ].map(([a, b]) => makeLink(a, b))
  const seqOf = { M1: 593, M2: 983, M3: 193, M4: 233, M5: 243, M6: 53 }
  const base = { nodes, links, range: 1.2, packets: [], update, seqOf, updates: 0, rowsSent: 0, shown: 'M2' }
  return { ...base, tables: convergedTables(base) }
}

/** 5 to 7 nodes, connected under the unit disk rule, own sequence numbers from 0 to 999. */
export function randomNetwork(update: Update, seed: number): DsdvSnapshot {
  const rng = mulberry32(seed)
  const ids = Array.from({ length: randInt(rng, 5, 7) }, (_, i) => `M${i + 1}`)
  const placed = connectedUnitDisk(rng, ids, 3.6, 2.4, 1.2, 40)
  if (!placed) return seedNetwork(update)
  const seqOf = Object.fromEntries(ids.map((id) => [id, randInt(rng, 0, 999)]))
  const base = { ...placed, range: 1.2, packets: [], update, seqOf, updates: 0, rowsSent: 0, shown: 'M1' }
  return { ...base, tables: convergedTables(base) }
}

const rowOf = (s: DsdvSnapshot, node: string, dest: string) => s.tables[node]?.find((r) => r.dest === dest)

function setRow(s: DsdvSnapshot, node: string, row: DsdvRow) {
  const rest = s.tables[node].filter((r) => r.dest !== row.dest)
  s.tables[node] = [...rest, row].sort((a, b) => a.dest.localeCompare(b.dest))
}

/**
 * One advertisement from `u`, narrated at `line` (or at the Advertise lines when null).
 * Returns the neighbors whose tables changed, in node order.
 */
function advertise(work: DsdvSnapshot, push: Push, u: string, line: number | null): string[] {
  const A = L.advertise
  const at = (l: number) => line ?? l
  const full = work.update === 'full'
  const rows = work.tables[u].filter((r) => full || r.changed).map((r) => ({ ...r }))
  const nbrs = neighbors(work, u)
  work.shown = u
  if (rows.length === 0) {
    push(`${u} has no changed rows, so the incremental update is empty.`, at(A.send), { nodes: { [u]: 'current' } })
    return []
  }
  work.updates += 1
  work.rowsSent += rows.length
  push(
    full
      ? `${u} sends ${plural(rows.length, 'row')} to ${listIds(nbrs)} as a full dump.`
      : `${u} sends its ${plural(rows.length, 'changed row')} to ${listIds(nbrs)}.`,
    at(A.send),
    { nodes: { [u]: 'current' } },
    [{ kind: 'UPDATE', from: u, to: '*', label: plural(rows.length, 'row') }],
  )
  const changed = receive(work, push, u, nbrs, rows, line)
  for (const r of work.tables[u]) r.changed = false
  work.shown = u
  push(`${u} sent ${plural(rows.length, 'row')} to ${plural(nbrs.length, 'neighbor')}.`, at(A.done))
  return changed
}

/** Lines 4 to 11: every receiver weighs every row. Returns the receivers whose tables changed. */
function receive(work: DsdvSnapshot, push: Push, u: string, receivers: string[], rows: DsdvRow[], line: number | null): string[] {
  const A = L.advertise
  const at = (l: number) => line ?? l
  const changed: string[] = []
  for (const n of receivers) {
    for (const r of rows) {
      const old = rowOf(work, n, r.dest)
      const m = r.metric + 1
      const route = { dest: r.dest, next: u, metric: m, seq: r.seq, changed: true }
      const mark = { nodes: { [n]: 'new' as const, [u]: 'current' as const }, links: { [linkKey(u, n)]: 'active' as const } }
      work.shown = n
      if (!old) {
        setRow(work, n, route)
        push(`${n} had no route to ${r.dest}, so it adds one via ${u}: ${plural(m, 'hop')}.`, at(A.newer), mark)
      } else if (r.seq > old.seq) {
        setRow(work, n, route)
        push(`${n} takes the route to ${r.dest} via ${u}: sequence ${r.seq} is newer than ${old.seq}.`, at(A.newer), mark)
      } else if (r.seq === old.seq && m < old.metric) {
        setRow(work, n, route)
        push(
          `Sequence ${r.seq} for ${r.dest} is the same, and via ${u} it is ${plural(m, 'hop')} instead of ${old.metric}, so ${n} switches.`,
          at(A.fewer),
          mark,
        )
      } else {
        push(`${n} keeps its route to ${r.dest} via ${old.next}.`, at(A.keep))
        continue
      }
      if (!changed.includes(n)) changed.push(n)
    }
  }
  return work.nodes.map((v) => v.id).filter((id) => changed.includes(id))
}

export function runAdvertise(state: DsdvState, input: unknown): Result {
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const [u] = parseIds(input)
  if (!u || !work.tables[u]) {
    push(`There is no node ${u ?? 'by that name'} in this network.`, L.advertise.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }
  advertise(work, push, u, null)
  return { steps, finalSnapshot: cloneNet(work) }
}

export function runMove(state: DsdvState, input: unknown): Result {
  const M = L.move
  const work = cloneNet(state)
  const { steps, push } = recorder(work)
  const ids = parseIds(input)
  const [u, near] = ids
  if (ids.length !== 2 || u === near || !work.tables[u] || !work.tables[near]) {
    push('Type the node that moves and the node it moves next to, such as M3 M6.', M.def)
    return { steps, finalSnapshot: cloneNet(work) }
  }

  const before = neighbors(work, u)
  const node = work.nodes.find((n) => n.id === u)!
  const target = work.nodes.find((n) => n.id === near)!
  node.x = Math.round((target.x + 0.8) * 10) / 10
  node.y = target.y
  work.links = work.links.filter((l) => l.a !== u && l.b !== u)
  for (const v of work.nodes)
    if (v.id !== u && !v.down && unitDiskLinked(dist(node, v), work.range)) work.links.push(makeLink(u, v.id))
  const after = neighbors(work, u)
  const lost = before.filter((n) => !after.includes(n))
  const gained = after.filter((n) => !before.includes(n))
  const names = (xs: string[]) => (xs.length ? listIds(xs) : 'no one')
  work.shown = u
  push(`${u} moves next to ${near}: it loses ${names(lost)} and gains ${names(gained)} as neighbors.`, M.move, {
    nodes: { [u]: 'current' },
  })

  for (const v of [u, ...lost]) {
    const nbrs = neighbors(work, v)
    const stale = work.tables[v].filter((r) => r.dest !== v && !nbrs.includes(r.next))
    if (stale.length === 0) continue
    const gone = [...new Set(stale.map((r) => r.next))]
    work.tables[v] = work.tables[v].filter((r) => !stale.includes(r))
    work.shown = v
    push(`${v} deletes ${plural(stale.length, 'route')} that went through ${listIds(gone)}.`, M.stale, { nodes: { [v]: 'current' } })
  }

  work.seqOf[u] += 1
  setRow(work, u, { dest: u, next: u, metric: 0, seq: work.seqOf[u], changed: true })
  work.shown = u
  push(`${u} raises its own sequence number to ${work.seqOf[u]}.`, M.seq, { nodes: { [u]: 'new' } })

  for (const n of gained) {
    const rows = work.tables[n].map((r) => ({ ...r }))
    work.updates += 1
    work.rowsSent += rows.length
    work.shown = n
    push(`${n} is a new neighbor, so it sends ${u} its full table of ${plural(rows.length, 'row')}.`, M.full, { nodes: { [n]: 'current' } }, [
      { kind: 'UPDATE', from: n, to: u, label: plural(rows.length, 'row') },
    ])
    receive(work, push, n, [u], rows, M.full)
  }

  const queue = [u]
  let sent = 0
  while (queue.length) {
    const v = queue.shift()!
    sent += 1
    const changed = advertise(work, push, v, M.advertise)
    for (const n of changed) if (!queue.includes(n)) queue.push(n)
  }
  push(`No table changed in the last round, so the update stops after ${plural(sent, 'advertisement')}.`, M.loop)
  return { steps, finalSnapshot: cloneNet(work) }
}

export const proactiveOperations: OperationDefinition<DsdvState, unknown, DsdvSnapshot>[] = [
  { id: 'advertise', label: 'Advertise', inputKind: 'text', placeholder: 'Node, e.g. M4', run: runAdvertise },
  { id: 'move', label: 'Move node', inputKind: 'text', placeholder: 'Node and new neighbor, e.g. M3 M6', run: runMove },
]
