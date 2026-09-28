// SPEC.md §19.0: a case study page, on the TopicPage layout contract (§6, §12): the simulator on the
// left, Scenario, Reasoning, and Quiz tabs on the right.
import { Link, Navigate, useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DecisionList } from '@/components/case-study/DecisionList'
import { QuizPanel } from '@/components/case-study/QuizPanel'
import { MarkdownContent } from '@/components/MarkdownContent'
import { VisualizerShell } from '@/components/visualizer/VisualizerShell'
import { getCaseStudy } from '@/case-studies/registry'
import { getTopic } from '@/topics/registry'
import type { CaseStudyModule } from '@/types/case-study'

export function CaseStudyPage() {
  const { slug } = useParams()
  const caseStudy = getCaseStudy(slug)

  if (!caseStudy) return <Navigate to="/" replace />

  // key={slug} gives a fresh simulator, tab selection, and quiz when navigating between case studies.
  return <CaseStudyView key={caseStudy.slug} caseStudy={caseStudy} />
}

function CaseStudyView({ caseStudy }: { caseStudy: CaseStudyModule }) {
  const topics = caseStudy.topicSlugs.map(getTopic).filter((t) => t !== undefined)

  return (
    <article className="flex flex-col gap-6 lg:h-[calc(100svh-6.5rem)] lg:overflow-hidden">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{caseStudy.title}</h1>
          <Badge className="font-mono">{caseStudy.weekLabel}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Case study built on{' '}
          {topics.map((t, i) => (
            <span key={t.slug}>
              {i > 0 && (i === topics.length - 1 ? ' and ' : ', ')}
              <Link to={`/topic/${t.slug}`} className="text-primary underline underline-offset-4">
                {t.title}
              </Link>
            </span>
          ))}
          .
        </p>
      </header>

      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="visualizer"
          className="min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto"
        >
          <h2 id="visualizer" className="sr-only">
            Simulator
          </h2>
          <VisualizerShell topic={caseStudy.simulator} />
        </section>

        <section aria-label="Case study materials" className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
          <Tabs defaultValue="scenario" className="lg:min-h-0 lg:flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="scenario" className="flex-1">
                Scenario
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="flex-1">
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1">
                Quiz
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scenario" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <MarkdownContent markdown={caseStudy.content.scenario} />
            </TabsContent>
            <TabsContent value="reasoning" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <DecisionList decisions={caseStudy.decisions} />
              <MarkdownContent markdown={caseStudy.content.reasoning} />
            </TabsContent>
            <TabsContent value="quiz" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <QuizPanel questions={caseStudy.quiz} simulator={caseStudy.simulator} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </article>
  )
}
