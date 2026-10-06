import type { MetricsResult } from '@/lib/sim/metrics'
import type { Group, LinkStats, Motion, Point } from '@/lib/sim/mobility'
import type { NetSnapshot } from '@/types/net'

export type Mobility = 'rpgm' | 'rwp'
export type Focus = 'clusters' | 'addresses' | 'movement'
export type Range = [number, number]

export interface CampSnapshot extends NetSnapshot, LinkStats {
  mobility: Mobility
  focus: Focus
  // Buddy allocation over 256 addresses (SPEC §10.7)
  space: number
  address: Record<string, number | null>
  pool: Record<string, Range[]>
  // Highest-ID clustering (SPEC §10.6)
  head: Record<string, string | null>
  gateways: string[]
  elections: number
  // Movement (SPEC §10.8), three teams
  seed: number
  tick: number
  area: { w: number; h: number }
  motion: Record<string, Motion>
  groups?: Group[]
  history: Point[]
  metrics?: MetricsResult
}

export type CampState = CampSnapshot
