// SPEC.md §19.0 Reasoning tab: one block per requirement, the chosen structure first and the
// rejected ones after it, each with its quoted cost and a link to the topic that teaches it.
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTopic } from '@/topics/registry'
import type { DecisionRow, StructureChoice } from '@/types/case-study'

function Choice({ choice, chosen }: { choice: StructureChoice; chosen: boolean }) {
  const topic = getTopic(choice.topicSlug)
  return (
    <div className={cn('rounded-lg border p-3', chosen ? 'border-foreground/30 bg-card' : 'border-dashed bg-muted/40')}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={chosen ? 'default' : 'outline'}>{chosen ? 'Chosen' : 'Rejected'}</Badge>
        <span className="font-semibold">{choice.name}</span>
      </div>
      <p className="mt-1.5 font-mono text-xs text-muted-foreground">{choice.cost}</p>
      <p className="mt-1.5 text-sm leading-relaxed">{choice.reason}</p>
      {topic && (
        <Link to={`/topic/${topic.slug}`} className="mt-1.5 inline-block text-sm text-primary underline underline-offset-4">
          {topic.title} topic, {topic.weekLabel}
        </Link>
      )}
    </div>
  )
}

export function DecisionList({ decisions }: { decisions: DecisionRow[] }) {
  return (
    <div className="max-w-prose space-y-6">
      {decisions.map((row, i) => (
        <section key={row.requirement} aria-labelledby={`requirement-${i}`} className="space-y-2">
          <h3 id={`requirement-${i}`} className="text-base font-semibold">
            {i + 1}. {row.requirement}
          </h3>
          <Choice choice={row.chosen} chosen />
          {row.rejected.map((choice) => (
            <Choice key={choice.name} choice={choice} chosen={false} />
          ))}
        </section>
      ))}
    </div>
  )
}
