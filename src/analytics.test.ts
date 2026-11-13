import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ANALYTICS_LOADER } from '../shared/analytics-loader'

describe('analytics loader', () => {
  it('index.html has the same copy as shared/analytics-loader.ts', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    expect(html).toContain(`<script>${ANALYTICS_LOADER}</script>`)
  })
})
