import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { CampCanvas } from './canvas'
import { scenario } from './content'
import { MOBILITY_LABEL, campOperations, seedNetwork } from './operations'
import { campPseudocode } from './pseudocode'
import { cast } from './story'
import { campStructure } from './structure'
import type { CampSnapshot, CampState, Mobility } from './types'

const asMobility = (v?: string): Mobility => (v === 'rwp' ? 'rwp' : 'rpgm')

export const campSimulator: TopicModule<CampState, CampSnapshot> = {
  slug: 'relief-camp',
  title: 'Relief camp',
  weekLabel: 'Weeks 4–6',
  operations: campOperations,
  pseudocode: campPseudocode,
  CanvasComponent: CampCanvas,
  content: { coreMaterial: '' },
  structure: campStructure,
  variant: {
    id: 'mobility',
    label: 'Movement',
    options: [
      { value: 'rpgm', label: MOBILITY_LABEL.rpgm },
      { value: 'rwp', label: MOBILITY_LABEL.rwp },
    ],
    default: 'rpgm',
  },
  createInitialState: (variant) => seedNetwork(asMobility(variant)),
  // A fresh seed redraws the movement; the camp itself, its addresses, and its heads stay.
  randomize: (_state, variant) => seedNetwork(asMobility(variant), newSeed()),
  story: { scenario, cast },
}
