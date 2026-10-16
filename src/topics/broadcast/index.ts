import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { BroadcastCanvas } from './canvas'
import { coreMaterial } from './content'
import { broadcastOperations, randomNetwork, seedNetwork } from './operations'
import { broadcastPseudocode } from './pseudocode'
import { broadcastNs3 } from './ns3'
import { story } from './story'
import { broadcastLiveFields } from './live-fields'
import type { BroadcastSnapshot, BroadcastState, Relay } from './types'

const asRelay = (v?: string): Relay => (v === 'flooding' ? 'flooding' : 'mpr')

export const broadcast: TopicModule<BroadcastState, BroadcastSnapshot> = {
  slug: 'broadcast',
  title: 'Broadcast: Flooding and MPR',
  weekLabel: 'Week 3',
  operations: broadcastOperations,
  pseudocode: broadcastPseudocode,
  CanvasComponent: BroadcastCanvas,
  content: { coreMaterial },
  liveFields: broadcastLiveFields,
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
  story,
  ns3: broadcastNs3,
}
