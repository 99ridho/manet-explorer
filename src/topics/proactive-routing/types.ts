import type { NetSnapshot } from '@/types/net'

export type Update = 'incremental' | 'full'

export interface DsdvRow {
  dest: string
  next: string
  metric: number
  seq: number
  changed: boolean
}

export interface DsdvSnapshot extends NetSnapshot {
  update: Update
  tables: Record<string, DsdvRow[]> // per node, sorted by dest
  seqOf: Record<string, number> // each node's own sequence number
  updates: number // advertisements sent
  rowsSent: number // table rows carried by those advertisements
  /** The node whose table the canvas prints under the network. */
  shown: string
}

export type DsdvState = DsdvSnapshot
