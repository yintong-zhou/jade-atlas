/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('lets long URLs and identifiers in any text wrap instead of scrolling the page sideways', () => {
  const css = readFileSync('src/index.css', 'utf8') // vitest runs from frontend/
  expect(css).toMatch(/body\s*\{[^}]*overflow-wrap:\s*anywhere/)
})
