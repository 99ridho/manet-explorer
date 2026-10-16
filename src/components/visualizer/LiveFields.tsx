// SPEC.md §8: the live fields of the snapshot on the canvas, one chip per field,
// in the same style as the step variables in CodePanel. Recomputed on every step, never stored.
// The chips sit in a grid whose column count depends on the width alone, so the row keeps its
// height while values change and stepping never moves the page (§12).
import { Badge } from '@/components/ui/badge'
import type { LiveFields as LiveFieldsFn } from '@/types/step-engine'

interface LiveFieldsProps {
  liveFields: LiveFieldsFn
  snapshot: unknown
  variant?: string
}

export function LiveFields({ liveFields, snapshot, variant }: LiveFieldsProps) {
  const fields = Object.entries(liveFields(snapshot, variant))
  return (
    <div
      role="list"
      aria-label="Live fields"
      className="mt-3 grid min-w-0 grid-cols-[repeat(auto-fill,6.75rem)] justify-items-start gap-1.5"
    >
      {fields.map(([k, v]) => (
        <Badge key={k} role="listitem" variant="outline" className="max-w-full font-mono text-[11px]">
          <span className="truncate">
            {k} = {v}
          </span>
        </Badge>
      ))}
    </div>
  )
}
