// Executable form of the SPEC.md §10.10 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runFindPath, runSend, seedNetwork } from './operations'
import type { Metric } from './types'

const find = (metric: Metric, input: string) => runFindPath(seedNetwork(metric), input)

describe('find path from A to E', () => {
  it('hop count picks A, D, E', () => {
    const { steps, finalSnapshot } = find('hop', 'A E')
    expect(finalSnapshot.path).toEqual(['A', 'D', 'E'])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 7, description: 'Path A, D, E: 2 hops, the fewest hops.' })
    expect(steps[0]).toMatchObject({ highlightLine: 5, description: 'A is next: 0 hops from A.' })
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 9, description: 'Going through B does not improve A.' }))
  })

  it('bandwidth with 3 Mbps prunes A-D and picks A, B, C, E', () => {
    const { steps, finalSnapshot } = find('bandwidth', 'A E 3')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'Link A-D offers 2 Mbps, less than 3, so it is not used.' })
    expect(steps.filter((s) => s.highlightLine === 2)).toHaveLength(1)
    expect(finalSnapshot.path).toEqual(['A', 'B', 'C', 'E'])
    expect(steps.at(-1)?.description).toBe('Path A, B, C, E: 3 hops, every link offers at least 3 Mbps.')
  })

  it('ETX picks A, B, C, E at 3.70, not A, D, E at 6.78', () => {
    const { steps, finalSnapshot } = find('etx', 'A E')
    expect(finalSnapshot.path).toEqual(['A', 'B', 'C', 'E'])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 7, description: 'Path A, B, C, E: 3 hops, total ETX 3.70.' })
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 13, description: 'D is reached through A: ETX 4.00 from A.' }))
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 5, description: 'E is next: ETX 3.70 from A.' }))
  })

  it('energy picks A, D, E: weakest relay D at 80 against B at 20', () => {
    const { steps, finalSnapshot } = find('energy', 'A E')
    expect(finalSnapshot.path).toEqual(['A', 'D', 'E'])
    expect(steps[0].description).toBe('A is next: it is the source, with no relay yet.')
    expect(steps.at(-1)?.description).toBe('Path A, D, E: 2 hops, weakest relay 80 units.')
  })

  it('rejects malformed input at line 1', () => {
    expect(find('hop', 'A').steps[0]).toMatchObject({ highlightLine: 1, description: 'Type a source and a destination, such as A E.' })
    expect(find('bandwidth', 'A E').steps[0]).toMatchObject({
      highlightLine: 1,
      description: 'Type a source and a destination, and a bandwidth in Mbps, such as A E 3.',
    })
  })

  it('reports no path when the request is too large', () => {
    expect(find('bandwidth', 'A E 7').steps.at(-1)).toMatchObject({ highlightLine: 12, description: 'No path from A to E meets the request.' })
  })
})

describe('send packets', () => {
  it('takes B down at packet 20 on the ETX path', () => {
    const { steps, finalSnapshot } = runSend(find('etx', 'A E').finalSnapshot, 20)
    expect(steps[0]).toMatchObject({ highlightLine: 5, description: 'Packet 1 reaches E; relays have B 19, C 59 left.' })
    expect(steps.at(-1)).toMatchObject({ highlightLine: 9, description: 'B runs out of battery after packet 20, so the path breaks.' })
    expect(finalSnapshot.firstDown).toBe(20)
    expect(runSend(finalSnapshot, 1).steps).toEqual([
      expect.objectContaining({ highlightLine: 4, description: 'The path is broken. Find a new path first.' }),
    ])
  })

  it('leaves D at 60 units on the energy path', () => {
    const { finalSnapshot } = runSend(find('energy', 'A E').finalSnapshot, 20)
    expect(finalSnapshot.nodes.find((n) => n.id === 'D')?.battery).toBe(60)
    expect(finalSnapshot.firstDown).toBeNull()
  })

  it('needs a path first', () => {
    expect(runSend(seedNetwork(), 5).steps[0]).toMatchObject({ highlightLine: 1, description: 'There is no path yet. Run Find path first.' })
  })
})
