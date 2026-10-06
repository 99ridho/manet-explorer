// SPEC.md §19.0: case studies in week order. Each simulator is a TopicModule kept out of `topics`.
import type { CaseStudyModule } from '@/types/case-study'
import { reliefCamp } from './relief-camp'
import { sarSlope } from './sar-slope'

// Cast: each module is strongly typed internally; the registry erases the snapshot param.
export const caseStudies: CaseStudyModule[] = [
  sarSlope as unknown as CaseStudyModule,
  reliefCamp as unknown as CaseStudyModule,
]

export function getCaseStudy(slug: string | undefined): CaseStudyModule | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
