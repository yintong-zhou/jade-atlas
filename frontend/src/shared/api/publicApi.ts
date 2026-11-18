import type { Education, Experience, Project, PublicContent, Skill } from './types'
import { githubProjects } from './github'

// ponytail: career content is static (sampleData) until the API exists. Phase 4: replace the body with fetch('/api/public/...').
async function content(): Promise<PublicContent> {
  const { sampleData } = await import('./sampleData')
  return sampleData
}

export const publicApi = {
  async getProjects(): Promise<Project[]> {
    return githubProjects()
  },
  async getExperiences(): Promise<Experience[]> {
    return (await content()).experiences
  },
  async getSkills(): Promise<Skill[]> {
    return (await content()).skills
  },
  async getEducation(): Promise<Education[]> {
    return (await content()).education
  },
}
