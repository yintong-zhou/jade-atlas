// Daily snapshot of the owner's public GitHub repos, run by .github/workflows/refresh-projects.yml.
// Writes only the fields the site uses; filtering and mapping live in src/shared/api/github.ts.
// The sources and the logo rules are in projectSnapshot.mjs and projectLogo.mjs. Logos are copied to
// public/project-logos/, so visitors never request anything from GitHub. Everything is fetched first and
// written at the end: a failed GitHub call leaves the previous snapshot and logos untouched.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { collectProjects, parseExternalRepos } from './projectSnapshot.mjs'

const owner = 'yintong-zhou'
const out = new URL('../src/shared/api/githubRepos.json', import.meta.url)
const logoDir = new URL('../public/project-logos/', import.meta.url)
const headers = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }) }

const github = (path, accept) =>
  fetch(`https://api.github.com${path}`, { headers: accept ? { ...headers, Accept: accept } : headers })

const external = parseExternalRepos(JSON.parse(await readFile(new URL('./external-projects.json', import.meta.url), 'utf8')))
const { repos, logos } = await collectProjects({ github, owner, external })

await mkdir(logoDir, { recursive: true })
for (const [file, bytes] of logos) await writeFile(new URL(file, logoDir), bytes)
for (const file of await readdir(logoDir)) if (!logos.has(file)) await rm(new URL(file, logoDir), { force: true })
await writeFile(out, `${JSON.stringify(repos, null, 2)}\n`)
console.log(`Saved ${repos.length} repos and ${logos.size} logos to ${out.pathname}`)
