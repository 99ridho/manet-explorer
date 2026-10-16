// Core domain types: dsa-course SPEC §7 with the SPEC.md §7.1 amendment (no language snippets)
// and §7.3 (the ns-3 script in place of the structure spec).
import type React from 'react'
import type { Ns3Script } from './ns3'
import type { TopicStory } from './story'

export interface Step<TSnapshot> {
  id: number
  description: string // human-readable narration of this step
  highlightLine: number // 1-indexed line number in the operation's pseudocode
  snapshot: TSnapshot // full structure state AFTER this step is applied
  variables?: Record<string, string | number> // e.g. { comparing: "12 vs 7" }
  why?: string // SPEC.md §20: the reason for this step in plain words, shown under the description
}

export interface OperationResult<TSnapshot> {
  steps: Step<TSnapshot>[]
  finalSnapshot: TSnapshot
}

export type OperationFn<TState, TInput, TSnapshot> = (
  state: TState,
  input: TInput,
) => OperationResult<TSnapshot>

export interface OperationDefinition<TState = unknown, TInput = unknown, TSnapshot = unknown> {
  id: string // e.g. "insert"
  label: string // e.g. "Insert"
  inputKind: 'key' | 'edge' | 'array' | 'none' | 'text'
  placeholder?: string // overrides the placeholder OperationBar shows for this inputKind
  variants?: string[] // variant values this operation applies to; absent means all
  run: OperationFn<TState, TInput, TSnapshot>
}

export interface VariantConfig {
  id: string // e.g. "collision-strategy"
  label: string // e.g. "Collision Strategy"
  options: { value: string; label: string }[]
  default: string
}

/** The live-field chips of SPEC.md §8: scalars only, at most six, read from the snapshot shown. */
export type LiveFields<TSnapshot = unknown> = (snapshot: TSnapshot, variant?: string) => Record<string, string | number>

export interface TopicModule<TState = unknown, TSnapshot = unknown> {
  slug: string
  title: string
  weekLabel: string // e.g. "Week 2" or "Weeks 1–3"
  operations: OperationDefinition<TState, unknown, TSnapshot>[]
  pseudocode: Record<string, string[]> // operationId -> lines of pseudocode
  CanvasComponent: React.ComponentType<{ snapshot: TSnapshot; variant?: string }>
  content: { coreMaterial: string } // SPEC.md §11; the Scenario tab replaced Real-World Usage (§20)
  liveFields: LiveFields<TSnapshot>
  variant?: VariantConfig
  createInitialState: (variant?: string) => TState
  randomize: (state: TState, variant?: string) => TState // instant, no animation
  story: TopicStory // SPEC.md §20: the Scenario tab and the Who's who line
  ns3?: Ns3Script // SPEC.md §7.3: the ns-3 tab; every topic has one, case-study simulators do not
}

/** Input shapes produced by OperationBar for each `inputKind`. */
export type KeyInput = number
export type ArrayInput = number[]
export type EdgeInput = { from: string; to: string }
export type TextInput = string
