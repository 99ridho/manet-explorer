import type { NetSnapshot } from '@/types/net'

export type Relay = 'mpr' | 'flooding'

export interface BroadcastSnapshot extends NetSnapshot {
  relay: Relay
  /** Every node's MPR set, recomputed whenever a link changes, as HELLO exchange would. */
  mpr: Record<string, string[]>
  tx: number // transmissions in the last broadcast
  dups: number // duplicate copies received in the last broadcast
  reached: number // nodes other than the source that received the last broadcast
}

export type BroadcastState = BroadcastSnapshot
