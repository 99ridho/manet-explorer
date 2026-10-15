import { newSeed } from '@/lib/sim/rng'
import type { TopicModule } from '@/types/step-engine'
import { AttacksCanvas } from './canvas'
import { coreMaterial } from './content'
import { attacksOperations, randomNetwork, seedNetwork } from './operations'
import { attacksPseudocode } from './pseudocode'
import { story } from './story'
import { attacksStructure } from './structure'
import type { AttackSnapshot, AttackState, Attacker } from './types'

const asAttacker = (v?: string): Attacker => (v === 'wormhole' || v === 'none' ? v : 'blackhole')

export const routingAttacks: TopicModule<AttackState, AttackSnapshot> = {
  slug: 'routing-attacks',
  title: 'Routing Attacks and the Watchdog',
  weekLabel: 'Week 8',
  operations: attacksOperations,
  pseudocode: attacksPseudocode,
  CanvasComponent: AttacksCanvas,
  content: { coreMaterial },
  structure: attacksStructure,
  variant: {
    id: 'attacker',
    label: 'Attacker',
    options: [
      { value: 'blackhole', label: 'Black hole' },
      { value: 'wormhole', label: 'Wormhole' },
      { value: 'none', label: 'No attacker' },
    ],
    default: 'blackhole',
  },
  createInitialState: (variant) => seedNetwork(asAttacker(variant)),
  randomize: (_state, variant) => randomNetwork(asAttacker(variant), newSeed()),
  story,
}
