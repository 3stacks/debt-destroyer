import { describe, expect, it } from 'vitest'
import { analyse, closedDebts, debtHistory, PlanVersion, Tracking } from './tracking'

const card = { id: 'a', name: 'Card', amount: '1000', rate: '0', repayment: '100' }
const store = { id: 'b', name: 'Store', amount: '500', rate: '0', repayment: '50' }
const v1: PlanVersion = { id: 'v1', startMonth: '2026-01', createdAt: '', method: 'snowball', extra: '0', debts: [card, store] }

const rec = (month: string, a: string, b: string) => ({ month, savedAt: '', entries: { a: { paid: a }, b: { paid: b } } })
const recs = {
  '2026-01': rec('2026-01', '100', '50'),
  '2026-02': rec('2026-02', '100', '50'),
  '2026-03': rec('2026-03', '100', '50'),
}

describe('debtHistory', () => {
  it('keeps the payments before a refinance, and records the new rate', () => {
    const v2: PlanVersion = { ...v1, id: 'v2', startMonth: '2026-04', debts: [{ ...card, amount: '700', rate: '5' }, { ...store, amount: '350' }] }
    const t: Tracking = { versions: [v1, v2], recs }
    const a = analyse(t, '2026-04')!
    const h = debtHistory(t, a, 'a')!
    expect(h.opening).toBe(1000)
    expect(h.paidTotal).toBe(300)
    expect(h.months.slice(0, 3).map(m => m.balance)).toEqual([900, 800, 700])
    expect(h.events.map(e => e.kind)).toEqual(['start', 'rate'])
    expect(h.events[1].text).toBe('Rate changed from 0% to 5%')
    expect(h.debt.rate).toBe('5')
  })

  it('links a consolidated debt and its new loan', () => {
    const loan = { id: 'c', name: 'Loan', amount: '1050', rate: '8', repayment: '120', from: ['a', 'b'] }
    const v2: PlanVersion = { ...v1, id: 'v2', startMonth: '2026-04', debts: [loan] }
    const t: Tracking = { versions: [v1, v2], recs }
    const a = analyse(t, '2026-04')!

    const old = debtHistory(t, a, 'a')!
    expect(old.inCurrentPlan).toBe(false)
    expect(old.balance).toBe(0)
    expect(old.mergedInto?.id).toBe('c')
    expect(old.paidTotal).toBe(300)
    expect(old.events.at(-1)!.text).toBe('Consolidated into Loan')

    const merged = debtHistory(t, a, 'c')!
    expect(merged.mergedFrom.map(d => d.name)).toEqual(['Card', 'Store'])
    expect(merged.events[0].text).toBe('Consolidated Card and Store into one loan of $1,050 at 8%')

    expect(closedDebts(t, a).map(d => d.id)).toEqual(['a', 'b'])
    // A consolidation moves balances, so the journey total stays the same.
    expect(a.startTotal).toBe(1500)
  })
})
