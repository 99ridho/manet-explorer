// Contract for the SPEC.md §8 live fields: one to six scalars on every step of every seed operation,
// each chip short enough for one track of the LiveFields grid.
import { describe, expect, it } from 'vitest'
import type { Step } from '@/types/step-engine'
import { caseStudies } from '@/case-studies/registry'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

const MAX_FIELDS = 6
const MAX_CHIP_LENGTH = 13 // `${key} = ${value}` fits one 6.75rem track in LiveFields; 14 truncates in the browser

function expectScalarFields(fields: Record<string, string | number>, where: string) {
  const entries = Object.entries(fields)
  expect(entries.length, `${where}: field count`).toBeGreaterThanOrEqual(1)
  expect(entries.length, `${where}: field count`).toBeLessThanOrEqual(MAX_FIELDS)
  for (const [k, v] of entries) {
    if (typeof v === 'number') expect(Number.isFinite(v), `${where}: ${k} is finite`).toBe(true)
    else {
      expect(typeof v, `${where}: ${k} is a string or number`).toBe('string')
      expect(v.length, `${where}: ${k} is non-empty`).toBeGreaterThan(0)
    }
    expect(`${k} = ${v}`.length, `${where}: chip "${k} = ${v}" fits a track`).toBeLessThanOrEqual(MAX_CHIP_LENGTH)
  }
}

// Case study simulators are TopicModules too (SPEC.md §19.0), so they meet the same contract.
const modules = [...topics, ...caseStudies.map((c) => c.simulator)]

describe.each(modules.map((t) => [t.slug, t] as const))('%s live fields', (_slug, topic) => {
  it('returns scalar live fields on the seed and on every step', () => {
    const variantsToTry = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]
    for (const variant of variantsToTry) {
      const state = topic.createInitialState(variant)
      expectScalarFields(topic.liveFields(state, variant), `${variant ?? 'default'} seed`)
      for (const op of topic.operations) {
        if (op.variants && (!variant || !op.variants.includes(variant))) continue
        const inputs = INPUTS[`${topic.slug}/${op.id}`] ?? [undefined]
        for (const input of inputs) {
          const result = op.run(state, input)
          for (const step of result.steps as Step<unknown>[]) {
            expectScalarFields(topic.liveFields(step.snapshot, variant), `${op.id} step ${step.id}`)
          }
          expectScalarFields(topic.liveFields(result.finalSnapshot, variant), `${op.id} final`)
        }
      }
    }
  })
})
