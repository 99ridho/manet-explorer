import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { BroadcastCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { broadcastOperations, randomNetwork, seedNetwork } from './operations'
import { broadcastPseudocode } from './pseudocode'
import { broadcastStructure } from './structure'
import type { BroadcastSnapshot, BroadcastState, Relay } from './types'

const asRelay = (v?: string): Relay => (v === 'flooding' ? 'flooding' : 'mpr')

export const broadcast: TopicModule<BroadcastState, BroadcastSnapshot> = {
  slug: 'broadcast',
  title: 'Broadcast: Flooding and MPR',
  weekLabel: 'Week 3',
  operations: broadcastOperations,
  pseudocode: broadcastPseudocode,
  CanvasComponent: BroadcastCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: broadcastStructure,
  variant: {
    id: 'relay',
    label: 'Relays',
    options: [
      { value: 'mpr', label: 'MPR relays' },
      { value: 'flooding', label: 'Blind flooding' },
    ],
    default: 'mpr',
  },
  createInitialState: (variant) => seedNetwork(asRelay(variant)),
  randomize: (_state, variant) => randomNetwork(asRelay(variant), newSeed()),
}
