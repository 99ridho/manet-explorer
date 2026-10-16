import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { QosCanvas } from './canvas'
import { coreMaterial } from './content'
import { qosOperations, randomNetwork, seedNetwork } from './operations'
import { qosPseudocode } from './pseudocode'
import { qosNs3 } from './ns3'
import { story } from './story'
import { qosLiveFields } from './live-fields'
import type { Metric, QosSnapshot, QosState } from './types'

const METRICS: Metric[] = ['bandwidth', 'etx', 'energy', 'hop']
const asMetric = (v?: string): Metric => METRICS.find((m) => m === v) ?? 'bandwidth'

export const qosRouting: TopicModule<QosState, QosSnapshot> = {
  slug: 'qos-routing',
  title: 'QoS, ETX, and Energy-Aware Routing',
  weekLabel: 'Week 7',
  operations: qosOperations,
  pseudocode: qosPseudocode,
  CanvasComponent: QosCanvas,
  content: { coreMaterial },
  liveFields: qosLiveFields,
  variant: {
    id: 'metric',
    label: 'Metric',
    options: [
      { value: 'bandwidth', label: 'Bandwidth' },
      { value: 'etx', label: 'ETX' },
      { value: 'energy', label: 'Energy' },
      { value: 'hop', label: 'Hop count' },
    ],
    default: 'bandwidth',
  },
  createInitialState: (variant) => seedNetwork(asMetric(variant)),
  randomize: (_state, variant) => randomNetwork(asMetric(variant), newSeed()),
  story,
  ns3: qosNs3,
}
