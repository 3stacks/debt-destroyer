import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ANALYTICS_LOADER } from '../shared/analytics-loader'
import { countedHost } from '../functions/_lib/analytics'

describe('analytics loader', () => {
  it('index.html has the same copy as shared/analytics-loader.ts', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    expect(html).toContain(`<script>${ANALYTICS_LOADER}</script>`)
  })
})

describe('analytics hosts', () => {
  it('counts the production domain, and not previews', () => {
    expect(countedHost('debtdestroyer.app', {})).toBe(true)
    expect(countedHost('www.debtdestroyer.app', {})).toBe(true)
    expect(countedHost('debt-destroyer.pages.dev', {})).toBe(true)
    expect(countedHost('5ccfa1a3.debt-destroyer.pages.dev', {})).toBe(false)
    expect(countedHost('localhost', {})).toBe(false)
  })
})
