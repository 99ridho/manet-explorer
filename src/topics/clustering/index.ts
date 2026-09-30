import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { ClusterCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { clusterOperations, randomNetwork, seedNetwork } from './operations'
import { clusterPseudocode } from './pseudocode'
import { clusterStructure } from './structure'
import type { ClusterSnapshot, ClusterState, Rule } from './types'

const asRule = (v?: string): Rule => (v === 'lowest' ? 'lowest' : 'highest')

export const clustering: TopicModule<ClusterState, ClusterSnapshot> = {
  slug: 'clustering',
  title: 'Clustering: LCA',
  weekLabel: 'Week 4',
  operations: clusterOperations,
  pseudocode: clusterPseudocode,
  CanvasComponent: ClusterCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: clusterStructure,
  variant: {
    id: 'rule',
    label: 'ID rule',
    options: [
      { value: 'highest', label: 'Highest ID' },
      { value: 'lowest', label: 'Lowest ID' },
    ],
    default: 'highest',
  },
  createInitialState: (variant) => seedNetwork(asRule(variant)),
  randomize: (_state, variant) => randomNetwork(asRule(variant), newSeed()),
}
