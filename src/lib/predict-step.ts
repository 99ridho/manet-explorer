// SPEC.md §19.0 predict questions: the picture is a real step of the simulator, never a hand-drawn one.
import type { PredictQuestion } from '@/types/case-study'
import type { Step, TopicModule } from '@/types/step-engine'

/** The step a predict question draws, from the operation run on the variant's seed state. */
export function predictStep(simulator: TopicModule, q: PredictQuestion): { current: Step<unknown>; next: Step<unknown> } | null {
  const op = simulator.operations.find((o) => o.id === q.operationId)
  if (!op) return null
  const { steps } = op.run(simulator.createInitialState(q.variant), q.input)
  const current = steps[q.stepIndex]
  const next = steps[q.stepIndex + 1]
  return current && next ? { current, next } : null
}
