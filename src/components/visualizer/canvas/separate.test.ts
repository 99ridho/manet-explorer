import { describe, expect, it } from 'vitest'
import { mulberry32 } from '@/lib/sim/rng'
import { separate } from './separate'

const GAP = 48

function closest(m: Map<string, { x: number; y: number }>): number {
  const ps = [...m.values()]
  let d = Infinity
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++) d = Math.min(d, Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y))
  return d
}

describe('separate', () => {
  it('leaves nodes that are already apart where they are', () => {
    const m = new Map([['A', { x: 0, y: 0 }], ['B', { x: 60, y: 0 }]])
    expect(separate(m, GAP)).toEqual(m)
  })

  it('splits two nodes on the same spot to the full gap', () => {
    const out = separate(new Map([['A', { x: 10, y: 10 }], ['B', { x: 10, y: 10 }]]), GAP)
    expect(closest(out)).toBeCloseTo(GAP)
  })

  it('spreads a clump of eight moving nodes, as a mobility tick can make', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const rng = mulberry32(seed)
      const m = new Map('ABCDEFGH'.split('').map((id) => [id, { x: rng() * 40, y: rng() * 40 }]))
      expect(closest(separate(m, GAP))).toBeGreaterThan(GAP - 1)
    }
  })
})
