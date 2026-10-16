import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { ProactiveCanvas } from './canvas'
import { coreMaterial } from './content'
import { proactiveOperations, randomNetwork, seedNetwork } from './operations'
import { proactivePseudocode } from './pseudocode'
import { proactiveNs3 } from './ns3'
import { story } from './story'
import { proactiveLiveFields } from './live-fields'
import type { DsdvSnapshot, DsdvState, Update } from './types'

const asUpdate = (v?: string): Update => (v === 'full' ? 'full' : 'incremental')

export const proactiveRouting: TopicModule<DsdvState, DsdvSnapshot> = {
  slug: 'proactive-routing',
  title: 'Proactive Routing: DSDV',
  weekLabel: 'Week 2',
  operations: proactiveOperations,
  pseudocode: proactivePseudocode,
  CanvasComponent: ProactiveCanvas,
  content: { coreMaterial },
  liveFields: proactiveLiveFields,
  variant: {
    id: 'update',
    label: 'Update',
    options: [
      { value: 'incremental', label: 'Incremental' },
      { value: 'full', label: 'Full dump' },
    ],
    default: 'incremental',
  },
  createInitialState: (variant) => seedNetwork(asUpdate(variant)),
  randomize: (_state, variant) => randomNetwork(asUpdate(variant), newSeed()),
  story,
  ns3: proactiveNs3,
}
