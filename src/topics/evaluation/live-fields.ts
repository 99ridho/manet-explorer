// The live fields of SPEC.md §10.9: scalars read from the snapshot shown, recomputed on every step.
import type { LiveFields } from '@/types/step-engine'
import type { EvaluationSnapshot } from './types'

export const evaluationLiveFields: LiveFields<EvaluationSnapshot> = (s) => ({ nodes: s.nodes.length, links: s.links.length, marked: s.marked.length, cds: s.cds.length })
