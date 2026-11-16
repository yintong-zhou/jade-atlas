import type { Project } from '../shared/api/types'

export const full: Project = {
  slug: 'full-project',
  title: 'Full project',
  summary: 'A project with every field.',
  description: 'First paragraph.\n\nSecond paragraph.',
  technologies: ['C#', 'Oracle'],
  repoUrl: 'https://github.com/example/full',
  siteUrl: 'https://full.example.com',
  coverImageUrl: '/cover.png',
}

export const bare: Project = {
  slug: 'bare-project',
  title: 'Averyveryverylongprojecttitlewithoutanyspaces',
  summary: 'A project with no optional data.',
  description: 'Only a description.',
  technologies: [],
  repoUrl: null,
  siteUrl: null,
  coverImageUrl: null,
}
