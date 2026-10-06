import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { campDecisions } from './decisions'
import { campQuiz } from './quiz'
import { campSimulator } from './simulator'
import type { CampSnapshot } from './types'

export const reliefCamp: CaseStudyModule<CampSnapshot> = {
  slug: 'relief-camp',
  title: 'Relief camp',
  weekLabel: 'Weeks 4–6',
  summary: 'Give volunteers unique addresses without a server, cluster their radios, and test the camp with movement that looks like it.',
  topicSlugs: ['clustering', 'address-allocation', 'mobility', 'evaluation'],
  content: { scenario, reasoning },
  decisions: campDecisions,
  simulator: campSimulator,
  quiz: campQuiz,
}
