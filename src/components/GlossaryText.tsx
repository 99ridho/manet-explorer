// SPEC.md §20: a term from the glossary opens its definition on click, tap, Enter, or Space.
import { Popover } from 'radix-ui'
import { splitGlossary, type GlossaryClaims } from '@/lib/glossary'

interface GlossaryTextProps {
  text: string
  // Shared by the blocks of one panel or document, so each term is marked once there.
  claims: GlossaryClaims
  // This block's id: its position in the document, or its slot in a panel.
  block: string | number
}

export function GlossaryText({ text, claims, block }: GlossaryTextProps) {
  return splitGlossary(text, claims, block).map((seg, i) =>
    typeof seg === 'string' ? (
      seg
    ) : (
      <Popover.Root key={i}>
        <Popover.Trigger
          className="cursor-help rounded-sm underline decoration-dotted decoration-1 underline-offset-[3px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label={`${seg.text}: show what it means`}
        >
          {seg.text}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            sideOffset={6}
            collisionPadding={16}
            className="z-50 max-w-72 rounded-md border bg-popover px-3 py-2 text-sm leading-snug text-popover-foreground shadow-md outline-none"
          >
            <p className="font-semibold">{seg.entry.term}</p>
            <p className="mt-1">{seg.entry.definition}</p>
            <Popover.Arrow className="fill-border" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    ),
  )
}
