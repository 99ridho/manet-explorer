// The live fields of SPEC.md §10.2: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { DsdvSnapshot } from './types'

export const proactiveLiveFields: LiveFields<DsdvSnapshot> = (s) => ({ nodes: s.nodes.length, updates: s.updates, rowsSent: s.rowsSent })
