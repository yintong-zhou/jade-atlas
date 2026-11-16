import repos from './githubRepos.json'
import type { Project } from './types'

const owner = 'yintong-zhou'

export interface GithubRepo {
  name: string
  description: string | null
  language: string | null
  topics: string[]
  html_url: string
  homepage: string | null
  fork: boolean
  archived: boolean
}

export function isListed(repo: GithubRepo): boolean {
  const name = repo.name.toLowerCase()
  return !repo.fork && !repo.archived && name !== owner && name !== `${owner}.github.io`
}

function normaliseHomepage(homepage: string | null): string | null {
  const value = homepage?.trim()
  if (!value) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function toProject(repo: GithubRepo): Project {
  return {
    slug: repo.name,
    title: repo.name,
    summary: repo.description ?? '',
    description: '',
    technologies: [...new Set([repo.language, ...repo.topics].filter((value): value is string => !!value?.trim()))].slice(0, 6),
    repoUrl: repo.html_url,
    siteUrl: normaliseHomepage(repo.homepage),
    coverImageUrl: null,
  }
}

export function githubProjects(): Project[] {
  return repos.filter(isListed).map(toProject)
}
