// SPEC.md §8: the live fields of the snapshot on the canvas, one chip per field,
// in the same style as the step variables in CodePanel. Recomputed on every step, never stored.
// The chips sit in a grid whose column count depends on the width alone, so the row keeps its
// height while values change and stepping never moves the page (§12).
import { Badge } from '@/components/ui/badge'
import { activeRepresentation } from '@/lib/structure'
import type { StructureSpec } from '@/types/step-engine'

interface LiveFieldsProps {
  structure: StructureSpec
  snapshot: unknown
  variant?: string
}

export function LiveFields({ structure, snapshot, variant }: LiveFieldsProps) {
  const representation = activeRepresentation(structure, variant)
  const fields = Object.entries(structure.liveFields(snapshot, variant))
  return (
    <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2">
      {representation && (
        <span className="shrink-0 pt-0.5 text-xs leading-4 text-muted-foreground">{representation.label}</span>
      )}
      <div
        role="list"
        aria-label="Live fields"
        className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,6.75rem)] justify-items-start gap-1.5"
      >
        {fields.map(([k, v]) => (
          <Badge key={k} role="listitem" variant="outline" className="max-w-full font-mono text-[11px]">
            <span className="truncate">
              {k} = {v}
            </span>
          </Badge>
        ))}
      </div>
    </div>
  )
}
