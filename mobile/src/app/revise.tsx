import { router, Stack } from 'expo-router'
import { Text } from 'react-native'
import { HeaderText } from '../components/HeaderButton'
import { PlanSetup } from '../components/PlanSetup'
import { Body, Button, Callout, Card, Row, Screen } from '../components/ui'
import { getPayoffMonths, getTotalInterestPaid, money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'
import { monthDiff, monthName, monthShort, revisionStart, shiftMonth } from '../lib/tracking'

// Revise a started plan. The draft starts at the actual balances (see
// beginRevision). Saving adds the draft as a new plan version.
export default function Revise() {
  const c = useColors()
  const { analysis, draftResult, saveRevision } = usePlan()

  if (!analysis) {
    return (
      <Screen>
        <Body muted>There is no plan to revise.</Body>
      </Screen>
    )
  }

  const start = revisionStart(analysis)
  const newPayoff = draftResult.ok ? shiftMonth(start, getPayoffMonths(draftResult.schedule) - 1) : null
  const change = newPayoff && analysis.projectedPayoff ? monthDiff(analysis.projectedPayoff, newPayoff) : null

  const save = () => {
    saveRevision()
    router.back()
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          // Android has a back button, and a left button there touches the title.
          headerLeft: process.env.EXPO_OS === 'ios' ? () => <HeaderText title="Cancel" onPress={() => router.back()} /> : undefined,
          headerRight: draftResult.ok ? () => <HeaderText title="Save" bold onPress={save} /> : undefined,
        }}
      />
      <Body muted>
        The balances are your actual balances
        {analysis.lastReconciled ? ` after ${monthName(analysis.lastReconciled)}` : ''}. Change the debts, the method or
        the extra amount. The revised plan starts in {monthName(start)}. Your history stays.
      </Body>

      {draftResult.ok && newPayoff ? (
        <Card style={{ gap: space.sm }}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>Revised plan</Text>
          <Row label="Debt free by" value={monthShort(newPayoff)} />
          <Row label="Interest from now" value={money(getTotalInterestPaid(draftResult.schedule))} />
          {analysis.projectedPayoff ? <Row label="Your current course" value={monthShort(analysis.projectedPayoff)} /> : null}
          {analysis.originalPayoff ? <Row label="Original plan" value={monthShort(analysis.originalPayoff)} /> : null}
          {change !== null && change !== 0 ? (
            <Text style={{ color: change < 0 ? c.good : c.warn, fontSize: 15, fontWeight: '600' }}>
              {Math.abs(change)} month{Math.abs(change) === 1 ? '' : 's'} {change < 0 ? 'sooner' : 'later'} than your current course
            </Text>
          ) : null}
        </Card>
      ) : draftResult.ok ? null : draftResult.reason === 'never' ? (
        <Callout tone="bad" title="This plan never ends">
          Your repayments do not cover the interest. Increase a repayment or the extra amount.
        </Callout>
      ) : (
        <Callout tone="good" title="Nothing left to pay">
          Every debt in this plan has a zero balance.
        </Callout>
      )}

      <PlanSetup />

      {draftResult.ok ? <Button title="Save revision" onPress={save} /> : null}
    </Screen>
  )
}
