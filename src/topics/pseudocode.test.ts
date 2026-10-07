// Contract for SPEC.md §7.1: one listing per operation, written as Python (snake_case functions,
// 4-space blocks, balanced brackets), no blank lines, every highlighted line inside it, and the §8 call line bound.
import { describe, expect, it } from 'vitest'
import type { Step, TopicModule } from '@/types/step-engine'
import { caseStudies } from '@/case-studies/registry'
import { enclosingDef } from '@/lib/call-line'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

function emittedSteps(topic: TopicModule, opId: string): Step<unknown>[] {
  const steps: Step<unknown>[] = []
  const variantsToTry = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]
  const op = topic.operations.find((o) => o.id === opId)!
  for (const variant of variantsToTry) {
    if (op.variants && (!variant || !op.variants.includes(variant))) continue
    const state = topic.createInitialState(variant)
    for (const input of INPUTS[`${topic.slug}/${opId}`] ?? [undefined]) steps.push(...(op.run(state, input).steps as Step<unknown>[]))
  }
  return steps
}

// Measures the SPEC names as step variables (§9.1, §10.3) that no listing spells as an identifier.
const SPEC_MEASURES = new Set(['header', 'pdr', 'delay', 'overhead'])

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
      const emitted = new Set(emittedSteps(topic, op.id).map((s) => s.highlightLine))
      expect(emitted.size).toBeGreaterThan(0)
      for (const n of emitted) {
        expect(n, `line ${n}`).toBeGreaterThanOrEqual(1)
        expect(n, `line ${n}`).toBeLessThanOrEqual(listing.length)
      }
    })

    // SPEC.md §8 call line: a step binds every argument of the def it runs inside, and names only what the listing names.
    it(`${op.id}: every step binds its call's arguments, and every variable is named in the listing`, () => {
      const listing = topic.pseudocode[op.id]
      const words = new Set(listing.join(' ').match(/[A-Za-z_][A-Za-z0-9_]*/g))
      for (const step of emittedSteps(topic, op.id)) {
        const vars = step.variables ?? {}
        for (const k of Object.keys(vars)) expect(words.has(k) || SPEC_MEASURES.has(k), `"${k}" on line ${step.highlightLine} is not in the listing`).toBe(true)
        for (const p of enclosingDef(listing, step.highlightLine)?.params ?? []) {
          if (p !== 'net') expect(vars, `${p} on line ${step.highlightLine}: ${step.description}`).toHaveProperty(p)
        }
      }
    })
  }
})
