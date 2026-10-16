// SPEC.md §7.3: the ns-3 scripts live in ns3/ at the repo root, so the file a student downloads is
// the file scripts/ns3-check.mjs compiled. Outputs are that script's captured stdout, never typed by hand.
import type { Ns3Script } from '@/types/ns3'

const sources = import.meta.glob<string>('/ns3/*.cc', { query: '?raw', import: 'default', eager: true })
const captured = import.meta.glob<string>('/ns3/output/*.txt', { query: '?raw', import: 'default', eager: true })
const runs = import.meta.glob<Record<string, { arg?: string; values?: string[] }>>('/ns3/runs.json', {
  import: 'default',
  eager: true,
})['/ns3/runs.json']

/** The pinned release the outputs come from; ns3/Dockerfile's NS3_TAG names the same one. */
export const NS3_RELEASE = 'ns-3.49'

export function ns3Script(slug: string, notes: string): Ns3Script {
  const run = runs[slug] ?? {}
  const keys = run.arg ? (run.values ?? []) : ['default']
  return {
    file: `${slug}.cc`,
    source: sources[`/ns3/${slug}.cc`] ?? '',
    arg: run.arg,
    outputs: Object.fromEntries(keys.map((k) => [k, captured[`/ns3/output/${slug}.${k}.txt`] ?? ''])),
    notes,
  }
}

/** The command that runs the script for one variant, as ns-3's own `./ns3 run` takes it. */
export function runCommand(script: Ns3Script, variant?: string): string {
  const name = script.file.replace(/\.cc$/, '')
  return script.arg && variant ? `./ns3 run "${name} --${script.arg}=${variant}"` : `./ns3 run ${name}`
}
