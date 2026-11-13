import { router, Stack } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { HeaderIcon } from '../../../components/HeaderButton'
import { PlanSetup, useAddDebt } from '../../../components/PlanSetup'
import { TrackView } from '../../../components/TrackView'
import { Body, Button, Callout, Card, Screen } from '../../../components/ui'
import { formatMonthsAsTime, getPayoffMonths, getTotalInterestPaid, money, payoffDate } from '../../../lib/metrics'
import { usePlan } from '../../../lib/plan'
import { space, useColors } from '../../../lib/theme'

function SetupScreen() {
  const c = useColors()
  const { draftResult: result, startPlan } = usePlan()
  const addDebt = useAddDebt()

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderIcon onPress={() => router.push('/about')} ios="info.circle" android="info" label="About" />,
          headerRight: () => <HeaderIcon onPress={addDebt} ios="plus" android="add" label="Add debt" />,
        }}
      />

      {result.ok ? (
        <Card style={{ backgroundColor: c.accent, gap: space.xs }}>
          <Text style={[styles.heroLabel, { color: c.accentInk }]}>Debt free by</Text>
          <Text style={[styles.heroValue, { color: c.accentInk }]}>{payoffDate(getPayoffMonths(result.schedule))}</Text>
          <Text style={[styles.heroLabel, { color: c.accentInk }]}>
            {formatMonthsAsTime(getPayoffMonths(result.schedule))} · {money(getTotalInterestPaid(result.schedule))} interest
          </Text>
        </Card>
      ) : result.reason === 'never' ? (
        <Callout tone="bad" title="This plan never ends">
          Your repayments do not cover the interest. Increase a minimum repayment or add an extra monthly amount.
        </Callout>
      ) : null}

      <PlanSetup />

      {result.ok ? (
        <Card>
          <Body>
            Start the plan to record what you pay each month, from next month. The app then shows how far you are from
            the plan.
          </Body>
          <Button title="Start this plan" onPress={startPlan} />
        </Card>
      ) : null}
    </Screen>
  )
}

export default function PlanScreen() {
  const { analysis } = usePlan()
  return analysis ? <TrackView analysis={analysis} /> : <SetupScreen />
}

const styles = StyleSheet.create({
  heroLabel: { fontSize: 15, opacity: 0.9 },
  heroValue: { fontSize: 34, fontWeight: '800' },
})
