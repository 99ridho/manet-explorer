// The live fields of SPEC.md §19.1: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import { currentRoute } from './operations'
import type { SarSnapshot } from './types'

export const sarLiveFields: LiveFields<SarSnapshot> = (s) => {
  const route = currentRoute(s, s.flow)
  return { tx: s.tx, dupes: s.dupes, hops: route ? route.length - 1 : 'none', bridges: s.bridges.length }
}
