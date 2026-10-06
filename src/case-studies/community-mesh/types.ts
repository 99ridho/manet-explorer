import type { MetricsResult } from '@/lib/sim/metrics'
import type { NetSnapshot } from '@/types/net'

export type Routing = 'etx-watchdog' | 'hop'
export type Focus = 'links' | 'route' | 'trust'

export interface Candidate {
  route: string[]
  hops: number
  etx: number
}

export interface MeshSnapshot extends NetSnapshot {
  routing: Routing
  focus: Focus
  seed: number
  joined: boolean // whether router M has joined
  route: string[] | null
  candidates: Candidate[] // every route an RREP brought, in order of arrival
  sent: number
  delivered: number
  dropped: number
  failures: Record<string, number> // watchdog counts
  flagged: string[]
  transmissions: number[] // per delivered packet, every try on every hop
  tries: number // every try of every packet, delivered or not
  control: number // RREQ, RREP, and report messages
  metrics?: MetricsResult
}

export type MeshState = MeshSnapshot
