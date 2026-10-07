// Nodes never land on top of each other (ADR-016).
import { describe, expect, it } from 'vitest'
import type { NetNode } from '@/types/net'
import { dist } from './geometry'
import { connectedUnitDisk, freeSpot, MIN_GAP, spread } from './placement'
import { mulberry32 } from './rng'
import * as addressAllocation from '@/topics/address-allocation/operations'
import * as broadcast from '@/topics/broadcast/operations'
import * as clustering from '@/topics/clustering/operations'
import * as evaluation from '@/topics/evaluation/operations'
import * as geographicRouting from '@/topics/geographic-routing/operations'
import * as multihop from '@/topics/multihop/operations'
import * as proactiveRouting from '@/topics/proactive-routing/operations'
import * as reactiveRouting from '@/topics/reactive-routing/operations'

const seeds = Array.from({ length: 20 }, (_, i) => i + 1)

function closest(nodes: Pick<NetNode, 'x' | 'y'>[]): number {
  let d = Infinity
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) d = Math.min(d, dist(nodes[i], nodes[j]))
  return d
}

describe('spread and connectedUnitDisk', () => {
  it('keep every pair MIN_GAP apart', () => {
    for (let seed = 1; seed <= 50; seed++) {
      expect(closest(spread(mulberry32(seed), 'ABCDEFGHIJ'.split(''), 4.5, 3))).toBeGreaterThanOrEqual(MIN_GAP)
      const placed = connectedUnitDisk(mulberry32(seed), 'ABCDEFGH'.split(''), 4.5, 3, 1.5)
      if (placed) expect(closest(placed.nodes)).toBeGreaterThanOrEqual(MIN_GAP)
    }
  })
})

describe('freeSpot', () => {
  it('keeps the preferred spot when it is clear', () => {
    expect(freeSpot([{ x: 0, y: 0 }], { x: 1, y: 0 }, { x: 0, y: 0 })).toEqual({ x: 1, y: 0 })
  })

  it('moves off a node that sits on the preferred spot', () => {
    const nodes = [{ x: 0, y: 0 }, { x: 0.3, y: 0.3 }]
    const p = freeSpot(nodes, { x: 0.3, y: 0.3 }, { x: 0, y: 0 })
    expect(closest([...nodes.slice(0, 1), p])).toBeGreaterThanOrEqual(MIN_GAP)
    expect(dist(nodes[1], p)).toBeGreaterThanOrEqual(MIN_GAP)
  })
})

describe('randomize in every topic that draws positions', () => {
  const builders: [string, (seed: number) => { nodes: NetNode[] }][] = [
    ['broadcast', (s) => broadcast.randomNetwork('mpr', s)],
    ['clustering', (s) => clustering.randomNetwork('highest', s)],
    ['evaluation', (s) => evaluation.randomNetwork('udg', s)],
    ['geographic-routing', (s) => geographicRouting.randomNetwork('perimeter', s)],
    ['multihop', (s) => multihop.randomNetwork('disk', s)],
    ['proactive-routing', (s) => proactiveRouting.randomNetwork('incremental', s)],
    ['reactive-routing', (s) => reactiveRouting.randomNetwork('aodv', s)],
  ]
  for (const [name, build] of builders)
    it(`${name} keeps every pair MIN_GAP apart`, () => {
      for (const seed of seeds) expect(closest(build(seed).nodes)).toBeGreaterThanOrEqual(MIN_GAP)
    })
})

describe('joins', () => {
  it('clustering places 10 next to 6 and 8, then 11 next to 8 and 3, clear of every node', () => {
    let s = clustering.runElect(clustering.seedNetwork('highest')).finalSnapshot
    s = clustering.runJoin(s, '10 6 8').finalSnapshot
    s = clustering.runJoin(s, '11 8 3').finalSnapshot
    expect(closest(s.nodes)).toBeGreaterThanOrEqual(MIN_GAP)
  })

  it('address allocation keeps captions apart when X, Y, Z all join through A', () => {
    let s = addressAllocation.seedNetwork('buddy')
    for (const input of ['X A', 'Y A', 'Z A']) s = addressAllocation.runJoinBuddy(s, input).finalSnapshot
    const all = [...s.nodes, ...s.partition.nodes]
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) {
        const [p, q] = [all[i], all[j]]
        // Each node and its two caption lines fill a strip 0.8 units tall.
        const gap = Math.hypot(p.x - q.x, Math.max(0, Math.abs(p.y - q.y) - 0.8))
        expect(gap, `${p.id} and ${q.id}`).toBeGreaterThanOrEqual(1 - 1e-9)
      }
  })

  it('address allocation randomize keeps captions apart', () => {
    for (const seed of seeds) {
      const s = addressAllocation.randomNetwork('buddy', seed)
      expect(closest(s.nodes)).toBeGreaterThanOrEqual(1)
    }
  })
})
