import { useMemo } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { PlanGate } from '../../../components/PlanGate'
import { ScenarioCard } from '../../../components/ScenarioCard'
import { Body, Button, Callout, Card, Em, Field, Row, Screen, SectionHeader, Segmented, Stat, StatGrid } from '../../../components/ui'
import {
  Debt,
  formatMonthsAsTime,
  Frequency,
  getPayoffMonths,
  getTotalInterestPaid,
  money,
  parseMoney,
  runPlan,
  Schedule,
  toMonthly,
  toYearly,
} from '../../../lib/metrics'
import { usePlan, Vice } from '../../../lib/plan'
import { space, useColors } from '../../../lib/theme'

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const PRESETS: { name: string; cost: string; frequency: Frequency }[] = [
  { name: 'Smoking', cost: '15', frequency: 'daily' },
  { name: 'Coffee', cost: '6', frequency: 'daily' },
]

function ViceCard({ vice }: { vice: Vice }) {
  const c = useColors()
  const { updateVice, removeVice } = usePlan()
  const remove = () =>
    Alert.alert('Remove this vice?', vice.name || undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeVice(vice.id) },
    ])
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Field label="Vice" value={vice.name} placeholder="e.g. Takeaway" onChangeText={name => updateVice(vice.id, { name })} />
        </View>
        <View style={{ width: 110 }}>
          <Field
            label="Cost"
            prefix="$"
            value={vice.cost}
            placeholder="0"
            keyboardType="decimal-pad"
            onChangeText={v => updateVice(vice.id, { cost: v.replace(/[^0-9.]/g, '') })}
          />
        </View>
        <Pressable onPress={remove} hitSlop={10} style={{ paddingTop: 30 }} accessibilityRole="button" accessibilityLabel="Remove vice">
          <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} tintColor={c.bad} size={20} />
        </Pressable>
      </View>
      <Segmented value={vice.frequency} options={FREQUENCIES} onChange={frequency => updateVice(vice.id, { frequency })} />
    </Card>
  )
}

function ViceSimulator({ schedule, debts }: { schedule: Schedule; debts: Debt[] }) {
  const c = useColors()
  const { vices, addVice, calcMethod: method, extraAmount } = usePlan()

  const priced = vices.filter(v => parseMoney(v.cost) > 0)
  const monthly = priced.reduce((a, v) => a + toMonthly(parseMoney(v.cost), v.frequency), 0)
  const yearly = priced.reduce((a, v) => a + toYearly(parseMoney(v.cost), v.frequency), 0)

  const months = getPayoffMonths(schedule)
  const interest = getTotalInterestPaid(schedule)

  const scenario = useMemo(() => {
    if (monthly <= 0) return null
    const r = runPlan(debts, method, extraAmount + Math.round(monthly))
    return r.ok ? r.schedule : null
  }, [monthly, debts, method, extraAmount])

  const viceMonths = scenario ? getPayoffMonths(scenario) : months
  const viceInterest = scenario ? getTotalInterestPaid(scenario) : interest
  const monthsSaved = months - viceMonths
  const interestSaved = interest - viceInterest
  const tenYears = Array.from({ length: 120 }).reduce<number>(
    (total, _, i) => total + monthly * Math.pow(1 + 0.07 / 12, 120 - i),
    0,
  )

  return (
    <Screen>
      <Body muted>Add your vices. See how much sooner you are debt free when that money goes to your debt.</Body>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {PRESETS.map(p => (
          <Button
            key={p.name}
            small
            variant="secondary"
            title={`+ ${p.name} ($${p.cost}/${p.frequency === 'daily' ? 'day' : p.frequency})`}
            onPress={() => addVice(p)}
          />
        ))}
      </View>

      {vices.map(v => (
        <ViceCard key={v.id} vice={v} />
      ))}
      <Button title="Add vice" variant="secondary" onPress={() => addVice()} />

      {vices.length === 0 ? (
        <Body muted style={{ textAlign: 'center' }}>Add a vice, or tap a preset to start.</Body>
      ) : monthly <= 0 ? (
        <Body muted style={{ textAlign: 'center' }}>Enter a cost for each vice to see the effect on your plan.</Body>
      ) : (
        <>
          <StatGrid>
            <Stat value={money(monthly)} label="Saved each month" />
            <Stat value={money(yearly)} label="Saved each year" />
          </StatGrid>

          <ScenarioCard title="Current plan" months={months} interest={interest} />
          <ScenarioCard
            title="Without your vices"
            highlight
            months={viceMonths}
            interest={viceInterest}
            monthsSaved={monthsSaved}
            interestSaved={interestSaved}
          />

          {priced.length > 1 ? (
            <>
              <SectionHeader title="Vice breakdown" />
              <Card style={{ gap: space.sm }}>
                {priced.map(v => (
                  <Row
                    key={v.id}
                    label={v.name || 'Unnamed vice'}
                    value={`${money(toMonthly(parseMoney(v.cost), v.frequency))}/mo · ${money(toYearly(parseMoney(v.cost), v.frequency))}/yr`}
                  />
                ))}
              </Card>
            </>
          ) : null}

          {monthsSaved > 0 ? (
            <Callout tone="good">
              Quit your vices and put {money(monthly)} a month toward debt. You are debt free{' '}
              {formatMonthsAsTime(monthsSaved)} sooner
              {interestSaved > 0 ? ` and you save ${money(interestSaved)} in interest` : ''}.
            </Callout>
          ) : null}

          <Callout tone="warn" title="10-year opportunity cost">
            Invest {money(monthly)} a month at 7% instead. In 10 years you have about{' '}
            <Em color={c.warn}>{money(tenYears)}</Em>.
          </Callout>
        </>
      )}
      <Text style={{ height: 1 }} />
    </Screen>
  )
}

export default function VicesScreen() {
  return (
    <PlanGate empty="Add your debts on the Plan tab, then see what a vice costs you.">
      {(schedule, debts) => <ViceSimulator schedule={schedule} debts={debts} />}
    </PlanGate>
  )
}
