// Executable form of the SPEC.md §10.2 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runAdvertise, runMove, seedNetwork } from './operations'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)

describe('seed', () => {
  it("starts converged, with M2's table equal to the slide's", () => {
    expect(seedNetwork().tables.M2.map((r) => [r.dest, r.next, r.metric, r.seq])).toEqual([
      ['M1', 'M1', 1, 593],
      ['M2', 'M2', 0, 983],
      ['M3', 'M3', 1, 193],
      ['M4', 'M4', 1, 233],
      ['M5', 'M4', 2, 243],
      ['M6', 'M4', 2, 53],
    ])
  })
})

describe('advertise', () => {
  it('sends nothing incrementally on a converged network', () => {
    const { steps, finalSnapshot } = runAdvertise(seedNetwork('incremental'), 'M4')
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [2, 'M4 has no changed rows, so the incremental update is empty.'],
    ])
    expect(finalSnapshot.updates).toBe(0)
  })

  it('sends every row as a full dump, and every neighbor keeps its routes', () => {
    const { steps, finalSnapshot } = runAdvertise(seedNetwork('full'), 'M4')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'M4 sends 6 rows to M2, M5, M6 as a full dump.' })
    expect(steps.filter((s) => s.highlightLine === 11)).toHaveLength(18)
    expect(steps.at(-1)).toMatchObject({ highlightLine: 12, description: 'M4 sent 6 rows to 3 neighbors.' })
    expect(finalSnapshot).toMatchObject({ updates: 1, rowsSent: 6 })
  })

  it('rejects an unknown node at line 1', () => {
    expect(runAdvertise(seedNetwork(), 'X9').steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'There is no node X9 in this network.' }),
    ])
  })
})

describe('move M3 next to M6', () => {
  for (const update of ['incremental', 'full'] as const) {
    describe(update, () => {
      const { steps, finalSnapshot } = runMove(seedNetwork(update), 'M3 M6')

      it('opens with the move, the stale routes, and the new sequence number', () => {
        expect(steps.slice(0, 4).map((s) => [s.highlightLine, s.description])).toEqual([
          [2, 'M3 moves next to M6: it loses M2 and gains M6 as neighbors.'],
          [4, 'M3 deletes 5 routes that went through M2.'],
          [4, 'M2 deletes 1 route that went through M3.'],
          [5, 'M3 raises its own sequence number to 194.'],
        ])
        expect(steps[4]).toMatchObject({ highlightLine: 7, description: 'M6 is a new neighbor, so it sends M3 its full table of 6 rows.' })
      })

      it('M2 learns of the move through M4, and no other row of M2 changes', () => {
        const before = seedNetwork().tables.M2
        const after = finalSnapshot.tables.M2
        expect(after.find((r) => r.dest === 'M3')).toMatchObject({ next: 'M4', metric: 3, seq: 194 })
        for (const r of before.filter((r) => r.dest !== 'M3'))
          expect(after.find((x) => x.dest === r.dest)).toMatchObject({ next: r.next, metric: r.metric, seq: r.seq })
        expect(descs(steps)).toContain('M2 had no route to M3, so it adds one via M4: 3 hops.')
      })

      it('stops when no table changed in the last round', () => {
        expect(steps.at(-1)).toMatchObject({
          highlightLine: 9,
          description: 'No table changed in the last round, so the update stops after 6 advertisements.',
        })
      })
    })
  }

  it('carries fewer rows incrementally than as full dumps', () => {
    const inc = runMove(seedNetwork('incremental'), 'M3 M6').finalSnapshot
    const full = runMove(seedNetwork('full'), 'M3 M6').finalSnapshot
    expect(inc.rowsSent).toBeLessThan(full.rowsSent)
    expect(inc.updates).toBe(full.updates)
  })

  it('rejects malformed input at line 1', () => {
    for (const bad of ['M3', 'M3 M3', 'M3 X1'])
      expect(runMove(seedNetwork(), bad).steps[0]).toMatchObject({
        highlightLine: 1,
        description: 'Type the node that moves and the node it moves next to, such as M3 M6.',
      })
  })
})
