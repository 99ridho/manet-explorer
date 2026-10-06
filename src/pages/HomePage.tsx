import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { caseStudies } from '@/case-studies/registry'
import { topicsByWeek } from '@/topics/registry'
import type { TopicModule } from '@/types/step-engine'

// Variant-scoped operations share a label (Discover route for AODV and for DSR), so count the labels a student sees.
function operationSummary(topic: TopicModule): string {
  const labels = [...new Set(topic.operations.map((o) => o.label))]
  return labels.join(', ')
}

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">MANET Interactive Explorer</h1>
        <p className="max-w-prose text-muted-foreground">
          Run the mobile ad hoc network mechanisms from Weeks 1–8 of the course on small networks, one step at a time.
          Each step highlights a line of pseudocode and names the node or message it concerns; scrub back and forth to see
          how routes and tables change.
        </p>
        <p className="max-w-prose">
          New to ad hoc networks?{' '}
          <Link to="/start" className="font-medium text-primary underline underline-offset-4">
            Read Start here first
          </Link>
          : what a MANET is, the words every page uses, and a four-phone example to click through.
        </p>
        <p className="max-w-prose text-sm text-muted-foreground">
          This is a teaching aid, not a network simulator: the project weeks still use ns-3, OMNeT++, or another simulator.
        </p>
      </section>

      {topicsByWeek().map((group) => (
        <section key={group.weekLabel} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">{group.weekLabel}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.topics.map((topic) => (
              <Link key={topic.slug} to={`/topic/${topic.slug}`} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full transition-colors group-hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <Badge variant="outline" className="font-mono">
                        {topic.weekLabel}
                      </Badge>
                    </div>
                    <CardDescription>{operationSummary(topic)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {caseStudies.length > 0 && (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Case Studies</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Each case study takes one scenario, explains which mechanisms fit it and why, runs the solution next to a naive
          one on the same network, and ends with a short quiz.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {caseStudies.map((cs) => (
            <Link key={cs.slug} to={`/case-study/${cs.slug}`} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{cs.title}</CardTitle>
                    <Badge variant="outline" className="font-mono">
                      {cs.weekLabel}
                    </Badge>
                  </div>
                  <CardDescription>{cs.summary}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
