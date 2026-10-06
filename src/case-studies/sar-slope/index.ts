import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { sarDecisions } from './decisions'
import { sarQuiz } from './quiz'
import { sarSimulator } from './simulator'
import type { SarSnapshot } from './types'

export const sarSlope: CaseStudyModule<SarSnapshot> = {
  slug: 'sar-slope',
  title: 'SAR team on a slope',
  weekLabel: 'Weeks 1–3',
  summary: 'Get a rescue team’s reports to the base camp over relay radios, without a broadcast storm and knowing which relay is critical.',
  topicSlugs: ['multihop', 'proactive-routing', 'reactive-routing', 'broadcast'],
  content: { scenario, reasoning },
  decisions: sarDecisions,
  simulator: sarSimulator,
  quiz: sarQuiz,
}
