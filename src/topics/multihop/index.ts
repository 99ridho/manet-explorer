import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { MultihopCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { multihopOperations, randomNetwork, seedNetwork } from './operations'
import { multihopPseudocode } from './pseudocode'
import { multihopStructure } from './structure'
import type { LinkModel, MultihopSnapshot, MultihopState } from './types'

const asModel = (v?: string): LinkModel => (v === 'shadowing' ? 'shadowing' : 'disk')

export const multihop: TopicModule<MultihopState, MultihopSnapshot> = {
  slug: 'multihop',
  title: 'Multihop Links and Bridges',
  weekLabel: 'Week 1',
  operations: multihopOperations,
  pseudocode: multihopPseudocode,
  CanvasComponent: MultihopCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: multihopStructure,
  variant: {
    id: 'model',
    label: 'Link model',
    options: [
      { value: 'disk', label: 'Unit disk' },
      { value: 'shadowing', label: 'Shadowing' },
    ],
    default: 'disk',
  },
  createInitialState: (variant) => seedNetwork(asModel(variant)),
  randomize: (_state, variant) => randomNetwork(asModel(variant), newSeed()),
}
