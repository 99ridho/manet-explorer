import type { NetSnapshot } from '@/types/net'

export type Attacker = 'blackhole' | 'wormhole' | 'none'

export interface AttackSnapshot extends NetSnapshot {
  attacker: Attacker
  route: string[] | null
  /** Every route an RREP brought to the source, in order of arrival. */
  routes: string[][]
  sent: number
  delivered: number
  dropped: number
  tunneled: number // packets that crossed the tunnel
  failures: Record<string, number> // watchdog counts
  flagged: string[]
}

export type AttackState = AttackSnapshot
