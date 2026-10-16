// The live fields of SPEC.md §10.5: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { dist } from '@/lib/sim/geometry'
import type { GeoSnapshot } from './types'

export const geoLiveFields: LiveFields<GeoSnapshot> = (s) => {
  const byId = new Map(s.nodes.map((n) => [n.id, n]))
  const at = s.flow ? byId.get(s.flow.at) : undefined
  const dst = s.flow ? byId.get(s.flow.dst) : undefined
  return {
    hops: s.hops,
    mode: s.mode === 'perimeter' ? 'face' : 'greedy',
    voids: s.voids,
    dist: at && dst ? dist(at, dst).toFixed(2) : 'none',
  }
}
