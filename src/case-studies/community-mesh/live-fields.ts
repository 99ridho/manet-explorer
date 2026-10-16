// The live fields of SPEC.md §19.3: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { MeshSnapshot } from './types'

export const meshLiveFields: LiveFields<MeshSnapshot> = (s) => ({
  sent: s.sent,
  delivered: s.delivered,
  dropped: s.dropped,
  pdr: s.sent ? `${Math.round((100 * s.delivered) / s.sent)}%` : 'none',
  flagged: s.flagged.length ? s.flagged.join(' ') : 0,
})
