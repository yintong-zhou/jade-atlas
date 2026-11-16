import { describe, expect, it } from 'vitest'
import { githubProjects, isListed, toProject, type GithubRepo } from './github'
import repos from './githubRepos.json'

const repo: GithubRepo = {
  name: 'NZT-48', description: 'A project', language: 'TypeScript', topics: ['react'],
  html_url: 'https://github.com/yintong-zhou/NZT-48', homepage: null,
  fork: false, archived: false,
}

describe('isListed', () => {
  it.each([
    { fork: true }, { archived: true }, { name: 'yintong-zhou' },
    { name: 'YINTONG-ZHOU' }, { name: 'yintong-zhou.github.io' },
    { name: 'Yintong-Zhou.GitHub.io' },
  ])('excludes %o', (overrides) => {
    expect(isListed({ ...repo, ...overrides })).toBe(false)
  })

  it('includes an active original repository', () => {
    expect(isListed(repo)).toBe(true)
  })
})

describe('toProject', () => {
  it('maps repository fields and preserves name casing', () => {
    expect(toProject(repo)).toEqual({
      slug: 'NZT-48', title: 'NZT-48', summary: 'A project', description: '',
      technologies: ['TypeScript', 'react'], repoUrl: repo.html_url,
      siteUrl: null, coverImageUrl: null,
    })
  })

  it.each([
    ['notify-flow-docs.pages.dev', 'https://notify-flow-docs.pages.dev/'],
    [' https://example.com/docs ', 'https://example.com/docs'],
    ['http://example.com', 'http://example.com/'],
    ['', null], ['   ', null], [null, null], ['javascript:alert(1)', null],
    ['ftp://example.com', null], ['https://', null],
  ])('normalises homepage %s', (homepage, expected) => {
    expect(toProject({ ...repo, homepage }).siteUrl).toBe(expected)
  })

  it('deduplicates technologies before capping them at six', () => {
    expect(toProject({ ...repo, topics: ['TypeScript', '', 'react', 'vite', 'api', 'web', 'css', 'html'] }).technologies)
      .toEqual(['TypeScript', 'react', 'vite', 'api', 'web', 'css'])
  })

  it('handles null language and description and empty technologies', () => {
    expect(toProject({ ...repo, description: null, language: null, topics: ['', 'react'] }))
      .toMatchObject({ summary: '', technologies: ['react'] })
    expect(toProject({ ...repo, language: null, topics: [] }).technologies).toEqual([])
  })
})

describe('githubProjects', () => {
  it('returns only listed snapshot repositories in JSON order', () => {
    const listed = repos.filter((repo) => !repo.fork && !repo.archived &&
      !['yintong-zhou', 'yintong-zhou.github.io'].includes(repo.name.toLowerCase()))
    expect(listed.length).toBeGreaterThan(0)
    expect(githubProjects()).toEqual(listed.map(toProject))
  })
})
