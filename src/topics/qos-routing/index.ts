import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { QosCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { qosOperations, randomNetwork, seedNetwork } from './operations'
import { qosPseudocode } from './pseudocode'
import { qosStructure } from './structure'
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
  content: { realWorldUsage, coreMaterial },
  structure: qosStructure,
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
}
