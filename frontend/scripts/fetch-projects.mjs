// Daily snapshot of the owner's public GitHub repos, run by .github/workflows/refresh-projects.yml.
// Writes only the fields the site uses; filtering and mapping live in src/shared/api/github.ts.
import { writeFile } from 'node:fs/promises'

const owner = 'yintong-zhou'
const out = new URL('../src/shared/api/githubRepos.json', import.meta.url)
const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}

// ponytail: one page of up to 100 repos; add pagination if the list grows beyond it.
const res = await fetch(`https://api.github.com/users/${owner}/repos?type=owner&sort=pushed&per_page=100`, { headers })
if (!res.ok) throw new Error(`GitHub request failed with status ${res.status}`)

const repos = (await res.json()).map((r) => ({
  name: r.name,
  description: r.description,
  language: r.language,
  topics: r.topics ?? [],
  html_url: r.html_url,
  homepage: r.homepage,
  fork: r.fork,
  archived: r.archived,
}))

await writeFile(out, JSON.stringify(repos, null, 2) + '\n')
console.log(`Saved ${repos.length} repos to ${out.pathname}`)
