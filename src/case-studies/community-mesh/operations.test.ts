// Executable form of the SPEC.md §19.3 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runDeliver, runFindRoute, runJoinM, seedNetwork } from './operations'
import type { Routing } from './types'

const found = (r: Routing, joined: boolean) => runFindRoute(joined ? runJoinM(seedNetwork(r)).finalSnapshot : seedNetwork(r))

describe('find route', () => {
  it('without M: hop count picks S, X, D at ETX 8.00', () => {
    const { steps, finalSnapshot } = found('hop', false)
    expect(finalSnapshot.route).toEqual(['S', 'X', 'D'])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 4, description: 'S, X, D has the fewest hops, so S uses it.' })
    expect(steps).toContainEqual(expect.objectContaining({ highlightLine: 2, description: 'Candidate S, X, D: 2 hops, ETX 8.00.' }))
  })

  it('without M: ETX picks S, A, B, C, D at 4.43', () => {
    const { steps, finalSnapshot } = found('etx-watchdog', false)
    expect(finalSnapshot.route).toEqual(['S', 'A', 'B', 'C', 'D'])
    expect(steps.at(-1)).toMatchObject({ highlightLine: 5, description: 'S, A, B, C, D has the smallest ETX, 4.43, so S uses it.' })
  })

  it('with M: both designs pick S, M, D', () => {
    for (const r of ['hop', 'etx-watchdog'] as const) {
      const { steps, finalSnapshot } = found(r, true)
      expect(finalSnapshot.route).toEqual(['S', 'M', 'D'])
      expect(steps).toContainEqual(expect.objectContaining({ description: 'M answers at once, claiming a route S, M, D it does not have.' }))
    }
  })
})

describe('router M joins', () => {
  it('appears next to S and advertises a link that does not exist', () => {
    const { steps } = runJoinM(seedNetwork())
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [2, 'A new router M appears next to S.'],
      [3, 'M advertises a link to D that does not exist.'],
    ])
    expect(runJoinM(steps.at(-1)!.snapshot).steps[0].description).toBe('M has already joined.')
  })
})

describe('deliver 20 packets', () => {
  it('with M, the hop mesh delivers none', () => {
    const { steps, finalSnapshot } = runDeliver(found('hop', true).finalSnapshot, 20)
    expect(steps.at(-1)).toMatchObject({ highlightLine: 14, description: '0 of 20 packets reached D: 0.0 %.' })
    expect(finalSnapshot.dropped).toBe(20)
  })

  it('with M, the watchdog loses 1 to 4, reports M, switches, and delivers the rest', () => {
    const { steps, finalSnapshot } = runDeliver(found('etx-watchdog', true).finalSnapshot, 20)
    expect(steps.slice(6, 10).map((s) => [s.highlightLine, s.description])).toEqual([
      [12, 'S never hears M forward packet 4: 4 failures for M.'],
      [12, 'M passed the threshold of 3, so S reports it.'],
      [12, 'The pathrater avoids M: S switches to S, A, B, C, D.'],
      [6, 'M drops packet 4 without a trace.'],
    ])
    expect(steps[10]).toMatchObject({ highlightLine: 13, description: 'Packet 5 reaches D after 4 transmissions.' })
    expect(steps.at(-1)?.description).toBe('16 of 20 packets reached D: 80.0 %.')
    expect(finalSnapshot.flagged).toEqual(['M'])
  })

  it('without M, the weak two-hop route loses packets to failed retries', () => {
    expect(runDeliver(found('hop', false).finalSnapshot, 20).steps.at(-1)?.description).toBe('14 of 20 packets reached D: 70.0 %.')
    expect(runDeliver(found('etx-watchdog', false).finalSnapshot, 20).steps.at(-1)?.description).toBe('20 of 20 packets reached D: 100.0 %.')
  })

  it('needs a route and a count from 1 to 30', () => {
    expect(runDeliver(seedNetwork(), 5).steps[0].description).toBe('There is no route yet. Run Find route first.')
    expect(runDeliver(found('hop', false).finalSnapshot, 31).steps[0]).toMatchObject({ highlightLine: 1, description: 'Type a number of packets from 1 to 30.' })
  })
})
