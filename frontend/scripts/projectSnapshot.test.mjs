import { afterEach, describe, expect, it, vi } from 'vitest'
import { collectProjects, parseExternalRepos } from './projectSnapshot.mjs'
import { logoFileName } from './projectLogo.mjs'

const owner = 'yintong-zhou'
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(20)])

const apiRepo = (fullName, overrides = {}) => ({
  name: fullName.split('/')[1], full_name: fullName, private: false, description: 'A description', language: 'C#',
  topics: ['topic'], html_url: `https://github.com/${fullName}`, homepage: '', fork: false, archived: false,
  pushed_at: '2026-01-01T00:00:00Z', ...overrides,
})

const reply = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  arrayBuffer: async () => (Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))),
})

// A fake GitHub API: `routes` maps an exact request path to a body or { status }. Everything else is a 404.
function fakeGithub(routes) {
  const calls = []
  const github = async (path) => {
    calls.push(path)
    const route = routes[path]
    if (route === undefined) return reply({}, 404)
    return route.status ? reply({}, route.status) : reply(route)
  }
  return { github, calls }
}

const list = `/users/${owner}/repos?type=owner&sort=pushed&per_page=100`
const tree = (owned) => `/repos/${owned}/git/trees/HEAD?recursive=1`
const blobPath = (fullName, sha) => `/repos/${fullName}/git/blobs/${sha}`
const withLogo = (fullName, sha = 'sha1') => ({
  [tree(fullName)]: { tree: [{ type: 'blob', path: 'logo.png', size: 100, sha }], truncated: false },
  [blobPath(fullName, sha)]: png,
})

const collect = (routes, external = []) => {
  const fake = fakeGithub(routes)
  return { fake, result: collectProjects({ github: fake.github, owner, external: parseExternalRepos(external) }) }
}

afterEach(() => vi.restoreAllMocks())

describe('parseExternalRepos', () => {
  it('accepts owner/repo entries and keeps their order', () => {
    expect(parseExternalRepos(['ICPN/subsmate', 'acme/web.app_2'])).toEqual([
      { owner: 'ICPN', name: 'subsmate' }, { owner: 'acme', name: 'web.app_2' },
    ])
    expect(parseExternalRepos([])).toEqual([])
  })

  it('merges entries that differ only by letter case, keeping the first', () => {
    expect(parseExternalRepos(['ICPN/subsmate', 'icpn/SubsMate'])).toEqual([{ owner: 'ICPN', name: 'subsmate' }])
  })

  it.each([
    'subsmate', 'a/b/c', 'ICPN/', '/subsmate', 'https://github.com/ICPN/subsmate', 'github.com/ICPN/subsmate',
    'ICPN/sub smate', ' ICPN/subsmate', 'ICPN/subsmate ', '-icpn/x', 'icpn-/x', 'ic--pn/x', 'ICPN/..', 'ICPN/.',
    'ICPN/sub?smate', 'IC_PN/x', '', 'a'.repeat(40) + '/x', 'ICPN/' + 'a'.repeat(101),
  ])('rejects the entry %j with a message that names it', (entry) => {
    expect(() => parseExternalRepos([entry])).toThrow(/external-projects\.json/)
    expect(() => parseExternalRepos([entry])).toThrow(JSON.stringify(entry))
  })

  it.each([[null], [undefined], ['ICPN/subsmate'], [{}], [[42]], [[null]], [[{ owner: 'a', name: 'b' }]]])(
    'rejects %j: it must be an array of strings',
    (config) => {
      expect(() => parseExternalRepos(config)).toThrow(/external-projects\.json/)
    },
  )
})

describe('logo identity', () => {
  it('keeps the plain name for the owner and qualifies other owners', () => {
    expect(logoFileName('ark', 'png')).toBe('ark.png')
    expect(logoFileName('subsmate', 'png', 'ICPN')).toBe('icpn--subsmate.png')
    expect(logoFileName('subsmate', 'ico', 'icpn')).toBe('icpn--subsmate.ico')
  })

  it.each(['', '-a', 'a-', 'a--b', 'a/b', 'a b', 'é'])('rejects the owner %j', (qualifier) => {
    expect(logoFileName('subsmate', 'png', qualifier)).toBeNull()
  })
})

describe('metadata mapping', () => {
  it('maps an external repository to the snapshot shape, with its own owner in every lookup', async () => {
    const subsmate = apiRepo('ICPN/subsmate', { description: 'Track subscriptions', language: 'TypeScript', topics: ['a', 'b'], homepage: 'https://subsmate.example' })
    const { fake, result } = collect({ [list]: [], '/repos/ICPN/subsmate': subsmate, ...withLogo('ICPN/subsmate') }, ['ICPN/subsmate'])
    const { repos, logos } = await result
    expect(repos).toEqual([
      {
        name: 'subsmate', full_name: 'ICPN/subsmate', description: 'Track subscriptions', language: 'TypeScript', topics: ['a', 'b'],
        html_url: 'https://github.com/ICPN/subsmate', homepage: 'https://subsmate.example', logo: '/project-logos/icpn--subsmate.png',
        fork: false, archived: false,
      },
    ])
    expect([...logos.keys()]).toEqual(['icpn--subsmate.png'])
    expect(logos.get('icpn--subsmate.png')).toEqual(png)
    expect(fake.calls).toEqual([list, '/repos/ICPN/subsmate', tree('ICPN/subsmate'), blobPath('ICPN/subsmate', 'sha1')])
  })

  it('uses the canonical full_name returned by GitHub, not the spelling in the configuration', async () => {
    const { fake, result } = collect({ [list]: [], '/repos/icpn/subsmate': apiRepo('ICPN/subsmate'), ...withLogo('ICPN/subsmate') }, ['icpn/subsmate'])
    const { repos } = await result
    expect(repos[0].full_name).toBe('ICPN/subsmate')
    expect(fake.calls).toContain(tree('ICPN/subsmate'))
  })

  it('maps owned repositories too, with their full name and a plain logo file name', async () => {
    const { result } = collect({ [list]: [apiRepo('yintong-zhou/ark')], ...withLogo('yintong-zhou/ark') })
    const { repos, logos } = await result
    expect(repos[0]).toMatchObject({ name: 'ark', full_name: 'yintong-zhou/ark', logo: '/project-logos/ark.png' })
    expect([...logos.keys()]).toEqual(['ark.png'])
  })

  it('writes only the fields the site uses', async () => {
    const { result } = collect({ [list]: [apiRepo('yintong-zhou/ark', { owner: { login: 'x' }, node_id: 'secret', permissions: { admin: true } })] })
    expect(Object.keys((await result).repos[0]).sort()).toEqual(
      ['archived', 'description', 'fork', 'full_name', 'homepage', 'html_url', 'language', 'logo', 'name', 'topics'],
    )
  })

  it('has no logo when the repository has none', async () => {
    const { result } = collect({ [list]: [apiRepo('yintong-zhou/ark')], [tree('yintong-zhou/ark')]: { tree: [], truncated: false } })
    expect((await result).repos[0].logo).toBeNull()
  })
})

describe('private repositories', () => {
  it('never enter the snapshot, are not looked up for a logo and are not logged', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const secret = apiRepo('ICPN/hidden', { private: true, description: 'secret-description', topics: ['secret-topic'], html_url: 'https://github.com/ICPN/secret-url' })
    const { fake, result } = collect({ [list]: [], '/repos/ICPN/hidden': secret, ...withLogo('ICPN/hidden') }, ['ICPN/hidden'])
    const { repos, logos } = await result
    expect(repos).toEqual([])
    expect(logos.size).toBe(0)
    expect(fake.calls.filter((path) => path.includes('/git/'))).toEqual([])
    const output = JSON.stringify([...warn.mock.calls, ...log.mock.calls])
    for (const leaked of ['secret-description', 'secret-topic', 'secret-url']) expect(output).not.toContain(leaked)
  })

  it('treats a repository without an explicit private: false as private', async () => {
    const noFlag = apiRepo('ICPN/unknown')
    delete noFlag.private
    const { result } = collect({ [list]: [], '/repos/ICPN/unknown': noFlag }, ['ICPN/unknown'])
    expect((await result).repos).toEqual([])
  })

  it('are excluded from the owner list too, even if GitHub returned them', async () => {
    const { fake, result } = collect({ [list]: [apiRepo('yintong-zhou/mine'), apiRepo('yintong-zhou/secret', { private: true })] })
    expect((await result).repos.map((r) => r.name)).toEqual(['mine'])
    expect(fake.calls.some((path) => path.includes('secret'))).toBe(false)
  })
})

describe('duplicates and same-name repositories', () => {
  it('keeps the owned repository when an external entry is the same repository', async () => {
    const { fake, result } = collect({ [list]: [apiRepo('yintong-zhou/ark')], '/repos/Yintong-Zhou/Ark': apiRepo('yintong-zhou/ark') }, ['Yintong-Zhou/Ark'])
    const { repos } = await result
    expect(repos.map((r) => r.full_name)).toEqual(['yintong-zhou/ark'])
    expect(fake.calls.filter((path) => path.includes('/git/trees/'))).toHaveLength(1)
  })

  it('keeps an external repository with the same name as an owned one, with separate logo files', async () => {
    const routes = {
      [list]: [apiRepo('yintong-zhou/subsmate', { pushed_at: '2026-02-01T00:00:00Z' })],
      '/repos/ICPN/subsmate': apiRepo('ICPN/subsmate', { pushed_at: '2026-01-01T00:00:00Z' }),
      ...withLogo('yintong-zhou/subsmate', 'own'), ...withLogo('ICPN/subsmate', 'ext'),
    }
    const { fake, result } = collect(routes, ['ICPN/subsmate'])
    const { repos, logos } = await result
    expect(repos.map((r) => [r.full_name, r.logo])).toEqual([
      ['yintong-zhou/subsmate', '/project-logos/subsmate.png'],
      ['ICPN/subsmate', '/project-logos/icpn--subsmate.png'],
    ])
    expect([...logos.keys()].sort()).toEqual(['icpn--subsmate.png', 'subsmate.png'])
    expect(fake.calls).toContain(tree('yintong-zhou/subsmate'))
    expect(fake.calls).toContain(tree('ICPN/subsmate'))
  })

  it('throws instead of overwriting when two repositories would share a logo file', async () => {
    const routes = {
      [list]: [apiRepo('yintong-zhou/icpn--subsmate')], '/repos/ICPN/subsmate': apiRepo('ICPN/subsmate'),
      ...withLogo('yintong-zhou/icpn--subsmate'), ...withLogo('ICPN/subsmate'),
    }
    await expect(collect(routes, ['ICPN/subsmate']).result).rejects.toThrow(/icpn--subsmate\.png/)
  })
})

describe('filters', () => {
  it('looks up no logo for forks, archived repositories and profile repositories', async () => {
    const routes = {
      [list]: [
        apiRepo('yintong-zhou/forked', { fork: true }), apiRepo('yintong-zhou/old', { archived: true }),
        apiRepo('yintong-zhou/yintong-zhou'), apiRepo('yintong-zhou/yintong-zhou.github.io'),
      ],
      '/repos/ICPN/icpn': apiRepo('ICPN/icpn'), '/repos/ICPN/icpn.github.io': apiRepo('ICPN/icpn.github.io'),
      '/repos/ICPN/forked': apiRepo('ICPN/forked', { fork: true }),
    }
    const { fake, result } = collect(routes, ['ICPN/icpn', 'ICPN/icpn.github.io', 'ICPN/forked'])
    const { repos } = await result
    expect(repos).toHaveLength(7) // the filters only skip logo lookups here; the site hides these entries
    expect(repos.every((r) => r.logo === null)).toBe(true)
    expect(fake.calls.filter((path) => path.includes('/git/'))).toEqual([])
  })

  it('does not exclude an external repository that is named like the owner profile', async () => {
    const routes = { [list]: [], '/repos/acme/yintong-zhou': apiRepo('acme/yintong-zhou'), ...withLogo('acme/yintong-zhou') }
    const { repos } = await collect(routes, ['acme/yintong-zhou']).result
    expect(repos[0].logo).toBe('/project-logos/acme--yintong-zhou.png')
  })
})

describe('ordering', () => {
  it('sorts by last push, newest first, then by full name; unpushed repositories go last', async () => {
    const routes = {
      [list]: [
        apiRepo('yintong-zhou/b', { pushed_at: '2026-03-01T00:00:00Z' }), apiRepo('yintong-zhou/old', { pushed_at: '2025-01-01T00:00:00Z' }),
        apiRepo('yintong-zhou/empty', { pushed_at: null }),
      ],
      '/repos/ICPN/new': apiRepo('ICPN/new', { pushed_at: '2026-04-01T00:00:00Z' }),
      '/repos/Acme/same': apiRepo('Acme/same', { pushed_at: '2026-03-01T00:00:00Z' }),
    }
    const { repos } = await collect(routes, ['Acme/same', 'ICPN/new']).result
    expect(repos.map((r) => r.full_name)).toEqual(['ICPN/new', 'Acme/same', 'yintong-zhou/b', 'yintong-zhou/old', 'yintong-zhou/empty'])
  })

  it('does not depend on the order of the configuration', async () => {
    const routes = { [list]: [], '/repos/A/x': apiRepo('A/x'), '/repos/B/x': apiRepo('B/x') }
    const one = await collect(routes, ['A/x', 'B/x']).result
    const two = await collect(routes, ['B/x', 'A/x']).result
    expect(one.repos).toEqual(two.repos)
  })
})

describe('failures abort the whole run', () => {
  it.each([403, 429, 500])('rejects when the owner list answers %i', async (status) => {
    await expect(collect({ [list]: { status } }).result).rejects.toThrow(String(status))
  })

  it('rejects when the owner list is not an array', async () => {
    await expect(collect({ [list]: { message: 'oops' } }).result).rejects.toThrow(/unexpected/)
  })

  it('rejects when a configured repository is not found, naming the entry', async () => {
    await expect(collect({ [list]: [] }, ['ICPN/subsmate']).result).rejects.toThrow('ICPN/subsmate')
  })

  it.each([403, 429, 500])('rejects when a configured repository answers %i', async (status) => {
    await expect(collect({ [list]: [], '/repos/ICPN/subsmate': { status } }, ['ICPN/subsmate']).result).rejects.toThrow(String(status))
  })

  it.each([403, 500])('rejects when the file list answers %i', async (status) => {
    await expect(collect({ [list]: [apiRepo('yintong-zhou/ark')], [tree('yintong-zhou/ark')]: { status } }).result).rejects.toThrow(String(status))
  })

  it('rejects when the logo download fails', async () => {
    const routes = { [list]: [apiRepo('yintong-zhou/ark')], [tree('yintong-zhou/ark')]: withLogo('yintong-zhou/ark')[tree('yintong-zhou/ark')], [blobPath('yintong-zhou/ark', 'sha1')]: { status: 502 } }
    await expect(collect(routes).result).rejects.toThrow('502')
  })

  it('treats a missing or empty repository as having no logo, not as a failure', async () => {
    for (const status of [404, 409]) {
      const { result } = collect({ [list]: [apiRepo('yintong-zhou/ark')], [tree('yintong-zhou/ark')]: { status } })
      expect((await result).repos[0].logo).toBeNull()
    }
  })

})
