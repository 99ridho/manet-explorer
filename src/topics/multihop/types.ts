import type { NetSnapshot } from '@/types/net'

export type LinkModel = 'disk' | 'shadowing'

export interface MultihopSnapshot extends NetSnapshot {
  model: LinkModel
  seed: number
  /** Find bridges has run on the current links; Build links clears it. */
  analyzed: boolean
  bridges: string[] // link keys
  cuts: string[] // articulation points
  etx: Record<string, number> // by link key
}

export type MultihopState = MultihopSnapshot
