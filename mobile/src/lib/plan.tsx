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
  useRef,
  useState,
} from 'react'
import { AppState } from 'react-native'
import { Debt, DEBT_PAYOFF_METHODS, parseMoney, PlanResult, runPlan } from './metrics'
import { E2E, now, setClock } from './clock'
import { analyse, Analysis, DebtEntry, monthKey, openingBalances, PlanVersion, revisionStarts, Tracking } from './tracking'
import { reportOpen, type PlanStage } from './usage'
import { EMPTY, isMethod, parseDraft, parseState, Stored, StoredPlan, Vice } from './stored'

const LEGACY_KEY = 'debt-destroyer:plan:v1'
// The fixed month of an end-to-end test. Only an E2E build reads it.
const CLOCK_KEY = 'debt-destroyer:e2e-clock'
const STORAGE_KEY = 'debt-destroyer:state:v2'

async function load(): Promise<Stored> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return parseState(JSON.parse(raw))
    } catch {
      return { draft: EMPTY, tracking: null }
    }
  }
  // The first native version kept only the draft, under another key.
  const legacy = await AsyncStorage.getItem(LEGACY_KEY)
  try {
    return { draft: legacy ? parseDraft(JSON.parse(legacy)) : EMPTY, tracking: null }
  } catch {
    return { draft: EMPTY, tracking: null }
  }
}

export type { Stored, Vice } from './stored'

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
  startPlan: (firstMonth: string) => void
  saveReconciliation: (month: string, entries: Record<string, DebtEntry>) => void
  deleteReconciliation: (month: string) => void
  beginRevision: () => void
  revisionMonth: string | null
  setRevisionMonth: (month: string) => void
  saveRevision: () => void
  endPlan: () => void
  // Replace the whole state with an imported backup.
  replaceState: (state: Stored) => void
  // End-to-end tests only: replace the whole state, and fix the clock.
  loadScenario: (state: Stored, month: string) => void
  setMethod: (m: DEBT_PAYOFF_METHODS) => void
  setExtra: (v: string) => void
  addDebt: () => string
  updateDebt: (id: string, patch: Partial<Debt>) => void
  removeDebt: (id: string) => void
  // Replace debts in the draft with one new loan that records them.
  consolidate: (ids: string[], loan: Omit<Debt, 'id' | 'from'>) => void
  addVice: (v?: Partial<Omit<Vice, 'id'>>) => void
  updateVice: (id: string, patch: Partial<Vice>) => void
  removeVice: (id: string) => void
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [clockTick, setClockTick] = useState(0)
  const [plan, setPlan] = useState<StoredPlan>(EMPTY)
  const [tracking, setTracking] = useState<Tracking | null>(null)

  useEffect(() => {
    const clock = E2E
      ? AsyncStorage.getItem(CLOCK_KEY).then(m => {
          setClock(m)
          setClockTick(t => t + 1)
        })
      : Promise.resolve()
    clock
      .then(() => load())
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

  // Anonymous usage counts (see usage.ts): when the app opens, and each time
  // it comes back to the foreground. usage.ts sends each event at most once a day.
  const stage = useRef<PlanStage>('none')
  stage.current = tracking ? 'tracking' : plan.debts.length > 0 ? 'draft' : 'none'
  useEffect(() => {
    if (!ready) return
    reportOpen(stage.current)
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') reportOpen(stage.current)
    })
    return () => sub.remove()
  }, [ready])

  // clockTick changes when a test fixes the clock, so that "today" follows it.
  const today = useMemo(() => monthKey(now()), [clockTick])
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

  const consolidate = useCallback((ids: string[], loan: Omit<Debt, 'id' | 'from'>) => {
    setPlan(p => ({
      ...p,
      debts: [...p.debts.filter(d => !ids.includes(d.id)), { ...loan, id: nanoid(), from: ids }],
    }))
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
      createdAt: now().toISOString(),
      method: plan.method,
      extra: plan.extra,
      debts: plan.debts.filter(d => parseMoney(d.amount) > 0),
    }),
    [plan],
  )

  // The user chooses the first payment month: this month or next month.
  const startPlan = useCallback(
    (firstMonth: string) => {
      setTracking({ versions: [versionFromDraft(firstMonth)], recs: {} })
    },
    [versionFromDraft],
  )

  const saveReconciliation = useCallback((month: string, entries: Record<string, DebtEntry>) => {
    setTracking(t => (t ? { ...t, recs: { ...t.recs, [month]: { month, entries, savedAt: now().toISOString() } } } : t))
  }, [])
  const deleteReconciliation = useCallback((month: string) => {
    setTracking(t => {
      if (!t) return t
      const recs = { ...t.recs }
      delete recs[month]
      return { ...t, recs }
    })
  }, [])

  const [revisionMonth, setRevisionMonthState] = useState<string | null>(null)

  // Load the actual position into the draft. The revision starts in this month
  // when that is a choice, so that a new debt shows in this month's reconciliation.
  const beginRevision = useCallback(() => {
    if (!analysis) return
    const starts = revisionStarts(analysis)
    const start = starts.includes(today) ? today : starts[starts.length - 1]
    const opening = openingBalances(analysis, start)
    setRevisionMonthState(start)
    setPlan(p => ({
      ...p,
      method: isMethod(analysis.current.method) ? analysis.current.method : p.method,
      extra: analysis.current.extra,
      // A debt that the current version added has no earlier balance: keep its amount.
      debts: analysis.current.debts
        .map(d => (d.id in opening ? { ...d, amount: String(opening[d.id]) } : d))
        .filter(d => parseMoney(d.amount) > 0),
    }))
  }, [analysis, today])

  // Change the start month, and move the balances of the existing debts to that
  // month. Keep the other changes in the draft, such as a new debt.
  const setRevisionMonth = useCallback(
    (month: string) => {
      if (!analysis) return
      const opening = openingBalances(analysis, month)
      setRevisionMonthState(month)
      setPlan(p => ({
        ...p,
        debts: p.debts.map(d => (d.id in opening ? { ...d, amount: String(opening[d.id]) } : d)),
      }))
    },
    [analysis],
  )

  const saveRevision = useCallback(() => {
    if (!analysis || !tracking) return
    const start = revisionMonth ?? revisionStarts(analysis).at(-1)!
    const version = versionFromDraft(start)
    // A revision from the start of the current version, or before it, replaces
    // that version. It has no reconciled month of its own.
    const versions =
      start <= analysis.current.startMonth
        ? [...tracking.versions.slice(0, -1), version]
        : [...tracking.versions, version]
    setTracking({ ...tracking, versions })
  }, [analysis, tracking, versionFromDraft, revisionMonth])

  const endPlan = useCallback(() => setTracking(null), [])

  const replaceState = useCallback((state: Stored) => {
    setRevisionMonthState(null)
    setPlan(state.draft)
    setTracking(state.tracking)
  }, [])

  const loadScenario = useCallback((state: Stored, month: string) => {
    if (!E2E) return
    setClock(month)
    AsyncStorage.setItem(CLOCK_KEY, month).catch(() => {})
    setClockTick(t => t + 1)
    setPlan(state.draft)
    setTracking(state.tracking)
  }, [])

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
      consolidate,
      addVice,
      updateVice,
      removeVice,
      startPlan,
      saveReconciliation,
      deleteReconciliation,
      beginRevision,
      revisionMonth,
      setRevisionMonth,
      saveRevision,
      endPlan,
      replaceState,
      loadScenario,
    }),
    [plan, ready, result, draftResult, calcMethod, extraAmount, tracking, analysis, today, setMethod, setExtra, addDebt, updateDebt, removeDebt, consolidate, addVice, updateVice, removeVice, startPlan, saveReconciliation, deleteReconciliation, beginRevision, revisionMonth, setRevisionMonth, saveRevision, endPlan, replaceState, loadScenario],
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
