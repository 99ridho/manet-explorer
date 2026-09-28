// SPEC.md §9: the only source of randomness inside run(). Same seed, same sequence.

export type Rng = () => number

/** mulberry32: a small 32-bit generator, uniform on [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard normal draw (Box-Muller); consumes two uniforms. */
export function normal(rng: Rng): number {
  const u = 1 - rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function randInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

/** A fresh seed for randomize(); the only place Math.random is allowed (CLAUDE.md invariants). */
export function newSeed(): number {
  return Math.floor(Math.random() * 1_000_000) + 1
}
