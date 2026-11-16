import { expect, it } from 'vitest'
import { formatDateRange, formatMonthYear, groupSkills } from './format'

it('formats an ISO date as short month and year, independent of the time zone', () => {
  expect(formatMonthYear('2020-03-01')).toBe('Mar 2020')
  expect(formatMonthYear('2019-12-31')).toBe('Dec 2019')
})

it('formats a closed range and an open range', () => {
  expect(formatDateRange('2018-01-15', '2020-03-01')).toBe('Jan 2018 – Mar 2020')
  expect(formatDateRange('2020-04-01', null)).toBe('Apr 2020 – Present')
})

it('groups skills by category keeping first-appearance order', () => {
  expect(
    groupSkills([
      { category: 'Backend', name: 'C#' },
      { category: 'Languages', name: 'Italian' },
      { category: 'Backend', name: 'ASP.NET' },
    ]),
  ).toEqual([
    { category: 'Backend', names: ['C#', 'ASP.NET'] },
    { category: 'Languages', names: ['Italian'] },
  ])
  expect(groupSkills([])).toEqual([])
})
