import type { Education, Experience, Project, PublicContent, Skill } from './types'

// ponytail: static sample data in dev, empty in production. Replace the bodies with fetch('/api/public/...') when the API exists.
async function content(): Promise<PublicContent | null> {
  if (import.meta.env.DEV) {
    const { sampleData } = await import('./sampleData')
    return sampleData
  }
  return null
}

export const publicApi = {
  async getProjects(): Promise<Project[]> {
    return (await content())?.projects ?? []
  },
  async getProject(slug: string): Promise<Project | null> {
    return (await content())?.projects.find((p) => p.slug === slug) ?? null
  },
  async getExperiences(): Promise<Experience[]> {
    return (await content())?.experiences ?? []
  },
  async getSkills(): Promise<Skill[]> {
    return (await content())?.skills ?? []
  },
  async getEducation(): Promise<Education[]> {
    return (await content())?.education ?? []
  },
}
