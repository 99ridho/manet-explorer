// SPEC.md §9.1: the three metrics Week 6 names (Misra 4.3.4, pp. 86-87), the shared listing, and
// the steps every metrics run emits. The numbers are this simulator's, never the books'.
import type { NetSnapshot } from '@/types/net'
import type { FlowRun } from './run'

export interface Summary {
  sent: number
  delivered: number
  control: number
  pdr: number | null // percent
  delay: number | null // mean ticks over delivered packets
  overhead: number | null // control transmissions per delivered packet
}

/** What MetricsBars draws: one group per metric, one bar per design, the chosen design first. */
export interface MetricsResult {
  caption: string // "Computed by this simulator on seed 5."
  designs: string[]
  groups: { name: string; values: (number | null)[]; labels: string[]; spread?: (number | null)[] }[]
}

export function summarize(runs: FlowRun[]): Summary {
  const sent = runs.reduce((s, r) => s + r.sent, 0)
  const delivered = runs.reduce((s, r) => s + r.delivered, 0)
  const control = runs.reduce((s, r) => s + r.control, 0)
  const delays = runs.flatMap((r) => r.delays)
  return {
    sent,
    delivered,
    control,
    pdr: sent ? (100 * delivered) / sent : null,
    delay: delays.length ? delays.reduce((s, x) => s + x, 0) / delays.length : null,
    overhead: delivered ? control / delivered : null,
  }
}

export const fmtPdr = (v: number | null) => (v === null ? 'none sent' : v.toFixed(1))
export const fmtDelay = (v: number | null) => (v === null ? 'none delivered' : v.toFixed(1))
export const fmtOverhead = (v: number | null) => (v === null ? 'no packets delivered' : v.toFixed(2))

export function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length
}

/** Population standard deviation. */
export function std(xs: number[]): number {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

export const metricsListing = [
  'def metrics(net, seed):',
  '    results = {}',
  '    for design in variants:  # the chosen design first',
  '        rng = RNG(seed)',
  '        runs = []',
  '        for flow in flows(net, rng):',
  '            runs.append(run_flow(net, design, flow, rng))',
  '        results[design] = summarize(runs)  # PDR, mean delay, control overhead',
  '    return results',
]

export const ML = { def: 1, flow: 7, result: 9 } as const

/** The three §9.1 groups for two or more designs' summaries. */
export function summaryGroups(summaries: Summary[]): MetricsResult['groups'] {
  return [
    { name: 'Packet delivery ratio (%)', values: summaries.map((s) => s.pdr), labels: summaries.map((s) => fmtPdr(s.pdr)) },
    { name: 'Mean delay (ticks)', values: summaries.map((s) => s.delay), labels: summaries.map((s) => fmtDelay(s.delay)) },
    {
      name: 'Control overhead (per delivered packet)',
      values: summaries.map((s) => s.overhead),
      labels: summaries.map((s) => fmtOverhead(s.overhead)),
    },
  ]
}

type Push = (description: string, line: number, highlight?: NetSnapshot['highlight'], packets?: NetSnapshot['packets'], variables?: Record<string, string | number>) => void

/**
 * The §9.1 steps for a run over designs: one per flow per design at line 7, then the result at
 * line 9. `setResult` puts the bars on the working snapshot just before the result step.
 */
export function pushMetricsSteps(
  push: Push,
  scope: string, // "seed 5", or what the run is over when nothing is random

  designs: { label: string; runs: FlowRun[] }[],
  setResult: (r: MetricsResult | undefined) => void,
  why: (text: string) => void, // SPEC.md §20: sets the reason on the step pushed last
) {
  const summaries: Summary[] = []
  for (const d of designs) {
    d.runs.forEach((run, i) => {
      const s = summarize(d.runs.slice(0, i + 1))
      push(
        `${d.label}: flow ${i + 1} from ${run.flow.src} to ${run.flow.dst} delivered ${run.delivered} of ${run.sent} packets in ${run.lastTick} ticks.`,
        ML.flow,
        undefined,
        [],
        { pdr: fmtPdr(s.pdr), delay: fmtDelay(s.delay), overhead: fmtOverhead(s.overhead) },
      )
      why(
        i === 0
          ? `${d.label} runs the same flows on the same network as the other design, so any difference comes from the design alone.`
          : 'The numbers under the step add this flow to the ones before it: delivery ratio, delay, and control overhead.',
      )
    })
    summaries.push(summarize(d.runs))
  }
  setResult({ caption: `Computed by this simulator on ${scope}.`, designs: designs.map((d) => d.label), groups: summaryGroups(summaries) })
  const [a, b] = designs
  push(
    `On ${scope}, ${a.label} delivers ${fmtPdr(summaries[0].pdr)} % and ${b.label} delivers ${fmtPdr(summaries[1].pdr)} %.`,
    ML.result,
  )
  why('Both designs carried the same traffic, so the gap between the bars comes from the design. This simulator computed these numbers; they are not figures from the books.')
  setResult(undefined)
  return summaries
}
