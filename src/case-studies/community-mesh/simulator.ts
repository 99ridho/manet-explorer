import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { MeshCanvas } from './canvas'
import { ROUTING_LABEL, meshOperations, seedNetwork } from './operations'
import { meshPseudocode } from './pseudocode'
import { meshStructure } from './structure'
import type { MeshSnapshot, MeshState, Routing } from './types'

const asRouting = (v?: string): Routing => (v === 'hop' ? 'hop' : 'etx-watchdog')

export const meshSimulator: TopicModule<MeshState, MeshSnapshot> = {
  slug: 'community-mesh',
  title: 'Community mesh',
  weekLabel: 'Weeks 7–8',
  operations: meshOperations,
  pseudocode: meshPseudocode,
  CanvasComponent: MeshCanvas,
  content: { realWorldUsage: '', coreMaterial: '' },
  structure: meshStructure,
  variant: {
    id: 'routing',
    label: 'Routing',
    options: [
      { value: 'etx-watchdog', label: ROUTING_LABEL['etx-watchdog'] },
      { value: 'hop', label: ROUTING_LABEL.hop },
    ],
    default: 'etx-watchdog',
  },
  createInitialState: (variant) => seedNetwork(asRouting(variant)),
  // A fresh seed redraws the retries; the mesh and its delivery ratios stay.
  randomize: (_state, variant) => seedNetwork(asRouting(variant), newSeed()),
}
