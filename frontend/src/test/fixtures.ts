import type { Project } from '../shared/api/types'

export const full: Project = {
  slug: 'full-project',
  title: 'Full project',
  summary: 'A project with every field.',
  technologies: ['C#', 'Oracle'],
  repoUrl: 'https://github.com/example/full',
  siteUrl: 'https://full.example.com/',
  logoUrl: '/project-logos/full-project.png',
}

export const bare: Project = {
  slug: 'bare-project',
  title: 'Averyveryverylongprojecttitlewithoutanyspaces',
  summary: '',
  technologies: [],
  repoUrl: null,
  siteUrl: null,
  logoUrl: null,
}
