import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { AddressCanvas } from './canvas'
import { coreMaterial } from './content'
import { addressOperations, randomNetwork, seedNetwork } from './operations'
import { addressPseudocode } from './pseudocode'
import { story } from './story'
import { addressStructure } from './structure'
import type { AddressSnapshot, AddressState, Scheme } from './types'

const asScheme = (v?: string): Scheme => (v === 'qdad' ? 'qdad' : 'buddy')

export const addressAllocation: TopicModule<AddressState, AddressSnapshot> = {
  slug: 'address-allocation',
  title: 'Address Allocation: Buddy and QDAD',
  weekLabel: 'Week 4',
  operations: addressOperations,
  pseudocode: addressPseudocode,
  CanvasComponent: AddressCanvas,
  content: { coreMaterial },
  structure: addressStructure,
  variant: {
    id: 'scheme',
    label: 'Scheme',
    options: [
      { value: 'buddy', label: 'Buddy' },
      { value: 'qdad', label: 'Query-based DAD' },
    ],
    default: 'buddy',
  },
  createInitialState: (variant) => seedNetwork(asScheme(variant)),
  randomize: (_state, variant) => randomNetwork(asScheme(variant), newSeed()),
  story,
}
