// Builds the GitHub project snapshot (used by fetch-projects.mjs, tested in projectSnapshot.test.mjs).
//
// Sources: every public repository of the site owner, plus the few repositories of other owners that are listed
// by hand in external-projects.json (projects the owner contributed to). There is no automatic discovery.
// Nothing is written here: the caller writes the result only after this function returned, so any GitHub error
// leaves the previous snapshot untouched.
import { isImage, logoExtension, logoFileName, pickLogo } from './projectLogo.mjs'

const OWNER = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i
const REPO = /^[a-z0-9._-]{1,100}$/i
const FULL_NAME = /^([a-z0-9-]+)\/([a-z0-9._-]+)$/i

// config: the parsed external-projects.json, an array of "owner/repo" strings.
// Returns [{ owner, name }] in configuration order, with entries that differ only by letter case merged.
export function parseExternalRepos(config) {
  if (!Array.isArray(config)) throw new Error('external-projects.json must be an array of "owner/repo" strings')
  const seen = new Set()
  const entries = []
  for (const entry of config) {
    const [owner, name, ...rest] = typeof entry === 'string' ? entry.split('/') : []
    if (!owner || !name || rest.length || !OWNER.test(owner) || !REPO.test(name) || name === '.' || name === '..')
      throw new Error(`external-projects.json: ${JSON.stringify(entry)} is not a valid "owner/repo" entry`)
    const key = `${owner}/${name}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({ owner, name })
  }
  return entries
}

// Only an explicit private: false counts as public, so a missing field never leaks a repository.
const isPublic = (r) => r?.private === false && typeof r.full_name === 'string' && FULL_NAME.test(r.full_name)

// The owner's profile repository (<owner>) and GitHub Pages repository (<owner>.github.io), for the repository's own owner.
function isProfileRepo(r) {
  const [owner, name] = r.full_name.toLowerCase().split('/')
  return name === owner || name === `${owner}.github.io`
}

// Same exclusions as isListed in src/shared/api/github.ts: no lookups for repositories the site never shows.
const isShown = (r) => !r.fork && !r.archived && !isProfileRepo(r)

const byRecentPushThenName = (a, b) =>
  (b.pushed_at ?? '').localeCompare(a.pushed_at ?? '') || a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase())

const skip = (message) => (console.warn(message), null)

// Returns { file, bytes } or null when the repository has no usable logo. Throws on GitHub errors.
async function findLogo(github, r, siteOwner) {
  const [owner, name] = r.full_name.split('/')
  const repoPath = `/repos/${r.full_name}`
  const treeRes = await github(`${repoPath}/git/trees/HEAD?recursive=1`)
  if (treeRes.status === 404 || treeRes.status === 409) return null // gone or empty repository
  if (!treeRes.ok) throw new Error(`GitHub tree request for ${r.full_name} failed with status ${treeRes.status}`)
  const { tree, truncated } = await treeRes.json()
  if (truncated) return skip(`${r.full_name}: file list truncated, no logo`)

  const entry = pickLogo(tree, name)
  if (!entry) return skip(`${r.full_name}: no logo, icon or favicon found`)
  const extension = logoExtension(entry.path)
  const qualifier = owner.toLowerCase() === siteOwner.toLowerCase() ? undefined : owner
  const file = logoFileName(name, extension, qualifier)
  if (!file) return skip(`${r.full_name}: ${entry.path} skipped (name is not a plain file name)`)

  const blobRes = await github(`${repoPath}/git/blobs/${entry.sha}`, 'application/vnd.github.raw+json')
  if (!blobRes.ok) throw new Error(`GitHub blob request for ${r.full_name} failed with status ${blobRes.status}`)
  const bytes = Buffer.from(await blobRes.arrayBuffer())
  if (!isImage(bytes, extension)) return skip(`${r.full_name}: ${entry.path} is not a valid image, no logo`)
  console.log(`${r.full_name}: ${entry.path}`)
  return { file, bytes }
}

// github(path, accept?) is a fetch of https://api.github.com{path} that returns a fetch Response.
// Returns { repos, logos }: the snapshot entries and a Map of logo file name -> bytes.
// Order: last push, newest first, then full name (case-insensitive), whatever the source of a repository.
export async function collectProjects({ github, owner, external }) {
  // ponytail: one page of up to 100 repos; add pagination if the list grows beyond it.
  const listRes = await github(`/users/${owner}/repos?type=owner&sort=pushed&per_page=100`)
  if (!listRes.ok) throw new Error(`GitHub request failed with status ${listRes.status}`)
  const list = await listRes.json()
  if (!Array.isArray(list)) throw new Error('GitHub returned an unexpected repository list')

  const found = list.filter(isPublic)
  for (const { owner: o, name } of external) {
    const res = await github(`/repos/${o}/${name}`)
    if (res.status === 404)
      throw new Error(`Configured repository ${o}/${name} was not found (status 404): fix or remove it in external-projects.json`)
    if (!res.ok) throw new Error(`GitHub request for ${o}/${name} failed with status ${res.status}`)
    const r = await res.json()
    if (isPublic(r)) found.push(r)
    else console.warn(`${o}/${name}: not public, skipped`) // nothing else about it is read or logged
  }

  // The site owner's own repositories come first in `found`, so they win a duplicate.
  const seen = new Set()
  const unique = found.filter((r) => !seen.has(r.full_name.toLowerCase()) && seen.add(r.full_name.toLowerCase()))
  unique.sort(byRecentPushThenName)

  const logos = new Map()
  const repos = []
  for (const r of unique) {
    const logo = isShown(r) ? await findLogo(github, r, owner) : null
    if (logo) {
      if (logos.has(logo.file)) throw new Error(`Two repositories would share the logo file ${logo.file}`)
      logos.set(logo.file, logo.bytes)
    }
    repos.push({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      topics: r.topics ?? [],
      html_url: r.html_url,
      homepage: r.homepage,
      logo: logo ? `/project-logos/${logo.file}` : null,
      fork: r.fork,
      archived: r.archived,
    })
  }
  return { repos, logos }
}
