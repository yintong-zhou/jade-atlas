import repos from './githubRepos.json'
import type { Project } from './types'

// The site owner: their repositories keep their plain name as the slug; other owners' repositories are qualified.
const siteOwner = 'yintong-zhou'

export interface GithubRepo {
  name: string
  full_name?: string // owner/repo; snapshots from before external repositories do not have it
  description: string | null
  language: string | null
  topics: string[]
  html_url: string
  homepage: string | null
  logo?: string | null
  fork: boolean
  archived: boolean
}

function ownerOf(repo: GithubRepo): string {
  return (repo.full_name?.split('/')[0] ?? siteOwner).toLowerCase()
}

// Forks, archived repositories and each owner's own profile and GitHub Pages repository are not projects.
// A repository named like the site owner but belonging to someone else is a normal project.
export function isListed(repo: GithubRepo): boolean {
  const name = repo.name.toLowerCase()
  const owner = ownerOf(repo)
  return !repo.fork && !repo.archived && name !== owner && name !== `${owner}.github.io`
}

function normaliseHttpUrl(input: string | null): string | null {
  const value = input?.trim()
  if (!value) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

// The snapshot script stores logos as /project-logos/<repository>.<ext> (<owner>--<repository>.<ext> for another
// owner's repository), ext being svg, png, webp or ico; anything else is ignored.
function localLogo(logo: string | null | undefined): string | null {
  return logo && /^\/project-logos\/[a-z0-9][a-z0-9._-]*\.(svg|png|webp|ico)$/.test(logo) ? logo : null
}

export function toProject(repo: GithubRepo): Project {
  return {
    slug: ownerOf(repo) === siteOwner ? repo.name : `${ownerOf(repo)}/${repo.name}`,
    title: repo.name,
    summary: repo.description?.trim() ?? '',
    technologies: [...new Set(repo.topics.map((topic) => topic.trim()).filter(Boolean))].slice(0, 6),
    repoUrl: normaliseHttpUrl(repo.html_url),
    siteUrl: normaliseHttpUrl(repo.homepage),
    logoUrl: localLogo(repo.logo),
  }
}

// Keeps the order of the snapshot (the script sorts it by last push). A repository listed twice appears once.
export function listProjects(snapshot: GithubRepo[]): Project[] {
  const seen = new Set<string>()
  return snapshot.filter(isListed).map(toProject).filter(({ slug }) => !seen.has(slug.toLowerCase()) && seen.add(slug.toLowerCase()))
}

export function githubProjects(): Project[] {
  return listProjects(repos)
}
