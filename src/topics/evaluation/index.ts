import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { EvaluationCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { evaluationOperations, randomNetwork, seedNetwork } from './operations'
import { evaluationPseudocode } from './pseudocode'
import { evaluationStructure } from './structure'
import type { EvaluationSnapshot, EvaluationState, Graph } from './types'

const asGraph = (v?: string): Graph => (v === 'qudg' ? 'qudg' : 'udg')

export const evaluation: TopicModule<EvaluationState, EvaluationSnapshot> = {
  slug: 'evaluation',
  title: 'Network Models and Evaluation',
  weekLabel: 'Week 6',
  operations: evaluationOperations,
  pseudocode: evaluationPseudocode,
  CanvasComponent: EvaluationCanvas,
  content: { realWorldUsage, coreMaterial },
  structure: evaluationStructure,
  variant: {
    id: 'graph',
    label: 'Graph model',
    options: [
      { value: 'udg', label: 'Unit disk graph' },
      { value: 'qudg', label: 'Quasi unit disk graph' },
    ],
    default: 'udg',
  },
  createInitialState: (variant) => seedNetwork(asGraph(variant)),
  randomize: (_state, variant) => randomNetwork(asGraph(variant), newSeed()),
}
