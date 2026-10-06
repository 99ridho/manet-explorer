// Single source of truth for navigation and routes (SPEC.md §7.4). Registry order is week order.
import type { TopicModule } from '@/types/step-engine'
import { multihop } from './multihop'
import { proactiveRouting } from './proactive-routing'
import { reactiveRouting } from './reactive-routing'
import { broadcast } from './broadcast'
import { geographicRouting } from './geographic-routing'
import { clustering } from './clustering'
import { addressAllocation } from './address-allocation'
import { mobility } from './mobility'
import { evaluation } from './evaluation'

// Cast: each module is strongly typed internally; the registry erases those params.
export const topics: TopicModule[] = [
  multihop as unknown as TopicModule,
  proactiveRouting as unknown as TopicModule,
  reactiveRouting as unknown as TopicModule,
  broadcast as unknown as TopicModule,
  geographicRouting as unknown as TopicModule,
  clustering as unknown as TopicModule,
  addressAllocation as unknown as TopicModule,
  mobility as unknown as TopicModule,
  evaluation as unknown as TopicModule,
]

export function getTopic(slug: string | undefined): TopicModule | undefined {
  return topics.find((t) => t.slug === slug)
}

/** Groups topics by their weekLabel, preserving registry order. */
export function topicsByWeek(): { weekLabel: string; topics: TopicModule[] }[] {
  const groups: { weekLabel: string; topics: TopicModule[] }[] = []
  for (const topic of topics) {
    const group = groups.find((g) => g.weekLabel === topic.weekLabel)
    if (group) group.topics.push(topic)
    else groups.push({ weekLabel: topic.weekLabel, topics: [topic] })
  }
  return groups
}
