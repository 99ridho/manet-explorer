// SPEC.md §19.0: case studies in week order. Each simulator is a TopicModule kept out of `topics`.
// None is built yet (SPEC §15), so the sidebar and home page hide the group while this is empty.
import type { CaseStudyModule } from '@/types/case-study'

export const caseStudies: CaseStudyModule[] = []

export function getCaseStudy(slug: string | undefined): CaseStudyModule | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
