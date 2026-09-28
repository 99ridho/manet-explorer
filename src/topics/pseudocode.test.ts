// Contract for SPEC.md §7.1: one listing per operation, written as Python (snake_case functions,
// 4-space blocks, balanced brackets), no blank lines, and every highlighted line inside it.
import { describe, expect, it } from 'vitest'
import type { Step, TopicModule } from '@/types/step-engine'
import { caseStudies } from '@/case-studies/registry'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

function emittedLines(topic: TopicModule, opId: string): Set<number> {
  const lines = new Set<number>()
  const variantsToTry = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]
  const op = topic.operations.find((o) => o.id === opId)!
  for (const variant of variantsToTry) {
    if (op.variants && (!variant || !op.variants.includes(variant))) continue
    const state = topic.createInitialState(variant)
    for (const input of INPUTS[`${topic.slug}/${opId}`] ?? [undefined]) {
      for (const step of op.run(state, input).steps as Step<unknown>[]) lines.add(step.highlightLine)
    }
  }
  return lines
}

const modules = [...topics, ...caseStudies.map((c) => c.simulator)]

describe.each(modules.map((t) => [t.slug, t] as const))('%s pseudocode', (_slug, topic) => {
  for (const op of topic.operations) {
    it(`${op.id}: a listing with no blank lines, and every emitted line inside it`, () => {
      const listing = topic.pseudocode[op.id]
      expect(listing, 'pseudocode listing').toBeDefined()
      expect(listing.length).toBeGreaterThan(0)
      listing.forEach((line, i) => expect(line.trim(), `line ${i + 1} is blank`).not.toBe(''))
      expect(listing[0], 'starts with a def').toMatch(/^def [a-z_]+\(.*\):$/)
      listing.forEach((line, i) => {
        const indent = line.length - line.trimStart().length
        expect(indent % 4, `line ${i + 1} indents by 4 spaces`).toBe(0)
        const code = line.replace(/#.*$/, '').replace(/'[^']*'|"[^"]*"/g, '')
        for (const [open, close] of ['()', '[]', '{}']) {
          const balance = [...code].reduce((n, c) => n + (c === open ? 1 : c === close ? -1 : 0), 0)
          expect(balance, `line ${i + 1} balances ${open}${close}`).toBe(0)
        }
        if (/^\s*(def|for|while|if|elif|else)\b/.test(code)) expect(code.trimEnd(), `line ${i + 1} opens a block`).toMatch(/:$/)
      })
      const emitted = emittedLines(topic, op.id)
      expect(emitted.size).toBeGreaterThan(0)
      for (const n of emitted) {
        expect(n, `line ${n}`).toBeGreaterThanOrEqual(1)
        expect(n, `line ${n}`).toBeLessThanOrEqual(listing.length)
      }
    })
  }
})
