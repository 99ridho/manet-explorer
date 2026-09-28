// SPEC.md §7.2 link rules. Seeds list their links explicitly; these rules apply only where a section says so.
import type { NetNode } from '@/types/net'

export function dist(p: Pick<NetNode, 'x' | 'y'>, q: Pick<NetNode, 'x' | 'y'>): number {
  return Math.hypot(p.x - q.x, p.y - q.y)
}

/** Loo 3.2.1.1: linked when the distance is within the radius. The epsilon keeps exact seed distances (2.0) linked. */
export function unitDiskLinked(d: number, range: number): boolean {
  return d <= range + 1e-9
}

/** Free-space exponent from the Week 1 slide. */
export const PATH_LOSS_N = 2
/** SPEC §17 open item: a demo value until decided; the Protocol tab labels it. */
export const SHADOWING_SIGMA = 4

/** Margin in dB: 10·n·log10(range / d) + x. Linked when the margin is at least 0; at x = 0 this is the unit disk rule. */
export function shadowingMargin(d: number, range: number, x: number, n = PATH_LOSS_N): number {
  return 10 * n * Math.log10(range / d) + x
}
