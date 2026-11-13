import { describe, expect, it } from 'vitest'
import { analyse, monthDiff, shiftMonth } from '../lib/tracking'
import { SCENARIOS, TODAY } from './scenarios'

// The end-to-end flows depend on these facts about each scenario.
const analysed = (name: string) => {
  const s = SCENARIOS[name]()
  return s.tracking ? analyse(s.tracking, TODAY)! : null
}

describe('e2e scenarios', () => {
  it('empty and draft have no started plan', () => {
    expect(SCENARIOS.empty().draft.debts).toHaveLength(0)
    expect(SCENARIOS.draft().tracking).toBeNull()
    expect(SCENARIOS.draft().draft.debts).toHaveLength(3)
  })

  it('started has November due, on plan', () => {
    const a = analysed('started')!
    expect(a.dueMonths).toEqual(['2026-11'])
    expect(a.totalVariance).toBe(0)
    expect(a.monthsBehindPlan).toBe(0)
  })

  it('three-months has three reconciled months before November', () => {
    const a = analysed('three-months')!
    expect(a.lastReconciled).toBe('2026-10')
    expect(a.rows.filter(r => r.reconciled)).toHaveLength(3)
  })

  it('reconciled-november has nothing due', () => {
    const a = analysed('reconciled-november')!
    expect(a.lastReconciled).toBe('2026-11')
    expect(a.dueMonths).toEqual([])
  })

  it('near-finish shows the countdown', () => {
    const a = analysed('near-finish')!
    const left = monthDiff(a.lastReconciled ?? shiftMonth(a.current.startMonth, -1), a.projectedPayoff!)
    expect(left).toBeGreaterThan(0)
    expect(left).toBeLessThanOrEqual(12)
  })

  it('finished has no balance left', () => {
    const a = analysed('finished')!
    expect(Object.values(a.balances).reduce((x, y) => x + y, 0)).toBe(0)
  })
})
