import { describe, expect, it } from 'vitest'
import {
  calculatePostDebtInvesting,
  formatMonthsAsTime,
  getPayoffMonths,
  isDebtComplete,
  runPlan,
  toMonthly,
} from './metrics'

const debt = (id: string, amount: string, rate: string, repayment: string) => ({ id, name: id, amount, rate, repayment })

describe('runPlan', () => {
  it('returns empty when no debt is complete', () => {
    expect(runPlan([debt('a', '1000', '10', '')], 'snowball', 0)).toEqual({ ok: false, reason: 'empty' })
  })

  it('skips incomplete debts instead of looping on NaN', () => {
    const r = runPlan([debt('a', '1000', '0', '100'), debt('b', '500', '5', '')], 'snowball', 0)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.debts.map(d => d.id)).toEqual(['a'])
      expect(getPayoffMonths(r.schedule)).toBe(10)
    }
  })

  it('reports a plan whose payments do not cover the interest', () => {
    expect(runPlan([debt('a', '10000', '24', '150')], 'snowball', 0)).toEqual({ ok: false, reason: 'never' })
  })

  it('lets an extra amount rescue a plan that never ends', () => {
    expect(runPlan([debt('a', '10000', '24', '150')], 'snowball', 100).ok).toBe(true)
  })
})

describe('helpers', () => {
  it('checks completeness', () => {
    expect(isDebtComplete(debt('a', '100', '0', '0'))).toBe(true)
    expect(isDebtComplete(debt('a', '0', '5', '10'))).toBe(false)
    expect(isDebtComplete(debt('a', '100', 'x', '10'))).toBe(false)
  })

  it('formats months', () => {
    expect(formatMonthsAsTime(1)).toBe('1 month')
    expect(formatMonthsAsTime(24)).toBe('2 years')
    expect(formatMonthsAsTime(29)).toBe('2y 5m')
  })

  it('converts frequencies and grows investments', () => {
    expect(toMonthly(6, 'daily')).toBe(180)
    expect(calculatePostDebtInvesting(100, 12, 0)).toBe(1200)
  })
})
