import { useState } from 'react'
import { Text, View } from 'react-native'
import { MonthDetail, PaymentsChart } from '../../../components/charts'
import { Body, Callout, Card, Divider, Empty, Row, Screen, SectionHeader } from '../../../components/ui'
import { money, payoffDate } from '../../../lib/metrics'
import { usePlan } from '../../../lib/plan'
import { space, useColors } from '../../../lib/theme'

export default function ChartScreen() {
  const c = useColors()
  const { result } = usePlan()
  const [detail, setDetail] = useState<MonthDetail | null>(null)

  if (!result.ok) {
    return (
      <Screen>
        {result.reason === 'never' ? (
          <Callout tone="bad" title="This plan never ends">
            Your repayments do not cover the interest. Change the plan on the Plan tab.
          </Callout>
        ) : (
          <Empty title="Nothing to chart yet" body="Add your debts on the Plan tab to see your payoff month by month." />
        )}
      </Screen>
    )
  }

  // Ignore a selection from an older schedule.
  const current = detail && detail.month < result.schedule.months.length ? detail : null

  return (
    <Screen>
      <Card>
        <Body muted>Monthly payments, stacked by debt. Scroll sideways for later months, and tap a bar for details.</Body>
        <PaymentsChart
          schedule={result.schedule}
          debts={result.debts}
          selected={current?.month ?? null}
          onSelect={m => setDetail(current?.month === m.month ? null : m)}
        />
      </Card>

      {current ? (
        <>
          <SectionHeader title={payoffDate(current.month)} />
          <Card>
            {current.parts.map(p => (
              <View key={p.id} style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: p.color }} />
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{p.name}</Text>
                  <Text style={{ color: c.text, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                    ${p.paid.toFixed(2)}
                  </Text>
                </View>
                <Text style={{ color: c.muted, fontSize: 13, marginLeft: 18 }}>
                  {p.remaining > 0 ? `${money(p.remaining)} left` : 'Paid off'}
                </Text>
              </View>
            ))}
            <Divider />
            <Row label="Total paid" value={`$${current.total.toFixed(2)}`} />
          </Card>
        </>
      ) : null}
    </Screen>
  )
}
