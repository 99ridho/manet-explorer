// The live fields of SPEC.md §10.4: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { sourceOf } from './operations'
import type { BroadcastSnapshot } from './types'

export const broadcastLiveFields: LiveFields<BroadcastSnapshot> = (s, variant) => {
  const fields: Record<string, string | number> = { tx: s.tx, dups: s.dups, reached: s.reached }
  const src = sourceOf(s)
  if ((variant ?? s.relay) === 'mpr') fields.mprs = src ? (s.mpr[src]?.length ?? 0) : 'none'
  return fields
}
