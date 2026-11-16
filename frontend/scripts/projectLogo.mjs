// Conservative logo discovery for the daily GitHub snapshot (used by fetch-projects.mjs, tested in projectLogo.test.mjs).
//
// A candidate is an svg, png, webp or ico file whose name is made only of known words (see WORDS) plus the
// repository name, at most three folders deep, outside hidden, vendored, build, test, template and demo folders.
// Anything with another word in its name (profile, avatar, claude, opengraph-image...) is never a logo.
//
// Precedence, first difference wins:
//   1. kind: an explicit logo, then an icon (icon, app-icon, apple-touch-icon...), then a favicon;
//   2. a variant made for a light background (light, black) before a neutral one; dark and white variants are never used;
//   3. a plain name before an apple one (apple-icon, apple-touch-icon), which is made for iOS home screens;
//   4. the shallowest folder;
//   5. an unsized file, then the named size (icon-192, icon-32x32, large...) closest to 256px;
//   6. svg, png, webp, ico.
// If the two best candidates still tie and are different files, the choice is ambiguous and there is no logo.
// Files over MAX_LOGO_BYTES and known framework defaults are not candidates, so the next best one is used.

export const MAX_LOGO_BYTES = 512 * 1024

const EXTENSION_RANK = { svg: 0, png: 1, webp: 2, ico: 3 }
const IGNORED_FOLDER =
  /^(\.|node_modules$|vendor$|third[-_]party$|dist$|build$|tests?$|__tests__$|__mocks__$|e2e$|cypress$|fixtures?$|examples?$|samples?$|templates?$|demos?$)/i
const MAX_DEPTH = 3
const PREFERRED_SIZE = 256

const KINDS = { logo: 0, icon: 1, favicon: 2 }
const LIGHT_BACKGROUND = new Set(['light', 'black'])
// Words that may appear in the name of a logo file, besides the repository name and a pixel size.
const WORDS = new Set([
  ...Object.keys(KINDS), 'app', 'apple', 'touch', 'on', 'color', 'colour', 'removebg', 'preview', 'transparent',
  ...LIGHT_BACKGROUND,
])
// Named sizes, in pixels.
const NAMED_SIZE = { xs: 32, sm: 64, small: 64, md: 128, medium: 128, lg: 256, large: 256, xl: 512 }

// Git blob ids of images that are not the project's own mark: the stock icons of project templates, and the
// jade-atlas placeholder. Without this, a repository that never replaced its template icon would show the template's.
export const KNOWN_DEFAULT_ASSETS = new Set([
  'a3a799985c43bc7309d701b2cad129023377dc71', // ASP.NET MVC template favicon.ico
  '6893eb13237060adc0c968a690149a49faa2d7d3', // Vite template favicon.svg
  '5101b674df391399da71c767aa5c976426c9dc7a', // Vite template vite.svg
  '3ceec55e88d35330b47ba3a6fb9a3cfdcd2f6119', // jade-atlas placeholder circle
])

const words = (text) =>
  text
    .toLowerCase()
    .split(/[-_.@\s]+/)
    .flatMap((part) => (/^\d+x\d+$/.test(part) ? part : part.split(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/)))
    .filter(Boolean)

// { kind, light, size } for a file stem, or null when the name is not made only of known words.
function classify(stem, repoName) {
  const repoWords = new Set(words(repoName))
  const found = { kind: Infinity, light: false, apple: false, size: null }
  for (const word of words(stem)) {
    if (repoWords.has(word)) continue
    if (Object.hasOwn(KINDS, word)) found.kind = Math.min(found.kind, KINDS[word])
    else if (LIGHT_BACKGROUND.has(word)) found.light = true
    else if (word === 'apple' || word === 'touch') found.apple = true
    else if (Object.hasOwn(NAMED_SIZE, word)) found.size = NAMED_SIZE[word]
    else if (/^\d+(x\d+)?$/.test(word)) found.size = Number.parseInt(word, 10)
    else if (!WORDS.has(word)) return null
  }
  return found.kind === Infinity ? null : found
}

// entries: the `tree` array of GET /repos/{owner}/{repo}/git/trees/{ref}?recursive=1
export function pickLogo(entries, repoName) {
  const candidates = []
  for (const entry of entries) {
    if (entry.type !== 'blob' || !(entry.size > 0 && entry.size <= MAX_LOGO_BYTES) || KNOWN_DEFAULT_ASSETS.has(entry.sha)) continue
    const parts = entry.path.split('/')
    const folders = parts.slice(0, -1)
    const file = parts.at(-1)
    const dot = file.lastIndexOf('.')
    const extension = file.slice(dot + 1).toLowerCase()
    if (dot < 1 || !Object.hasOwn(EXTENSION_RANK, extension) || folders.length > MAX_DEPTH || folders.some((f) => IGNORED_FOLDER.test(f))) continue
    const name = classify(file.slice(0, dot), repoName)
    if (!name) continue
    // A light-background variant sorts before a neutral one; unsized before sized.
    const size = name.size === null ? 0 : 1 + Math.abs(name.size - PREFERRED_SIZE)
    candidates.push({ entry, rank: [name.kind, name.light ? 0 : 1, name.apple ? 1 : 0, folders.length, size, EXTENSION_RANK[extension]] })
  }
  const compare = (a, b) => {
    for (let i = 0; i < a.rank.length; i++) if (a.rank[i] !== b.rank[i]) return a.rank[i] - b.rank[i]
    return 0
  }
  candidates.sort((a, b) => compare(a, b) || (a.entry.path < b.entry.path ? -1 : 1))
  const [best, next] = candidates
  if (!best) return null
  if (next && compare(best, next) === 0 && best.entry.sha !== next.entry.sha) return null
  return best.entry
}

export function logoExtension(path) {
  return path.split('.').pop().toLowerCase()
}

// GitHub user and organisation names: letters, digits and single hyphens, not at either end.
const OWNER_NAME = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i

// Local file name for a repository logo, or null when a name is not a plain file name. A repository of the site
// owner gets `<repo>.<ext>`; one of another owner passes that owner as `qualifier` and gets `<owner>--<repo>.<ext>`
// (the caller rejects the rare case of an owned repository that is literally named like that).
export function logoFileName(repoName, extension, qualifier) {
  const name = repoName.toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || !Object.hasOwn(EXTENSION_RANK, extension)) return null
  if (qualifier === undefined) return `${name}.${extension}`
  return OWNER_NAME.test(qualifier) ? `${qualifier.toLowerCase()}--${name}.${extension}` : null
}

// Content check, so an LFS pointer, an HTML error page or a script never gets stored as a logo.
export function isImage(bytes, extension) {
  if (bytes.length === 0 || bytes.length > MAX_LOGO_BYTES) return false
  if (extension === 'png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (extension === 'webp')
    return bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP'
  if (extension === 'ico') // reserved 0, type 1 (icon, not cursor), at least one image, room for its directory entry
    return bytes.length >= 22 && bytes.readUInt16LE(0) === 0 && bytes.readUInt16LE(2) === 1 && bytes.readUInt16LE(4) > 0
  if (extension === 'svg') {
    const text = bytes.toString('utf8').replace(/^﻿/, '')
    return /^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(text) && !/<script[\s>]/i.test(text)
  }
  return false
}
