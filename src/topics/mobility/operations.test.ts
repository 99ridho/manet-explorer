// Executable form of the SPEC.md §10.8 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { inMiddleHalf, runAdvance, runDensity, seedNetwork } from './operations'

const at = (s: ReturnType<typeof seedNetwork>) => s.nodes.map((n) => `${n.id}(${n.x.toFixed(2)},${n.y.toFixed(2)})`).join(' ')

describe('advance on seed 5', () => {
  it('pins random waypoint positions and statistics after 10 ticks', () => {
    const { steps, finalSnapshot } = runAdvance(seedNetwork('rwp'), 10)
    expect(at(finalSnapshot)).toBe(
      'A(7.50,2.70) B(5.07,2.48) C(5.52,2.04) D(0.75,4.03) E(3.16,0.63) F(3.66,2.72) G(2.72,2.32) H(7.97,4.01)',
    )
    expect(steps.filter((s) => s.highlightLine === 6)).toHaveLength(10)
    expect(steps.at(-1)).toMatchObject({
      highlightLine: 7,
      description: 'After 10 ticks the links changed 39 times, a link lasts 2.8 ticks on average, and 61.8 % of node pairs had a path.',
    })
  })

  it('pins RPGM positions after 10 ticks, with no link broken yet', () => {
    const { steps, finalSnapshot } = runAdvance(seedNetwork('rpgm'), 10)
    expect(at(finalSnapshot)).toBe(
      'A(5.31,0.98) B(4.45,0.52) C(3.31,0.85) D(3.64,0.74) E(5.03,4.97) F(3.82,4.62) G(6.01,4.94) H(4.83,4.82)',
    )
    expect(steps.at(-1)?.description).toBe(
      'After 10 ticks the links changed 0 times, no link has broken yet, and 42.9 % of node pairs had a path.',
    )
  })

  it('gives the same result in two runs of 5 as in one run of 10', () => {
    const half = runAdvance(runAdvance(seedNetwork('rwp'), 5).finalSnapshot, 5).finalSnapshot
    expect(at(half)).toBe(at(runAdvance(seedNetwork('rwp'), 10).finalSnapshot))
  })

  it('rejects a tick count outside 1 to 40 at line 1', () => {
    for (const bad of [0, 41, 2.5, Number.NaN])
      expect(runAdvance(seedNetwork(), bad).steps).toEqual([
        expect.objectContaining({ highlightLine: 1, description: 'Type a number of ticks from 1 to 40.' }),
      ])
  })
})

describe('where nodes spend time', () => {
  it('asks for an advance first', () => {
    expect(runDensity(seedNetwork()).steps).toEqual([
      expect.objectContaining({ highlightLine: 3, description: 'Advance the nodes first: no positions are recorded yet.' }),
    ])
  })

  it('shows random waypoint crowding the centre after 40 ticks', () => {
    const { steps } = runDensity(runAdvance(seedNetwork('rwp'), 40).finalSnapshot)
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [7, '140 of 320 recorded positions fall in the centre quarter of the area.'],
      [8, 'The centre quarter holds 43.8 % of the time spent, against 25 % for an even spread.'],
    ])
  })

  it('counts the middle half of both width and height', () => {
    const area = { w: 10, h: 6 }
    expect(inMiddleHalf({ x: 5, y: 3 }, area)).toBe(true)
    expect(inMiddleHalf({ x: 2, y: 3 }, area)).toBe(false)
    expect(inMiddleHalf({ x: 5, y: 5 }, area)).toBe(false)
  })
})
