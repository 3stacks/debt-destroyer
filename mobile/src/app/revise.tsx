import { router, Stack } from 'expo-router'
import { Text } from 'react-native'
import { HeaderText } from '../components/HeaderButton'
import { PlanSetup } from '../components/PlanSetup'
import { Body, Button, Callout, Card, Row, Screen, Segmented } from '../components/ui'
import { getPayoffMonths, getTotalInterestPaid, money } from '../lib/metrics'
import { usePlan } from '../lib/plan'
import { space, useColors } from '../lib/theme'
import { monthDiff, monthName, monthShort, revisionStarts, shiftMonth } from '../lib/tracking'

// Revise a started plan. The draft starts at the actual balances (see
// beginRevision). Saving adds the draft as a new plan version.
export default function Revise() {
  const c = useColors()
  const { analysis, draftResult, saveRevision, revisionMonth, setRevisionMonth } = usePlan()

  if (!analysis) {
    return (
      <Screen>
        <Body muted>There is no plan to revise.</Body>
      </Screen>
    )
  }

  const starts = revisionStarts(analysis)
  const start = revisionMonth && starts.includes(revisionMonth) ? revisionMonth : starts[starts.length - 1]
  // The revision starts in a month that is already reconciled.
  const redo = analysis.rows.some(r => r.month === start && r.reconciled)
  const newPayoff = draftResult.ok ? shiftMonth(start, getPayoffMonths(draftResult.schedule) - 1) : null
  const change = newPayoff && analysis.projectedPayoff ? monthDiff(analysis.projectedPayoff, newPayoff) : null

  const save = () => {
    saveRevision()
    // A revision of a reconciled month can add a debt to it: go to that month.
    if (redo) router.replace({ pathname: '/reconcile/[month]', params: { month: start } })
    else router.back()
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
      {starts.length > 1 ? (
        <Card>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>Start the revision in</Text>
          <Segmented
            value={start}
            options={starts.map(m => ({ value: m, label: monthName(m) }))}
            onChange={setRevisionMonth}
          />
          <Body muted>
            {redo
              ? `${monthName(start)} is already reconciled. The revision changes it, so you can add a debt to that month. Then check the reconciliation of ${monthName(start)}.`
              : `${monthName(start)} is the first month of the revision. ${monthName(starts[0])} stays as it is.`}
          </Body>
        </Card>
      ) : null}
      <Body muted>
        The balances are your actual balances at the start of {monthName(start)}. Change the debts, the method or the
        extra amount. Your history stays.
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

      <Card>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>Refinanced or consolidated?</Text>
        <Body muted>
          Refinanced a debt? Tap it above and change its rate or its repayment. Rolled debts into one new loan? Use
          Consolidate. Your history stays with the old debts.
        </Body>
        <Button testID="revise-consolidate" title="Consolidate debts" variant="secondary" onPress={() => router.push('/consolidate')} />
      </Card>

      {draftResult.ok ? <Button testID="revise-save" title="Save revision" onPress={save} /> : null}
    </Screen>
  )
}
