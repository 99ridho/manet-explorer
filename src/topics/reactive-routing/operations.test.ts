// Executable form of the SPEC.md §10.3 step tables and seed results.
import { describe, expect, it } from 'vitest'
import { currentRoute, runBreakLink, runDiscover, runSend, seedNetwork } from './operations'

const descs = (steps: { description: string }[]) => steps.map((s) => s.description)

describe('discover, AODV', () => {
  const { steps, finalSnapshot } = runDiscover(seedNetwork('aodv'), 'S D')

  it('broadcasts the RREQ 5 times: every node except D', () => {
    const broadcasts = steps.filter((s) => s.highlightLine === 7)
    expect(broadcasts.map((s) => s.description.split(' ')[0])).toEqual(['S', 'A', 'B', 'C', 'E'])
    expect(finalSnapshot.rreqTx).toBe(5)
  })

  it('reaches D first through C and drops the copy through E', () => {
    expect(descs(steps)).toContain('The RREQ reaches D through C.')
    expect(descs(steps)).toContain('D has already seen request 1, so it drops this copy.')
  })

  it('opens with the no-route step and sends the RREP back along the reverse path', () => {
    expect(steps[0]).toMatchObject({ highlightLine: 2, description: 'S has no route to D, so it starts route discovery 1.' })
    expect(steps.filter((s) => s.highlightLine === 20).map((s) => s.description)).toEqual([
      'The RREP goes from D to C, so C now forwards straight to D.',
      'The RREP goes from C to A, so A now forwards to D through C.',
      'The RREP goes from A to S, so S now forwards to D through A.',
    ])
    expect(currentRoute(finalSnapshot, 'S', 'D')).toEqual(['S', 'A', 'C', 'D'])
    expect(finalSnapshot.control).toBe(8)
  })

  it('narrates the flood result at line 5', () => {
    expect(steps.find((s) => s.highlightLine === 5 && s.description.startsWith('The flood'))?.description).toBe(
      'The flood is over after 5 RREQ transmissions; D answers instead of forwarding.',
    )
  })
})

describe('discover, DSR', () => {
  const { steps, finalSnapshot } = runDiscover(seedNetwork('dsr'), 'S D')

  it('grows the record and keeps both candidates at D', () => {
    expect(finalSnapshot.rreqTx).toBe(5)
    expect(descs(steps)).toContain('D receives the record S, A, C, D.')
    expect(descs(steps)).toContain('D receives the record S, B, E, D.')
    expect(descs(steps)).toContain('A is already in the record, so it drops this copy.')
  })

  it('picks the first of two equal routes and caches it at S', () => {
    expect(steps.find((s) => s.highlightLine === 17)?.description).toBe('D picks S, A, C, D: 3 hops, the first to arrive.')
    expect(steps.at(-1)?.description).toBe('S stores S, A, C, D in its route cache.')
    expect(finalSnapshot.cache.S.D).toEqual(['S', 'A', 'C', 'D'])
  })
})

describe('discover input', () => {
  it('rejects a malformed pair at line 1', () => {
    expect(runDiscover(seedNetwork(), 'S').steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'Type a source and a destination, such as S D.' }),
    ])
    expect(runDiscover(seedNetwork(), 'S S').steps[0].highlightLine).toBe(1)
  })
})

describe('send', () => {
  it('needs a route first', () => {
    expect(runSend(seedNetwork(), 'S D').steps[0]).toMatchObject({
      highlightLine: 3,
      description: 'S has no route to D. Run Discover route first.',
    })
  })

  it('forwards hop by hop with AODV table lookups', () => {
    const state = runDiscover(seedNetwork('aodv'), 'S D').finalSnapshot
    const { steps } = runSend(state, 'S D')
    expect(descs(steps)).toEqual([
      'S looks up D in its table: next hop A.',
      'The packet moves from S to A.',
      'A looks up D in its table: next hop C.',
      'The packet moves from A to C.',
      'C looks up D in its table: next hop D.',
      'The packet moves from C to D.',
      'The packet reaches D after 3 hops.',
    ])
  })

  it('reads the header route under DSR and reports its size', () => {
    const state = runDiscover(seedNetwork('dsr'), 'S D').finalSnapshot
    const { steps } = runSend(state, 'S D')
    expect(steps[0]).toMatchObject({ description: 'S reads the header route S, A, C, D: next hop A.', variables: { header: 4 } })
  })
})

describe('break link', () => {
  it('sends RERRs from C and D, deletes the route, and the next discovery goes through B and E (AODV)', () => {
    const found = runDiscover(seedNetwork('aodv'), 'S D').finalSnapshot
    const { steps, finalSnapshot } = runBreakLink(found, 'C D')
    expect(descs(steps)).toEqual([
      'Link C-D breaks.',
      'C sends an RERR toward S.',
      'C deletes its route to D, which used C-D.',
      'A deletes its route to D, which used C-D.',
      'S deletes its route to D, which used C-D.',
      'D also sends an RERR, since it sits at the other end of C-D.',
      'S has no route to D now; its next discovery uses request id 2.',
    ])
    expect(currentRoute(finalSnapshot, 'S', 'D')).toBeNull()
    const again = runDiscover(finalSnapshot, 'S D').finalSnapshot
    expect(currentRoute(again, 'S', 'D')).toEqual(['S', 'B', 'E', 'D'])
    expect(again.requestId).toBe(2)
  })

  it('deletes the cached route under DSR', () => {
    const found = runDiscover(seedNetwork('dsr'), 'S D').finalSnapshot
    const { steps, finalSnapshot } = runBreakLink(found, 'C D')
    expect(descs(steps)).toContain('S deletes the cached route S, A, C, D.')
    expect(finalSnapshot.cache.S.D).toBeUndefined()
    expect(runDiscover(finalSnapshot, 'S D').finalSnapshot.cache.S.D).toEqual(['S', 'B', 'E', 'D'])
  })

  it('changes no table when no route uses the link', () => {
    const { steps } = runBreakLink(seedNetwork(), 'S B')
    expect(descs(steps)).toEqual(['Link S-B breaks.', 'No route used S-B, so no table changes.'])
  })

  it('rejects a link that does not exist', () => {
    expect(runBreakLink(seedNetwork(), 'A E').steps[0]).toMatchObject({ highlightLine: 1, description: 'There is no link A-E to break.' })
  })
})
