import { describe, expect, it } from 'vitest'
import { SCENARIOS } from '../e2e/scenarios'
import { backupFileName, backupJson, describeBackup, makeBackup, parseBackup } from './backup'
import { analyse } from './tracking'

describe('backup', () => {
  it('gives back the same state after a round trip', () => {
    const state = SCENARIOS['three-months']()
    const parsed = parseBackup(backupJson(makeBackup(state, new Date('2026-11-13T10:00:00Z'))))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data).toEqual(state)
    expect(parsed.exportedAt).toBe('2026-11-13T10:00:00.000Z')
    // The imported plan gives the same analysis.
    expect(analyse(parsed.data.tracking!, '2026-11')?.balances).toEqual(analyse(state.tracking!, '2026-11')?.balances)
  })

  it('keeps a consolidated loan and the debts that it replaced', () => {
    const state = SCENARIOS.started()
    state.draft.debts.push({ id: 'loan', name: 'Loan', amount: '5000', rate: '9', repayment: '200', from: ['card', 'store'] })
    const parsed = parseBackup(backupJson(makeBackup(state, new Date())))
    expect(parsed.ok && parsed.data.draft.debts.at(-1)?.from).toEqual(['card', 'store'])
  })

  it('refuses a file that is not a backup', () => {
    expect(parseBackup('not json')).toMatchObject({ ok: false })
    expect(parseBackup('{"debts":[]}')).toMatchObject({ ok: false, error: 'This file is not a Debt Destroyer backup.' })
    expect(parseBackup(JSON.stringify({ format: 'debt-destroyer-backup', version: 99, data: {} }))).toMatchObject({ ok: false })
    expect(parseBackup(JSON.stringify(makeBackup(SCENARIOS.empty(), new Date())))).toMatchObject({ ok: false, error: 'This backup has no debts.' })
  })

  it('cleans bad values out of a file that a person edited', () => {
    const text = JSON.stringify({
      format: 'debt-destroyer-backup',
      version: 1,
      data: {
        draft: { debts: [{ id: 'a', name: 'Card', amount: 1000, rate: '20', repayment: '50' }, { name: 'no id' }, 'junk'], method: 'nonsense', vices: 'junk' },
        tracking: { versions: [{ id: 'v', startMonth: 'not a month', debts: [] }], recs: {} },
      },
    })
    const parsed = parseBackup(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.draft.debts).toEqual([{ id: 'a', name: 'Card', amount: '1000', rate: '20', repayment: '50' }])
    expect(parsed.data.draft.method).toBe('snowball')
    expect(parsed.data.draft.vices).toEqual([])
    expect(parsed.data.tracking).toBeNull()
  })

  it('describes what the backup holds', () => {
    const draft = SCENARIOS.draft()
    expect(describeBackup(draft)).toBe(`${draft.draft.debts.length} debts, and no started plan`)
    const plan = SCENARIOS['three-months']()
    const n = plan.tracking!.versions.at(-1)!.debts.length
    expect(describeBackup(plan)).toBe(`A plan that started in August 2026, with ${n} debts and 3 months of payments`)
  })

  it('names the file with the local date', () => {
    expect(backupFileName(new Date(2026, 0, 5, 23, 30))).toBe('debt-destroyer-2026-01-05.json')
  })
})
