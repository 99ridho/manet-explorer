import type { NetSnapshot } from '@/types/net'

export type Metric = 'bandwidth' | 'etx' | 'energy' | 'hop'

export interface QosSnapshot extends NetSnapshot {
  metric: Metric
  path: string[] | null
  sent: number
  /** The packet after which the first relay ran out of battery. */
  firstDown: number | null
}

export type QosState = QosSnapshot
