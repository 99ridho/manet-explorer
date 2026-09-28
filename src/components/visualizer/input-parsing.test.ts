import { describe, expect, it } from 'vitest'
import { INPUT_PLACEHOLDER, parseInput } from './input-parsing'

describe('parseInput', () => {
  it('key accepts an integer and rejects anything else', () => {
    expect(parseInput('key', ' 42 ')).toEqual({ ok: true, value: 42 })
    expect(parseInput('key', '4.2').ok).toBe(false)
  })

  it('array splits on commas and whitespace', () => {
    expect(parseInput('array', '5, 3 8')).toEqual({ ok: true, value: [5, 3, 8] })
    expect(parseInput('array', '').ok).toBe(false)
  })

  it('text returns the trimmed expression and rejects an empty one', () => {
    expect(parseInput('text', '  ( 1 + 2 ) ')).toEqual({ ok: true, value: '( 1 + 2 )' })
    expect(parseInput('text', '   ')).toEqual({ ok: false, error: 'The field is empty. Type a value, then press Go.' })
  })

  it('has a placeholder for every input kind', () => {
    for (const kind of ['key', 'array', 'edge', 'text', 'none'] as const) expect(INPUT_PLACEHOLDER[kind]).toBeDefined()
  })
})
