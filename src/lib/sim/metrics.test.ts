// SPEC.md §9.1: every declared metrics run, pinned on its seed. A change to the model shows up here
// as a failing number, never as a silent drift.
import { describe, expect, it } from 'vitest'
import { runMetrics as evaluationMetrics, seedNetwork as evaluationSeed } from '@/topics/evaluation/operations'
import { runMetrics as mobilityMetrics, seedNetwork as mobilitySeed } from '@/topics/mobility/operations'

const flowSteps = (steps: { highlightLine: number; description: string }[]) => steps.filter((s) => s.highlightLine === 7).map((s) => s.description)

describe('mobility, seed 5', () => {
  const { steps, finalSnapshot } = mobilityMetrics(mobilitySeed('rwp'))

  it('runs four flows per model, the chosen model first', () => {
    expect(flowSteps(steps)).toEqual([
      'Random waypoint: flow 1 from E to H delivered 0 of 30 packets in 30 ticks.',
      'Random waypoint: flow 2 from C to H delivered 4 of 30 packets in 25 ticks.',
      'Random waypoint: flow 3 from A to C delivered 0 of 30 packets in 30 ticks.',
      'Random waypoint: flow 4 from D to H delivered 20 of 30 packets in 26 ticks.',
      'Group (RPGM): flow 1 from E to H delivered 27 of 30 packets in 29 ticks.',
      'Group (RPGM): flow 2 from C to H delivered 0 of 30 packets in 30 ticks.',
      'Group (RPGM): flow 3 from A to C delivered 22 of 30 packets in 29 ticks.',
      'Group (RPGM): flow 4 from D to H delivered 0 of 30 packets in 30 ticks.',
    ])
  })

  it('ends on the result, with the bars on that step only', () => {
    expect(steps.at(-1)).toMatchObject({ highlightLine: 9, description: 'On seed 5, Random waypoint delivers 20.0 % and Group (RPGM) delivers 40.8 %.' })
    expect(steps.at(-1)?.snapshot.metrics?.groups.map((g) => g.labels)).toEqual([
      ['20.0', '40.8'],
      ['9.1', '2.0'],
      ['8.42', '2.78'],
    ])
    expect(steps.at(-2)?.snapshot.metrics).toBeUndefined()
    expect(finalSnapshot.metrics).toBeUndefined()
  })

  it('puts RPGM first when it is the chosen model', () => {
    expect(mobilityMetrics(mobilitySeed('rpgm')).steps.at(-1)?.description).toBe(
      'On seed 5, Group (RPGM) delivers 40.8 % and Random waypoint delivers 20.0 %.',
    )
  })
})

describe('evaluation, seeds 1 to 10', () => {
  const { steps } = evaluationMetrics(evaluationSeed('udg'), 10)

  it('runs one step per seed per graph, then the result with the spread', () => {
    expect(steps.filter((s) => s.highlightLine === 7)).toHaveLength(20)
    expect(steps.at(-1)?.description).toBe(
      'Over 10 seeds, UDG delivers 86.7 % (standard deviation 16.3) and QUDG 80.0 % (standard deviation 22.1).',
    )
    expect(steps.at(-1)?.snapshot.metrics?.groups.map((g) => g.labels)).toEqual([
      ['86.7', '80.0'],
      ['3.0', '3.5'],
      ['1.45', '3.19'],
    ])
  })

  it('rejects a seed count outside 1 to 10', () => {
    expect(evaluationMetrics(evaluationSeed(), 11).steps).toEqual([
      expect.objectContaining({ highlightLine: 1, description: 'Type a number of seeds from 1 to 10.' }),
    ])
  })
})
