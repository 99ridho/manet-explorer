// The live fields of SPEC.md §10.7: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { AddressSnapshot } from './types'

export const addressLiveFields: LiveFields<AddressSnapshot> = (s, variant): Record<string, number> => {
  const nodes = s.nodes.length
  if ((variant ?? s.scheme) === 'qdad') return { nodes, control: s.control, conflicts: s.conflicts }
  const held = s.nodes.reduce((t, n) => t + (s.pool[n.id] ?? []).reduce((u, r) => u + r[1] - r[0] + 1, 0), 0)
  const used = s.nodes.filter((n) => s.address[n.id] != null).length
  return { nodes, free: held - used, leaked: s.leaked, conflicts: s.conflicts }
}
