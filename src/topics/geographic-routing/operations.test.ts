// Executable form of the SPEC.md §10.5 step table and seed results.
import { describe, expect, it } from 'vitest'
import { gabriel, randomNetwork, runRoute, seedNetwork } from './operations'

describe('route S to D on the seed, greedy with perimeter', () => {
  const { steps, finalSnapshot } = runRoute(seedNetwork('perimeter'), 'S D')
  const lines = steps.map((s) => s.highlightLine)

  it('keeps every seed link in the Gabriel graph', () => {
    expect(gabriel(seedNetwork()).size).toBe(6)
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'The perimeter walk uses the Gabriel graph: every link stays.' })
  })

  it('meets the void at S, where both neighbors are farther than 2.00', () => {
    expect(steps[1]).toMatchObject({
      highlightLine: 10,
      description: 'No neighbor of S is closer to D than S itself (2.00), so the packet switches to perimeter mode.',
    })
  })

  it('walks S, A, B, C clockwise, then resumes greedy at C (1.80)', () => {
    expect(steps.filter((s) => s.highlightLine === 15).map((s) => s.description)).toEqual([
      'Sweeping clockwise at S, the first link leads to A.',
      'Sweeping clockwise at A, the first link leads to B.',
      'Sweeping clockwise at B, the first link leads to C.',
    ])
    expect(steps.find((s) => s.highlightLine === 17)?.description).toBe(
      'C is 1.80 from D, closer than S was, so the packet returns to greedy mode.',
    )
  })

  it('finishes greedily through E and delivers after 5 hops on the slide route', () => {
    expect(steps.filter((s) => s.highlightLine === 8).map((s) => s.description)).toEqual([
      'E is the neighbor closest to D: 0.95 against 1.80, so the packet moves to E.',
      'D is the neighbor closest to D: 0.00 against 0.95, so the packet moves to D.',
    ])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 18, description: 'The packet reaches D after 5 hops.' })
    expect(finalSnapshot.path).toEqual(['S', 'A', 'B', 'C', 'E', 'D'])
    expect(finalSnapshot).toMatchObject({ hops: 5, voids: 1, mode: 'greedy' })
    expect(lines).toEqual([2, 10, 15, 15, 15, 17, 8, 8, 18])
  })
})

describe('route S to D, greedy only', () => {
  it('drops the packet at S', () => {
    const { steps, finalSnapshot } = runRoute(seedNetwork('none'), 'S D')
    expect(steps.at(-1)).toMatchObject({
      highlightLine: 12,
      description: 'No neighbor of S is closer to D than S itself, so greedy forwarding drops the packet.',
    })
    expect(finalSnapshot).toMatchObject({ hops: 0, voids: 1, path: ['S'] })
  })
})

describe('route input and other pairs', () => {
  it('rejects a malformed pair at line 1', () => {
    expect(runRoute(seedNetwork(), 'S').steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'Type a source and a destination, such as S D.' }),
    ])
  })

  it('moves the direction line and the roles to the new pair', () => {
    const { finalSnapshot } = runRoute(seedNetwork(), 'D S')
    const virtual = finalSnapshot.links.filter((l) => l.virtual)
    expect(virtual).toEqual([{ a: 'D', b: 'S', virtual: true }])
    expect(finalSnapshot.linkLabels).toEqual({ 'D-S': 'toward S' })
    expect(finalSnapshot.path.at(-1)).toBe('S')
  })

  it('reports an unreachable destination when the walk returns without progress', () => {
    // Without D-E, D has no radio link: the second void is at E, and the walk circles back to it.
    const s = seedNetwork()
    s.links = s.links.filter((l) => !(l.a === 'D' && l.b === 'E'))
    const { steps } = runRoute(s, 'S D')
    expect(steps.at(-1)).toMatchObject({
      highlightLine: 14,
      description: 'The perimeter walk came back to E without getting closer, so D is unreachable.',
    })
  })
})

describe('randomize', () => {
  it('builds 8 to 10 connected nodes with S and D and delivers with perimeter recovery', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 42, 99]) {
      const s = randomNetwork('perimeter', seed)
      expect(s.nodes.length).toBeGreaterThanOrEqual(8)
      expect(s.nodes.length).toBeLessThanOrEqual(10)
      expect(s.nodes[0].id).toBe('S')
      expect(s.nodes.at(-1)?.id).toBe('D')
      expect(runRoute(s, 'S D').finalSnapshot.path.at(-1)).toBe('D')
    }
  })
})
