// The live fields of SPEC.md §10.3: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { currentRoute } from './operations'
import type { ReactiveSnapshot } from './types'

export const reactiveLiveFields: LiveFields<ReactiveSnapshot> = (s, variant) => {
  const route = s.flow ? currentRoute(s, s.flow.src, s.flow.dst) : null
  const fields: Record<string, string | number> = {
    rreqTx: s.rreqTx,
    control: s.control,
    hops: route ? route.length - 1 : 'none',
    requestId: s.requestId,
  }
  if ((variant ?? s.protocol) === 'dsr') fields.header = route ? route.length : 'none'
  return fields
}
