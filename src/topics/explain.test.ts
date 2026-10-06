// SPEC.md §20: every step of a topic with a story says why, in at most two plain sentences,
// and the story casts only seed nodes. WITH_STORY grows as each week gains its story.
import { describe, expect, it } from 'vitest'
import { intro } from '@/start/intro'
import type { Step, TopicModule } from '@/types/step-engine'
import type { NetSnapshot } from '@/types/net'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

const WITH_STORY = ['reactive-routing']
const MAX_WHY = 240

const INTRO_INPUTS: Record<string, unknown[]> = { send: ['A D', 'A A', 'x'], leave: ['B', 'Z', ''] }

// Branches that need an earlier operation, as [operation id, input] in order on the seed.
const CHAINS: Record<string, [string, unknown][][]> = {
  'reactive-routing': [
    [['discover-aodv', 'S D'], ['send-aodv', 'S D'], ['break-link', 'C D'], ['send-aodv', 'S D'], ['discover-aodv', 'S D']],
    [['discover-aodv', 'S D'], ['break-link', 'S A']],
    [['discover-aodv', 'S D'], ['break-link', 'A B']],
  ],
  start: [[['leave', 'B'], ['send', 'A D'], ['leave', 'C'], ['send', 'A D']], [['send', 'A B']]],
}
const CHAINS_DSR: Record<string, [string, unknown][][]> = {
  'reactive-routing': [[['discover-dsr', 'S D'], ['send-dsr', 'S D'], ['break-link', 'C D'], ['discover-dsr', 'S D']]],
}

function expectWhy(steps: Step<unknown>[], where: string) {
  expect(steps.length, `${where}: steps`).toBeGreaterThan(0)
  steps.forEach((s, i) => {
    const why = s.why ?? ''
    expect(why.length, `${where} step ${i} ("${s.description}"): why`).toBeGreaterThan(0)
    expect(why.length, `${where} step ${i}: why is short`).toBeLessThanOrEqual(MAX_WHY)
    expect(why.trim().endsWith('.'), `${where} step ${i}: why ends with a period`).toBe(true)
    expect(why.split(/(?<=\.)\s+(?=[A-Z])/).length, `${where} step ${i}: at most two sentences`).toBeLessThanOrEqual(2)
  })
}

function runChain(topic: TopicModule, variant: string | undefined, chain: [string, unknown][]) {
  let state = topic.createInitialState(variant)
  for (const [id, input] of chain) {
    const op = topic.operations.find((o) => o.id === id)!
    const { steps, finalSnapshot } = op.run(state, input)
    expectWhy(steps, `${topic.slug} ${id} ${String(input)} after a chain`)
    state = finalSnapshot
  }
}

const modules: TopicModule[] = [...topics.filter((t) => WITH_STORY.includes(t.slug)), intro as unknown as TopicModule]

describe.each(modules.map((t) => [t.slug, t] as const))('%s explains every step', (slug, topic) => {
  const variants = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]

  it.each(variants.map((v) => [v ?? 'default', v] as const))('on the seed, variant %s', (_name, variant) => {
    for (const op of topic.operations) {
      if (op.variants && (!variant || !op.variants.includes(variant))) continue
      const inputs = slug === 'start' ? INTRO_INPUTS[op.id] : INPUTS[`${slug}/${op.id}`]
      expect(inputs, `${slug}/${op.id} has test inputs`).toBeDefined()
      for (const input of inputs) expectWhy(op.run(topic.createInitialState(variant), input).steps, `${slug} ${op.id} ${String(input)}`)
    }
  })

  it('after earlier operations', () => {
    for (const chain of CHAINS[slug] ?? []) runChain(topic, topic.variant?.default, chain)
    for (const chain of CHAINS_DSR[slug] ?? []) runChain(topic, 'dsr', chain)
  })

  it('casts only seed nodes and labels the story illustrative', () => {
    const story = topic.story!
    expect(story).toBeDefined()
    const ids = new Set((topic.createInitialState(topic.variant?.default) as NetSnapshot).nodes.map((n) => n.id))
    for (const id of Object.keys(story.cast)) expect(ids.has(id), `cast ${id} is a seed node`).toBe(true)
    if (slug !== 'start') expect(story.scenario).toMatch(/^\*Illustrative scenario/)
  })
})
