import type { NetSnapshot } from '@/types/net'

export type Recovery = 'perimeter' | 'none'

export interface GeoSnapshot extends NetSnapshot {
  recovery: Recovery
  mode: 'greedy' | 'perimeter'
  hops: number
  voids: number // voids met over every route
  /** The pair of the last route and where its packet is now; null before the first route. */
  flow: { src: string; dst: string; at: string } | null
  path: string[] // nodes the last packet visited, in order
}

export type GeoState = GeoSnapshot
