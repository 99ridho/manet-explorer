// Executable form of the SPEC.md §10.11 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { findLink, neighbors } from '@/lib/net'
import { randomNetwork, runDiscover, runSend, runWatchdog, seedNetwork } from './operations'
import type { Attacker } from './types'

const discovered = (a: Attacker) => runDiscover(seedNetwork(a)).finalSnapshot
const lines = (steps: { highlightLine: number; description: string }[]) => steps.map((s) => [s.highlightLine, s.description])

describe('discover route', () => {
  it('black hole: the fake RREP S, M, D arrives first and S uses it', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('blackhole'))
    expect(lines(steps)).toEqual([
      [14, 'Tick 1: S broadcasts the RREQ with the record S.'],
      [22, 'A hears its first copy from S and adds itself: S, A.'],
      [22, 'M hears its first copy from S and adds itself: S, M.'],
      [24, 'M answers at once, claiming a route S, M, D it does not have.'],
      [9, 'An RREP with S, M, D reaches S at tick 2.'],
      [14, 'Tick 2: A broadcasts the RREQ with the record S, A.'],
      [17, 'S already has this RREQ, so it drops the copy from A.'],
      [22, 'B hears its first copy from A and adds itself: S, A, B.'],
      [13, 'M heard the RREQ but passes nothing on.'],
      [14, 'Tick 3: B broadcasts the RREQ with the record S, A, B.'],
      [17, 'A already has this RREQ, so it drops the copy from B.'],
      [20, 'D receives the record S, A, B, D and answers.'],
      [6, 'Tick 4: the RREP with S, A, B, D moves from D to B.'],
      [6, 'Tick 5: the RREP with S, A, B, D moves from B to A.'],
      [9, 'An RREP with S, A, B, D reaches S at tick 6.'],
      [28, 'S uses the first route to arrive: S, M, D.'],
    ])
    // Every RREP hop draws the RREP on the link it crosses.
    expect(steps.filter((s) => s.highlightLine === 6 || s.highlightLine === 9).map((s) => s.snapshot.packets)).toEqual([
      [{ kind: 'RREP', from: 'M', to: 'S' }],
      [{ kind: 'RREP', from: 'D', to: 'B' }],
      [{ kind: 'RREP', from: 'B', to: 'A' }],
      [{ kind: 'RREP', from: 'A', to: 'S' }],
    ])
    expect(finalSnapshot.routes).toEqual([
      ['S', 'M', 'D'],
      ['S', 'A', 'B', 'D'],
    ])
  })

  it('wormhole: D first hears S, M1, M2, D and S uses it', () => {
    const { steps, finalSnapshot } = runDiscover(seedNetwork('wormhole'))
    expect(steps).toHaveLength(25)
    expect(steps.filter((s) => s.highlightLine === 9).map((s) => s.description)).toEqual([
      'An RREP with S, M1, M2, D reaches S at tick 5.',
      'An RREP with S, A, B, C, D reaches S at tick 8.',
    ])
    expect(steps).toContainEqual(
      expect.objectContaining({ highlightLine: 27, description: 'M1 passes the RREQ through the tunnel, and M2 replays it next to D.' }),
    )
    expect(steps.find((s) => s.highlightLine === 20)?.description).toBe('D receives the record S, M1, M2, D and answers.')
    expect(finalSnapshot.route).toEqual(['S', 'M1', 'M2', 'D'])
    expect(finalSnapshot.routes[1]).toEqual(['S', 'A', 'B', 'C', 'D'])
  })

  it('no attacker: S uses S, A, B, D', () => {
    expect(discovered('none').route).toEqual(['S', 'A', 'B', 'D'])
  })
})

describe('send packets', () => {
  it('the black hole drops everything', () => {
    const { steps, finalSnapshot } = runSend(discovered('blackhole'), 2)
    expect(lines(steps)).toEqual([
      [8, 'S sends packet 1 to M.'],
      [6, 'M drops packet 1 without a trace.'],
      [9, 'Packet 1 never reaches D.'],
      [8, 'S sends packet 2 to M.'],
      [6, 'M drops packet 2 without a trace.'],
      [9, 'Packet 2 never reaches D.'],
    ])
    expect(finalSnapshot).toMatchObject({ sent: 2, delivered: 0, dropped: 2 })
  })

  it('the wormhole delivers every packet while tunneling all of them', () => {
    const { steps, finalSnapshot } = runSend(discovered('wormhole'), 2)
    expect(lines(steps)).toEqual([
      [8, 'S sends packet 1 to M1.'],
      [8, 'Packet 1 crosses the tunnel from M1 to M2.'],
      [8, 'M2 sends packet 1 to D.'],
      [9, 'Packet 1 reaches D.'],
      [8, 'S sends packet 2 to M1.'],
      [8, 'Packet 2 crosses the tunnel from M1 to M2.'],
      [8, 'M2 sends packet 2 to D.'],
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
    expect(steps.filter((s) => s.highlightLine === 8).map((s) => s.description)).toEqual([
      'M has 1 failure, not past the threshold of 3, so S does not report it yet.',
      'M has 2 failures, not past the threshold of 3, so S does not report it yet.',
      'M has 3 failures, not past the threshold of 3, so S does not report it yet.',
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
    expect(lines(steps.slice(0, 6))).toEqual([
      [4, 'S sends packet 1 to M1 and listens.'],
      [5, 'S hears M1 forward packet 1.'],
      [4, 'Packet 1 crosses the tunnel from M1 to M2.'],
      [5, 'M1 hears M2 forward packet 1.'],
      [4, 'M2 sends packet 1 to D and listens.'],
      [5, 'Packet 1 reaches D.'],
    ])
    expect(finalSnapshot).toMatchObject({ delivered: 5, flagged: [], tunneled: 5, route: ['S', 'M1', 'M2', 'D'] })
  })
})

const seeds = Array.from({ length: 20 }, (_, i) => i + 1)

describe('randomize', () => {
  it('black hole: M sits next to S and out of D range, answers first, and the watchdog reports it', () => {
    for (const seed of seeds) {
      const s = randomNetwork('blackhole', seed)
      expect(randomNetwork('blackhole', seed)).toEqual(s)
      expect(neighbors(s, 'M')).toContain('S')
      expect(neighbors(s, 'M')).not.toContain('D')
      expect(findLink(s, 'M', 'D')?.virtual).toBe(true)
      const d = runDiscover(s).finalSnapshot
      expect(d.route).toEqual(['S', 'M', 'D'])
      const w = runWatchdog(d, 10).finalSnapshot
      expect(w.flagged, `seed ${seed}`).toEqual(['M'])
      expect(w.route).not.toContain('M')
    }
  })

  it('wormhole: the tunnel route wins over at least 4 honest hops', () => {
    for (const seed of seeds) {
      const s = randomNetwork('wormhole', seed)
      expect(neighbors(s, 'M1')).not.toContain('D')
      expect(neighbors(s, 'M2')).not.toContain('S')
      expect(runDiscover(s).finalSnapshot.route?.join(), `seed ${seed}`).toContain('M1,M2')
    }
  })

  it('no attacker: M is ordinary and S finds a route', () => {
    for (const seed of seeds) {
      const s = randomNetwork('none', seed)
      expect(s.nodes.find((n) => n.id === 'M')?.roles).toEqual([])
      expect(findLink(s, 'M', 'D')).toBeUndefined()
      expect(runDiscover(s).finalSnapshot.route).not.toBeNull()
    }
  })
})
