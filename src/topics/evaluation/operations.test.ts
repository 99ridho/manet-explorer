// Executable form of the SPEC.md §10.9 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runBuildLinks, runCds, seedNetwork } from './operations'

const keys = (s: ReturnType<typeof seedNetwork>) => s.links.map((l) => `${l.a}-${l.b}`)

describe('seed', () => {
  it('links the unit disk seed as SPEC lists', () => {
    expect(keys(seedNetwork('udg'))).toEqual(['A-B', 'A-C', 'B-C', 'B-D', 'C-D', 'D-E', 'E-F', 'E-G', 'F-G', 'F-H', 'G-H'])
  })
})

describe('build links', () => {
  it('rebuilds the same unit disk links, one step per pair', () => {
    const { steps, finalSnapshot } = runBuildLinks(seedNetwork('udg'))
    expect(steps).toHaveLength(28 + 1)
    expect(steps[0]).toMatchObject({ highlightLine: 6, description: 'A and B are 1.17 apart, within range 1.2: link A-B.' })
    expect(steps.find((s) => s.description.startsWith('A and D'))).toMatchObject({
      highlightLine: 5,
      description: 'A and D are 2.00 apart, beyond range 1.2, so they cannot hear each other.',
    })
    expect(steps.at(-1)).toMatchObject({ highlightLine: 7, description: 'Build links made 11 links among 8 nodes.' })
    expect(keys(finalSnapshot)).toEqual(keys(seedNetwork('udg')))
  })

  it('draws for every pair between 0.96 and 1.2 under the quasi UDG', () => {
    const { steps, finalSnapshot } = runBuildLinks(seedNetwork('qudg'))
    const between = steps.filter((s) => s.description.includes('between 0.96 and 1.2'))
    expect(between.length).toBeGreaterThan(0)
    for (const s of between) expect(s.highlightLine).toBe(s.description.endsWith('no link.') ? 5 : 6)
    expect(keys(finalSnapshot)).toEqual(keys(seedNetwork('qudg')))
    expect(finalSnapshot.links.find((l) => l.a === 'D' && l.b === 'E')).toBeDefined()
  })
})

describe('connected dominating set', () => {
  const { steps, finalSnapshot } = runCds(seedNetwork('udg'))

  it('marks B, C, D, E, F, G and prunes B and F', () => {
    expect(finalSnapshot.marked).toEqual(['B', 'C', 'D', 'E', 'F', 'G'])
    expect(steps.filter((s) => s.highlightLine === 11).map((s) => s.description)).toEqual([
      'C has a larger id and covers B and all its neighbors, so B is unmarked.',
      'G has a larger id and covers F and all its neighbors, so F is unmarked.',
    ])
  })

  it('leaves C, D, E, G', () => {
    expect(steps[0]).toMatchObject({ highlightLine: 4, description: 'Every two neighbors of A are neighbors of each other, so A is not marked.' })
    expect(steps[1]).toMatchObject({ highlightLine: 5, description: 'A and D are neighbors of B but not of each other, so B is marked.' })
    expect(steps.at(-1)).toMatchObject({ highlightLine: 12, description: 'The connected dominating set is C, D, E, G: 4 of 8 nodes.' })
    expect(finalSnapshot.cds).toEqual(['C', 'D', 'E', 'G'])
  })
})
