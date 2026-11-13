// Cloudflare Pages builds this repo from git with `npm run build`, and it
// publishes dist/. In that build, put the full public site in dist/: the
// homepage at the root and the web app at /app/. Cloudflare sets CF_PAGES=1.
// Other builds (local, CI) keep dist/ as the web app only.
import { execSync } from 'node:child_process'
import { cpSync, rmSync } from 'node:fs'

if (process.env.CF_PAGES !== '1') process.exit(0)

const run = cmd => execSync(cmd, { stdio: 'inherit' })
run('npm ci --prefix site')
run('npm --prefix site run build')
run('node scripts/merge-site.mjs')
rmSync('dist', { recursive: true, force: true })
cpSync('site/out', 'dist', { recursive: true })
console.log('dist/ holds the full public site')
