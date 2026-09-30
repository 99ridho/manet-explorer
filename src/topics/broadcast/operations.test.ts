// Executable form of the SPEC.md §10.4 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { randomNetwork, runBroadcast, runRemoveLink, runSelectMpr, seedNetwork } from './operations'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)

describe('select MPRs on the seed', () => {
  const { steps } = runSelectMpr(seedNetwork(), 'A')

  it('names the one-hop and two-hop neighbors at line 3', () => {
    expect(steps[0]).toMatchObject({ highlightLine: 3, description: 'A has one-hop neighbors B, D, E and two-hop neighbors C, G, F.' })
  })

  it('fixes B and D at line 8 as the only ways to C and G, so no greedy pick is needed', () => {
    expect(steps.filter((s) => s.highlightLine === 8).map((s) => s.description)).toEqual([
      'C is reachable only through B, so B becomes an MPR.',
      'G is reachable only through D, so D becomes an MPR.',
    ])
    expect(steps.find((s) => s.highlightLine === 9)?.description).toBe('The MPRs so far cover C, G, F.')
    expect(steps.some((s) => s.highlightLine === 12)).toBe(false)
  })

  it('ends with the MPR set B, D and E silent', () => {
    expect(steps.at(-1)).toMatchObject({
      highlightLine: 14,
      description: 'Every two-hop neighbor is covered. The MPR set of A is B, D; E stays silent.',
    })
    expect(seedNetwork().mpr.A).toEqual(['B', 'D'])
  })

  it('picks greedily when no two-hop neighbor has a single way in', () => {
    // A square A-B-C-D: C is two hops from A through both B and D, so line 12 picks B, first in node order.
    const s = seedNetwork()
    s.nodes = ['A', 'B', 'C', 'D'].map((id, i) => ({ id, x: i, y: 0, roles: [] }))
    s.links = [
      { a: 'A', b: 'B' },
      { a: 'B', b: 'C' },
      { a: 'C', b: 'D' },
      { a: 'A', b: 'D' },
    ]
    const { steps: sq } = runSelectMpr(s, 'A')
    expect(descs(sq)).toContain('No two-hop neighbor has a single way in, so no MPR is fixed yet.')
    expect(sq.find((x) => x.highlightLine === 12)?.description).toBe(
      'B covers 1 of the uncovered two-hop neighbors, the most, so it becomes an MPR.',
    )
  })

  it('rejects an unknown node at line 1', () => {
    expect(runSelectMpr(seedNetwork(), 'X').steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'Type a node id, such as A.' }),
    ])
  })
})

describe('broadcast from A', () => {
  it('blind flooding: 7 transmissions and 8 duplicates, all 6 other nodes reached', () => {
    const { steps, finalSnapshot } = runBroadcast(seedNetwork('flooding'), 'A')
    expect(steps.filter((s) => s.highlightLine === 8).map((s) => s.description.split(' ')[0])).toEqual([
      'A', 'B', 'D', 'E', 'C', 'G', 'F',
    ])
    expect(finalSnapshot).toMatchObject({ tx: 7, dups: 8, reached: 6 })
    expect(steps.at(-1)).toMatchObject({
      highlightLine: 4,
      description: '6 of 6 other nodes received the packet with 7 transmissions and 8 duplicates.',
    })
  })

  it('MPR relaying: 3 transmissions (A, B, D) and 2 duplicates, all 6 other nodes reached', () => {
    const { steps, finalSnapshot } = runBroadcast(seedNetwork('mpr'), 'A')
    expect(steps.filter((s) => s.highlightLine === 8).map((s) => s.description.split(' ')[0])).toEqual(['A', 'B', 'D'])
    expect(finalSnapshot).toMatchObject({ tx: 3, dups: 2, reached: 6 })
    expect(descs(steps)).toContain('E is not an MPR of A, so it does not relay.')
    expect(steps.at(-1)?.description).toBe('6 of 6 other nodes received the packet with 3 transmissions and 2 duplicates.')
  })

  it('narrates the first copy and a duplicate', () => {
    const { steps } = runBroadcast(seedNetwork('flooding'), 'A')
    expect(steps[1]).toMatchObject({ highlightLine: 12, description: 'B receives the packet for the first time.' })
    expect(descs(steps)).toContain('A already has the packet, so this copy is a duplicate.')
  })

  it('moves the source role to the node typed', () => {
    const { finalSnapshot } = runBroadcast(seedNetwork(), 'C')
    expect(finalSnapshot.nodes.filter((n) => n.roles.includes('source')).map((n) => n.id)).toEqual(['C'])
  })
})

describe('remove link', () => {
  it('D-F makes A choose B, D, E', () => {
    const { steps, finalSnapshot } = runRemoveLink(seedNetwork(), 'D F')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'Link D-F is gone.' })
    expect(descs(steps)).toContain("A's MPR set changes from B, D to B, D, E.")
    expect(finalSnapshot.mpr.A).toEqual(['B', 'D', 'E'])
    expect(finalSnapshot.links).toHaveLength(6)
  })

  it('a missing link changes nothing', () => {
    const { steps, finalSnapshot } = runRemoveLink(seedNetwork(), 'A G')
    expect(steps).toEqual([expect.objectContaining({ highlightLine: 1, description: 'There is no link A-G.' })])
    expect(finalSnapshot.links).toHaveLength(7)
  })
})

describe('randomize', () => {
  it('builds 7 to 10 connected nodes with A as the source', () => {
    for (const seed of [1, 2, 3, 42]) {
      const s = randomNetwork('mpr', seed)
      expect(s.nodes.length).toBeGreaterThanOrEqual(7)
      expect(s.nodes.length).toBeLessThanOrEqual(10)
      expect(s.nodes[0]).toMatchObject({ id: 'A', roles: ['source'] })
      expect(runBroadcast(s, 'A').finalSnapshot.reached).toBe(s.nodes.length - 1)
    }
  })
})
