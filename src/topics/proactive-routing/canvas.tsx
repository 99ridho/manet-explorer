// SPEC.md §10.2 canvas: the network, then one node's routing table. The table follows the node the
// step is about; the node buttons pick another table until the step changes it again.
import { useState } from 'react'
import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import { cn } from '@/lib/utils'
import type { DsdvRow, DsdvSnapshot } from './types'

const COLUMNS: [string, (r: DsdvRow) => string | number][] = [
  ['Dest', (r) => r.dest],
  ['Next', (r) => r.next],
  ['Hops', (r) => r.metric],
  ['Seq', (r) => r.seq],
]

export function ProactiveCanvas({ snapshot }: { snapshot: DsdvSnapshot; variant?: string }) {
  const [picked, setPicked] = useState<{ node: string; for: string } | null>(null)
  // A pick holds only while the step still shows the same node.
  const node = picked && picked.for === snapshot.shown && snapshot.tables[picked.node] ? picked.node : snapshot.shown
  const rows = snapshot.tables[node] ?? []
  return (
    <div>
      <NetworkCanvas snapshot={snapshot} />
      <div className="mt-2 flex flex-wrap items-center gap-1" role="group" aria-label="Routing table to show">
        <span className="mr-1 text-xs text-muted-foreground">Table of</span>
        {snapshot.nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            aria-pressed={n.id === node}
            onClick={() => setPicked({ node: n.id, for: snapshot.shown })}
            className={cn(
              'min-h-8 rounded-md border px-2 font-mono text-[11px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              n.id === node ? 'border-foreground bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {n.id}
          </button>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="font-mono text-[11px]" aria-label={`Routing table of ${node}`}>
          <tbody>
            {COLUMNS.map(([label, cell]) => (
              <tr key={label}>
                <th scope="row" className="pr-3 text-left font-normal text-muted-foreground">
                  {label}
                </th>
                {rows.map((r) => (
                  <td key={r.dest} className={cn('px-1.5 text-right', r.changed ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                    {cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-muted-foreground">Bold columns changed since {node} last advertised.</p>
      </div>
    </div>
  )
}
