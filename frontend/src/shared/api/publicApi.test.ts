import { expect, it } from 'vitest'
import { githubProjects } from './github'
import { publicApi } from './publicApi'

it('returns snapshot projects', async () => {
  expect(await publicApi.getProjects()).toEqual(githubProjects())
})

it('serves the static career content', async () => {
  expect((await publicApi.getExperiences()).some((e) => e.endDate === null)).toBe(true)
  expect((await publicApi.getSkills()).some((s) => s.category === 'Programming languages')).toBe(true)
  const types = (await publicApi.getEducation()).map((e) => e.type)
  expect(types).toContain('education')
  expect(types).toContain('certification')
})
