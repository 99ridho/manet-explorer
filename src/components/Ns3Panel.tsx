// SPEC.md §7.3/§8: the ns-3 tab. The notes, the command for the variant on the canvas, the output that
// command printed, and the script itself. Lines soft-wrap with a hanging indent, so nothing scrolls sideways.
import { useState } from 'react'
import { MarkdownContent } from '@/components/MarkdownContent'
import { Button } from '@/components/ui/button'
import { NS3_RELEASE, runCommand } from '@/lib/ns3'
import type { Ns3Script } from '@/types/ns3'
import type { VariantConfig } from '@/types/step-engine'

interface Ns3PanelProps {
  script: Ns3Script
  variant?: string
  variantConfig?: VariantConfig
}

type CopyState = 'idle' | 'copied' | 'failed'

export function Ns3Panel({ script, variant, variantConfig }: Ns3PanelProps) {
  const [copy, setCopy] = useState<CopyState>('idle')
  const key = script.arg && variant ? variant : 'default'
  const output = script.outputs[key] ?? ''
  const label = script.arg ? variantConfig?.options.find((o) => o.value === variant)?.label : undefined

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(script.source)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
    setTimeout(() => setCopy('idle'), 2000)
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <MarkdownContent markdown={script.notes} />

      <section aria-labelledby="ns3-run" className="flex flex-col gap-2">
        <h3 id="ns3-run" className="text-lg font-semibold">
          Run it
        </h3>
        <p className="leading-relaxed">
          Save the file in the <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">scratch</code> folder
          of an ns-3 release and run it from the ns-3 folder. The output below comes from {NS3_RELEASE}.
        </p>
        <pre className="rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap [overflow-wrap:anywhere]">
          {runCommand(script, variant)}
        </pre>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <a href={`data:text/x-c++src;charset=utf-8,${encodeURIComponent(script.source)}`} download={script.file}>
              Download {script.file}
            </a>
          </Button>
          <Button variant="outline" onClick={copyScript}>
            Copy script
          </Button>
          <span aria-live="polite" className="text-sm text-muted-foreground">
            {copy === 'copied' && 'Copied.'}
            {copy === 'failed' && 'The browser blocked the clipboard, so use Download.'}
          </span>
        </div>
      </section>

      <section aria-labelledby="ns3-output" className="flex flex-col gap-2">
        <h3 id="ns3-output" className="text-lg font-semibold">
          Output{label && `, ${label}`}
        </h3>
        {output ? (
          <pre
            data-ns3-output={key}
            className="rounded-lg border bg-card p-3 font-mono text-xs leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]"
          >
            {output.trimEnd()}
          </pre>
        ) : (
          <p className="text-muted-foreground">No output was captured for this variant.</p>
        )}
      </section>

      <section aria-labelledby="ns3-script" className="flex flex-col gap-2">
        <h3 id="ns3-script" className="text-lg font-semibold">
          {script.file}
        </h3>
        <ol
          tabIndex={0}
          aria-labelledby="ns3-script"
          className="rounded-lg border bg-card p-3 font-mono text-xs leading-5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {script.source.trimEnd().split('\n').map((text, i) => {
            // ns-3 code indents by four spaces; drawing each level at 2ch keeps a narrow card readable.
            const indent = (text.length - text.trimStart().length) / 2
            const at = text.trimStart().startsWith('//') ? text.indexOf('//') : text.indexOf('  //')
            const code = (at >= 0 ? text.slice(0, at) : text).trimStart()
            const comment = at >= 0 ? text.slice(at).trim() : null
            return (
              <li key={i} className="flex gap-2 py-px">
                <span className="w-7 shrink-0 select-none text-right text-muted-foreground">{i + 1}</span>
                <span
                  className="min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere]"
                  style={{ paddingLeft: `${indent + 2}ch`, textIndent: '-2ch' }}
                >
                  {code || (comment ? '' : ' ')}
                  {comment && <span className="text-muted-foreground">{code ? `  ${comment}` : comment}</span>}
                </span>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
