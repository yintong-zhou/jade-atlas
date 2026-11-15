import { expect, it } from 'vitest'
import { publicApi } from './publicApi'

// Vitest runs with import.meta.env.DEV === true
it('returns sample content in development, every title marked as sample', async () => {
  const projects = await publicApi.getProjects()
  expect(projects).toHaveLength(3)
  expect(projects.every((p) => p.title.startsWith('Sample'))).toBe(true)
  expect((await publicApi.getExperiences()).some((e) => e.endDate === null)).toBe(true)
  expect((await publicApi.getSkills()).some((s) => s.category === 'Languages')).toBe(true)
  const types = (await publicApi.getEducation()).map((e) => e.type)
  expect(types).toContain('education')
  expect(types).toContain('certification')
})

it('finds a project by slug and returns null for an unknown slug', async () => {
  const [first] = await publicApi.getProjects()
  expect(await publicApi.getProject(first.slug)).toEqual(first)
  expect(await publicApi.getProject('unknown-slug')).toBeNull()
})
