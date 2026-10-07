// Executable form of the SPEC.md §10.1 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { linkKey } from '@/lib/net'
import { isConnected } from '@/lib/sim/placement'
import { randomNetwork, runBuildLinks, runFindBridges, runLinkEtx, seedNetwork } from './operations'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const keys = (links: { a: string; b: string }[]) => links.map((l) => linkKey(l.a, l.b)).sort()
const SEED_LINKS = ['A-B', 'A-C', 'B-C', 'C-D', 'D-E', 'D-F', 'E-F']

describe('seed', () => {
  it('matches the Week 1 bridge slide', () => {
    const s = seedNetwork()
    expect(s.nodes.map((n) => n.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
    expect(keys(s.links)).toEqual(SEED_LINKS)
    expect(s.range).toBe(2)
  })
})

describe('build links', () => {
  it('reproduces the seed links under the unit disk rule, one step per pair', () => {
    const { steps, finalSnapshot } = runBuildLinks(seedNetwork('disk'))
    expect(steps).toHaveLength(16)
    expect(keys(finalSnapshot.links)).toEqual(SEED_LINKS)
    expect(steps[0].description).toBe('A and B are 2.00 apart, within range 2.00: link A-B.')
    expect(steps[2].description).toBe('A and D are 3.16 apart, beyond range 2.00, so they cannot hear each other.')
    expect(lines(steps).filter((l) => l === 6)).toHaveLength(7)
    expect(lines(steps).filter((l) => l === 5)).toHaveLength(8)
    expect(steps.at(-1)).toMatchObject({ highlightLine: 7, description: 'Build links made 7 links among 6 nodes.' })
    expect(finalSnapshot.highlight).toBeUndefined()
  })

  it('gives the same shadowing links for the same seed', () => {
    const a = runBuildLinks(seedNetwork('shadowing')).finalSnapshot
    const b = runBuildLinks(seedNetwork('shadowing')).finalSnapshot
    expect(keys(a.links)).toEqual(keys(b.links))
    const step = runBuildLinks(seedNetwork('shadowing')).steps[0]
    expect(step.description).toMatch(/^A and B are 2\.00 apart and the random fade adds -?\d+\.\d\d dB, so the margin is -?\d+\.\d\d dB: (link A-B|no link)\.$/)
  })

  it('clears an earlier Find bridges result', () => {
    const analyzed = runFindBridges(seedNetwork()).finalSnapshot
    expect(analyzed.analyzed).toBe(true)
    expect(runBuildLinks(analyzed).finalSnapshot.analyzed).toBe(false)
  })
})

describe('find bridges', () => {
  it('finds bridge C-D and articulation points C and D on the seed', () => {
    const { steps, finalSnapshot } = runFindBridges(seedNetwork())
    expect(finalSnapshot.bridges).toEqual(['C-D'])
    expect(finalSnapshot.cuts.sort()).toEqual(['C', 'D'])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 2, description: 'Found 1 bridge and 2 articulation points.' })
  })

  it('emits the Tarjan steps in order', () => {
    const { steps } = runFindBridges(seedNetwork())
    expect(steps.map((s) => s.description).slice(0, 6)).toEqual([
      'Visiting A: disc = low = 1.',
      'B is unvisited, so the search goes from A to B.',
      'Visiting B: disc = low = 2.',
      'C is unvisited, so the search goes from B to C.',
      'Visiting C: disc = low = 3.',
      'A was visited earlier and is not the parent, so low[C] = 1.',
    ])
    expect(steps.find((s) => s.highlightLine === 14)?.description).toBe(
      'low[D] = 4 is greater than disc[C] = 3, so C-D is a bridge: it is the only way between the two parts.',
    )
    expect(steps.filter((s) => s.highlightLine === 16).map((s) => s.description)).toEqual([
      'low[E] = 4 is not less than disc[D] = 4, so removing D cuts E off: D is an articulation point.',
      'low[D] = 4 is not less than disc[C] = 3, so removing C cuts D off: C is an articulation point.',
    ])
    expect(lines(steps)).not.toContain(20)
    expect(steps[5].variables).toEqual({ v: 'C', parent: 'B', w: 'A', disc: 'A:1 B:2 C:3', low: 'A:1 B:2 C:1' })
  })

  it('reports nothing on a network without bridges', () => {
    const s = seedNetwork()
    s.links.push({ a: 'B', b: 'F' })
    const { steps, finalSnapshot } = runFindBridges(s)
    expect(finalSnapshot.bridges).toEqual([])
    expect(steps.at(-1)?.description).toBe('Found no bridges and no articulation points.')
  })

  it('marks a root with two children', () => {
    // A path B-A-C: A starts the search and both neighbors hang off it.
    const s = seedNetwork()
    s.nodes = s.nodes.filter((n) => ['A', 'B', 'C'].includes(n.id))
    s.links = [
      { a: 'A', b: 'B' },
      { a: 'A', b: 'C' },
    ]
    const { steps } = runFindBridges(s)
    expect(steps.find((x) => x.highlightLine === 20)?.description).toBe(
      'A started the search and has 2 children, so it is an articulation point.',
    )
  })
})

describe('link ETX', () => {
  it("reproduces the Week 1 worked example: 0.8 and 0.5 give 2.5", () => {
    const { steps, finalSnapshot } = runLinkEtx(seedNetwork(), 'C D 0.8 0.5')
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [4, 'A full cycle succeeds with probability 0.8 × 0.5 = 0.4.'],
      [5, 'ETX = 1 / 0.4 = 2.5 expected transmissions.'],
      [6, 'Link C-D now shows ETX 2.5.'],
    ])
    expect(finalSnapshot.etx['C-D']).toBeCloseTo(2.5)
    expect(finalSnapshot.linkLabels?.['C-D']).toBe('ETX 2.5')
  })

  it('handles invalid input, a missing link, and a zero ratio', () => {
    expect(runLinkEtx(seedNetwork(), 'C D 2 0.5').steps[0]).toMatchObject({ highlightLine: 1 })
    expect(runLinkEtx(seedNetwork(), 'A D 0.8 0.5').steps[0]).toMatchObject({
      highlightLine: 3,
      description: 'A and D share no link, so there is no ETX to compute.',
    })
    expect(runLinkEtx(seedNetwork(), 'C D 0 0.5').steps.at(-1)?.description).toBe(
      'The cycle never succeeds, so the expected number of transmissions has no bound.',
    )
  })
})

describe('randomize', () => {
  it('places 6 to 8 connected nodes and repeats for a seed', () => {
    for (const seed of [1, 2, 3, 42, 99]) {
      const s = randomNetwork('disk', seed)
      expect(s.nodes.length).toBeGreaterThanOrEqual(6)
      expect(s.nodes.length).toBeLessThanOrEqual(8)
      expect(isConnected(s.nodes, s.links)).toBe(true)
      expect(randomNetwork('disk', seed)).toEqual(s)
    }
  })
})
