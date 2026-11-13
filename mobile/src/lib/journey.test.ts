import { describe, expect, it } from 'vitest'
import { buildJourney } from './journey'
import { analyse, PlanVersion, Tracking } from './tracking'

const v1: PlanVersion = {
  id: 'v1',
  startMonth: '2026-01',
  createdAt: '',
  method: 'snowball',
  extra: '0',
  debts: [
    { id: 'a', name: 'Card', amount: '200', rate: '0', repayment: '100' },
    { id: 'b', name: 'Loan', amount: '300', rate: '0', repayment: '100' },
  ],
}
const rec = (month: string) => ({ month, savedAt: '', entries: { a: { paid: '100' }, b: { paid: '100' } } })

describe('buildJourney', () => {
  it('plays the real months, then the projection to zero', () => {
    const t: Tracking = { versions: [v1], recs: { '2026-01': rec('2026-01') } }
    const j = buildJourney(t, analyse(t, '2026-01')!)
    expect(j.frames.map(f => [f.month, f.total, f.projected])).toEqual([
      ['2025-12', 500, false],
      ['2026-01', 300, false],
      ['2026-02', 100, true],
      ['2026-03', 0, true],
    ])
    expect(j.realMonths).toBe(1)
    expect(j.finished).toBe(true)
    expect(j.frames[2].paidOff).toEqual(['a'])
    expect(j.frames[3].paidOff).toEqual(['b'])
    expect(j.peaks).toEqual({ a: 200, b: 300 })
  })
})
