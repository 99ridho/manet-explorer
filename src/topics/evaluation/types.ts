import type { MetricsResult } from '@/lib/sim/metrics'
import type { NetSnapshot } from '@/types/net'

export type Graph = 'udg' | 'qudg'

export interface EvaluationSnapshot extends NetSnapshot {
  graph: Graph
  seed: number
  marked: string[]
  cds: string[]
  /** Set only on the result step of a metrics run, for MetricsBars. */
  metrics?: MetricsResult
}

export type EvaluationState = EvaluationSnapshot
