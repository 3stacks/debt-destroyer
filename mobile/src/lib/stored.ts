// The saved state, and the checks that turn unknown JSON into it. The app
// runs these checks when it loads its state from the device, and when it
// imports a backup file.
import { Debt, DEBT_PAYOFF_METHODS, Frequency } from './metrics'
import { DebtEntry, PlanVersion, Reconciliation, Tracking } from './tracking'

export interface Vice {
  id: string
  name: string
  cost: string
  frequency: Frequency
}

export interface StoredPlan {
  debts: Debt[]
  method: DEBT_PAYOFF_METHODS
  extra: string
  vices: Vice[]
}

export interface Stored {
  draft: StoredPlan
  tracking: Tracking | null
}

export const EMPTY: StoredPlan = {
  debts: [],
  method: DEBT_PAYOFF_METHODS.SNOWBALL,
  extra: '0',
  vices: [],
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
// A number in an old or hand-made file becomes the string that the app uses.
const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : fallback

export function isMethod(v: unknown): v is DEBT_PAYOFF_METHODS {
  return v === DEBT_PAYOFF_METHODS.SNOWBALL || v === DEBT_PAYOFF_METHODS.AVALANCHE
}

function parseDebt(v: unknown): Debt | null {
  if (!isObj(v) || !str(v.id)) return null
  const debt: Debt = { id: str(v.id), name: str(v.name), amount: str(v.amount), rate: str(v.rate), repayment: str(v.repayment) }
  if (Array.isArray(v.from)) debt.from = v.from.filter((x): x is string => typeof x === 'string')
  return debt
}

const parseDebts = (v: unknown): Debt[] => (Array.isArray(v) ? v.map(parseDebt).filter((d): d is Debt => d !== null) : [])

function parseVice(v: unknown): Vice | null {
  if (!isObj(v) || !str(v.id)) return null
  const f = v.frequency
  const frequency: Frequency = f === 'daily' || f === 'weekly' || f === 'monthly' ? f : 'monthly'
  return { id: str(v.id), name: str(v.name), cost: str(v.cost), frequency }
}

export function parseDraft(v: unknown): StoredPlan {
  if (!isObj(v)) return EMPTY
  return {
    debts: parseDebts(v.debts),
    method: isMethod(v.method) ? v.method : DEBT_PAYOFF_METHODS.SNOWBALL,
    extra: str(v.extra, '0'),
    vices: Array.isArray(v.vices) ? v.vices.map(parseVice).filter((x): x is Vice => x !== null) : [],
  }
}

function parseVersion(v: unknown): PlanVersion | null {
  if (!isObj(v) || !str(v.id) || !MONTH.test(str(v.startMonth))) return null
  return {
    id: str(v.id),
    startMonth: str(v.startMonth),
    createdAt: str(v.createdAt),
    method: isMethod(v.method) ? v.method : DEBT_PAYOFF_METHODS.SNOWBALL,
    extra: str(v.extra, '0'),
    debts: parseDebts(v.debts),
  }
}

function parseRec(month: string, v: unknown): Reconciliation | null {
  if (!MONTH.test(month) || !isObj(v) || !isObj(v.entries)) return null
  const entries: Record<string, DebtEntry> = {}
  for (const [id, e] of Object.entries(v.entries)) {
    if (!isObj(e)) continue
    entries[id] = e.balance === undefined ? { paid: str(e.paid) } : { paid: str(e.paid), balance: str(e.balance) }
  }
  return { month, entries, savedAt: str(v.savedAt) }
}

export function parseTracking(v: unknown): Tracking | null {
  if (!isObj(v) || !Array.isArray(v.versions)) return null
  const versions = v.versions.map(parseVersion).filter((x): x is PlanVersion => x !== null)
  if (versions.length === 0) return null
  versions.sort((a, b) => a.startMonth.localeCompare(b.startMonth))
  const recs: Record<string, Reconciliation> = {}
  if (isObj(v.recs)) {
    for (const [month, r] of Object.entries(v.recs)) {
      const rec = parseRec(month, r)
      if (rec) recs[month] = rec
    }
  }
  return { versions, recs }
}

export function parseState(v: unknown): Stored {
  if (!isObj(v)) return { draft: EMPTY, tracking: null }
  return { draft: parseDraft(v.draft), tracking: parseTracking(v.tracking) }
}
