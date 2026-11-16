import { expect, it } from 'vitest'
import { texts } from './texts'
import { sampleData } from './api/sampleData'

// Generic on purpose: the test must not contain the private values it guards against.
it('keeps phone numbers and street addresses out of sample content and site copy', () => {
  const phone = /\+\d{2}|\b\d{3}[\s.-]\d{3,4}[\s.-]\d{3,4}\b|\b\d{9,}\b/
  const street = /\b(?:via|viale|piazza|corso|largo)\s+[A-Z]/
  const content = JSON.stringify({ sampleData, texts })
  expect(content).not.toMatch(phone)
  expect(content).not.toMatch(street)
})

it('carries the exact Home numbers from PROFILE.md', () => {
  expect(texts.home.numbers.map((n) => `${n.value}${n.suffix} ${n.label}`)).toEqual([
    '8+ years building enterprise apps',
    '38 web apps migrated',
    '10+ apps moved to Single Sign-On',
  ])
})
