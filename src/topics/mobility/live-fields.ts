// The live fields of SPEC.md §10.8: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { meanDuration, pathAvailability } from '@/lib/sim/mobility'
import type { MobilitySnapshot } from './types'

export const mobilityLiveFields: LiveFields<MobilitySnapshot> = (s) => {
  const d = meanDuration(s)
  const p = pathAvailability(s)
  return {
    tick: s.tick,
    links: s.links.filter((l) => !l.broken).length,
    changes: s.linkChanges,
    lasts: d === null ? 'none' : d.toFixed(1),
    paths: p === null ? 'none' : `${Math.round(p)}%`,
  }
}
