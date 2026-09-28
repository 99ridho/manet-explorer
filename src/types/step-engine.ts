// Core domain types: dsa-course SPEC §7 with the SPEC.md §7.1 amendment (no language snippets).
import type React from 'react'

export interface Step<TSnapshot> {
  id: number
  description: string // human-readable narration of this step
  highlightLine: number // 1-indexed line number in the operation's pseudocode
  snapshot: TSnapshot // full structure state AFTER this step is applied
  variables?: Record<string, string | number> // e.g. { comparing: "12 vs 7" }
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

export interface AdtOperation {
  name: string // e.g. "push"
  signature: string // e.g. "push(item)"
  cost: string | Record<string, string> // one cost, or one per representation key
  note?: string // one sentence, house style
  operationIds?: string[] // visualizer operations that demonstrate it (one per variant when scoped)
}

export interface StructureField {
  name: string // e.g. "first"
  type: string // e.g. "Node"
  role: string // e.g. "top of the stack, null when empty"
}

export interface Representation {
  label: string // e.g. "Resizing array"
  declaration: string[] // language-neutral pseudo-declaration, one line each
  fields: StructureField[]
  invariants?: string[] // invariants this representation adds to the ADT's
}

export interface StructureSpec<TSnapshot = unknown> {
  adt: {
    name: string // e.g. "Stack"
    summary: string // one sentence; for algorithm topics it says there is no ADT to call
    operations: AdtOperation[] // empty for algorithm topics
    invariants: string[]
  }
  representations: Record<string, Representation> // key = variant value, or "default" alone when every variant shares one
  algorithms?: string[] // operation ids that run an algorithm over the structure rather than an ADT operation
  liveFields: (snapshot: TSnapshot, variant?: string) => Record<string, string | number> // scalars only, at most six
}

export interface TopicModule<TState = unknown, TSnapshot = unknown> {
  slug: string
  title: string
  weekLabel: string // e.g. "Week 2" or "Weeks 1–3"
  operations: OperationDefinition<TState, unknown, TSnapshot>[]
  pseudocode: Record<string, string[]> // operationId -> lines of pseudocode
  CanvasComponent: React.ComponentType<{ snapshot: TSnapshot; variant?: string }>
  content: { realWorldUsage: string; coreMaterial: string }
  structure: StructureSpec<TSnapshot> // the Protocol spec of SPEC.md §7.3 (ProtocolPanel, LiveFields)
  variant?: VariantConfig
  createInitialState: (variant?: string) => TState
  randomize: (state: TState, variant?: string) => TState // instant, no animation
}

/** Input shapes produced by OperationBar for each `inputKind`. */
export type KeyInput = number
export type ArrayInput = number[]
export type EdgeInput = { from: string; to: string }
export type TextInput = string
