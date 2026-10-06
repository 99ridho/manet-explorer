// Executable form of the SPEC.md §19.2 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { runAdvance, runElect, runJoin, seedNetwork } from './operations'

describe('seed', () => {
  it('pins the Buddy pools of the joins in arrival order', () => {
    expect(seedNetwork().pool).toEqual({
      9: [[1, 64]],
      4: [[129, 256]],
      2: [[65, 96]],
      6: [[97, 112]],
      8: [[113, 120]],
      3: [[121, 124]],
      5: [[125, 126]],
      7: [[127, 127]],
      1: [[128, 128]],
    })
  })

  it('pins the heads and gateways of Elect under the highest-ID rule', () => {
    const s = seedNetwork()
    expect(s.nodes.filter((n) => s.head[n.id] === n.id).map((n) => n.id)).toEqual(['9', '8', '7'])
    expect(s.gateways).toEqual(['6', '5'])
  })
})

describe('volunteer joins', () => {
  it('a newcomer next to 1 cannot join through 1, whose range holds only its own address', () => {
    const { steps, finalSnapshot } = runJoin(seedNetwork(), '10 1')
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [2, '10 arrives next to 1 and hears 1, 7, 5.'],
      [5, '1 has no spare address, so 10 asks the next neighbor.'],
      [5, '7 has no spare address, so 10 asks the next neighbor.'],
      [6, '5 splits 125 to 126 in half.'],
      [6, '5 keeps 125 and gives 126 to 10.'],
      [6, '10 takes address 126 without asking any other node.'],
      [10, '10 joins cluster head 7, which it can hear.'],
    ])
    expect(finalSnapshot.address['10']).toBe(126)
    expect(steps[1].snapshot.focus).toBe('addresses')
    expect(steps.at(-1)?.snapshot.focus).toBe('clusters')
  })

  it('rejects an existing id at line 1', () => {
    expect(runJoin(seedNetwork(), '9 1').steps[0]).toMatchObject({ highlightLine: 1, description: 'Type a new id and a nearby volunteer, such as 10 7.' })
  })
})

describe('elect', () => {
  it('re-elects 9, 8, and 7 with gateways 6 and 5', () => {
    const { steps } = runElect(seedNetwork())
    expect(steps[0]).toMatchObject({ highlightLine: 5, description: '9 has the highest id among its undecided neighbors, so it becomes a cluster head.' })
    expect(steps[1]).toMatchObject({ highlightLine: 9, description: '4 joins cluster head 9.' })
    expect(steps.at(-1)).toMatchObject({ highlightLine: 11, description: '3 cluster heads and 2 gateways.' })
  })
})

describe('advance the day', () => {
  it('elects fewer new heads in 20 ticks when teams move together', () => {
    const rpgm = runAdvance(seedNetwork('rpgm'), 20).finalSnapshot.elections
    const rwp = runAdvance(seedNetwork('rwp'), 20).finalSnapshot.elections
    expect([rpgm, rwp]).toEqual([0, 1])
    expect(rpgm).toBeLessThan(rwp)
  })

  it('narrates every tick and ends at line 14', () => {
    const { steps } = runAdvance(seedNetwork('rwp'), 20)
    expect(steps.filter((s) => s.highlightLine === 4 || s.highlightLine === 5)).toHaveLength(20)
    expect(steps.at(-1)).toMatchObject({ highlightLine: 14, description: 'After 20 ticks the camp elected 1 new head.' })
  })

  it('rejects a tick count outside 1 to 30', () => {
    expect(runAdvance(seedNetwork(), 31).steps[0]).toMatchObject({ highlightLine: 1, description: 'Type a number of ticks from 1 to 30.' })
  })
})
