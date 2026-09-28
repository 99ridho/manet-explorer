// Single source of truth for navigation and routes (SPEC.md §7.4). Registry order is week order.
import type { TopicModule } from '@/types/step-engine'
import { multihop } from './multihop'
import { reactiveRouting } from './reactive-routing'

// Cast: each module is strongly typed internally; the registry erases those params.
export const topics: TopicModule[] = [multihop as unknown as TopicModule, reactiveRouting as unknown as TopicModule]

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
