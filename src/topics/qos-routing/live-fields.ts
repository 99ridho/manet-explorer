// The live fields of SPEC.md §10.10: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { minBandwidth, pathEtx, weakestRelay } from './operations'
import type { QosSnapshot } from './types'

export const qosLiveFields: LiveFields<QosSnapshot> = (s) => {
  const p = s.path
  const weakest = p ? weakestRelay(s, p) : null
  const cost =
    !p ? 'none'
    : s.metric === 'etx' ? pathEtx(s, p).toFixed(2)
    : s.metric === 'energy' ? (weakest ?? 'none')
    : s.metric === 'bandwidth' ? `${minBandwidth(s, p)} Mbps`
    : p.length - 1
  return { hops: p ? p.length - 1 : 'none', cost, minBatt: weakest ?? 'n/a', sent: s.sent }
}
