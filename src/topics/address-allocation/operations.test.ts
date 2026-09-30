// Executable form of the SPEC.md §10.7 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { addressStructure } from './structure'
import {
  addressLabels,
  randomNetwork,
  runCrashBuddy,
  runJoinBuddy,
  runJoinQdad,
  runLeaveBuddy,
  runMerge,
  seedNetwork,
} from './operations'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)

describe('join, Buddy', () => {
  it('D through C: C splits 13 to 16, keeps 13 to 14, and D takes 15', () => {
    const { steps, finalSnapshot } = runJoinBuddy(seedNetwork(), 'D C')
    expect(steps.map((s) => [s.highlightLine, s.description])).toEqual([
      [4, 'C splits 13 to 16 in half.'],
      [6, 'C keeps 13 to 14 and gives 15 to 16 to D.'],
      [8, 'D takes address 15 without asking any other node.'],
    ])
    expect(finalSnapshot.pool.C).toEqual([[13, 14]])
    expect(finalSnapshot.address.D).toBe(15)
    expect(addressLabels(finalSnapshot).D).toEqual({ lines: ['15', '15–16'], spoken: 'address 15, pool 15 to 16' })
  })

  it('a node with no range left to split turns the newcomer away at line 3', () => {
    let s = seedNetwork()
    s = runJoinBuddy(s, 'D C').finalSnapshot // C keeps 13 to 14
    s = runJoinBuddy(s, 'E C').finalSnapshot // C keeps 13
    expect(runJoinBuddy(s, 'F C').steps).toEqual([
      expect.objectContaining({ highlightLine: 3, description: 'C has no range left to split, so F cannot join through it.' }),
    ])
  })

  it('rejects an id in use or an unknown neighbor at line 1', () => {
    for (const input of ['A C', 'D X', 'P C']) {
      expect(runJoinBuddy(seedNetwork(), input).steps[0]).toMatchObject({
        highlightLine: 1,
        description: 'Type a new node id and a configured neighbor, such as D C.',
      })
    }
  })
})

describe('leave and crash, Buddy', () => {
  it('C hands 13 to 16 to B, whose range touches it, and B merges them', () => {
    const { steps, finalSnapshot } = runLeaveBuddy(seedNetwork(), 'C')
    expect(descs(steps)).toEqual(['C says goodbye and hands 13 to 16 to B.', 'B now holds 9 to 16.', 'C leaves.'])
    expect(finalSnapshot.pool.B).toEqual([[9, 16]])
    expect(finalSnapshot.nodes.map((n) => n.id)).toEqual(['A', 'B'])
  })

  it('B keeps the half with its own address after taking A’s pool', () => {
    let s = runLeaveBuddy(seedNetwork(), 'A').finalSnapshot // B holds 1 to 12, address 9
    s = runJoinBuddy(s, 'D B').finalSnapshot
    expect(s.pool.B).toEqual([[7, 12]])
    expect(s.pool.D).toEqual([[1, 6]])
    expect(s.address.D).toBe(1)
  })

  it('C crashing leaks its 4 addresses', () => {
    const { steps, finalSnapshot } = runCrashBuddy(seedNetwork(), 'C')
    expect(descs(steps)).toEqual(['C disappears without a goodbye.', '4 addresses went with C, and no node knows they are free.'])
    expect(finalSnapshot.leaked).toBe(4)
    expect(addressStructure.liveFields(finalSnapshot, 'buddy')).toEqual({ nodes: 2, free: 10, leaked: 4, conflicts: 0 })
  })
})

describe('merge', () => {
  it('Buddy finds 2 conflicts: A and P on 1, B and Q on 9; P rejoins through C, Q through P', () => {
    const { steps, finalSnapshot } = runMerge(seedNetwork('buddy'))
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'The partition with P, Q comes into range: C links to P.' })
    expect(steps.filter((s) => s.highlightLine === 4).map((s) => s.description)).toEqual([
      'A and P both use address 1.',
      'B and Q both use address 9.',
    ])
    expect(descs(steps)).toContain('C keeps 13 to 14 and gives 15 to 16 to P.')
    expect(descs(steps)).toContain('P keeps 15 and gives 16 to Q.')
    expect(steps.at(-1)).toMatchObject({ highlightLine: 3, description: '2 conflicts were found and resolved.' })
    expect(finalSnapshot.address).toMatchObject({ A: 1, B: 9, C: 13, P: 15, Q: 16 })
    expect(finalSnapshot.conflicts).toBe(2)
    expect(runMerge(finalSnapshot).steps[0].description).toBe('The partition has already merged.')
  })

  it('QDAD finds 1 conflict: B and P on 11, and P picks an unused address', () => {
    const { steps, finalSnapshot } = runMerge(seedNetwork('qdad'))
    expect(steps.filter((s) => s.highlightLine === 4).map((s) => s.description)).toEqual(['B and P both use address 11.'])
    expect(steps.at(-1)?.description).toBe('1 conflict was found and resolved.')
    const used = Object.values(finalSnapshot.address)
    expect(new Set(used).size).toBe(used.length)
    expect(finalSnapshot.conflicts).toBe(1)
  })
})

describe('join, QDAD', () => {
  const { steps, finalSnapshot } = runJoinQdad(seedNetwork('qdad'), 'D C')

  it('ends after three silent AREQs with an address no other node uses', () => {
    const lines = steps.map((s) => s.highlightLine)
    expect(lines.slice(-7)).toEqual([5, 12, 5, 12, 5, 12, 13])
    expect(steps.at(-1)?.description).toMatch(/^Three AREQs got no answer, so D takes address \d+\.$/)
    const d = finalSnapshot.address.D
    expect(['A', 'B', 'C'].map((n) => finalSnapshot.address[n])).not.toContain(d)
  })

  it('counts every AREQ once per node that transmits it and every AREP once per hop', () => {
    const areqs = steps.filter((s) => s.highlightLine === 5).length
    const areps = steps.filter((s) => s.highlightLine === 8).length
    expect(areqs).toBeGreaterThanOrEqual(3)
    expect(finalSnapshot.control).toBeGreaterThanOrEqual(areqs * 4 + areps)
  })

  it('is the same run for the same seed and a new run for the next join', () => {
    expect(runJoinQdad(seedNetwork('qdad'), 'D C').finalSnapshot.address.D).toBe(finalSnapshot.address.D)
    expect(finalSnapshot.seed).not.toBe(seedNetwork('qdad').seed)
  })
})

describe('randomize', () => {
  it('replays 3 to 6 joins from A under both schemes with unique addresses', () => {
    for (const scheme of ['buddy', 'qdad'] as const) {
      for (const seed of [1, 2, 3, 42]) {
        const s = randomNetwork(scheme, seed)
        expect(s.nodes.length).toBeGreaterThanOrEqual(4)
        expect(s.nodes.length).toBeLessThanOrEqual(7)
        const used = s.nodes.map((n) => s.address[n.id])
        expect(new Set(used).size).toBe(used.length)
        expect(s.control).toBe(0)
      }
    }
  })
})
