// Hand-written until the API exists; then generated from OpenAPI.
export interface Project {
  slug: string
  title: string
  summary: string
  description: string
  technologies: string[]
  repoUrl: string | null
  siteUrl: string | null
  coverImageUrl: string | null
}

export interface Experience {
  id: number
  role: string
  company: string
  location: string | null
  startDate: string // ISO date
  endDate: string | null // ISO date, null = current
  description: string
}

export interface Skill {
  id: number
  category: string
  name: string
}

export interface Education {
  id: number
  type: 'education' | 'certification'
  title: string
  institution: string
  year: number
}

export interface PublicContent {
  projects: Project[]
  experiences: Experience[]
  skills: Skill[]
  education: Education[]
}
