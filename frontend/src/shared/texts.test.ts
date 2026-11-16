import { expect, it } from 'vitest'
import { texts } from './texts'
import { cvContent } from '../modules/public/about/cvContent'
import { sampleData } from './api/sampleData'

// Generic on purpose: the test must not contain the private values it guards against.
it('keeps phone numbers and street addresses out of sample content and site copy', () => {
  const phone = /\+\d{2}|\b\d{3}[\s.-]\d{3,4}[\s.-]\d{3,4}\b|\b\d{9,}\b/
  const street = /\b(?:via|viale|piazza|corso|largo)\s+[A-Z]/
  const content = JSON.stringify({ sampleData, texts, cvContent })
  expect(content).not.toMatch(phone)
  expect(content).not.toMatch(street)
})
