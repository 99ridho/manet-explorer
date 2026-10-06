import type { MetricsResult } from '@/lib/sim/metrics'
import type { NetSnapshot } from '@/types/net'

export type Relay = 'mpr' | 'flooding'
export type Focus = 'topology' | 'broadcast' | 'route'

export interface SarSnapshot extends NetSnapshot {
  relay: Relay
  focus: Focus
  mpr: Record<string, string[]> // each radio's MPR set (SPEC §10.4)
  reverse: Record<string, string> // the way back to the source of the last discovery
  route: Record<string, string> // next hop toward G, per radio (AODV, SPEC §10.3)
  flow: string | null // the team radio of the last discovery
  tx: number
  dupes: number
  txBy: Record<string, number> // the Broadcast view's counts per radio
  dupBy: Record<string, number>
  bridges: string[]
  cuts: string[]
  metrics?: MetricsResult
}

export type SarState = SarSnapshot
