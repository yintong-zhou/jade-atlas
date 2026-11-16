import { expect, it } from 'vitest'
import { texts } from './texts'

it('carries the exact Home numbers from PROFILE.md', () => {
  expect(texts.home.numbers.map((n) => `${n.value}${n.suffix} ${n.label}`)).toEqual([
    '8+ years building enterprise apps',
    '38 web apps migrated',
    '10+ apps moved to Single Sign-On',
  ])
})
