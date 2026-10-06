// Executable form of the SPEC.md §10.11 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runDiscover, runSend, runWatchdog, seedNetwork } from './operations'
import type { Attacker } from './types'

const discovered = (a: Attacker) => runDiscover(seedNetwork(a)).finalSnapshot
const lines = (steps: { highlightLine: number; description: string }[]) => steps.map((s) => [s.highlightLine, s.description])

describe('discover route', () => {
  it('black hole: the fake RREP S, M, D arrives first and S uses it', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('blackhole'))
    expect(lines(steps)).toEqual([
      [4, 'Tick 1: A, M hear the RREQ.'],
      [7, 'M answers at once, claiming a route S, M, D it does not have.'],
      [4, 'Tick 2: B hears the RREQ.'],
      [13, 'An RREP with S, M, D reaches S at tick 2.'],
      [4, 'Tick 3: D hears the RREQ.'],
      [11, 'D receives the record S, A, B, D and answers.'],
      [13, 'An RREP with S, A, B, D reaches S at tick 6.'],
      [14, 'S uses the first route to arrive: S, M, D.'],
    ])
    expect(finalSnapshot.routes).toEqual([
      ['S', 'M', 'D'],
      ['S', 'A', 'B', 'D'],
    ])
  })

  it('wormhole: D first hears S, M1, M2, D and S uses it', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('wormhole'))
    expect(steps).toContainEqual(
      expect.objectContaining({ highlightLine: 9, description: 'M1 passes the RREQ through the tunnel, and M2 replays it next to D.' }),
    )
    expect(steps.find((s) => s.highlightLine === 11)?.description).toBe('D receives the record S, M1, M2, D and answers.')
    expect(finalSnapshot.route).toEqual(['S', 'M1', 'M2', 'D'])
    expect(finalSnapshot.routes[1]).toEqual(['S', 'A', 'B', 'C', 'D'])
  })

  it('no attacker: S uses S, A, B, D', () => {
    expect(discovered('none').route).toEqual(['S', 'A', 'B', 'D'])
  })
})

describe('send packets', () => {
  it('the black hole drops everything', () => {
    const { steps, finalSnapshot } = runSend(discovered('blackhole'), 3)
    expect(lines(steps)).toEqual([
      [6, 'M drops packet 1 without a trace.'],
      [6, 'M drops packet 2 without a trace.'],
      [6, 'M drops packet 3 without a trace.'],
    ])
    expect(finalSnapshot).toMatchObject({ sent: 3, delivered: 0, dropped: 3 })
  })

  it('the wormhole delivers every packet while tunneling all of them', () => {
    const { steps, finalSnapshot } = runSend(discovered('wormhole'), 2)
    expect(lines(steps)).toEqual([
      [8, 'Packet 1 crosses the tunnel from M1 to M2.'],
      [9, 'Packet 1 reaches D.'],
      [8, 'Packet 2 crosses the tunnel from M1 to M2.'],
      [9, 'Packet 2 reaches D.'],
    ])
    expect(finalSnapshot).toMatchObject({ delivered: 2, tunneled: 2 })
  })

  it('needs a route and a count from 1 to 20', () => {
    expect(runSend(seedNetwork(), 3).steps[0].description).toBe('There is no route yet. Run Discover route first.')
    expect(runSend(discovered('none'), 21).steps[0]).toMatchObject({ highlightLine: 1, description: 'Type a number of packets from 1 to 20.' })
  })
})

describe('send with watchdog', () => {
  it('black hole, 10 packets: 1 to 4 dropped, M reported after the fourth, 5 to 10 go S, A, B, D', () => {
    const { steps, finalSnapshot } = runWatchdog(discovered('blackhole'), 10)
    expect(steps.filter((s) => s.highlightLine === 7).map((s) => s.description)).toEqual([
      'S never hears M forward packet 1: 1 failure for M.',
      'S never hears M forward packet 2: 2 failures for M.',
      'S never hears M forward packet 3: 3 failures for M.',
      'S never hears M forward packet 4: 4 failures for M.',
    ])
    const report = steps.findIndex((s) => s.highlightLine === 9)
    expect(steps[report].description).toBe('M passed the threshold of 3, so S reports it.')
    expect(steps[report + 1]).toMatchObject({ highlightLine: 10, description: 'The pathrater avoids M: S switches to S, A, B, D.' })
    expect(steps.at(-1)?.description).toBe('Packet 10 reaches D.')
    expect(finalSnapshot).toMatchObject({ sent: 10, delivered: 6, dropped: 4, flagged: ['M'], route: ['S', 'A', 'B', 'D'] })
  })

  it('wormhole: every packet is passed on, so nobody is flagged', () => {
    const { steps, finalSnapshot } = runWatchdog(discovered('wormhole'), 5)
    expect(steps.some((s) => s.highlightLine === 7)).toBe(false)
    expect(steps[0]).toMatchObject({ highlightLine: 5, description: 'S hears M1 forward packet 1.' })
    expect(finalSnapshot).toMatchObject({ delivered: 5, flagged: [], tunneled: 5, route: ['S', 'M1', 'M2', 'D'] })
  })
})
