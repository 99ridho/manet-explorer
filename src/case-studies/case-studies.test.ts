// Contract for SPEC.md §19.0: every case study links real topics, every quiz answer indexes a
// choice, and every predict question's picture is followed by the step its right answer names.
import { describe, expect, it } from 'vitest'
import { predictStep } from '@/lib/predict-step'
import { topics } from '@/topics/registry'
import { caseStudies } from './registry'

const topicSlugs = new Set(topics.map((t) => t.slug))
const noDash = (text: string, where: string) => {
  expect(text, `${where}: no em dash`).not.toMatch(/\u2014/)
  expect(text, `${where}: no arrow glyph`).not.toMatch(/[\u2192\u2190\u21d2]/)
}

describe('case study registry', () => {
  it('has unique slugs that do not clash with topics', () => {
    const slugs = caseStudies.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(topicSlugs.has(slug), slug).toBe(false)
  })
})

describe.each(caseStudies.map((c) => [c.slug, c] as const))('%s', (_slug, cs) => {
  it('names its simulator after itself and links existing topics', () => {
    expect(cs.simulator.slug).toBe(cs.slug)
    for (const slug of cs.topicSlugs) expect(topicSlugs.has(slug), slug).toBe(true)
    for (const row of cs.decisions) {
      for (const choice of [row.chosen, ...row.rejected]) {
        expect(topicSlugs.has(choice.topicSlug), `${choice.name} links ${choice.topicSlug}`).toBe(true)
        noDash(`${choice.name} ${choice.cost} ${choice.reason}`, choice.name)
        expect(choice.reason, `${choice.name} reason ends with a period`).toMatch(/\.$/)
      }
    }
    noDash(cs.content.scenario, 'scenario')
    noDash(cs.content.reasoning, 'reasoning')
  })

  it('has a simulator variant with the chosen design first', () => {
    expect(cs.simulator.variant?.options.length).toBe(2)
    expect(cs.simulator.variant?.default).toBe(cs.simulator.variant?.options[0].value)
  })

  it('has well-formed quiz questions', () => {
    expect(cs.quiz.length).toBeGreaterThanOrEqual(6)
    expect(new Set(cs.quiz.map((q) => q.id)).size).toBe(cs.quiz.length)
    for (const q of cs.quiz) {
      expect(q.choices.length, q.id).toBeGreaterThanOrEqual(3)
      expect(new Set(q.choices).size, `${q.id} choices are distinct`).toBe(q.choices.length)
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
      expect(q.answer, q.id).toBeLessThan(q.choices.length)
      expect(topicSlugs.has(q.topicSlug), `${q.id} links ${q.topicSlug}`).toBe(true)
      noDash([q.prompt, q.explanation, ...q.choices].join(' '), q.id)
    }
    // The right answer should not always sit in the same position.
    expect(new Set(cs.quiz.map((q) => q.answer)).size).toBeGreaterThan(1)
  })

  it('draws predict questions from real steps', () => {
    const predicts = cs.quiz.filter((q) => q.kind === 'predict')
    expect(predicts.length).toBeGreaterThanOrEqual(2)
    for (const q of predicts) {
      const step = predictStep(cs.simulator, q)
      expect(step, `${q.id} has a step and a next step`).not.toBeNull()
      expect(step!.next.description, `${q.id} next step`).toContain(q.expect)
      expect(q.choices[q.answer], `${q.id} right choice`).toContain(q.expect)
      q.choices.forEach((c, i) => {
        if (i !== q.answer) expect(c, `${q.id} wrong choice ${i}`).not.toContain(q.expect)
      })
    }
  })
})
