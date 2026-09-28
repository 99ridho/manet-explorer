// SPEC.md §7.3/§8: the Protocol tab. The messages (fields, costs), the invariants, then one block of
// per-node state per variant; the block on the canvas carries a badge. Structured JSX rather than
// markdown because MarkdownContent renders no tables.
import { Badge } from '@/components/ui/badge'
import { representationKey } from '@/lib/structure'
import type { AdtOperation, OperationDefinition, Representation, StructureSpec, VariantConfig } from '@/types/step-engine'

interface ProtocolPanelProps {
  structure: StructureSpec
  variant?: string
  variantConfig?: VariantConfig
  operations: OperationDefinition[]
}

function resolveCost(op: AdtOperation, activeKey: string): string {
  return typeof op.cost === 'string' ? op.cost : (op.cost[activeKey] ?? '')
}

// The visualizer operation for the active representation, or the first listed for a topic without one.
function shownBy(op: AdtOperation, operations: OperationDefinition[], variant?: string): string | null {
  if (!op.operationIds) return null
  const visible = operations.filter(
    (o) => op.operationIds!.includes(o.id) && (!o.variants || (variant !== undefined && o.variants.includes(variant))),
  )
  return visible[0]?.label ?? null
}

const TH = 'py-1.5 pr-3 text-left text-xs font-medium text-muted-foreground'
const TD = 'py-1.5 pr-3 align-top'

function RepresentationBlock({
  repKey,
  representation,
  active,
  variantConfig,
}: {
  repKey: string
  representation: Representation
  active: boolean
  variantConfig?: VariantConfig
}) {
  return (
    <section aria-label={representation.label} data-representation={repKey} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold">{representation.label}</h4>
        {active ? (
          <Badge variant="outline">on the canvas</Badge>
        ) : (
          variantConfig && (
            <span className="text-xs text-muted-foreground">
              Switch {variantConfig.label} in the Operation card to see it.
            </span>
          )
        )}
      </div>
      <pre className="rounded-md bg-muted p-3 font-mono text-xs leading-5">
        {representation.declaration.map((line, i) => {
          // Hanging indent as in CodePanel: a wrapped line continues two columns past its own indent.
          const indent = line.length - line.trimStart().length
          return (
            <div
              key={i}
              className="whitespace-pre-wrap [overflow-wrap:anywhere]"
              style={{ paddingLeft: `${indent + 2}ch`, textIndent: '-2ch' }}
            >
              {line.trimStart() || ' '}
            </div>
          )
        })}
      </pre>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className={TH}>Field</th>
            <th className={TH}>Type</th>
            <th className={TH}>Role</th>
          </tr>
        </thead>
        <tbody>
          {representation.fields.map((f) => (
            <tr key={f.name} className="border-b border-border/60">
              <td className={`${TD} font-mono`}>{f.name}</td>
              <td className={`${TD} font-mono text-muted-foreground`}>{f.type}</td>
              <td className={TD}>{f.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {representation.invariants && representation.invariants.length > 0 && (
        <ul className="list-disc space-y-1 pl-5">
          {representation.invariants.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ProtocolPanel({ structure, variant, variantConfig, operations }: ProtocolPanelProps) {
  const activeKey = representationKey(structure, variant)
  const { adt } = structure
  const algorithms = (structure.algorithms ?? [])
    .map((id) => operations.find((o) => o.id === id))
    .filter((o): o is OperationDefinition => o !== undefined)

  return (
    <div className="max-w-prose space-y-6 text-sm text-foreground">
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{adt.name}</h3>
        <p className="leading-relaxed">{adt.summary}</p>
        {adt.operations.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className={TH}>Message</th>
                <th className={TH}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {adt.operations.map((op) => {
                const label = shownBy(op, operations, variant)
                return (
                  <tr key={op.name} className="border-b border-border/60">
                    <td className={TD}>
                      <code className="font-mono">{op.signature}</code>
                      {op.note && <p className="mt-0.5 text-xs text-muted-foreground">{op.note}</p>}
                      {label && <p className="mt-0.5 text-xs text-muted-foreground">Shown by {label}.</p>}
                    </td>
                    <td className={`${TD} text-xs leading-5`}>
                      {resolveCost(op, activeKey) || (
                        <span className="text-muted-foreground">Not stated in the course reference.</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      {adt.invariants.length > 0 && (
        <section className="space-y-2">
          <h4 className="font-semibold">Invariants</h4>
          <ul className="list-disc space-y-1 pl-5">
            {adt.invariants.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-5">
        <h4 className="font-semibold">Per-node state</h4>
        {Object.entries(structure.representations).map(([key, rep]) => (
          <RepresentationBlock
            key={key}
            repKey={key}
            representation={rep}
            active={key === activeKey}
            variantConfig={variantConfig}
          />
        ))}
      </section>

      {algorithms.length > 0 && (
        <section className="space-y-2">
          <h4 className="font-semibold">Algorithms over the network</h4>
          <ul className="list-disc space-y-1 pl-5">
            {algorithms.map((o) => (
              <li key={o.id}>{o.label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
