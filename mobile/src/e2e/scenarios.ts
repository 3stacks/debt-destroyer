// Fixed states for the end-to-end tests (maestro/). The seed link loads one:
//   debtdestroyer://e2e/seed?scenario=three-months
// Each scenario also fixes the clock, so that the month names never change.
import { DEBT_PAYOFF_METHODS, Debt } from '../lib/metrics'
import type { Stored } from '../lib/plan'
import { PlanVersion, Reconciliation, planFor, plannedMonth, shiftMonth, Tracking } from '../lib/tracking'

export const TODAY = '2026-11'

const card: Debt = { id: 'card', name: 'Credit card', amount: '4500', rate: '19.9', repayment: '150' }
const store: Debt = { id: 'store', name: 'Store card', amount: '1200', rate: '24', repayment: '60' }
const car: Debt = { id: 'car', name: 'Car loan', amount: '12000', rate: '7.5', repayment: '320' }
const three = [card, store, car]

const small: Debt[] = [
  { id: 'phone', name: 'Phone plan', amount: '300', rate: '0', repayment: '100' },
  { id: 'card', name: 'Credit card', amount: '200', rate: '0', repayment: '100' },
]
const near: Debt[] = [
  { id: 'card', name: 'Credit card', amount: '900', rate: '19.9', repayment: '150' },
  { id: 'phone', name: 'Phone plan', amount: '600', rate: '0', repayment: '100' },
]

function version(startMonth: string, debts: Debt[], extra = '200'): PlanVersion {
  return { id: 'v1', startMonth, createdAt: '2026-01-01T00:00:00.000Z', method: DEBT_PAYOFF_METHODS.SNOWBALL, extra, debts }
}

// Reconcile each month from the start of the version, paid exactly as planned.
function paidAsPlanned(v: PlanVersion, months: number): Record<string, Reconciliation> {
  const plan = planFor(v)
  if (!plan.ok) throw new Error('A scenario plan must end')
  const recs: Record<string, Reconciliation> = {}
  for (let i = 0; i < months; i++) {
    const month = shiftMonth(v.startMonth, i)
    const planned = plannedMonth(v, plan.schedule, month)
    recs[month] = {
      month,
      savedAt: '2026-01-01T00:00:00.000Z',
      entries: Object.fromEntries(v.debts.map(d => [d.id, { paid: (planned[d.id]?.paid ?? 0).toFixed(2) }])),
    }
  }
  return recs
}

function tracked(v: PlanVersion, months: number): Tracking {
  return { versions: [v], recs: paidAsPlanned(v, months) }
}

function state(debts: Debt[], tracking: Tracking | null, extra = '200'): Stored {
  return { draft: { debts, method: DEBT_PAYOFF_METHODS.SNOWBALL, extra, vices: [] }, tracking }
}

export const SCENARIOS: Record<string, () => Stored> = {
  // A fresh install.
  empty: () => ({ draft: { debts: [], method: DEBT_PAYOFF_METHODS.SNOWBALL, extra: '0', vices: [] }, tracking: null }),
  // Three debts, and no plan started.
  draft: () => state(three, null),
  // Started in September. September and October are reconciled, November is due.
  started: () => state(three, tracked(version('2026-09', three), 2)),
  // Started in August, three months reconciled: ready to refinance or consolidate.
  'three-months': () => state(three, tracked(version('2026-08', three), 3)),
  // November is already reconciled: a revision can add a debt to it.
  'reconciled-november': () => state(three, tracked(version('2026-09', three), 3)),
  // A few payments from the end: the countdown shows.
  'near-finish': () => state(near, tracked(version('2026-09', near, '100'), 2), '100'),
  // Every debt is paid off.
  finished: () => state(small, tracked(version('2026-09', small, '0'), 3), '0'),
}
