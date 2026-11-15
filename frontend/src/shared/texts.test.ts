import { expect, it } from 'vitest'
import { texts } from './texts'

it('carries the exact Home numbers from PROFILE.md', () => {
  expect(texts.home.numbers.map((n) => `${n.value}${n.suffix} ${n.label}`)).toEqual([
    '8+ years of experience',
    '38 web apps migrated',
    '10+ applications under Single Sign-On',
  ])
})
