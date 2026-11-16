import { describe, expect, it } from 'vitest'
import { isImage, KNOWN_DEFAULT_ASSETS, logoExtension, logoFileName, MAX_LOGO_BYTES, pickLogo } from './projectLogo.mjs'

const blob = (path, size = 1000, sha = `sha-${path}`) => ({ type: 'blob', path, size, sha })
const picked = (entries, repo = 'myrepo') => pickLogo(entries, repo)?.path ?? null
const big = MAX_LOGO_BYTES + 1

describe('names that count as a logo', () => {
  it.each([
    'logo.png', 'Logo.PNG', 'logo.svg', 'logo.webp', 'logo-on-light.png', 'logo_light.svg', 'logo-black.png',
    'myrepo_logo.png', 'myrepo-logo-removebg-preview.png', 'logo-192.png', 'logo512.png', 'logo-large.png',
    'icon.png', 'app-icon.png', 'apple-icon.png', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-512.png', 'icon.ico',
    'favicon.ico', 'favicon.svg', 'favicon-32x32.png', 'myrepo-favicon.png', 'favicon-large.png',
  ])('accepts %s', (name) => {
    expect(picked([blob(name)])).toBe(name)
  })

  it.each([
    'logo-dark.png', 'logo-on-dark.png', 'logo_white.svg', 'logo-white.png', 'icon-maskable-512.png',
    'profile.png', 'avatar.png', 'claude.png', 'gpt.png', 'cloud.png', 'vite.svg', 'next.svg', 'file.svg', 'globe.svg',
    'opengraph-image.png', 'google-icon.svg', 'external-api.png', 'myrepo_only.jpg', 'myrepo_black-removebg.png',
    'logos.png', 'logo.png.bak', 'logo.gif', 'logo.jpg', 'icon-v2.png', 'other-logo.png', 'screenshot-logo.png',
  ])('rejects %s', (name) => {
    expect(picked([blob(name)])).toBeNull()
  })

  it('accepts only the repository name as a prefix or suffix, not another project', () => {
    expect(picked([blob('nzt-48-logo.png')], 'NZT-48')).toBe('nzt-48-logo.png')
    expect(picked([blob('myrepo_logo.png')], 'other')).toBeNull()
  })
})

describe('folders and entries', () => {
  it('ignores hidden, vendored, build, test, template and demo folders', () => {
    for (const path of [
      'node_modules/x/logo.png', 'vendor/x/logo.svg', 'src/vendor/logo.png', 'dist/logo.png', 'build/logo.png',
      'tests/logo.png', 'examples/demo/logo.png', '.github/logo.png', 'docs/.hidden/logo.png', 'third_party/logo.png',
      'templates/logo.png', 'demo/logo.png', 'e2e/logo.png', 'src/home/hero/vendor/x/public/favicon.ico',
    ])
      expect(picked([blob(path)])).toBeNull()
    expect(picked([blob('public/logo.svg')])).toBe('public/logo.svg')
    expect(picked([blob('docs/logo.png')])).toBe('docs/logo.png')
  })

  it('looks at most three folders deep', () => {
    expect(picked([blob('a/b/c/logo.png')])).toBe('a/b/c/logo.png')
    expect(picked([blob('a/b/c/d/logo.png')])).toBeNull()
  })

  it('ignores entries that are not files, and empty files', () => {
    expect(picked([{ type: 'tree', path: 'logo.png', sha: 'x' }, { type: 'commit', path: 'sub/logo.png', sha: 'y' }])).toBeNull()
    expect(picked([blob('logo.png', 0)])).toBeNull()
  })

  it('returns null for an empty tree', () => {
    expect(pickLogo([], 'x')).toBeNull()
  })
})

describe('precedence', () => {
  it('prefers an explicit logo over an icon over a favicon, whatever the folder', () => {
    expect(picked([blob('favicon.ico'), blob('a/b/icon.png'), blob('a/b/c/logo.png')])).toBe('a/b/c/logo.png')
    expect(picked([blob('favicon.ico'), blob('a/b/icon.png')])).toBe('a/b/icon.png')
    expect(picked([blob('favicon.ico')])).toBe('favicon.ico')
  })

  it('prefers a variant made for a light background over a neutral one', () => {
    expect(picked([blob('logo.png'), blob('logo-on-light.png'), blob('logo-on-dark.png')])).toBe('logo-on-light.png')
    expect(picked([blob('logo.png'), blob('logo-black.svg')])).toBe('logo-black.svg')
  })

  it('prefers a plain icon over an apple icon, which is made for iOS home screens', () => {
    expect(picked([blob('apple-icon.png'), blob('icon.png')])).toBe('icon.png')
    expect(picked([blob('icon.png'), blob('apple-icon.png')])).toBe('icon.png')
    expect(picked([blob('apple-touch-icon.png'), blob('app-icon.png')])).toBe('app-icon.png')
    expect(picked([blob('apple-touch-icon.png'), blob('favicon.ico')])).toBe('apple-touch-icon.png')
  })

  it('then prefers the shallowest folder', () => {
    expect(picked([blob('web/public/logo.svg'), blob('src/logo.png')])).toBe('src/logo.png')
  })

  it('then prefers an unsized file, then the size closest to 256px', () => {
    expect(picked([blob('icon-512.png'), blob('icon.png'), blob('icon-192.png')])).toBe('icon.png')
    expect(picked([blob('icon-512.png'), blob('icon-192.png'), blob('icon-32x32.png')])).toBe('icon-192.png')
    expect(picked([blob('logo-small.png'), blob('logo-large.png')])).toBe('logo-large.png')
  })

  it('then prefers svg over png over webp over ico', () => {
    expect(picked([blob('icon.ico'), blob('icon.webp'), blob('icon.png'), blob('icon.svg')])).toBe('icon.svg')
    expect(picked([blob('favicon.ico'), blob('favicon.png')])).toBe('favicon.png')
  })

  it('does not depend on the order of the file list', () => {
    const entries = [blob('web/public/logo.png'), blob('desktop/logo.png'), blob('src/app/logo.png')]
    expect(picked(entries)).toBe('desktop/logo.png')
    expect(picked([...entries].reverse())).toBe('desktop/logo.png')
  })
})

describe('ambiguity', () => {
  it('gives no logo when the best candidates tie on every rule', () => {
    expect(picked([blob('a/logo.png'), blob('b/logo.png')])).toBeNull()
    expect(picked([blob('a/logo.png'), blob('b/logo.png'), blob('c/d/logo.png')])).toBeNull()
  })

  it('is not ambiguous when the tied files are identical', () => {
    expect(picked([blob('a/logo.png', 10, 'same'), blob('b/logo.png', 10, 'same')])).toBe('a/logo.png')
  })

  it('lets a unique better file beat an ambiguous worse pair', () => {
    expect(picked([blob('desktop/logo.png'), blob('a/b/logo.png'), blob('c/d/logo.png')])).toBe('desktop/logo.png')
    expect(picked([blob('a/icon.png'), blob('b/icon.png'), blob('logo.svg')])).toBe('logo.svg')
  })
})

describe('size protection and defaults', () => {
  it('skips an oversized file and falls to the next candidate', () => {
    expect(picked([blob('logo.png', big), blob('icon.ico', 124555)])).toBe('icon.ico')
    expect(picked([blob('logo.png', big), blob('icon.png', big)])).toBeNull()
    expect(picked([blob('logo.png', MAX_LOGO_BYTES)])).toBe('logo.png')
  })

  it('skips known framework defaults and placeholders', () => {
    expect(KNOWN_DEFAULT_ASSETS.size).toBeGreaterThan(0)
    const [sha] = KNOWN_DEFAULT_ASSETS
    expect(picked([blob('favicon.ico', 1000, sha)])).toBeNull()
    expect(picked([blob('favicon.ico', 1000, sha), blob('icon.png')])).toBe('icon.png')
  })
})

describe('the real repository trees', () => {
  it('ark: the 1 MB logo and icon are too big, the ico is chosen', () => {
    expect(picked([
      blob('resources/claude.png', 156835), blob('resources/gpt.png', 30205), blob('resources/icon.ico', 124555),
      blob('resources/icon.png', 1080992), blob('resources/logo.png', 1168366), blob('src/renderer/assets/logo.png', 1080992),
    ], 'ark')).toBe('resources/icon.ico')
  })

  it('faixabjj: the transparent logo, not the big one, the icon-only file or the app icons', () => {
    expect(picked([
      blob('frontend/app/apple-icon.png', 5965), blob('frontend/app/icon.png', 56481), blob('frontend/public/file.svg', 391),
      blob('frontend/public/icons/icon-192.png', 6519), blob('frontend/public/icons/icon-512.png', 30156),
      blob('frontend/public/icons/icon-maskable-512.png', 22886),
      blob('frontend/public/logo/faixabjj_logo-removebg-preview.png', 74311), blob('frontend/public/logo/faixabjj_logo.png', 638480),
      blob('frontend/public/logo/faixabjj_only-removebg-preview.png', 56481), blob('frontend/public/logo/faixabjj_only.jpg', 27225),
      blob('frontend/public/next.svg', 1375), blob('frontend/public/vercel.svg', 128),
    ], 'faixabjj')).toBe('frontend/public/logo/faixabjj_logo-removebg-preview.png')
  })

  it('loresync: the variant for light backgrounds', () => {
    expect(picked([
      blob('frontend/app/apple-icon.png', 14819), blob('frontend/app/icon.png', 76767), blob('frontend/app/opengraph-image.png', 61729),
      blob('frontend/lib/img/logo-on-dark.png', 43009), blob('frontend/lib/img/logo-on-light.png', 43577),
      blob('frontend/lib/img/loresync_black-removebg.png', 59663), blob('frontend/lib/img/loresync_white-removebg.png', 66694),
    ], 'loresync')).toBe('frontend/lib/img/logo-on-light.png')
  })

  it('ICPN/subsmate: the app icon, not the apple icon, the favicon, the sized icons or the other images', () => {
    expect(picked([
      blob('frontend/app/apple-icon.png', 47139), blob('frontend/app/favicon.ico', 2120), blob('frontend/app/icon.png', 82513),
      blob('frontend/public/file.svg', 391), blob('frontend/public/globe.svg', 1035), blob('frontend/public/icon-192.png', 53612),
      blob('frontend/public/icon-512.png', 259148), blob('frontend/public/logo/chatgpt.png', 38611), blob('frontend/public/logo/claude.png', 6156),
      blob('frontend/public/next.svg', 1375), blob('frontend/public/subsmate.svg', 378), blob('frontend/public/vercel.svg', 128),
      blob('frontend/public/window.svg', 385),
    ], 'subsmate')).toBe('frontend/app/icon.png')
  })

  it('ilovestock: the shallowest logo of three', () => {
    expect(picked([
      blob('desktop/logo.png', 44555), blob('docs/img/analyze-aapl.svg', 84080), blob('src/ilovestock/logo.png', 44057), blob('web/public/logo.png', 44555),
    ], 'ilovestock')).toBe('desktop/logo.png')
  })

  it('profile photos, small UI icons and template assets are not logos', () => {
    expect(picked([blob('personal-site/wwwroot/img/profile.png'), blob('personal-site/wwwroot/img/realpic.png'), blob('personal-site/wwwroot/img/zyt.png')], 'personal-site-source')).toBeNull()
    expect(picked([blob('LogInsight.Web/Content/imgs/activity.svg'), blob('frontend/src/assets/vite.svg')], 'LogInsight')).toBeNull()
  })

  it('the default ASP.NET, Vite and jade-atlas placeholder icons are skipped', () => {
    for (const sha of [
      'a3a799985c43bc7309d701b2cad129023377dc71', '6893eb13237060adc0c968a690149a49faa2d7d3', '3ceec55e88d35330b47ba3a6fb9a3cfdcd2f6119',
    ])
      expect(KNOWN_DEFAULT_ASSETS.has(sha)).toBe(true)
  })
})

describe('logoFileName and logoExtension', () => {
  it('lower-cases the repository name', () => {
    expect(logoFileName('NZT-48', 'png')).toBe('nzt-48.png')
    expect(logoFileName('ark', 'ico')).toBe('ark.ico')
    expect(logoExtension('a/b/Logo.SVG')).toBe('svg')
  })

  it.each(['..', '.hidden', 'a/b', 'a b', '', 'é'])('rejects the repository name %j', (name) => {
    expect(logoFileName(name, 'png')).toBeNull()
  })

  it('rejects unknown extensions', () => {
    expect(logoFileName('repo', 'gif')).toBeNull()
  })
})

describe('isImage', () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(20)])
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(20)])
  const ico = Buffer.concat([Buffer.from([0, 0, 1, 0, 2, 0]), Buffer.alloc(40)])

  it('accepts real png, webp, ico and svg content', () => {
    expect(isImage(png, 'png')).toBe(true)
    expect(isImage(webp, 'webp')).toBe(true)
    expect(isImage(ico, 'ico')).toBe(true)
    expect(isImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'), 'svg')).toBe(true)
    expect(isImage(Buffer.from('﻿<?xml version="1.0"?>\n<!-- c -->\n<!DOCTYPE svg>\n<svg width="1"/>'), 'svg')).toBe(true)
  })

  it('rejects content that does not match its extension', () => {
    expect(isImage(Buffer.from('version https://git-lfs.github.com/spec/v1\noid sha256:abc'), 'png')).toBe(false)
    expect(isImage(Buffer.from('<!DOCTYPE html><html></html>'), 'svg')).toBe(false)
    expect(isImage(png, 'webp')).toBe(false)
    expect(isImage(webp, 'png')).toBe(false)
    expect(isImage(png, 'ico')).toBe(false)
    expect(isImage(ico, 'png')).toBe(false)
    expect(isImage(png, 'gif')).toBe(false)
  })

  it('rejects an ico that is a cursor, has no images or is truncated', () => {
    expect(isImage(Buffer.concat([Buffer.from([0, 0, 2, 0, 1, 0]), Buffer.alloc(40)]), 'ico')).toBe(false)
    expect(isImage(Buffer.concat([Buffer.from([0, 0, 1, 0, 0, 0]), Buffer.alloc(40)]), 'ico')).toBe(false)
    expect(isImage(Buffer.from([0, 0, 1, 0]), 'ico')).toBe(false)
  })

  it('rejects svg with scripts, empty files and oversized files', () => {
    expect(isImage(Buffer.from('<svg><script>alert(1)</script></svg>'), 'svg')).toBe(false)
    expect(isImage(Buffer.alloc(0), 'png')).toBe(false)
    expect(isImage(Buffer.concat([png, Buffer.alloc(MAX_LOGO_BYTES)]), 'png')).toBe(false)
  })
})
