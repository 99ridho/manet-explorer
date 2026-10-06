// Renders the verbatim course markdown (content.ts) with theme-aware Tailwind classes.
// No typography plugin so src/index.css stays untouched.
import { Children, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GlossaryText } from '@/components/GlossaryText'
import type { GlossaryClaims } from '@/lib/glossary'

const components: Components = {
  h2: ({ children }) => <h2 className="mt-8 text-xl font-semibold tracking-tight">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-lg font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 font-semibold">{children}</h4>,
  p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-accent bg-muted/50 px-4 py-2 italic">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{children}</pre>,
  hr: () => <hr className="my-6" />,
  // The references quote book tables (Loo Table 2.1). Cells wrap so a 4-column table fits a phone;
  // the wrapper scrolls only a table that still cannot fit, never the page.
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border bg-muted px-3 py-2 text-left align-top font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-3 py-2 text-left align-top">{children}</td>,
}

/** Runs the plain-text children of a block through the glossary; elements such as bold pass through. */
function withGlossary(children: ReactNode, claims: GlossaryClaims, block: number) {
  return Children.map(children, (child, i) =>
    typeof child === 'string' ? <GlossaryText text={child} claims={claims} block={`${block}.${i}`} /> : child,
  )
}

// SPEC.md §20: hand-written scenarios mark glossary terms; the verbatim course references do not.
export function MarkdownContent({ markdown, glossary = false }: { markdown: string; glossary?: boolean }) {
  // One map per render, so each term is marked once in the whole document.
  const claims: GlossaryClaims = new Map()
  const marked: Components = glossary
    ? {
        ...components,
        p: ({ children, node }) => (
          <p className="my-3 leading-relaxed">{withGlossary(children, claims, node?.position?.start.offset ?? 0)}</p>
        ),
        li: ({ children, node }) => (
          <li className="leading-relaxed">{withGlossary(children, claims, node?.position?.start.offset ?? 0)}</li>
        ),
      }
    : components
  return (
    <div className="max-w-prose text-foreground">
      <Markdown remarkPlugins={[remarkGfm]} components={marked}>{markdown}</Markdown>
    </div>
  )
}
