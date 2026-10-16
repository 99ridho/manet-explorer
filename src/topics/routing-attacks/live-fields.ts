// The live fields of SPEC.md §10.11: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { AttackSnapshot } from './types'

export const attacksLiveFields: LiveFields<AttackSnapshot> = (s) => {
  const fields: Record<string, string | number> = {
    sent: s.sent,
    delivered: s.delivered,
    dropped: s.dropped,
    pdr: s.sent ? `${Math.round((100 * s.delivered) / s.sent)}%` : 'none',
  }
  if (s.attacker === 'wormhole') fields.tunneled = s.tunneled
  else fields.flagged = s.flagged.length ? s.flagged.join(' ') : 0
  return fields
}
