// Case study types: SPEC.md §19.0, verbatim. The simulator is a plain TopicModule outside `topics`.
import type { TopicModule } from './step-engine'

export interface StructureChoice {
  name: string // e.g. "Queue (linked list)"
  cost: string // quoted from the week reference, same rule as structure.ts
  reason: string // one or two sentences, house style
  topicSlug: string // the topic page that teaches it
}

export interface DecisionRow {
  requirement: string // what the scenario needs, in the student's words
  chosen: StructureChoice
  rejected: StructureChoice[]
}

export interface ChoiceQuestion {
  kind: 'choice'
  id: string
  prompt: string
  choices: string[]
  answer: number // index into choices
  explanation: string // shown after Check; names the week, never SPEC.md
  topicSlug: string
}

export interface PredictQuestion extends Omit<ChoiceQuestion, 'kind'> {
  kind: 'predict'
  operationId: string // run on simulator.createInitialState(variant)
  variant: string
  input: unknown
  stepIndex: number // the step drawn with the simulator canvas; the question asks about the step after it
  expect: string // substring of steps[stepIndex + 1].description, and of choices[answer]
}

export type QuizQuestion = ChoiceQuestion | PredictQuestion

export interface CaseStudyModule<TSnapshot = unknown> {
  slug: string
  title: string
  weekLabel: string // e.g. "Weeks 1–7"
  summary: string // one sentence for the home page and sidebar
  topicSlugs: string[] // topics the case study draws on, in week order
  content: { scenario: string; reasoning: string } // hand-written markdown, not generated
  decisions: DecisionRow[]
  simulator: TopicModule<TSnapshot, TSnapshot> // slug equals the case study slug
  quiz: QuizQuestion[]
}
