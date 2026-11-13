import { ReactNode } from 'react'
import { Debt, Schedule } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { Callout, Empty, Screen } from './ui'

// Show the empty or the "never ends" state, or render the screen with a valid
// schedule.
export function PlanGate({
  empty,
  children,
}: {
  empty: string
  children: (schedule: Schedule, debts: Debt[]) => ReactNode
}) {
  const { result } = usePlan()
  if (result.ok) return <>{children(result.schedule, result.debts)}</>
  return (
    <Screen>
      {result.reason === 'never' ? (
        <Callout tone="bad" title="This plan never ends">
          Your repayments do not cover the interest. Change the plan on the Plan tab.
        </Callout>
      ) : (
        <Empty title="Add your debts first" body={empty} />
      )}
    </Screen>
  )
}
