import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { MobilityCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { MODEL_LABEL, mobilityOperations, seedNetwork } from './operations'
import { mobilityPseudocode } from './pseudocode'
import { mobilityStructure } from './structure'
import type { MobilitySnapshot, MobilityState, Model } from './types'

const asModel = (v?: string): Model => (v === 'rpgm' ? 'rpgm' : 'rwp')

export const mobility: TopicModule<MobilityState, MobilitySnapshot> = {
  slug: 'mobility',
  title: 'Mobility Models',
  weekLabel: 'Week 5',
  operations: mobilityOperations,
  pseudocode: mobilityPseudocode,
  CanvasComponent: MobilityCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: mobilityStructure,
  variant: {
    id: 'model',
    label: 'Model',
    options: [
      { value: 'rwp', label: MODEL_LABEL.rwp },
      { value: 'rpgm', label: MODEL_LABEL.rpgm },
    ],
    default: 'rwp',
  },
  createInitialState: (variant) => seedNetwork(asModel(variant)),
  randomize: (_state, variant) => seedNetwork(asModel(variant), newSeed()),
}
