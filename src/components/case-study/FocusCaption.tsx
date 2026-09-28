// SPEC.md §19.0 canvas view switch: one button per part of a case study's snapshot. The canvas
// follows the step, and a student can open another part until the step moves somewhere else.
import { cn } from '@/lib/utils'

export interface CaptionPart<K extends string> {
  key: K
  label: string
  disabled?: boolean
}

interface FocusCaptionProps<K extends string> {
  parts: CaptionPart<K>[]
  focus: K // the part the snapshot points at
  view: K // the part on screen
  onSelect: (view: K) => void
}

export function FocusCaption<K extends string>({ parts, focus, view, onSelect }: FocusCaptionProps<K>) {
  return (
    // data-shell-keys="off": Space presses these buttons instead of toggling playback.
    <div role="group" aria-label="Choose what the canvas shows" data-shell-keys="off" className="mb-2 flex flex-wrap gap-1.5">
      {parts.map((p) => {
        const shown = p.key === view
        const stepHere = p.key === focus && !shown
        return (
          <button
            key={p.key}
            type="button"
            aria-pressed={shown}
            disabled={p.disabled}
            onClick={() => onSelect(p.key)}
            className={cn(
              'min-h-9 rounded-md border px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              shown ? 'border-accent bg-accent font-medium text-accent-foreground' : 'border-border text-muted-foreground hover:bg-muted/60',
              stepHere && 'border-dashed border-accent text-foreground',
            )}
          >
            {p.label}
            {stepHere && <span className="sr-only"> (the current step is here)</span>}
          </button>
        )
      })}
    </div>
  )
}
