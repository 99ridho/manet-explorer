import type { NetSnapshot } from '@/types/net'

export type Rule = 'highest' | 'lowest'

export interface ClusterSnapshot extends NetSnapshot {
  rule: Rule
  /** A node's cluster head: itself for a head, null while undecided. */
  head: Record<string, string | null>
  gateways: string[]
  elections: number // heads elected by Leave and Join, after the first Elect
}

export type ClusterState = ClusterSnapshot
