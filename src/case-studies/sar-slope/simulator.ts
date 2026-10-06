import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { SarCanvas } from './canvas'
import { scenario } from './content'
import { RELAY_LABEL, randomNetwork, sarOperations, seedNetwork } from './operations'
import { sarPseudocode } from './pseudocode'
import { cast } from './story'
import { sarStructure } from './structure'
import type { Relay, SarSnapshot, SarState } from './types'

const asRelay = (v?: string): Relay => (v === 'flooding' ? 'flooding' : 'mpr')

export const sarSimulator: TopicModule<SarState, SarSnapshot> = {
  slug: 'sar-slope',
  title: 'SAR team on a slope',
  weekLabel: 'Weeks 1–3',
  operations: sarOperations,
  pseudocode: sarPseudocode,
  CanvasComponent: SarCanvas,
  content: { coreMaterial: '' },
  structure: sarStructure,
  variant: {
    id: 'relay',
    label: 'Relays',
    options: [
      { value: 'mpr', label: RELAY_LABEL.mpr },
      { value: 'flooding', label: RELAY_LABEL.flooding },
    ],
    default: 'mpr',
  },
  createInitialState: (variant) => seedNetwork(asRelay(variant)),
  randomize: (_state, variant) => randomNetwork(asRelay(variant), newSeed()),
  story: { scenario, cast },
}
