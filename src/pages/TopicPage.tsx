// SPEC.md §6: generic topic page: visualizer (left) beside the course materials (right, tabbed).
import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownContent } from '@/components/MarkdownContent'
import { ProtocolPanel } from '@/components/ProtocolPanel'
import { VisualizerShell } from '@/components/visualizer/VisualizerShell'
import { getTopic } from '@/topics/registry'
import type { TopicModule } from '@/types/step-engine'

export function TopicPage() {
  const { slug } = useParams()
  const topic = getTopic(slug)

  if (!topic) return <Navigate to="/" replace />

  // key={slug} guarantees a fresh visualizer, tab selection, and variant when navigating between topics.
  return <TopicView key={topic.slug} topic={topic} />
}

function TopicView({ topic }: { topic: TopicModule }) {
  // Mirror of the shell's variant, so the Protocol tab can mark the representation on the canvas.
  const [variant, setVariant] = useState<string | undefined>(topic.variant?.default)

  return (
    // At lg the article is capped to the viewport, so the page never scrolls; the Code
    // listing and the active materials panel scroll on their own.
    <article className="flex flex-col gap-6 lg:h-[calc(100svh-6.5rem)] lg:overflow-hidden">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <Badge className="font-mono">{topic.weekLabel}</Badge>
      </header>

      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* overflow-y-auto only kicks in on viewports too short for canvas + Operation + Playback. */}
        <section
          aria-labelledby="visualizer"
          className="min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto"
        >
          <h2 id="visualizer" className="sr-only">
            Visualizer
          </h2>
          <VisualizerShell topic={topic} onVariantChange={setVariant} />
        </section>

        <section aria-label="Course materials" className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
          <Tabs defaultValue="usage" className="lg:min-h-0 lg:flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="usage" className="flex-1">
                Real-World Usage
              </TabsTrigger>
              <TabsTrigger value="core" className="flex-1">
                Core Material
              </TabsTrigger>
              <TabsTrigger value="protocol" className="flex-1">
                Protocol
              </TabsTrigger>
            </TabsList>
            <TabsContent value="usage" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <MarkdownContent markdown={topic.content.realWorldUsage} />
            </TabsContent>
            <TabsContent value="core" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <MarkdownContent markdown={topic.content.coreMaterial} />
            </TabsContent>
            <TabsContent value="protocol" className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <ProtocolPanel
                structure={topic.structure}
                variant={variant}
                variantConfig={topic.variant}
                operations={topic.operations}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </article>
  )
}
