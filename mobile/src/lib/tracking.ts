// Plan tracking. The user starts a plan, then reconciles each month with what
// they actually paid. A revision starts a new plan version from the actual
// balances. Earlier versions and reconciliations stay as history.
//
// Months are calendar keys in the form "YYYY-MM". Plan month 1 of a version is
// its start month.
import { addMonths, format, parse } from 'date-fns'
import { Debt, getPayoffMonths, PlanResult, runPlan, Schedule } from './metrics'

export interface PlanVersion {
  id: string
  startMonth: string
  createdAt: string
  method: string
  extra: string
  debts: Debt[]
}

export interface DebtEntry {
  paid: string
  // A statement balance overrides the calculated balance.
  balance?: string
}

export interface Reconciliation {
  month: string
  entries: Record<string, DebtEntry>
  savedAt: string
}

export interface Tracking {
  versions: PlanVersion[]
  recs: Record<string, Reconciliation>
}

export const monthKey = (d: Date) => format(d, 'yyyy-MM')
const toDate = (key: string) => parse(key, 'yyyy-MM', new Date(2000, 0, 1))
export const shiftMonth = (key: string, n: number) => monthKey(addMonths(toDate(key), n))
export const monthName = (key: string) => format(toDate(key), 'MMMM yyyy')
export const monthShort = (key: string) => format(toDate(key), 'MMM yyyy')

export function monthDiff(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

const round2 = (n: number) => Math.round(n * 100) / 100
const num = (s: string | undefined) => {
  const n = s === undefined || s.trim() === '' ? NaN : Number(s)
  return Number.isFinite(n) ? n : NaN
}

export function versionFor(t: Tracking, month: string): PlanVersion | undefined {
  let found: PlanVersion | undefined
  for (const v of t.versions) if (v.startMonth <= month) found = v
  return found
}

export function planFor(v: PlanVersion): PlanResult {
  return runPlan(v.debts, v.method, Math.max(0, num(v.extra) || 0))
}

// The planned payment and balance for each debt in a calendar month.
export function plannedMonth(
  v: PlanVersion,
  schedule: Schedule,
  month: string,
): Record<string, { paid: number; balance: number }> {
  const index = monthDiff(v.startMonth, month) + 1
  const row = schedule.months[index]
  const out: Record<string, { paid: number; balance: number }> = {}
  for (const d of v.debts) {
    out[d.id] = {
      paid: row?.values[d.id]?.amountPaid ?? 0,
      balance: row ? (row.values[d.id]?.remainingBalance ?? 0) : 0,
    }
  }
  return out
}

// Apply one month of interest and the actual payment, as the engine does.
export function applyMonth(
  debts: Debt[],
  balances: Record<string, number>,
  rec: Reconciliation,
): Record<string, number> {
  const next: Record<string, number> = {}
  for (const d of debts) {
    const b = balances[d.id] ?? 0
    const entry = rec.entries[d.id]
    const override = num(entry?.balance)
    if (Number.isFinite(override)) {
      next[d.id] = Math.max(0, override)
      continue
    }
    if (b <= 0) {
      next[d.id] = 0
      continue
    }
    const interest = round2((b * (num(d.rate) || 0)) / 1200)
    const paid = num(entry?.paid) || 0
    next[d.id] = Math.max(0, round2(b + interest - paid))
  }
  return next
}

export interface MonthRow {
  month: string
  version: PlanVersion
  reconciled: boolean
  plannedPaid: number
  actualPaid: number | null
  // Paid minus planned. A negative value means less than the plan.
  variance: number | null
  plannedBalance: number
  actualBalance: number | null
}

export interface Analysis {
  current: PlanVersion
  original: PlanVersion
  rows: MonthRow[]
  dueMonths: string[]
  lastReconciled: string | null
  balances: Record<string, number>
  totalPlannedPaid: number
  totalActualPaid: number
  totalVariance: number
  plannedPayoff: string | null
  originalPayoff: string | null
  forecast: PlanResult
  forecastDebts: Debt[]
  projectedPayoff: string | null
  // Actual minus planned total balance after the last reconciled month of the
  // current version. Positive means behind the plan.
  balanceGap: number | null
  // Positive means later than the current plan.
  monthsBehindPlan: number | null
  monthsBehindOriginal: number | null
}

function payoffKey(v: PlanVersion, r: PlanResult): string | null {
  return r.ok ? shiftMonth(v.startMonth, getPayoffMonths(r.schedule) - 1) : null
}

export function analyse(t: Tracking, today: string): Analysis | null {
  if (t.versions.length === 0) return null
  const original = t.versions[0]
  const current = t.versions[t.versions.length - 1]
  const plans = new Map(t.versions.map(v => [v.id, planFor(v)]))

  const rows: MonthRow[] = []
  let balances: Record<string, number> = {}
  let contiguous = false
  let activeVersion: PlanVersion | null = null
  let lastReconciled: string | null = null
  let totalPlannedPaid = 0
  let totalActualPaid = 0

  const end = today < current.startMonth ? current.startMonth : today
  for (let m = original.startMonth; m <= end; m = shiftMonth(m, 1)) {
    const v = versionFor(t, m)!
    if (v !== activeVersion) {
      activeVersion = v
      balances = Object.fromEntries(v.debts.map(d => [d.id, Math.max(0, num(d.amount) || 0)]))
      contiguous = true
    }
    const plan = plans.get(v.id)!
    const planned = plan.ok ? plannedMonth(v, plan.schedule, m) : {}
    const plannedPaid = Object.values(planned).reduce((a, p) => a + p.paid, 0)
    const plannedBalance = Object.values(planned).reduce((a, p) => a + p.balance, 0)
    const rec = t.recs[m]

    let actualPaid: number | null = null
    let actualBalance: number | null = null
    if (rec) {
      actualPaid = v.debts.reduce((a, d) => a + (num(rec.entries[d.id]?.paid) || 0), 0)
      totalPlannedPaid += plannedPaid
      totalActualPaid += actualPaid
      if (contiguous) {
        balances = applyMonth(v.debts, balances, rec)
        actualBalance = Object.values(balances).reduce((a, b) => a + b, 0)
        if (v === current) lastReconciled = m
      }
    } else {
      contiguous = false
    }

    rows.push({
      month: m,
      version: v,
      reconciled: !!rec,
      plannedPaid,
      actualPaid,
      variance: actualPaid === null ? null : round2(actualPaid - plannedPaid),
      plannedBalance,
      actualBalance,
    })
  }

  // The forecast starts from the balances after the last reconciled month of
  // the current version.
  const forecastBalances =
    lastReconciled !== null
      ? balances
      : Object.fromEntries(current.debts.map(d => [d.id, Math.max(0, num(d.amount) || 0)]))
  const forecastDebts = current.debts.map(d => ({ ...d, amount: String(forecastBalances[d.id] ?? 0) }))
  const forecast = runPlan(forecastDebts, current.method, Math.max(0, num(current.extra) || 0))
  const forecastStart = lastReconciled ? shiftMonth(lastReconciled, 1) : current.startMonth
  const projectedPayoff = forecast.ok
    ? shiftMonth(forecastStart, getPayoffMonths(forecast.schedule) - 1)
    : forecast.reason === 'empty'
      ? lastReconciled
      : null

  const currentPlan = plans.get(current.id)!
  const plannedPayoff = payoffKey(current, currentPlan)
  let balanceGap: number | null = null
  if (lastReconciled && currentPlan.ok) {
    const planned = plannedMonth(current, currentPlan.schedule, lastReconciled)
    const plannedTotal = Object.values(planned).reduce((x, p) => x + p.balance, 0)
    const actualTotal = Object.values(forecastBalances).reduce((x, b) => x + b, 0)
    balanceGap = round2(actualTotal - plannedTotal)
  }
  const originalPayoff = payoffKey(original, plans.get(original.id)!)

  return {
    current,
    original,
    rows,
    dueMonths: rows.filter(r => r.version === current && !r.reconciled && r.month <= today).map(r => r.month),
    lastReconciled,
    balances: forecastBalances,
    totalPlannedPaid,
    totalActualPaid,
    totalVariance: round2(totalActualPaid - totalPlannedPaid),
    plannedPayoff,
    originalPayoff,
    forecast,
    forecastDebts,
    projectedPayoff,
    balanceGap,
    monthsBehindPlan: projectedPayoff && plannedPayoff ? monthDiff(plannedPayoff, projectedPayoff) : null,
    monthsBehindOriginal: projectedPayoff && originalPayoff ? monthDiff(originalPayoff, projectedPayoff) : null,
  }
}

// The month that a revision starts: the month after the last reconciled month,
// or the start of the current version when nothing is reconciled.
export function revisionStart(a: Analysis): string {
  return a.lastReconciled ? shiftMonth(a.lastReconciled, 1) : a.current.startMonth
}
