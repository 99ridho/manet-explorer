import { describe, expect, it } from 'vitest'
import { mulberry32, normal } from './rng'

describe('mulberry32', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const xs = Array.from({ length: 5 }, a)
    expect(Array.from({ length: 5 }, b)).toEqual(xs)
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true)
  })

  it('differs across seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })

  it('draws normals with a mean near 0', () => {
    const rng = mulberry32(7)
    const draws = Array.from({ length: 4000 }, () => normal(rng))
    const mean = draws.reduce((s, x) => s + x, 0) / draws.length
    expect(Math.abs(mean)).toBeLessThan(0.1)
  })
})
