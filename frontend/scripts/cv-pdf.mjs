// Regenerates public/cv/Yintong_Zhou_CV.pdf from the CV preview sheet (its print stylesheet).
// Needs the dev server running (npm run dev) and Chrome or Edge installed.
// Usage: npm run cv:pdf [-- http://127.0.0.1:5173]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const origin = process.argv[2] ?? 'http://127.0.0.1:5173'
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/cv/Yintong_Zhou_CV.pdf')

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
const browser = browsers.find((path) => path && existsSync(path))
if (!browser) throw new Error('Chrome or Edge not found: set CHROME_PATH')

mkdirSync(dirname(out), { recursive: true })
const profile = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
try {
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--user-data-dir=${profile}`,
    '--virtual-time-budget=8000',
    `--print-to-pdf=${out}`,
    `${origin}/about#cv`,
  ])
} finally {
  rmSync(profile, { recursive: true, force: true })
}
console.log(`Wrote ${out}`)
