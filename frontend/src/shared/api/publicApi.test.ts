import { expect, it } from 'vitest'
import { githubProjects } from './github'
import { publicApi } from './publicApi'

it('returns snapshot projects', async () => {
  expect(await publicApi.getProjects()).toEqual(githubProjects())
})

// Vitest runs with import.meta.env.DEV === true
it('keeps career sample content in development', async () => {
  expect((await publicApi.getExperiences()).some((e) => e.endDate === null)).toBe(true)
  expect((await publicApi.getSkills()).some((s) => s.category === 'Programming languages')).toBe(true)
  const types = (await publicApi.getEducation()).map((e) => e.type)
  expect(types).toContain('education')
  expect(types).toContain('certification')
})

it('finds an exact project slug and returns null for an unknown slug', async () => {
  const [first] = githubProjects()
  expect(first).toBeDefined()
  expect(await publicApi.getProject(first.slug)).toEqual(first)
  expect(await publicApi.getProject(first.slug.toUpperCase())).toBeNull()
  expect(await publicApi.getProject('unknown-slug')).toBeNull()
})
