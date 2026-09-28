import type { NetSnapshot } from '@/types/net'

export type Protocol = 'aodv' | 'dsr'

export interface ReactiveSnapshot extends NetSnapshot {
  protocol: Protocol
  /** AODV: node, destination, next hop. */
  route: Record<string, Record<string, string>>
  /** DSR: node, destination, full route. */
  cache: Record<string, Record<string, string[]>>
  requestId: number // the source's broadcast id (AODV) or request id (DSR)
  rreqTx: number // RREQ transmissions over every discovery
  control: number // every RREQ, RREP, RERR transmission
  /** The pair of the last discovery, so the canvas and live fields can show its route. */
  flow: { src: string; dst: string } | null
}

export type ReactiveState = ReactiveSnapshot
