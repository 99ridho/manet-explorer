// Executable form of the SPEC.md §10.6 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { randomNetwork, runElect, runJoin, runLeave, seedNetwork } from './operations'

const heads = (s: { nodes: { id: string }[]; head: Record<string, string | null> }) =>
  s.nodes.filter((n) => s.head[n.id] === n.id).map((n) => n.id)
const descs = (steps: { description: string }[]) => steps.map((s) => s.description)

describe('elect, highest ID', () => {
  const { steps, finalSnapshot } = runElect(seedNetwork('highest'))

  it('makes 9 a head with 4, 2, 6, then 8 with 3, 5, and 6 the gateway: the slide figure', () => {
    expect(steps.filter((s) => s.highlightLine === 5).map((s) => s.description)).toEqual([
      '9 has the highest id among its undecided neighbors, so it becomes a cluster head.',
      '8 has the highest id among its undecided neighbors, so it becomes a cluster head.',
    ])
    expect(steps.filter((s) => s.highlightLine === 9).map((s) => s.description)).toEqual([
      '4 joins cluster head 9.',
      '2 joins cluster head 9.',
      '6 joins cluster head 9.',
      '3 joins cluster head 8.',
      '5 joins cluster head 8.',
    ])
    expect(descs(steps)).toContain('6 neighbors cluster heads 9, 8, so it becomes a gateway.')
    expect(steps.at(-1)).toMatchObject({ highlightLine: 11, description: '2 cluster heads and 1 gateway.' })
    expect(heads(finalSnapshot)).toEqual(['9', '8'])
    expect(finalSnapshot.gateways).toEqual(['6'])
    expect(finalSnapshot.nodes.find((n) => n.id === '6')?.roles).toEqual(['gateway'])
  })

  it('has nothing to do a second time', () => {
    expect(runElect(finalSnapshot).steps).toEqual([
      expect.objectContaining({ highlightLine: 2, description: 'Every node already has a cluster head.' }),
    ])
  })
})

describe('elect, lowest ID', () => {
  it('gives five heads (2, 3, 4, 5, 6) and gateways 9 and 8', () => {
    const { finalSnapshot } = runElect(seedNetwork('lowest'))
    expect(heads(finalSnapshot).sort()).toEqual(['2', '3', '4', '5', '6'])
    expect(finalSnapshot.gateways).toEqual(['9', '8'])
  })
})

describe('node leaves', () => {
  const elected = runElect(seedNetwork('highest')).finalSnapshot

  it('9 leaving sends 6 to head 8 and makes 4 and 2 heads: two new elections', () => {
    const { steps, finalSnapshot } = runLeave(elected, '9')
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: '9 leaves the network.' })
    expect(descs(steps)).toEqual([
      '9 leaves the network.',
      '4 hears no cluster head, so it is undecided again.',
      '2 hears no cluster head, so it is undecided again.',
      '6 joins cluster head 8, which it can still hear.',
      '4 has no undecided neighbor left, so it becomes a cluster head of its own.',
      '2 has no undecided neighbor left, so it becomes a cluster head of its own.',
      'No node is a gateway now.',
    ])
    expect(finalSnapshot.elections).toBe(2)
    expect(heads(finalSnapshot)).toEqual(['4', '2', '8'])
    expect(finalSnapshot.links.some((l) => l.a === '9' || l.b === '9')).toBe(false)
  })

  it('a member leaving only changes the gateways', () => {
    const { steps, finalSnapshot } = runLeave(elected, '6')
    expect(descs(steps)).toEqual(['6 leaves the network.', 'No node is a gateway now.'])
    expect(finalSnapshot.elections).toBe(0)
  })

  it('rejects an unknown node at line 1', () => {
    expect(runLeave(elected, '42').steps).toEqual([expect.objectContaining({ highlightLine: 1, description: 'There is no node 42.' })])
  })
})

describe('node joins', () => {
  const elected = runElect(seedNetwork('highest')).finalSnapshot

  it('7 linked to 6 and 8 joins head 8 and lands at the centroid plus (0.3, 0.3)', () => {
    const { steps, finalSnapshot } = runJoin(elected, '7 6 8')
    expect(descs(steps)).toEqual([
      '7 joins the network with links to 6, 8.',
      '7 joins cluster head 8, which it can hear.',
      'Gateways are now 6.',
    ])
    expect(finalSnapshot.nodes.at(-1)).toMatchObject({ id: '7', x: 2.8, y: 1.3 })
    expect(finalSnapshot.head['7']).toBe('8')
  })

  it('a node that hears no head becomes one and counts as an election', () => {
    const { steps, finalSnapshot } = runJoin(elected, '1 4')
    expect(steps[1]).toMatchObject({ highlightLine: 7, description: '1 hears no cluster head, so it becomes one.' })
    expect(finalSnapshot.elections).toBe(1)
    expect(finalSnapshot.gateways).toEqual(['4', '6'])
  })

  it('rejects an id in use and an unknown neighbor', () => {
    expect(runJoin(elected, '9 6').steps[0].description).toBe('Node 9 already exists.')
    expect(runJoin(elected, '7 99').steps[0].description).toBe('There is no node 99 to link to.')
    expect(runJoin(elected, '7').steps[0].description).toBe('Type a new id and its neighbors, such as 7 6 8.')
  })
})

describe('randomize', () => {
  it('builds 7 to 10 undecided nodes with distinct ids from 1 to 20', () => {
    for (const seed of [1, 2, 3, 42]) {
      const s = randomNetwork('highest', seed)
      const ids = s.nodes.map((n) => Number(n.id))
      expect(s.nodes.length).toBeGreaterThanOrEqual(7)
      expect(s.nodes.length).toBeLessThanOrEqual(10)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.every((i) => i >= 1 && i <= 20)).toBe(true)
      expect(Object.values(s.head).every((h) => h === null)).toBe(true)
      expect(runElect(s).finalSnapshot.nodes.every((n) => runElect(s).finalSnapshot.head[n.id] !== null)).toBe(true)
    }
  })
})
