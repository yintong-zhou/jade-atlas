import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { githubProjects, isListed, listProjects, toProject, type GithubRepo } from './github'
import repos from './githubRepos.json'

const repo: GithubRepo = {
  name: 'NZT-48', description: 'A project', language: 'TypeScript', topics: ['react'],
  html_url: 'https://github.com/yintong-zhou/NZT-48', homepage: null, logo: null,
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

  it("excludes the profile and GitHub Pages repository of the repository's own owner", () => {
    for (const name of ['yintong-zhou', 'yintong-zhou.github.io'])
      expect(isListed({ ...repo, name, full_name: `yintong-zhou/${name}` })).toBe(false)
    for (const name of ['icpn', 'ICPN.github.io'])
      expect(isListed({ ...repo, name, full_name: `ICPN/${name}` })).toBe(false)
  })

  it("does not exclude another owner's repository that is named like the site owner", () => {
    for (const name of ['yintong-zhou', 'yintong-zhou.github.io'])
      expect(isListed({ ...repo, name, full_name: `acme/${name}` })).toBe(true)
  })

  it('applies the fork and archived filters to external repositories as well', () => {
    expect(isListed({ ...repo, name: 'subsmate', full_name: 'ICPN/subsmate' })).toBe(true)
    expect(isListed({ ...repo, name: 'subsmate', full_name: 'ICPN/subsmate', fork: true })).toBe(false)
    expect(isListed({ ...repo, name: 'subsmate', full_name: 'ICPN/subsmate', archived: true })).toBe(false)
  })
})

describe('toProject', () => {
  it('keeps the plain name as the slug for the site owner, with or without full_name', () => {
    expect(toProject(repo).slug).toBe('NZT-48')
    expect(toProject({ ...repo, full_name: 'yintong-zhou/NZT-48' }).slug).toBe('NZT-48')
    expect(toProject({ ...repo, full_name: 'Yintong-Zhou/NZT-48' }).slug).toBe('NZT-48')
  })

  it("qualifies the slug of another owner's repository, so same-name repositories stay distinct", () => {
    const external = toProject({ ...repo, name: 'subsmate', full_name: 'ICPN/subsmate' })
    expect(external).toMatchObject({ slug: 'icpn/subsmate', title: 'subsmate' })
    expect(toProject({ ...repo, name: 'subsmate', full_name: 'icpn/Subsmate' }).slug).toBe('icpn/subsmate')
    expect(toProject({ ...repo, name: 'subsmate', full_name: 'yintong-zhou/subsmate' }).slug).toBe('subsmate')
  })

  it('maps repository fields and preserves name casing', () => {
    expect(toProject(repo)).toEqual({
      slug: 'NZT-48', title: 'NZT-48', summary: 'A project',
      technologies: ['react'], repoUrl: repo.html_url,
      siteUrl: null, logoUrl: null,
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

  it('keeps the repository URL only when it is http(s)', () => {
    expect(toProject({ ...repo, html_url: 'javascript:alert(1)' }).repoUrl).toBeNull()
    expect(toProject({ ...repo, html_url: '' }).repoUrl).toBeNull()
  })

  it('uses the GitHub topics as tags: trimmed, deduplicated, without blanks, at most six', () => {
    expect(toProject({ ...repo, topics: ['react', ' react ', '', '  ', 'vite', 'api', 'web', 'css', 'html', 'node'] }).technologies)
      .toEqual(['react', 'vite', 'api', 'web', 'css', 'html'])
  })

  it('does not turn the language into a tag', () => {
    expect(toProject({ ...repo, language: 'C#', topics: [] }).technologies).toEqual([])
  })

  it('handles missing and blank descriptions', () => {
    expect(toProject({ ...repo, description: null }).summary).toBe('')
    expect(toProject({ ...repo, description: '  ' }).summary).toBe('')
    expect(toProject({ ...repo, description: ' Trimmed ' }).summary).toBe('Trimmed')
  })

  it.each([
    ['/project-logos/ilovestock.png', '/project-logos/ilovestock.png'],
    ['/project-logos/my-app_2.svg', '/project-logos/my-app_2.svg'],
    ['/project-logos/x.webp', '/project-logos/x.webp'],
    ['/project-logos/ark.ico', '/project-logos/ark.ico'],
    ['https://github.com/yintong-zhou.png', null],
    ['https://raw.githubusercontent.com/o/r/main/logo.png', null],
    ['//evil.example/logo.png', null],
    ['/project-logos/../secret.png', null],
    ['/project-logos/sub/logo.png', null],
    ['/project-logos/logo.gif', null],
    ['/project-logos/logo.jpg', null],
    ['/other/logo.png', null],
    ['', null], [null, null], [undefined, null],
  ])('accepts only a local snapshot logo path: %s', (logo, expected) => {
    expect(toProject({ ...repo, logo }).logoUrl).toBe(expected)
  })

  it('treats a snapshot entry without the logo field as having no logo', () => {
    const old: GithubRepo = { ...repo }
    delete old.logo
    expect(toProject(old).logoUrl).toBeNull()
  })
})

describe('listProjects', () => {
  const sub: GithubRepo = { ...repo, name: 'subsmate', full_name: 'ICPN/subsmate' }

  it('keeps the order of the snapshot and drops excluded repositories', () => {
    const own = { ...repo, name: 'ark', full_name: 'yintong-zhou/ark' }
    expect(listProjects([sub, { ...own, fork: true }, own]).map((p) => p.slug)).toEqual(['icpn/subsmate', 'ark'])
  })

  it('lists a repository once, whatever the letter case of its full name, keeping the first', () => {
    const copy = { ...sub, full_name: 'icpn/SubSmate', description: 'later copy' }
    const projects = listProjects([sub, copy])
    expect(projects).toHaveLength(1)
    expect(projects[0].summary).toBe('A project')
  })

  it('keeps an external repository next to an owned one with the same name', () => {
    const own = { ...repo, name: 'subsmate', full_name: 'yintong-zhou/subsmate' }
    expect(listProjects([own, sub]).map((p) => p.slug)).toEqual(['subsmate', 'icpn/subsmate'])
  })

  it('keeps entries of an older snapshot without full_name, by name', () => {
    expect(listProjects([repo, { ...repo }]).map((p) => p.slug)).toEqual(['NZT-48'])
  })
})

describe('githubProjects', () => {
  it('returns only listed snapshot repositories in JSON order', () => {
    const listed = repos.filter((repo) => {
      const [fullOwner, name] = repo.full_name.toLowerCase().split('/')
      return !repo.fork && !repo.archived && name !== fullOwner && name !== `${fullOwner}.github.io`
    })
    expect(listed.length).toBeGreaterThan(0)
    expect(githubProjects()).toEqual(listed.map(toProject))
  })

  it('has a unique slug and a unique logo file for every project', () => {
    const projects = githubProjects()
    const slugs = projects.map((p) => p.slug.toLowerCase())
    expect(new Set(slugs).size).toBe(slugs.length)
    const logos = projects.flatMap((p) => (p.logoUrl ? [p.logoUrl.toLowerCase()] : []))
    expect(new Set(logos).size).toBe(logos.length)
  })

  it('has a full_name for every snapshot entry, unique ignoring letter case', () => {
    const names = repos.map((r) => r.full_name.toLowerCase())
    expect(names.every((n) => /^[a-z0-9-]+\/[a-z0-9._-]+$/.test(n))).toBe(true)
    expect(new Set(names).size).toBe(names.length)
  })

  it('only references logo files that exist in public/project-logos', () => {
    for (const { logoUrl } of githubProjects())
      if (logoUrl) expect(existsSync(resolve(process.cwd(), 'public', logoUrl.slice(1)))).toBe(true)
  })
})
