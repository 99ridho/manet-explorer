// SPEC.md §6: client-only routing. Topic and case study slugs are canonical; week is metadata.
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { TopicPage } from '@/pages/TopicPage'
import { CaseStudyPage } from '@/pages/CaseStudyPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'topic/:slug', Component: TopicPage },
      { path: 'case-study/:slug', Component: CaseStudyPage },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
