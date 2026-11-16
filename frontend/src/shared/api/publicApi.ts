import type { Education, Experience, Project, PublicContent, Skill } from './types'
import { githubProjects } from './github'

// ponytail: career sample data in dev, empty in production. Replace with fetch('/api/public/...') when the API exists.
async function content(): Promise<PublicContent | null> {
  if (import.meta.env.DEV) {
    const { sampleData } = await import('./sampleData')
    return sampleData
  }
  return null
}

export const publicApi = {
  async getProjects(): Promise<Project[]> {
    return githubProjects()
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
