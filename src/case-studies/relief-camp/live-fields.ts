// The live fields of SPEC.md §19.2: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { CampSnapshot } from './types'

export const campLiveFields: LiveFields<CampSnapshot> = (s) => ({
  tick: s.tick,
  heads: s.nodes.filter((n) => s.head[n.id] === n.id).length,
  elections: s.elections,
  free: s.space - s.nodes.filter((n) => s.address[n.id] != null).length,
})
