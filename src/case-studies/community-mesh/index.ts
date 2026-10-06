import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { meshDecisions } from './decisions'
import { meshQuiz } from './quiz'
import { meshSimulator } from './simulator'
import type { MeshSnapshot } from './types'

export const communityMesh: CaseStudyModule<MeshSnapshot> = {
  slug: 'community-mesh',
  title: 'Community mesh',
  weekLabel: 'Weeks 7–8',
  summary: 'Route a household’s traffic over strong links rather than few ones, and stop trusting a router that drops what it should forward.',
  topicSlugs: ['reactive-routing', 'evaluation', 'qos-routing', 'routing-attacks'],
  content: { scenario, reasoning },
  decisions: meshDecisions,
  simulator: meshSimulator,
  quiz: meshQuiz,
}
