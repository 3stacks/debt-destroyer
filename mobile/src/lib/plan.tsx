// The plan: the debts, the payoff method, the extra monthly amount and the
// vices, plus the tracking of a started plan. The web app keeps its state in
// the URL. The native app keeps it on the device in AsyncStorage.
//
// The draft is the plan that the Plan tab edits. "Start plan" copies the draft
// into the first plan version. "Revise plan" loads the actual position into the
// draft, and "Save revision" adds the draft as a new version.
import AsyncStorage from '@react-native-async-storage/async-storage'
import { nanoid } from 'nanoid/non-secure'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Debt, DEBT_PAYOFF_METHODS, Frequency, parseMoney, PlanResult, runPlan } from './metrics'
import { analyse, Analysis, DebtEntry, monthKey, PlanVersion, revisionStart, shiftMonth, Tracking } from './tracking'

const LEGACY_KEY = 'debt-destroyer:plan:v1'
const STORAGE_KEY = 'debt-destroyer:state:v2'

export interface Vice {
  id: string
  name: string
  cost: string
  frequency: Frequency
}

interface StoredPlan {
  debts: Debt[]
  method: DEBT_PAYOFF_METHODS
  extra: string
  vices: Vice[]
}

interface Stored {
  draft: StoredPlan
  tracking: Tracking | null
}

interface PlanContextValue extends StoredPlan {
  ready: boolean
  // The schedule for the result tabs: the forecast from the actual position
  // for a started plan, or the draft otherwise.
  result: PlanResult
  draftResult: PlanResult
  calcMethod: string
  extraAmount: number
  tracking: Tracking | null
  analysis: Analysis | null
  today: string
  startPlan: () => void
  saveReconciliation: (month: string, entries: Record<string, DebtEntry>) => void
  deleteReconciliation: (month: string) => void
  beginRevision: () => void
  saveRevision: () => void
  endPlan: () => void
  setMethod: (m: DEBT_PAYOFF_METHODS) => void
  setExtra: (v: string) => void
  addDebt: () => string
  updateDebt: (id: string, patch: Partial<Debt>) => void
  removeDebt: (id: string) => void
  addVice: (v?: Partial<Omit<Vice, 'id'>>) => void
  updateVice: (id: string, patch: Partial<Vice>) => void
  removeVice: (id: string) => void
}

const EMPTY: StoredPlan = {
  debts: [],
  method: DEBT_PAYOFF_METHODS.SNOWBALL,
  extra: '0',
  vices: [],
}

const PlanContext = createContext<PlanContextValue | null>(null)

function isMethod(v: unknown): v is DEBT_PAYOFF_METHODS {
  return v === DEBT_PAYOFF_METHODS.SNOWBALL || v === DEBT_PAYOFF_METHODS.AVALANCHE
}

function parseDraft(p: Partial<StoredPlan> | undefined): StoredPlan {
  if (!p) return EMPTY
  return {
      debts: Array.isArray(p.debts) ? p.debts : [],
      method: isMethod(p.method) ? p.method : DEBT_PAYOFF_METHODS.SNOWBALL,
      extra: typeof p.extra === 'string' ? p.extra : '0',
      vices: Array.isArray(p.vices) ? p.vices : [],
  }
}

function parseTracking(t: unknown): Tracking | null {
  const v = t as Partial<Tracking> | null
  if (!v || !Array.isArray(v.versions) || v.versions.length === 0) return null
  return { versions: v.versions, recs: v.recs && typeof v.recs === 'object' ? v.recs : {} }
}

async function load(): Promise<Stored> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const p = JSON.parse(raw) as Partial<Stored>
      return { draft: parseDraft(p.draft), tracking: parseTracking(p.tracking) }
    } catch {
      return { draft: EMPTY, tracking: null }
    }
  }
  return { draft: parseStored(await AsyncStorage.getItem(LEGACY_KEY)), tracking: null }
}

function parseStored(raw: string | null): StoredPlan {
  if (!raw) return EMPTY
  try {
    const p = JSON.parse(raw) as Partial<StoredPlan>
    return {
      debts: Array.isArray(p.debts) ? p.debts : [],
      method: isMethod(p.method) ? p.method : DEBT_PAYOFF_METHODS.SNOWBALL,
      extra: typeof p.extra === 'string' ? p.extra : '0',
      vices: Array.isArray(p.vices) ? p.vices : [],
    }
  } catch {
    return EMPTY
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [plan, setPlan] = useState<StoredPlan>(EMPTY)
  const [tracking, setTracking] = useState<Tracking | null>(null)

  useEffect(() => {
    load()
      .then(s => {
        setPlan(s.draft)
        setTracking(s.tracking)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    const stored: Stored = { draft: plan, tracking }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {})
  }, [plan, tracking, ready])

  const today = monthKey(new Date())
  const analysis = useMemo(() => (tracking ? analyse(tracking, today) : null), [tracking, today])

  // Typing must stay smooth, so the schedule follows the inputs at a lower
  // priority.
  const deferred = useDeferredValue(plan)
  const draftExtra = parseMoney(deferred.extra)
  const draftResult = useMemo(
    () => runPlan(deferred.debts, deferred.method, draftExtra),
    [deferred.debts, deferred.method, draftExtra],
  )
  const result = analysis ? analysis.forecast : draftResult
  const calcMethod = analysis ? analysis.current.method : deferred.method
  const extraAmount = analysis ? parseMoney(analysis.current.extra) : draftExtra

  const setMethod = useCallback((method: DEBT_PAYOFF_METHODS) => setPlan(p => ({ ...p, method })), [])
  const setExtra = useCallback((extra: string) => setPlan(p => ({ ...p, extra })), [])

  const addDebt = useCallback(() => {
    const id = nanoid()
    setPlan(p => ({ ...p, debts: [...p.debts, { id, name: '', amount: '', rate: '', repayment: '' }] }))
    return id
  }, [])
  const updateDebt = useCallback((id: string, patch: Partial<Debt>) => {
    setPlan(p => ({ ...p, debts: p.debts.map(d => (d.id === id ? { ...d, ...patch } : d)) }))
  }, [])
  const removeDebt = useCallback((id: string) => {
    setPlan(p => ({ ...p, debts: p.debts.filter(d => d.id !== id) }))
  }, [])

  const addVice = useCallback((v?: Partial<Omit<Vice, 'id'>>) => {
    setPlan(p => ({
      ...p,
      vices: [...p.vices, { id: nanoid(), name: '', cost: '', frequency: 'weekly', ...v }],
    }))
  }, [])
  const updateVice = useCallback((id: string, patch: Partial<Vice>) => {
    setPlan(p => ({ ...p, vices: p.vices.map(v => (v.id === id ? { ...v, ...patch } : v)) }))
  }, [])
  const removeVice = useCallback((id: string) => {
    setPlan(p => ({ ...p, vices: p.vices.filter(v => v.id !== id) }))
  }, [])

  const versionFromDraft = useCallback(
    (startMonth: string): PlanVersion => ({
      id: nanoid(),
      startMonth,
      createdAt: new Date().toISOString(),
      method: plan.method,
      extra: plan.extra,
      debts: plan.debts.filter(d => parseMoney(d.amount) > 0),
    }),
    [plan],
  )

  // The first payment is next month. This matches the dates on the other tabs
  // and in the web app, which count month 1 from next month.
  const startPlan = useCallback(() => {
    setTracking({ versions: [versionFromDraft(shiftMonth(today, 1))], recs: {} })
  }, [versionFromDraft, today])

  const saveReconciliation = useCallback((month: string, entries: Record<string, DebtEntry>) => {
    setTracking(t => (t ? { ...t, recs: { ...t.recs, [month]: { month, entries, savedAt: new Date().toISOString() } } } : t))
  }, [])
  const deleteReconciliation = useCallback((month: string) => {
    setTracking(t => {
      if (!t) return t
      const recs = { ...t.recs }
      delete recs[month]
      return { ...t, recs }
    })
  }, [])

  const beginRevision = useCallback(() => {
    if (!analysis) return
    setPlan(p => ({
      ...p,
      method: isMethod(analysis.current.method) ? analysis.current.method : p.method,
      extra: analysis.current.extra,
      debts: analysis.forecastDebts.filter(d => parseMoney(d.amount) > 0),
    }))
  }, [analysis])

  const saveRevision = useCallback(() => {
    if (!analysis || !tracking) return
    const start = revisionStart(analysis)
    const version = versionFromDraft(start)
    const versions =
      start === analysis.current.startMonth
        ? [...tracking.versions.slice(0, -1), version]
        : [...tracking.versions, version]
    setTracking({ ...tracking, versions })
  }, [analysis, tracking, versionFromDraft])

  const endPlan = useCallback(() => setTracking(null), [])

  const value = useMemo<PlanContextValue>(
    () => ({
      ...plan,
      ready,
      result,
      draftResult,
      calcMethod,
      extraAmount,
      tracking,
      analysis,
      today,
      setMethod,
      setExtra,
      addDebt,
      updateDebt,
      removeDebt,
      addVice,
      updateVice,
      removeVice,
      startPlan,
      saveReconciliation,
      deleteReconciliation,
      beginRevision,
      saveRevision,
      endPlan,
    }),
    [plan, ready, result, draftResult, calcMethod, extraAmount, tracking, analysis, today, setMethod, setExtra, addDebt, updateDebt, removeDebt, addVice, updateVice, removeVice, startPlan, saveReconciliation, deleteReconciliation, beginRevision, saveRevision, endPlan],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider')
  return ctx
}

// A debt counts once it has a positive balance. This matches the filter in the
// payoff engine.
export function activeDebts(debts: Debt[]): Debt[] {
  return debts.filter(d => parseMoney(d.amount) > 0)
}
