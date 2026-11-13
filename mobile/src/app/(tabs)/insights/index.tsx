import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { PlanGate } from '../../../components/PlanGate'
import { ScenarioCard } from '../../../components/ScenarioCard'
import { Body, Callout, Card, Screen, SectionHeader, Stat, StatGrid } from '../../../components/ui'
import {
  Debt,
  formatMonthsAsTime,
  getDebtPayoffOrder,
  getPayoffMonths,
  getTotalInterestPaid,
  money,
  payoffDate,
  runPlan,
  Schedule,
  totalMinimumRepayments,
} from '../../../lib/metrics'
import { usePlan } from '../../../lib/plan'
import { space, useColors } from '../../../lib/theme'

const PERCENTAGES = [10, 25, 50]

function Insights({ schedule, debts }: { schedule: Schedule; debts: Debt[] }) {
  const c = useColors()
  const { calcMethod: method, extraAmount } = usePlan()
  const totalMonthly = totalMinimumRepayments(debts) + extraAmount

  const scenarios = useMemo(
    () =>
      PERCENTAGES.map(pct => {
        const add = Math.round(totalMonthly * (pct / 100))
        const r = runPlan(debts, method, extraAmount + add)
        return r.ok ? { pct, add, months: getPayoffMonths(r.schedule), interest: getTotalInterestPaid(r.schedule) } : null
      }),
    [debts, method, extraAmount, totalMonthly],
  )

  const months = getPayoffMonths(schedule)
  const interest = getTotalInterestPaid(schedule)
  const order = getDebtPayoffOrder(schedule, debts)
  const best = scenarios[scenarios.length - 1]

  return (
    <Screen>
      <StatGrid>
        <Stat value={String(debts.length)} label="Debts to crush" />
        <Stat value={formatMonthsAsTime(months)} label="Until freedom" />
        <Stat value={money(interest)} label="Interest to pay" tone="bad" />
        <Stat value={payoffDate(months)} label="Freedom date" tone="good" />
      </StatGrid>

      {order.length > 1 ? (
        <>
          <SectionHeader title="Payoff order" />
          <Card style={{ gap: space.sm }}>
            {order.map(({ debt, month }, i) => (
              <View key={debt.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: c.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ color: c.accent, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={{ color: c.text, fontSize: 16, flex: 1 }} numberOfLines={1}>
                  {debt.name || 'Unnamed debt'}
                </Text>
                <Text style={{ color: c.muted, fontSize: 15 }}>{formatMonthsAsTime(month)}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="What if you paid more?" />
      <Body muted>You pay {money(totalMonthly)} each month toward debt now.</Body>
      <ScenarioCard title="Current plan" months={months} interest={interest} />
      {scenarios.map(s =>
        s ? (
          <ScenarioCard
            key={s.pct}
            title={`+${s.pct}% (+$${s.add}/mo)`}
            months={s.months}
            interest={s.interest}
            highlight={s.pct === 50}
            monthsSaved={months - s.months}
            interestSaved={interest - s.interest}
          />
        ) : null,
      )}

      {best && months - best.months > 6 ? (
        <Callout tone="good">
          Pay 50% more (${best.add} a month extra) and you are debt free {formatMonthsAsTime(months - best.months)} sooner.
          You also save {money(interest - best.interest)} in interest.
        </Callout>
      ) : null}
    </Screen>
  )
}

export default function InsightsScreen() {
  return (
    <PlanGate empty="Add your debts on the Plan tab to see your insights.">
      {(schedule, debts) => <Insights schedule={schedule} debts={debts} />}
    </PlanGate>
  )
}
