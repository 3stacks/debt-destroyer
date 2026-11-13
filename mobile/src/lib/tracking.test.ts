import { describe, expect, it } from 'vitest'
import { analyse, monthDiff, openingBalances, revisionStarts, shiftMonth, Tracking } from './tracking'

const debts = [
  { id: 'a', name: 'Card', amount: '1000', rate: '0', repayment: '100' },
  { id: 'b', name: 'Loan', amount: '2000', rate: '0', repayment: '100' },
]
const v1 = { id: 'v1', startMonth: '2026-01', createdAt: '', method: 'snowball', extra: '0', debts }

function rec(month: string, a: string, b: string, balanceA?: string) {
  return { month, savedAt: '', entries: { a: { paid: a, balance: balanceA }, b: { paid: b } } }
}

describe('month keys', () => {
  it('shifts and diffs across years', () => {
    expect(shiftMonth('2026-11', 3)).toBe('2027-02')
    expect(monthDiff('2026-11', '2027-02')).toBe(3)
  })
})

describe('analyse', () => {
  it('is on plan with no reconciliation', () => {
    const a = analyse({ versions: [v1], recs: {} }, '2026-01')!
    // 3000 at 200 a month: 15 months, Jan 2026 to Mar 2027.
    expect(a.plannedPayoff).toBe('2027-03')
    expect(a.projectedPayoff).toBe('2027-03')
    expect(a.monthsBehindPlan).toBe(0)
    expect(a.dueMonths).toEqual(['2026-01'])
  })

  it('shows variance and a later payoff when the user pays less', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01', '50', '100') } }
    const a = analyse(t, '2026-02')!
    expect(a.rows[0].variance).toBe(-50)
    expect(a.totalVariance).toBe(-50)
    expect(a.balances).toEqual({ a: 950, b: 1900 })
    expect(a.lastReconciled).toBe('2026-01')
    expect(a.dueMonths).toEqual(['2026-02'])
    // 2850 left at 200 a month: 15 months from Feb 2026 = Apr 2027.
    expect(a.projectedPayoff).toBe('2027-04')
    expect(a.monthsBehindPlan).toBe(1)
    expect(a.balanceGap).toBe(50)
  })

  it('shows an earlier payoff when the user pays more', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01', '700', '100') } }
    const a = analyse(t, '2026-01')!
    expect(a.rows[0].variance).toBe(600)
    expect(a.monthsBehindPlan).toBeLessThan(0)
  })

  it('uses a statement balance in place of the calculated balance', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01', '100', '100', '1200') } }
    expect(analyse(t, '2026-01')!.balances.a).toBe(1200)
  })

  it('stops the actual balance at a gap', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01', '100', '100'), '2026-03': rec('2026-03', '100', '100') } }
    const a = analyse(t, '2026-03')!
    expect(a.lastReconciled).toBe('2026-01')
    expect(a.dueMonths).toEqual(['2026-02'])
    expect(a.rows[2].actualBalance).toBeNull()
  })

  it('compares a revision with the original plan', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01', '0', '0') } }
    const a1 = analyse(t, '2026-02')!
    expect(revisionStarts(a1)).toEqual(['2026-01', '2026-02'])
    const v2 = {
      ...v1,
      id: 'v2',
      startMonth: '2026-02',
      extra: '100',
      debts: a1.forecastDebts,
    }
    const a2 = analyse({ versions: [v1, v2], recs: t.recs }, '2026-02')!
    expect(a2.current.id).toBe('v2')
    expect(a2.originalPayoff).toBe('2027-03')
    // 3000 at 300 a month from Feb 2026: 10 months = Nov 2026.
    expect(a2.plannedPayoff).toBe('2026-11')
    expect(a2.monthsBehindOriginal).toBe(-4)
    expect(a2.rows[0].variance).toBe(-200)
  })

  it('adds a debt to a month that is already reconciled', () => {
    const t: Tracking = {
      versions: [v1],
      recs: { '2026-01': rec('2026-01', '100', '100'), '2026-02': rec('2026-02', '100', '100') },
    }
    const a1 = analyse(t, '2026-02')!
    expect(revisionStarts(a1)).toEqual(['2026-02', '2026-03'])
    // A revision from February starts at the balances after January.
    const opening = openingBalances(a1, '2026-02')
    expect(opening).toEqual({ a: 900, b: 1900 })
    const v2 = {
      ...v1,
      id: 'v2',
      startMonth: '2026-02',
      debts: [
        ...v1.debts.map(d => ({ ...d, amount: String(opening[d.id]) })),
        { id: 'c', name: 'Store card', amount: '500', rate: '0', repayment: '50' },
      ],
    }
    const t2: Tracking = {
      versions: [v1, v2],
      recs: { ...t.recs, '2026-02': { month: '2026-02', savedAt: '', entries: { a: { paid: '100' }, b: { paid: '100' }, c: { paid: '50' } } } },
    }
    const a2 = analyse(t2, '2026-02')!
    expect(a2.rows[1].version.id).toBe('v2')
    expect(a2.balances).toEqual({ a: 800, b: 1800, c: 450 })
    expect(a2.lastReconciled).toBe('2026-02')
  })

  it('moves an unused revision back to the reconciled month before it', () => {
    const recs = { '2026-01': rec('2026-01', '100', '100'), '2026-02': rec('2026-02', '100', '100') }
    const v2 = { ...v1, id: 'v2', startMonth: '2026-03', debts: [...v1.debts, { id: 'c', name: 'Store card', amount: '500', rate: '0', repayment: '50' }] }
    const a = analyse({ versions: [v1, v2], recs }, '2026-02')!
    expect(a.lastReconciled).toBeNull()
    expect(revisionStarts(a)).toEqual(['2026-02', '2026-03'])
    // February starts at the balances after January. The store card has none.
    expect(openingBalances(a, '2026-02')).toEqual({ a: 900, b: 1900 })
  })
})
