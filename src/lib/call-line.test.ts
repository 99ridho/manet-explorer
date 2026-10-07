import { describe, expect, it } from 'vitest'
import { callLine, enclosingDef } from './call-line'

const listing = [
  'def find_bridges(net, rank):',
  '    for v in net.nodes:',
  '        dfs(net, v, parent=None)',
  '    def dfs(net, v, parent):',
  '        disc[v] = next(clock)',
  '    return disc',
  'def relays(v, heard_from):',
  '    return v in mpr',
]

describe('enclosingDef', () => {
  it('finds the def a body line runs inside', () => {
    expect(enclosingDef(listing, 2)?.name).toBe('find_bridges')
    expect(enclosingDef(listing, 5)?.name).toBe('dfs')
    expect(enclosingDef(listing, 8)?.name).toBe('relays')
  })
  it('takes a def line as its own', () => {
    expect(enclosingDef(listing, 1)?.name).toBe('find_bridges')
    expect(enclosingDef(listing, 4)?.name).toBe('dfs')
  })
  it('returns to the outer def after a nested one ends', () => {
    expect(enclosingDef(listing, 6)?.name).toBe('find_bridges')
  })
})

describe('callLine', () => {
  it('binds the params the step carries and leaves the rest as chips', () => {
    expect(callLine(listing, 2, { rank: 'highest', v: 'A' })).toEqual({ call: 'find_bridges(net, rank=highest)', rest: [['v', 'A']] })
  })
  it('has no call when the step binds none of the params', () => {
    expect(callLine(listing, 2, { v: 'A' })).toEqual({ call: null, rest: [['v', 'A']] })
    expect(callLine(listing, 2)).toEqual({ call: null, rest: [] })
  })
})
