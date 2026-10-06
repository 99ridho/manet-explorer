import type { MetricsResult } from '@/lib/sim/metrics'
import type { Group, LinkStats, Motion, Point } from '@/lib/sim/mobility'
import type { NetSnapshot } from '@/types/net'

export type Model = 'rwp' | 'rpgm'

export interface MobilitySnapshot extends NetSnapshot, LinkStats {
  model: Model
  seed: number
  tick: number
  area: { w: number; h: number }
  motion: Record<string, Motion>
  groups?: Group[]
  history: Point[] // every position after every tick, node order within a tick
  /** Set only on the result step of a metrics run, for MetricsBars. */
  metrics?: MetricsResult
}

export type MobilityState = MobilitySnapshot
