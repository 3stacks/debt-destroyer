// Run the Maestro flows in maestro/flows against the web build, in Chromium.
// This is a fast check for CI and for a computer with no simulator. The real
// devices run the same flows with Maestro (see maestro/README.md).
//
//   EXPO_PUBLIC_E2E=1 npx expo export --platform web --output-dir dist-e2e
//   node e2e-web/run.mjs dist-e2e [flow-name-filter]
//
// It supports the Maestro commands that the flows use. A flow that needs a
// command it does not know fails, so the two runners stay in step.
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { parseAllDocuments } from 'yaml'

const here = dirname(fileURLToPath(import.meta.url))
const flowsDir = resolve(here, '../maestro/flows')
const outDir = resolve(here, '../maestro-output/web')
const [distArg, filter = ''] = process.argv.slice(2)
if (!distArg || !existsSync(join(distArg, 'index.html'))) {
  console.error('Usage: node e2e-web/run.mjs <web export folder> [flow filter]')
  process.exit(2)
}
const dist = resolve(distArg)

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ttf': 'font/ttf', '.ico': 'image/x-icon' }
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = join(dist, path)
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html')
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const STEP_TIMEOUT = 8000

function interpolate(value, env) {
  if (typeof value === 'string') return value.replace(/\$\{(\w+)\}/g, (_, k) => (k in env ? env[k] : `\${${k}}`))
  if (Array.isArray(value)) return value.map(v => interpolate(v, env))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolate(v, env)]))
  return value
}

function loadFlow(file) {
  const docs = parseAllDocuments(readFileSync(file, 'utf8')).map(d => d.toJS())
  return { header: docs.length > 1 ? docs[0] : {}, steps: docs[docs.length - 1] ?? [] }
}

// Maestro matches text with a regular expression against the whole text.
const textRegex = text => new RegExp(`^(?:${text})$`, 's')

async function visible(page, selector) {
  const loc =
    typeof selector === 'string'
      ? page.getByText(textRegex(selector))
      : selector.id
        ? page.locator(`[data-testid="${selector.id}"]`)
        : page.getByText(textRegex(selector.text))
  const n = await loc.count()
  for (let i = n - 1; i >= 0; i--) {
    const el = loc.nth(i)
    if (await el.isVisible()) return el
  }
  return null
}

async function waitVisible(page, selector, timeout, dialogs) {
  const deadline = Date.now() + timeout
  for (;;) {
    const el = await visible(page, selector)
    if (el) return el
    const text = typeof selector === 'string' ? selector : selector.text
    if (text && dialogs.some(d => textRegex(text).test(d) || d.split('\n\n').some(part => textRegex(text).test(part)))) return 'dialog'
    if (Date.now() > deadline) throw new Error(`Not visible: ${JSON.stringify(selector)}`)
    await page.waitForTimeout(150)
  }
}

async function run(page, steps, env, dir, dialogs, log) {
  for (const raw of steps) {
    const step = interpolate(raw, env)
    const [cmd, arg] = typeof step === 'string' ? [step, undefined] : Object.entries(step)[0]
    log(`  ${cmd} ${arg === undefined ? '' : JSON.stringify(arg)}`)
    switch (cmd) {
      case 'launchApp':
        await page.goto(`${base}/`)
        break
      case 'openLink': {
        const link = typeof arg === 'string' ? arg : arg.link
        await page.goto(link.startsWith('http') ? link : `${base}/${link.replace(/^[a-z]+:\/\/(?:[^/]*\/--\/)?/, '')}`)
        break
      }
      case 'waitForAnimationToEnd':
        await page.waitForTimeout(900)
        break
      case 'runFlow': {
        // A condition, for example an iOS system question. Skip the flow if it is not met.
        if (arg.when?.visible !== undefined && !(await visible(page, arg.when.visible))) break
        if (arg.commands) {
          await run(page, arg.commands, { ...env, ...(arg.env ?? {}) }, dir, dialogs, log)
          break
        }
        const file = resolve(dir, arg.file)
        const sub = loadFlow(file)
        await run(page, sub.steps, { ...env, ...(arg.env ?? {}) }, dirname(file), dialogs, log)
        break
      }
      case 'tapOn': {
        // A button of a native alert. In the browser, the dialog is already accepted.
        if (typeof arg === 'string' && /^(OK|Cancel)$/.test(arg) && dialogs.length > 0 && !(await visible(page, arg))) {
          dialogs.length = 0
          break
        }
        const el = await waitVisible(page, arg, STEP_TIMEOUT, dialogs)
        if (el === 'dialog') break // the dialog was already accepted
        await el.click()
        await page.waitForTimeout(250)
        break
      }
      case 'inputText':
        await page.keyboard.type(String(arg))
        break
      case 'eraseText':
        await page.keyboard.press('ControlOrMeta+A')
        await page.keyboard.press('Backspace')
        break
      case 'hideKeyboard':
        await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
        break
      case 'scrollUntilVisible': {
        const el = await waitVisible(page, arg.element, STEP_TIMEOUT, dialogs)
        if (el !== 'dialog') await el.scrollIntoViewIfNeeded()
        break
      }
      case 'assertVisible':
        await waitVisible(page, arg, STEP_TIMEOUT, dialogs)
        break
      case 'assertNotVisible': {
        await page.waitForTimeout(400)
        if (await visible(page, arg)) throw new Error(`Visible, but must not be: ${JSON.stringify(arg)}`)
        break
      }
      case 'extendedWaitUntil':
        await waitVisible(page, arg.visible, arg.timeout ?? STEP_TIMEOUT, dialogs)
        break
      case 'takeScreenshot':
        await page.screenshot({ path: join(outDir, `${arg}.png`) })
        break
      default:
        throw new Error(`The web runner does not know the command "${cmd}"`)
    }
  }
}

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const files = readdirSync(flowsDir).filter(f => f.endsWith('.yaml') && f.includes(filter)).sort()
const results = []
for (const f of files) {
  const file = join(flowsDir, f)
  const { header, steps } = loadFlow(file)
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const dialogs = []
  const errors = []
  page.on('dialog', d => {
    dialogs.push(d.message())
    d.accept()
  })
  page.on('pageerror', e => errors.push(String(e)))
  const lines = []
  const started = Date.now()
  try {
    await run(page, steps, { APP_ID: header.appId ?? 'web', LINK: `${base}/` }, flowsDir, dialogs, l => lines.push(l))
    if (errors.length) throw new Error(`Page errors: ${errors.join('; ')}`)
    results.push({ f, ok: true, ms: Date.now() - started })
    console.log(`PASS ${f} (${((Date.now() - started) / 1000).toFixed(1)}s)`)
  } catch (e) {
    results.push({ f, ok: false })
    await page.screenshot({ path: join(outDir, `FAILED-${f.replace('.yaml', '')}.png`) }).catch(() => {})
    console.log(`FAIL ${f}\n${lines.slice(-6).join('\n')}\n  → ${e.message}`)
  }
  await context.close()
}
await browser.close()
server.close()
const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${outDir}`)
process.exit(failed ? 1 : 0)
