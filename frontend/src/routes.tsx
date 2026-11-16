import { Navigate, type RouteObject } from 'react-router'
import { AboutPage } from './modules/public/about/AboutPage'
import { HomePage } from './modules/public/home/HomePage'
import { NotFoundPage } from './modules/public/NotFoundPage'
import { ProjectsPage } from './modules/public/projects/ProjectsPage'
import { PublicLayout } from './modules/public/PublicLayout'

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/cv', element: <Navigate to="/about" replace /> },
      { path: '/about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
