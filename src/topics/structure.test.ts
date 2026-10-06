// Contract for SPEC.md §7.3, the Protocol spec: every topic names its messages and one per-node
// state per variant, every visualizer operation is either a message's operation or a listed
// algorithm, the live fields stay scalar on every step of every seed operation, and the copy meets §18.
import { describe, expect, it } from 'vitest'
import type { Step, StructureSpec } from '@/types/step-engine'
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

/** Every human-readable string in the spec, with where it came from. */
function copyStrings(structure: StructureSpec): [string, string][] {
  const out: [string, string][] = [['adt.summary', structure.adt.summary]]
  structure.adt.invariants.forEach((s, i) => out.push([`adt.invariants[${i}]`, s]))
  for (const op of structure.adt.operations) {
    if (op.note) out.push([`${op.name}.note`, op.note])
    const costs = typeof op.cost === 'string' ? [op.cost] : Object.values(op.cost)
    costs.forEach((c) => out.push([`${op.name}.cost`, c]))
  }
  for (const [key, rep] of Object.entries(structure.representations)) {
    out.push([`${key}.label`, rep.label])
    rep.declaration.forEach((s, i) => out.push([`${key}.declaration[${i}]`, s]))
    rep.fields.forEach((f) => out.push([`${key}.${f.name}.role`, f.role]))
    rep.invariants?.forEach((s, i) => out.push([`${key}.invariants[${i}]`, s]))
  }
  return out
}

// Case study simulators are TopicModules too (SPEC.md §19.0), so they meet the same contract.
const modules = [...topics, ...caseStudies.map((c) => c.simulator)]

describe.each(modules.map((t) => [t.slug, t] as const))('%s structure', (_slug, topic) => {
  const { structure } = topic
  const ids = topic.operations.map((o) => o.id)

  it('names the mechanism and one per-node state per variant', () => {
    expect(structure.adt.name.length).toBeGreaterThan(0)
    expect(structure.adt.summary.length).toBeGreaterThan(0)
    // One entry per variant value, or `default` alone when every variant shares one representation.
    const keys = Object.keys(structure.representations).sort()
    const perVariant = topic.variant ? topic.variant.options.map((o) => o.value).sort() : null
    if (perVariant && keys.join() !== 'default') expect(keys).toEqual(perVariant)
    else expect(keys).toEqual(['default'])
    for (const rep of Object.values(structure.representations)) {
      expect(rep.declaration.length).toBeGreaterThan(0)
      expect(rep.fields.length).toBeGreaterThan(0)
    }
  })

  it('covers every visualizer operation exactly once', () => {
    const covered = new Map<string, number>()
    for (const op of structure.adt.operations) {
      for (const id of op.operationIds ?? []) {
        expect(ids, `${op.name} names operation ${id}`).toContain(id)
        covered.set(id, (covered.get(id) ?? 0) + 1)
      }
    }
    for (const id of structure.algorithms ?? []) {
      expect(ids, `algorithms names operation ${id}`).toContain(id)
      covered.set(id, (covered.get(id) ?? 0) + 1)
    }
    for (const id of ids) expect(covered.get(id), `${id} is covered once`).toBe(1)
  })

  it('gives a cost per representation when costs differ', () => {
    const keys = Object.keys(structure.representations).sort()
    for (const op of structure.adt.operations) {
      if (typeof op.cost === 'string') continue
      expect(Object.keys(op.cost).sort(), `${op.name}.cost keys`).toEqual(keys)
    }
  })

  it('returns scalar live fields on the seed and on every step', () => {
    const variantsToTry = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]
    for (const variant of variantsToTry) {
      const state = topic.createInitialState(variant)
      expectScalarFields(structure.liveFields(state, variant), `${variant ?? 'default'} seed`)
      for (const op of topic.operations) {
        if (op.variants && (!variant || !op.variants.includes(variant))) continue
        const inputs = INPUTS[`${topic.slug}/${op.id}`] ?? [undefined]
        for (const input of inputs) {
          const result = op.run(state, input)
          for (const step of result.steps as Step<unknown>[]) {
            expectScalarFields(structure.liveFields(step.snapshot, variant), `${op.id} step ${step.id}`)
          }
          expectScalarFields(structure.liveFields(result.finalSnapshot, variant), `${op.id} final`)
        }
      }
    }
  })

  it('meets the copy floor', () => {
    for (const [where, text] of copyStrings(structure)) {
      expect(text, `${where}: no em dash`).not.toMatch(/\u2014/)
      expect(text, `${where}: no spaced double hyphen`).not.toMatch(/\s-{2}\s/)
      expect(text, `${where}: no arrow glyph`).not.toMatch(/[\u2192\u2190\u21d2]/)
      if (/invariants|note|summary/.test(where)) expect(text, `${where}: ends with a period`).toMatch(/\.$/)
    }
  })
})
