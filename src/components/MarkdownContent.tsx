// Renders the verbatim course markdown (content.ts) with theme-aware Tailwind classes.
// No typography plugin so src/index.css stays untouched.
import Markdown, { type Components } from 'react-markdown'

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
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-prose text-foreground">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  )
}
