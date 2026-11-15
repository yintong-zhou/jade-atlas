import { texts } from './texts'

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatMonthYear(isoDate: string): string {
  return monthYear.format(new Date(isoDate))
}

export function formatDateRange(startDate: string, endDate: string | null): string {
  return `${formatMonthYear(startDate)} – ${endDate ? formatMonthYear(endDate) : texts.cv.present}`
}

export function groupSkills(skills: { category: string; name: string }[]): { category: string; names: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const { category, name } of skills) groups.set(category, [...(groups.get(category) ?? []), name])
  return [...groups].map(([category, names]) => ({ category, names }))
}
