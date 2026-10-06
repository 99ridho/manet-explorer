// SPEC.md §8 and §9.1: the last step of a metrics run draws this in place of the network, at the
// same height. Chart-1 marks the chosen design and chart-3 the other; every bar prints its value,
// so the legend and the text carry identity and color is never the only cue.
import type { MetricsResult } from '@/lib/sim/metrics'

const HEIGHT = 280
const FILLS = ['var(--color-chart-1)', 'var(--color-chart-3)']

export function MetricsBars({ result }: { result: MetricsResult }) {
  return (
    <figure className="flex flex-col gap-3 overflow-hidden" style={{ height: HEIGHT }} aria-label={describe(result)}>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-hidden>
        {result.designs.map((d, i) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: FILLS[i] }} />
            {d}
          </span>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-around gap-2" aria-hidden>
        {result.groups.map((g) => {
          const top = Math.max(1e-9, ...g.values.map((v, i) => (v ?? 0) + (g.spread?.[i] ?? 0)))
          return (
            <div key={g.name} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{g.name}</span>
              {g.values.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative h-3 min-w-0 flex-1">
                    {v !== null && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-r"
                        style={{ width: `${(100 * v) / top}%`, background: FILLS[i] }}
                      />
                    )}
                    {v !== null && g.spread?.[i] ? (
                      <div
                        className="absolute top-1/2 h-px bg-foreground"
                        style={{
                          left: `${(100 * Math.max(0, v - g.spread[i]!)) / top}%`,
                          width: `${(100 * (Math.min(v, g.spread[i]!) + g.spread[i]!)) / top}%`,
                        }}
                      />
                    ) : null}
                  </div>
                  <span className="w-36 shrink-0 font-mono text-[11px] tabular-nums">
                    {g.labels[i]}
                    {g.spread?.[i] != null ? ` ± ${g.spread[i]!.toFixed(1)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <figcaption className="text-xs text-muted-foreground">{result.caption}</figcaption>
    </figure>
  )
}

function describe(r: MetricsResult): string {
  const parts = r.groups.map((g) => `${g.name}: ${r.designs.map((d, i) => `${d} ${g.labels[i]}`).join(', ')}`)
  return `${parts.join('. ')}. ${r.caption}`
}
