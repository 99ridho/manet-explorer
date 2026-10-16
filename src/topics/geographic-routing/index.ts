import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { GeoCanvas } from './canvas'
import { coreMaterial } from './content'
import { geoOperations, randomNetwork, seedNetwork } from './operations'
import { geoPseudocode } from './pseudocode'
import { geoNs3 } from './ns3'
import { story } from './story'
import { geoLiveFields } from './live-fields'
import type { GeoSnapshot, GeoState, Recovery } from './types'

const asRecovery = (v?: string): Recovery => (v === 'none' ? 'none' : 'perimeter')

export const geographicRouting: TopicModule<GeoState, GeoSnapshot> = {
  slug: 'geographic-routing',
  title: 'Geographic Routing',
  weekLabel: 'Week 3',
  operations: geoOperations,
  pseudocode: geoPseudocode,
  CanvasComponent: GeoCanvas,
  content: { coreMaterial },
  liveFields: geoLiveFields,
  variant: {
    id: 'recovery',
    label: 'Void handling',
    options: [
      { value: 'perimeter', label: 'Greedy with perimeter' },
      { value: 'none', label: 'Greedy only' },
    ],
    default: 'perimeter',
  },
  createInitialState: (variant) => seedNetwork(asRecovery(variant)),
  randomize: (_state, variant) => randomNetwork(asRecovery(variant), newSeed()),
  story,
  ns3: geoNs3,
}
