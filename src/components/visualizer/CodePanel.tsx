// SPEC.md §8 and §20: the step narration, the reason for it, the call it runs inside, its variables, and one numbered pseudocode listing with the
// current step's line highlighted. Lines soft-wrap with a hanging indent; no horizontal scroll.
import { useEffect, useRef } from 'react'
import { GlossaryText } from '@/components/GlossaryText'
import { callLine } from '@/lib/call-line'
import type { GlossaryClaims } from '@/lib/glossary'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Step } from '@/types/step-engine'

interface CodePanelProps {
  lines: string[]
  currentStep: Step<unknown> | null
  operationLabel: string | null
}

export function CodePanel({ lines, currentStep, operationLabel }: CodePanelProps) {
  const highlightLine = currentStep?.highlightLine
  const listRef = useRef<HTMLOListElement>(null)
  // One map per render, so the description and the Why line mark each term once between them.
  const claims: GlossaryClaims = new Map()
  const { call, rest } = currentStep ? callLine(lines, currentStep.highlightLine, currentStep.variables) : { call: null, rest: [] }

  // Scroll the <ol> itself rather than scrollIntoView, so stepping never moves the page.
  useEffect(() => {
    const list = listRef.current
    if (!list || list.scrollHeight <= list.clientHeight) return
    const active = list.querySelector<HTMLLIElement>('[aria-current="step"]')
    if (!active) return
    const top = active.offsetTop
    const bottom = top + active.offsetHeight
    if (top < list.scrollTop) list.scrollTop = top
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
  }, [highlightLine, lines])

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="min-h-12 shrink-0 rounded-lg bg-muted px-3 py-2 text-sm" aria-live="polite">
        {currentStep ? (
          <>
            <p>
              <GlossaryText text={currentStep.description} claims={claims} block="description" />
            </p>
            {currentStep.why && (
              <p className="mt-1.5 text-muted-foreground">
                <span className="font-semibold text-foreground">Why: </span>
                <GlossaryText text={currentStep.why} claims={claims} block="why" />
              </p>
            )}
            {call && <p className="mt-1.5 font-mono text-xs [overflow-wrap:anywhere]">{call}</p>}
            {rest.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {rest.map(([k, v]) => (
                  <Badge key={k} variant="outline" className="font-mono text-[11px]">
                    {k} = {v}
                  </Badge>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            {operationLabel ? `Press Go to run ${operationLabel}.` : 'Pick an operation to see its pseudocode.'}
          </p>
        )}
      </div>

      {lines.length > 0 && (
        <ol
          ref={listRef}
          tabIndex={0}
          className="relative min-h-0 rounded-lg border bg-card p-3 font-mono text-xs leading-5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none lg:overflow-y-auto"
          aria-label="Pseudocode"
        >
          {lines.map((text, i) => {
            const lineNo = i + 1
            const active = highlightLine === lineNo
            // Listings indent by four spaces (SPEC §7.1); drawing each level at 2ch keeps a narrow card readable.
            const indent = (text.length - text.trimStart().length) / 2
            const hash = text.indexOf('  #')
            const code = (hash >= 0 ? text.slice(0, hash) : text).trimStart()
            const comment = hash >= 0 ? text.slice(hash).trim() : null
            return (
              <li
                key={lineNo}
                className={cn('-mx-1 flex gap-2 rounded px-1 py-0.5', active && 'bg-accent/40 font-bold')}
                aria-current={active ? 'step' : undefined}
              >
                <span className="w-5 shrink-0 select-none text-right text-muted-foreground">{lineNo}</span>
                {/* Hanging indent: the line starts at its own indent, wrapped continuations two columns deeper. */}
                <span
                  className="min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere]"
                  style={{ paddingLeft: `${indent + 2}ch`, textIndent: '-2ch' }}
                >
                  {code || ' '}
                  {comment && <span className="font-normal text-muted-foreground">{`  ${comment}`}</span>}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
