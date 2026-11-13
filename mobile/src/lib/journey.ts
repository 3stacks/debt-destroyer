// The frames of the journey replay: the real balances of each reconciled
// month, then the projected balances to the payoff month.
import { Debt, getPayoffMonths } from './metrics'
import { Analysis, monthDiff, shiftMonth, Tracking } from './tracking'

export interface Frame {
  month: string
  balances: Record<string, number>
  total: number
  projected: boolean
  // The debts that reach zero in this frame.
  paidOff: string[]
}

export interface Journey {
  frames: Frame[]
  debts: Record<string, Debt>
  // The highest balance of each debt, for the width of its bar.
  peaks: Record<string, number>
  startTotal: number
  finished: boolean
  realMonths: number
  totalMonths: number
}

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

export function buildJourney(t: Tracking, a: Analysis): Journey {
  const debts: Record<string, Debt> = {}
  for (const v of t.versions) for (const d of v.debts) debts[d.id] = d

  const first = t.versions[0]
  const opening = Object.fromEntries(first.debts.map(d => [d.id, Math.max(0, Number(d.amount) || 0)]))
  const raw: { month: string; balances: Record<string, number>; projected: boolean }[] = [
    { month: shiftMonth(first.startMonth, -1), balances: opening, projected: false },
  ]

  for (const r of a.rows) {
    const b = a.balanceHistory[r.month]
    if (b) raw.push({ month: r.month, balances: b, projected: false })
  }
  const realMonths = raw.length - 1

  if (a.forecast.ok) {
    const start = a.lastReconciled ? shiftMonth(a.lastReconciled, 1) : a.current.startMonth
    const months = a.forecast.schedule.months
    for (let k = 1; k < months.length; k++) {
      const balances = Object.fromEntries(Object.entries(months[k].values).map(([id, v]) => [id, v.remainingBalance]))
      raw.push({ month: shiftMonth(start, k - 1), balances, projected: true })
    }
  }

  const peaks: Record<string, number> = {}
  const frames: Frame[] = raw.map((f, i) => {
    for (const [id, b] of Object.entries(f.balances)) peaks[id] = Math.max(peaks[id] ?? 0, b)
    const prev = i > 0 ? raw[i - 1].balances : {}
    const paidOff = Object.entries(f.balances)
      .filter(([id, b]) => b <= 0 && (prev[id] ?? 0) > 0)
      .map(([id]) => id)
    return { ...f, total: sum(f.balances), paidOff }
  })

  const last = frames[frames.length - 1]
  return {
    frames,
    debts,
    peaks,
    startTotal: a.startTotal,
    finished: last.total <= 0,
    realMonths,
    totalMonths: monthDiff(frames[0].month, last.month),
  }
}

export function payoffMonths(a: Analysis): number {
  return a.forecast.ok ? getPayoffMonths(a.forecast.schedule) : 0
}
