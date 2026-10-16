// The live fields of SPEC.md §10.1: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { MultihopSnapshot } from './types'

export const multihopLiveFields: LiveFields<MultihopSnapshot> = (s) => ({
  nodes: s.nodes.filter((n) => !n.down).length,
  links: s.links.filter((l) => !l.virtual && !l.broken).length,
  range: s.range,
  bridges: s.analyzed ? s.bridges.length : '?',
  cuts: s.analyzed ? s.cuts.length : '?',
})
