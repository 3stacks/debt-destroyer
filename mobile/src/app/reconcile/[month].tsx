import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { showAlert } from '../../lib/alert'
import { HeaderText } from '../../components/HeaderButton'
import { Body, Button, Card, Divider, Field, Row, Screen } from '../../components/ui'
import { money } from '../../lib/metrics'
import { usePlan } from '../../lib/plan'
import { space, useColors } from '../../lib/theme'
import { DebtEntry, monthName, planFor, plannedMonth, versionFor } from '../../lib/tracking'

const clean = (v: string) => v.replace(/[^0-9.]/g, '')

export default function ReconcileSheet() {
  const c = useColors()
  const { month } = useLocalSearchParams<{ month: string }>()
  const { tracking, saveReconciliation, deleteReconciliation } = usePlan()

  const version = tracking ? versionFor(tracking, month) : undefined
  const planned = useMemo(() => {
    if (!version) return {}
    const p = planFor(version)
    return p.ok ? plannedMonth(version, p.schedule, month) : {}
  }, [version, month])
  const existing = tracking?.recs[month]

  // The paid fields start empty, so that the user enters the real amounts. A
  // saved month shows its amounts. A debt that a revision added to it is empty.
  const [entries, setEntries] = useState<Record<string, DebtEntry>>(() => existing?.entries ?? {})

  if (!tracking || !version) {
    return (
      <View style={{ padding: space.lg }}>
        <Body muted>There is no plan for this month.</Body>
      </View>
    )
  }

  const set = (id: string, patch: Partial<DebtEntry>) =>
    setEntries(e => ({ ...e, [id]: { ...(e[id] ?? { paid: '' }), ...patch } }))

  const plannedTotal = version.debts.reduce((a, d) => a + (planned[d.id]?.paid ?? 0), 0)
  const paidTotal = version.debts.reduce((a, d) => a + (Number(entries[d.id]?.paid) || 0), 0)
  const variance = paidTotal - plannedTotal

  const missing = version.debts.filter(d => (entries[d.id]?.paid ?? '').trim() === '')
  const fillPlanned = () =>
    setEntries(e =>
      Object.fromEntries(
        version.debts.map(d => [d.id, { ...e[d.id], paid: (planned[d.id]?.paid ?? 0).toFixed(2) }]),
      ),
    )

  const save = () => {
    if (missing.length > 0) {
      showAlert(
        'Enter what you paid',
        `Enter the amount that you actually paid on ${missing.map(d => d.name || 'each debt').join(', ')}. Enter 0 if you paid nothing.`,
      )
      return
    }
    saveReconciliation(month, entries)
    router.back()
  }
  const remove = () =>
    showAlert('Delete this reconciliation?', monthName(month), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteReconciliation(month)
          router.back()
        },
      },
    ])

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: monthName(month),
          // Android has a back button, and a left button there touches the title.
          headerLeft: process.env.EXPO_OS === 'ios' ? () => <HeaderText title="Cancel" onPress={() => router.back()} /> : undefined,
          headerRight: () => <HeaderText title="Save" bold onPress={save} />,
        }}
      />
      <Body>
        How much did you actually pay on each debt in {monthName(month)}? Check your bank or your statements, and enter the
        real amounts.
      </Body>
      <Button testID="reconcile-planned" title="I paid the planned amounts" variant="secondary" onPress={fillPlanned} />

      {version.debts.map(d => {
        const p = planned[d.id]
        const entry = entries[d.id] ?? { paid: '' }
        const empty = entry.paid.trim() === ''
        return (
          <Card key={d.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
              <Text style={{ color: c.text, fontSize: 17, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {d.name || 'Unnamed debt'}
              </Text>
              <Text style={{ color: c.muted, fontSize: 15 }}>Planned: ${(p?.paid ?? 0).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Actually paid"
                  testID={`paid-${d.id}`}
                  prefix="$"
                  value={entry.paid}
                  placeholder="Amount"
                  keyboardType="decimal-pad"
                  onChangeText={v => set(d.id, { paid: clean(v) })}
                  hint={empty ? 'Enter 0 if you paid nothing' : undefined}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Statement balance"
                  testID={`statement-${d.id}`}
                  prefix="$"
                  value={entry.balance ?? ''}
                  placeholder="Optional"
                  keyboardType="decimal-pad"
                  onChangeText={v => set(d.id, { balance: clean(v) || undefined })}
                />
              </View>
            </View>
          </Card>
        )
      })}

      <Card style={{ gap: space.sm }}>
        <Row label="Planned" value={money(plannedTotal)} />
        <Row label="Actually paid" value={missing.length > 0 ? `${money(paidTotal)} so far` : money(paidTotal)} />
        <Divider />
        <Row
          label={variance < 0 ? 'Under the plan' : 'Over the plan'}
          value={`${variance < 0 ? '−' : '+'}${money(Math.abs(variance))}`}
          color={Math.round(variance) < 0 ? c.bad : Math.round(variance) > 0 ? c.good : c.muted}
        />
      </Card>
      <Body muted>
        Leave the statement balance blank to calculate it from the payment and the interest rate. Enter it when your
        statement shows a different balance, for example after fees or new purchases.
      </Body>

      <Button testID="reconcile-save" title="Save" onPress={save} />
      {existing ? <Button title="Delete reconciliation" variant="destructive" onPress={remove} /> : null}
    </Screen>
  )
}
