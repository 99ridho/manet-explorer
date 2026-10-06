// Executable form of the SPEC.md §19.1 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { currentRoute, runDiscover, runSend, runWalkAway, seedNetwork } from './operations'

const route = ['T1', 'T2', 'R1', 'R2', 'R4', 'R5', 'G']
const transmitters = (steps: { highlightLine: number; description: string }[]) =>
  steps.filter((s) => s.highlightLine === 10).map((s) => s.description.split(' ')[0])

describe('discover route to base from T1', () => {
  it('blind flooding: 8 transmissions and 15 duplicates', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('flooding'), 'T1')
    expect(transmitters(steps)).toEqual(['T1', 'T2', 'T3', 'R1', 'R2', 'R3', 'R4', 'R5'])
    expect(finalSnapshot).toMatchObject({ tx: 8, dupes: 15 })
    expect(currentRoute(finalSnapshot, 'T1')).toEqual(route)
  })

  it('MPR relaying: 6 transmissions (T1, T2, R1, R2, R4, R5) and 9 duplicates', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('mpr'), 'T1')
    expect(transmitters(steps)).toEqual(['T1', 'T2', 'R1', 'R2', 'R4', 'R5'])
    expect(finalSnapshot).toMatchObject({ tx: 6, dupes: 9 })
    expect(currentRoute(finalSnapshot, 'T1')).toEqual(route)
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 9, description: 'T3 is not an MPR of T1, so it does not relay.' }))
  })

  it('opens at line 2 on the topology and ends with the RREP at line 17 on the route', () => {
    const { steps } = runDiscover(seedNetwork(), 'T1')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'T1 needs a route to G, so it starts a route discovery.' })
    expect(steps[0].snapshot.focus).toBe('topology')
    expect(steps[1].snapshot.focus).toBe('broadcast')
    expect(steps.at(-1)).toMatchObject({ highlightLine: 17, description: 'The RREP goes from T2 to T1, so T1 now forwards to G through T2.' })
    expect(steps.at(-1)?.snapshot.focus).toBe('route')
  })

  it('rejects anything but a team radio at line 1', () => {
    expect(runDiscover(seedNetwork(), 'R1').steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'Type a team radio: T1, T2, or T3.' }),
    ])
  })
})

describe('send report', () => {
  it('follows the next hops to G', () => {
    const { steps } = runSend(runDiscover(seedNetwork(), 'T1').finalSnapshot, 'T1')
    expect(steps.at(-1)).toMatchObject({ highlightLine: 9, description: 'The report reaches G after 6 hops.' })
  })

  it('needs a discovery first', () => {
    expect(runSend(seedNetwork(), 'T2').steps[0]).toMatchObject({ highlightLine: 3, description: 'T2 has no route to G. Run Discover route to base first.' })
  })
})

describe('radio walks away', () => {
  it('R2 leaves a path through R3', () => {
    const { steps } = runWalkAway(runDiscover(seedNetwork(), 'T1').finalSnapshot, 'R2')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'R2 is about to walk out of range.' })
    expect(steps[0].snapshot.links.some((l) => l.a === 'R2' || l.b === 'R2')).toBe(true)
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 4, description: 'R1 sends an RERR toward T1.' }))
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 5, description: 'T1 deletes its route to G, which went through R2.' }))
    expect(steps.at(-1)).toMatchObject({ highlightLine: 8, description: 'The team can still reach G another way. Run Discover route to base again.' })
  })

  it('R5 cuts G off', () => {
    const { steps } = runWalkAway(seedNetwork(), 'R5')
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [2, 'R5 is about to walk out of range.'],
      [2, 'R5 is out of range of every radio.'],
      [7, 'R5 was an articulation point: without it the team has no path to G.'],
    ])
  })
})

describe('topology', () => {
  it('finds the bridges and articulation points of the seed', () => {
    expect(seedNetwork()).toMatchObject({ bridges: ['G-R5', 'R4-R5'], cuts: ['R1', 'R4', 'R5'] })
  })
})
