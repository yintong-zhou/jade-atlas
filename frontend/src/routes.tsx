import type { RouteObject } from 'react-router'
import { AboutPage } from './modules/public/about/AboutPage'
import { CvPage } from './modules/public/cv/CvPage'
import { HomePage } from './modules/public/home/HomePage'
import { NotFoundPage } from './modules/public/NotFoundPage'
import { ProjectPage } from './modules/public/projects/ProjectPage'
import { ProjectsPage } from './modules/public/projects/ProjectsPage'
import { PublicLayout } from './modules/public/PublicLayout'

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/projects/:slug', element: <ProjectPage /> },
      { path: '/cv', element: <CvPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
