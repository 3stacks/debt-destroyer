// Pure helpers for the result screens. They mirror the helpers inside the web
// components (insights, opportunity-cost, vice-simulator). The payoff engine
// itself is shared: see ../../../src/utils.
import { addMonths, format } from 'date-fns'
import { now } from './clock'
import {
  calculateDebts,
  DEBT_PAYOFF_METHODS,
  IDebt,
  IRepaymentSchedule,
} from '../../../src/utils'

export type Schedule = IRepaymentSchedule
// A debt can record the debts that it consolidates (see the consolidate screen).
export type Debt = IDebt & { from?: string[] }
export { DEBT_PAYOFF_METHODS }

export type PlanResult =
  | { ok: true; schedule: Schedule; debts: Debt[] }
  | { ok: false; reason: 'empty' | 'never' }

function num(value: string): number {
  return value.trim() === '' ? NaN : Number(value)
}

// A debt can go into the engine when its balance, rate and repayment are all
// numbers. A blank repayment gives NaN balances, and the engine never ends.
export function isDebtComplete(d: Debt): boolean {
  const amount = num(d.amount)
  const rate = num(d.rate)
  const repayment = num(d.repayment)
  return amount > 0 && rate >= 0 && repayment >= 0
}

// The engine recurses once for each month. When the payments do not cover the
// interest, the balance never falls and the recursion never ends. Check that
// first, and catch a stack overflow for a plan that runs too long.
export function runPlan(allDebts: Debt[], method: string, extra: number): PlanResult {
  const debts = allDebts.filter(isDebtComplete)
  if (debts.length === 0) return { ok: false, reason: 'empty' }

  const payments = debts.reduce((a, d) => a + num(d.repayment), 0) + extra
  const interest = debts.reduce((a, d) => a + (num(d.amount) * num(d.rate)) / 1200, 0)
  if (payments <= interest + 0.01) return { ok: false, reason: 'never' }

  try {
    const schedule = calculateDebts({ debts, debtMethod: method, extraContributions: extra })
    return { ok: true, schedule, debts }
  } catch {
    return { ok: false, reason: 'never' }
  }
}

export function parseMoney(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function money(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

export function moneyShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${Math.round(value)}`
}

export function getTotalInterestPaid(s: Schedule): number {
  return s.months.reduce(
    (acc, m) => acc + Object.values(m.values).reduce((a, v) => a + (v.interestPaid || 0), 0),
    0,
  )
}

export function getTotalAmountPaid(s: Schedule): number {
  return s.months.reduce(
    (acc, m) => acc + Object.values(m.values).reduce((a, v) => a + (v.amountPaid || 0), 0),
    0,
  )
}

export function getPayoffMonths(s: Schedule): number {
  return s.months[s.months.length - 1]?.month || 0
}

export function getMonthlyPayments(s: Schedule): number[] {
  return s.months
    .slice(1)
    .map(m => Object.values(m.values).reduce((a, v) => a + (v.amountPaid || 0), 0))
}

export function getAverageMonthlyPayment(s: Schedule): number {
  const p = getMonthlyPayments(s)
  return p.length === 0 ? 0 : p.reduce((a, b) => a + b, 0) / p.length
}

export function getWeightedAverageInterestRate(debts: Debt[]): number {
  const total = debts.reduce((a, d) => a + parseMoney(d.amount), 0)
  if (total === 0) return 0
  return debts.reduce((a, d) => a + parseMoney(d.amount) * (parseFloat(d.rate) || 0), 0) / total
}

export function getDebtPayoffOrder(s: Schedule, debts: Debt[]): { debt: Debt; month: number }[] {
  const order: { debt: Debt; month: number }[] = []
  for (const debt of debts) {
    for (let i = 1; i < s.months.length; i++) {
      const prev = s.months[i - 1]?.values[debt.id]?.remainingBalance ?? 0
      const curr = s.months[i]?.values[debt.id]?.remainingBalance ?? 0
      if (prev > 0 && curr === 0) {
        order.push({ debt, month: s.months[i].month })
        break
      }
    }
  }
  return order.sort((a, b) => a.month - b.month)
}

// Future value of each monthly payment, grown until month `totalMonths`.
export function calculateInvestmentGrowth(
  payments: number[],
  totalMonths: number,
  annualReturn: number,
): number {
  const r = annualReturn / 100 / 12
  return payments.reduce((total, payment, i) => {
    const growth = totalMonths - i
    return total + (growth > 0 ? payment * Math.pow(1 + r, growth) : payment)
  }, 0)
}

// Future value of a fixed monthly investment for `months` months.
export function calculatePostDebtInvesting(
  monthly: number,
  months: number,
  annualReturn: number,
): number {
  const r = annualReturn / 100 / 12
  let total = 0
  for (let i = 0; i < months; i++) total += monthly * Math.pow(1 + r, months - i)
  return total
}

export type Frequency = 'daily' | 'weekly' | 'monthly'

export function toMonthly(cost: number, f: Frequency): number {
  return f === 'daily' ? cost * 30 : f === 'weekly' ? cost * (52 / 12) : cost
}

export function toYearly(cost: number, f: Frequency): number {
  return f === 'daily' ? cost * 365 : f === 'weekly' ? cost * 52 : cost * 12
}

export function formatMonthsAsTime(months: number): string {
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} month${rest !== 1 ? 's' : ''}`
  if (rest === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years}y ${rest}m`
}

export function payoffDate(months: number, from = now()): string {
  return format(addMonths(from, months), 'MMM yyyy')
}

export function monthLabel(months: number, from = now()): string {
  return format(addMonths(from, months), "MMM ''yy")
}

export function totalMinimumRepayments(debts: Debt[]): number {
  return debts.reduce((a, d) => a + parseMoney(d.repayment), 0)
}
