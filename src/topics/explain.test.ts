// SPEC.md §20: every step of every topic and case study simulator says why, in at most two plain
// sentences, and each story casts only seed nodes.
import { describe, expect, it } from 'vitest'
import { caseStudies } from '@/case-studies/registry'
import { intro } from '@/start/intro'
import type { NetSnapshot } from '@/types/net'
import type { Step, TopicModule } from '@/types/step-engine'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

const MAX_WHY = 240

const INTRO_INPUTS: Record<string, unknown[]> = { send: ['A D', 'A A', 'x'], leave: ['B', 'Z', ''] }

type Chain = { variant?: string; ops: [string, unknown][] }

// Branches that need an earlier operation, run in order from the variant's seed.
const CHAINS: Record<string, Chain[]> = {
  start: [{ ops: [['leave', 'B'], ['send', 'A D'], ['leave', 'C'], ['send', 'A D']] }, { ops: [['send', 'A B']] }],
  multihop: [{ variant: 'shadowing', ops: [['build-links', undefined], ['find-bridges', undefined]] }],
  'proactive-routing': [
    { ops: [['move', 'M3 M6'], ['advertise', 'M2'], ['advertise', 'M4']] },
    { variant: 'full', ops: [['move', 'M3 M6'], ['move', 'M1 M5']] },
  ],
  'reactive-routing': [
    { ops: [['discover-aodv', 'S D'], ['send-aodv', 'S D'], ['break-link', 'C D'], ['send-aodv', 'S D'], ['discover-aodv', 'S D']] },
    { ops: [['discover-aodv', 'S D'], ['break-link', 'S A']] },
    { ops: [['discover-aodv', 'S D'], ['break-link', 'A B']] },
    { variant: 'dsr', ops: [['discover-dsr', 'S D'], ['send-dsr', 'S D'], ['break-link', 'C D'], ['discover-dsr', 'S D']] },
  ],
  broadcast: [{ ops: [['remove-link', 'D F'], ['select-mpr', 'A'], ['broadcast-mpr', 'A']] }],
  'geographic-routing': [{ variant: 'none', ops: [['route', 'S D'], ['route', 'F D']] }],
  clustering: [
    { ops: [['elect', undefined], ['leave', '9'], ['elect', undefined]] },
    { ops: [['elect', undefined], ['join', '7 6 8'], ['join', '11 3']] },
    { variant: 'lowest', ops: [['elect', undefined], ['leave', '2']] },
  ],
  'address-allocation': [
    { ops: [['join-buddy', 'D C'], ['join-buddy', 'E D'], ['join-buddy', 'F E'], ['leave-buddy', 'D'], ['merge', undefined], ['merge', undefined]] },
    { ops: [['crash-buddy', 'C'], ['leave-buddy', 'A']] },
    { variant: 'qdad', ops: [['join-qdad', 'D C'], ['merge', undefined]] },
  ],
  mobility: [
    { ops: [['density', undefined], ['advance-rwp', 40], ['density', undefined]] },
    { variant: 'rpgm', ops: [['advance-rpgm', 20], ['metrics', undefined]] },
  ],
  evaluation: [{ variant: 'qudg', ops: [['build-links', undefined], ['cds', undefined], ['metrics', 3]] }],
  'qos-routing': [
    { variant: 'etx', ops: [['path-etx', 'A E'], ['send', 25]] },
    { variant: 'energy', ops: [['path-energy', 'A E'], ['send', 20]] },
    { variant: 'bandwidth', ops: [['path-bandwidth', 'A E 7'], ['send', 1]] },
  ],
  'routing-attacks': [
    { ops: [['discover', undefined], ['send', 5], ['watchdog', 10]] },
    { variant: 'wormhole', ops: [['discover', undefined], ['send', 3], ['watchdog', 3]] },
    { variant: 'none', ops: [['discover', undefined], ['watchdog', 3]] },
  ],
  'sar-slope': [
    { ops: [['discover-mpr', 'T1'], ['send', 'T1'], ['walk-away', 'R2'], ['walk-away', 'R5'], ['discover-mpr', 'T1']] },
    { variant: 'flooding', ops: [['discover-flooding', 'T1'], ['walk-away', 'T2'], ['metrics', undefined]] },
  ],
  'relief-camp': [{ ops: [['elect', undefined], ['join', '10 7'], ['advance', 20], ['elect', undefined]] }, { variant: 'rwp', ops: [['advance', 20]] }],
  'community-mesh': [
    { ops: [['route', undefined], ['deliver', 20], ['join-m', undefined], ['join-m', undefined], ['route', undefined], ['deliver', 20]] },
    { variant: 'hop', ops: [['route', undefined], ['deliver', 20], ['join-m', undefined], ['route', undefined], ['deliver', 5]] },
  ],
}

function expectWhy(steps: Step<unknown>[], where: string) {
  expect(steps.length, `${where}: steps`).toBeGreaterThan(0)
  steps.forEach((s, i) => {
    const why = s.why ?? ''
    expect(why.length, `${where} step ${i} ("${s.description}"): why`).toBeGreaterThan(0)
    expect(why.length, `${where} step ${i}: why is short`).toBeLessThanOrEqual(MAX_WHY)
    expect(why.trim().endsWith('.'), `${where} step ${i}: why ends with a period`).toBe(true)
    expect(why.split(/(?<=\.)\s+(?=[A-Z])/).length, `${where} step ${i}: at most two sentences`).toBeLessThanOrEqual(2)
    expect(why, `${where} step ${i}: no em dash or arrow`).not.toMatch(/\u2014|\u2192/)
  })
}

const isCaseStudy = new Set(caseStudies.map((c) => c.simulator.slug))
const modules: TopicModule[] = [...topics, ...caseStudies.map((c) => c.simulator), intro as unknown as TopicModule]

describe.each(modules.map((t) => [t.slug, t] as const))('%s explains every step', (slug, topic) => {
  const variants = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]

  it.each(variants.map((v) => [v ?? 'default', v] as const))('on the seed, variant %s', (_name, variant) => {
    for (const op of topic.operations) {
      if (op.variants && (!variant || !op.variants.includes(variant))) continue
      const listed = slug === 'start' ? INTRO_INPUTS[op.id] : INPUTS[`${slug}/${op.id}`]
      const inputs = listed ?? (op.inputKind === 'none' ? [undefined] : undefined)
      expect(inputs, `${slug}/${op.id} has test inputs`).toBeDefined()
      for (const input of inputs!) expectWhy(op.run(topic.createInitialState(variant), input).steps, `${slug} ${op.id} ${String(input)}`)
    }
  })

  it('after earlier operations', () => {
    for (const chain of CHAINS[slug] ?? []) {
      let state = topic.createInitialState(chain.variant ?? topic.variant?.default)
      for (const [id, input] of chain.ops) {
        const op = topic.operations.find((o) => o.id === id)
        expect(op, `${slug} has operation ${id}`).toBeDefined()
        const { steps, finalSnapshot } = op!.run(state, input)
        expectWhy(steps, `${slug} ${id} ${String(input)} in a chain`)
        state = finalSnapshot
      }
    }
  })

  it('casts only seed nodes and labels the story illustrative', () => {
    const ids = new Set(variants.flatMap((v) => (topic.createInitialState(v) as NetSnapshot).nodes.map((n) => n.id)))
    for (const id of Object.keys(topic.story.cast)) expect(ids.has(id), `cast ${id} is a seed node`).toBe(true)
    if (slug === 'start') return
    if (isCaseStudy.has(slug)) expect(topic.story.scenario).toContain('*Illustrative scenario')
    else expect(topic.story.scenario).toMatch(/^\*Illustrative scenario/)
  })
})
