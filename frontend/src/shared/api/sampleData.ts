import type { PublicContent } from './types'

// Development only. Never shipped: publicApi imports this file inside an import.meta.env.DEV block.
const cover =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#e8ecf0"/></svg>')

export const sampleData: PublicContent = {
  projects: [
    {
      slug: 'sample-portal',
      title: 'Sample portal',
      summary: 'Sample summary of an enterprise web portal.',
      description: 'Sample description, first paragraph.\n\nSample description, second paragraph.',
      technologies: ['Sample C#', 'Sample Oracle'],
      repoUrl: 'https://github.com/yintong-zhou',
      siteUrl: 'https://example.com',
      coverImageUrl: cover,
    },
    {
      slug: 'sample-sso-integration',
      title: 'Sample Single Sign-On integration with a deliberately long title to test wrapping',
      summary: 'Sample summary of an authentication project.',
      description: 'Sample description of the integration.',
      technologies: ['Sample ASP.NET', 'Sample Averyveryverylongtechnologynamewithoutanyspaces'],
      repoUrl: 'https://github.com/yintong-zhou',
      siteUrl: null,
      coverImageUrl: null,
    },
    {
      slug: 'sample-bare',
      title: 'Sample bare project',
      summary: 'Sample project with no optional data.',
      description: 'Sample description.',
      technologies: [],
      repoUrl: null,
      siteUrl: null,
      coverImageUrl: null,
    },
  ],
  experiences: [
    {
      id: 1,
      role: 'Sample senior developer',
      company: 'Sample company A',
      location: 'Sample city',
      startDate: '2022-04-01',
      endDate: null,
      description: 'Sample achievement one.\nSample achievement two.',
    },
    {
      id: 2,
      role: 'Sample developer',
      company: 'Sample company B',
      location: null,
      startDate: '2019-01-15',
      endDate: '2022-03-31',
      description: 'Sample description of the role.',
    },
    {
      id: 3,
      role: 'Sample junior developer',
      company: 'Sample company C',
      location: 'Sample city',
      startDate: '2017-09-01',
      endDate: '2018-12-31',
      description: 'Sample description of the first role.',
    },
  ],
  skills: [
    { id: 1, category: 'Sample backend', name: 'Sample C#' },
    { id: 2, category: 'Sample backend', name: 'Sample ASP.NET' },
    { id: 3, category: 'Sample data', name: 'Sample Oracle' },
    { id: 4, category: 'Languages', name: 'Sample language' },
  ],
  education: [
    { id: 1, type: 'education', title: 'Sample degree', institution: 'Sample university', year: 2017 },
    { id: 2, type: 'certification', title: 'Sample certification', institution: 'Sample issuer', year: 2021 },
  ],
}
