import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { ReactiveCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { randomNetwork, reactiveOperations, seedNetwork } from './operations'
import { reactivePseudocode } from './pseudocode'
import { reactiveStructure } from './structure'
import type { Protocol, ReactiveSnapshot, ReactiveState } from './types'

const asProtocol = (v?: string): Protocol => (v === 'dsr' ? 'dsr' : 'aodv')

export const reactiveRouting: TopicModule<ReactiveState, ReactiveSnapshot> = {
  slug: 'reactive-routing',
  title: 'Reactive Routing: AODV and DSR',
  weekLabel: 'Week 2',
  operations: reactiveOperations,
  pseudocode: reactivePseudocode,
  CanvasComponent: ReactiveCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: reactiveStructure,
  variant: {
    id: 'protocol',
    label: 'Protocol',
    options: [
      { value: 'aodv', label: 'AODV' },
      { value: 'dsr', label: 'DSR' },
    ],
    default: 'aodv',
  },
  createInitialState: (variant) => seedNetwork(asProtocol(variant)),
  randomize: (_state, variant) => randomNetwork(asProtocol(variant), newSeed()),
}
