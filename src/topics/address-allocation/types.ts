import type { NetLink, NetNode, NetSnapshot } from '@/types/net'

export type Scheme = 'buddy' | 'qdad'
export type Range = [number, number]

export interface AddressSnapshot extends NetSnapshot {
  scheme: Scheme
  space: number // 16: addresses 1 to 16, this demo's choice
  address: Record<string, number | null>
  pool: Record<string, Range[]> // Buddy: ranges each node holds
  leaked: number // Buddy: addresses lost with a crashed node
  control: number // QDAD: AREQ and AREP transmissions
  conflicts: number // duplicate addresses found on merge
  /** A separate network, drawn faded until Merge brings it into range. */
  partition: { nodes: NetNode[]; links: NetLink[]; address: Record<string, number>; pool: Record<string, Range[]> }
  merged: boolean
  seed: number
}

export type AddressState = AddressSnapshot
